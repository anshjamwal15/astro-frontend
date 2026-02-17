import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ApiService } from '../services/apiService';
import { useUser } from '../contexts/UserContext';
import { WalletService } from '../services/WalletService';

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  chatRoomId: string;
  messageType: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';
  createdAt: string;
  isUser?: boolean; // Helper property for UI
}

export default function ChatBoxScreen() {
  const params = useLocalSearchParams();
  const { astrologerId, astrologerName, astrologerImage, isOnline, sessionId, ratePerMinute } = params;
  const { user } = useUser();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [chatRoomId, setChatRoomId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionActive, setSessionActive] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [estimatedMinutes, setEstimatedMinutes] = useState(0);
  const [showLowBalanceWarning, setShowLowBalanceWarning] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const balanceCheckInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (user && astrologerId) {
      initializeChatRoom();
      if (sessionId) {
        startBalanceMonitoring();
        setSessionActive(true);
      }
    }

    return () => {
      cleanup();
    };
  }, [user, astrologerId, sessionId]);

  useEffect(() => {
    // Auto scroll to bottom when new messages are added
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const cleanup = () => {
    if (balanceCheckInterval.current) {
      clearInterval(balanceCheckInterval.current);
      balanceCheckInterval.current = null;
    }
  };

  const startBalanceMonitoring = () => {
    if (!sessionId) return;

    // Check balance every 30 seconds
    balanceCheckInterval.current = setInterval(async () => {
      try {
        const status = await WalletService.checkSessionStatus(sessionId as string);
        setCurrentBalance(status.currentBalance);
        setEstimatedMinutes(status.estimatedMinutes);
        
        if (status.status === 'LOW_BALANCE') {
          setShowLowBalanceWarning(true);
          
          if (status.estimatedMinutes < 1) {
            Alert.alert(
              'Insufficient Balance',
              'Your balance is too low to continue. The chat will end now.',
              [{ text: 'OK', onPress: () => endChatSession('INSUFFICIENT_BALANCE') }]
            );
          }
        } else if (status.status === 'INSUFFICIENT_BALANCE') {
          endChatSession('INSUFFICIENT_BALANCE');
        }
      } catch (error) {
        console.error('Error checking session status:', error);
      }
    }, 30000);
  };

  const endChatSession = async (reason: string = 'NORMAL_END') => {
    if (!sessionId) return;

    try {
      const endStatus = await WalletService.endSession(sessionId as string, reason);
      
      const message = reason === 'INSUFFICIENT_BALANCE' 
        ? `Chat ended due to insufficient balance.\n\nDuration: ${endStatus.durationMinutes || 0} minutes\nCost: ₹${endStatus.totalCost?.toFixed(2) || '0.00'}`
        : `Chat ended successfully.\n\nDuration: ${endStatus.durationMinutes || 0} minutes\nCost: ₹${endStatus.totalCost?.toFixed(2) || '0.00'}\nRemaining Balance: ₹${endStatus.currentBalance.toFixed(2)}`;
      
      Alert.alert('Chat Summary', message, [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error ending chat session:', error);
      router.back();
    } finally {
      setSessionActive(false);
      cleanup();
    }
  };

  const initializeChatRoom = async () => {
    try {
      setIsLoading(true);
      
      // Create a unique chat room name for this user-astrologer pair
      const roomName = `chat_${user?.id}_${astrologerId}`;
      
      // Try to get existing chat rooms for the user
      const userRoomsResponse = await ApiService.getUserChatRooms(user!.id);
      
      let existingRoom = null;
      if (userRoomsResponse.success && userRoomsResponse.data) {
        // Look for existing room with this astrologer
        existingRoom = userRoomsResponse.data.find((room: any) => 
          room.name === roomName
        );
      }
      
      let roomId: string;
      
      if (existingRoom) {
        roomId = existingRoom.id;
        console.log('Using existing chat room:', roomId);
      } else {
        // Create new chat room
        const createRoomResponse = await ApiService.createChatRoom(roomName);
        if (!createRoomResponse.success) {
          throw new Error('Failed to create chat room');
        }
        roomId = createRoomResponse.data.id;
        console.log('Created new chat room:', roomId);
        
        // Join the chat room
        await ApiService.joinChatRoom(roomId, user!.id);
      }
      
      setChatRoomId(roomId);
      
      // Load existing messages
      await loadMessages(roomId);
      
    } catch (error) {
      console.error('Error initializing chat room:', error);
      Alert.alert('Error', 'Failed to initialize chat. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (roomId: string) => {
    try {
      const response = await ApiService.getChatRoomMessages(roomId);
      if (response.success && response.data) {
        const formattedMessages = response.data.map((msg: any) => ({
          ...msg,
          isUser: msg.messageType === 'SYSTEM' ? false : msg.senderId === user?.id,
        }));
        setMessages(formattedMessages);
        
        // If no messages exist, add a welcome message
        if (formattedMessages.length === 0) {
          await sendWelcomeMessage(roomId);
        }
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendWelcomeMessage = async (roomId: string) => {
    try {
      const welcomeText = `Hello! I'm ${astrologerName}. How can I help you today with your astrological questions?`;
      
      const response = await ApiService.sendMessage({
        content: welcomeText,
        senderId: user!.id,
        chatRoomId: roomId,
        messageType: 'SYSTEM',
      });

      if (response.success && response.data) {
        const welcomeMessage = {
          ...response.data,
          isUser: false,
          senderName: astrologerName as string,
        };
        setMessages([welcomeMessage]);
      }
    } catch (error) {
      console.error('Error sending welcome message:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || !chatRoomId || !user) {
      return;
    }

    const messageText = inputText.trim();
    setInputText('');

    try {
      const response = await ApiService.sendMessage({
        content: messageText,
        senderId: user.id,
        chatRoomId: chatRoomId,
        messageType: 'TEXT',
      });

      if (response.success && response.data) {
        const newMessage = {
          ...response.data,
          isUser: true,
        };
        setMessages(prev => [...prev, newMessage]);
        
        // Simulate astrologer response after a delay
        setTimeout(() => {
          sendAstrologerResponse();
        }, 1500);
      } else {
        Alert.alert('Error', 'Failed to send message. Please try again.');
        setInputText(messageText); // Restore the message
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
      setInputText(messageText); // Restore the message
    }
  };

  const sendAstrologerResponse = async () => {
    if (!chatRoomId) return;

    const responses = [
      "Thank you for sharing that with me. Let me analyze your situation...",
      "Based on your birth details, I can see some interesting planetary positions.",
      "That's a very good question. In astrology, this relates to...",
      "I understand your concern. The stars suggest...",
      "Let me check your chart for more insights on this matter.",
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    try {
      // For now, we'll simulate the astrologer response by using the user's ID
      // but marking it as from the astrologer in the UI
      // In a real app, astrologers would have their own user accounts
      const response = await ApiService.sendMessage({
        content: randomResponse,
        senderId: user!.id, // Using user ID for now since astrologer isn't a user
        chatRoomId: chatRoomId,
        messageType: 'SYSTEM', // Mark as system message to differentiate
      });

      if (response.success && response.data) {
        const astrologerMessage = {
          ...response.data,
          isUser: false, // Force this to be treated as astrologer message
          senderName: astrologerName as string,
        };
        setMessages(prev => [...prev, astrologerMessage]);
      }
    } catch (error) {
      console.error('Error sending astrologer response:', error);
    }
  };

  const handleCallPress = () => {
    Alert.alert(
      'Voice Call',
      `Start voice call with ${astrologerName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => Alert.alert('Calling...', 'Voice call feature will be available soon!') }
      ]
    );
  };

  const handleVideoCallPress = () => {
    Alert.alert(
      'Coming Soon',
      'Video call feature will be available soon!',
      [{ text: 'OK' }]
    );
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.loadingText}>Loading chat...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor="#4CAF50" />
      
      {/* Header */}
      <LinearGradient
        colors={['#4CAF50', '#45A049']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          
          <View style={styles.astrologerInfo}>
            <View style={styles.astrologerImageContainer}>
              <Image 
                source={{ uri: astrologerImage as string }}
                style={styles.astrologerImage}
              />
              {isOnline === 'true' && <View style={styles.onlineIndicator} />}
            </View>
            <View style={styles.astrologerDetails}>
              <Text style={styles.astrologerName}>{astrologerName}</Text>
              <Text style={styles.onlineStatus}>
                {isOnline === 'true' ? 'Online' : 'Offline'}
              </Text>
              {sessionActive && (
                <Text style={styles.billingInfo}>
                  ₹{ratePerMinute}/min • Balance: ₹{currentBalance.toFixed(2)}
                </Text>
              )}
            </View>
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleCallPress()}
            >
              <Ionicons name="call" size={16} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleVideoCallPress()}
            >
              <Ionicons name="videocam" size={16} color="#FFFFFF" />
            </TouchableOpacity>
            {sessionActive && (
              <TouchableOpacity 
                style={[styles.actionButton, styles.endChatButton]}
                onPress={() => endChatSession('NORMAL_END')}
              >
                <Ionicons name="close" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="ellipsis-vertical" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Low Balance Warning */}
      {showLowBalanceWarning && sessionActive && (
        <View style={styles.lowBalanceWarning}>
          <View style={styles.warningContent}>
            <Ionicons name="warning" size={20} color="#f59e0b" />
            <Text style={styles.warningText}>
              Low Balance! ~{estimatedMinutes} min left
            </Text>
            <TouchableOpacity onPress={() => setShowLowBalanceWarning(false)}>
              <Ionicons name="close" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Chat Messages */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageContainer,
              message.isUser ? styles.userMessageContainer : styles.astrologerMessageContainer
            ]}
          >
            {!message.isUser && (
              <Image 
                source={{ uri: astrologerImage as string }}
                style={styles.messageAvatar}
              />
            )}
            <View
              style={[
                styles.messageBubble,
                message.isUser ? styles.userMessageBubble : styles.astrologerMessageBubble
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  message.isUser ? styles.userMessageText : styles.astrologerMessageText
                ]}
              >
                {message.content}
              </Text>
              <Text
                style={[
                  styles.messageTime,
                  message.isUser ? styles.userMessageTime : styles.astrologerMessageTime
                ]}
              >
                {formatTime(message.createdAt)}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TouchableOpacity style={styles.attachButton}>
            <Ionicons name="attach" size={20} color="#666" />
          </TouchableOpacity>
          
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type your message..."
            placeholderTextColor="#999"
            multiline
            maxLength={500}
          />
          
          <TouchableOpacity style={styles.emojiButton}>
            <Ionicons name="happy" size={20} color="#666" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.sendButton,
              inputText.trim() ? styles.sendButtonActive : styles.sendButtonInactive
            ]}
            onPress={sendMessage}
            disabled={!inputText.trim()}
          >
            <Ionicons name="send" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 15,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  astrologerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
  },
  astrologerImageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  astrologerImage: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  astrologerDetails: {
    flex: 1,
  },
  astrologerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  onlineStatus: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  billingInfo: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    marginTop: 2,
  },
  endChatButton: {
    backgroundColor: 'rgba(255, 68, 68, 0.8)',
  },
  lowBalanceWarning: {
    backgroundColor: '#fef3c7',
    borderBottomWidth: 1,
    borderBottomColor: '#fde68a',
  },
  warningContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  warningText: {
    flex: 1,
    color: '#92400e',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'flex-end',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  astrologerMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
  },
  userMessageBubble: {
    backgroundColor: '#4CAF50',
    borderBottomRightRadius: 5,
  },
  astrologerMessageBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  astrologerMessageText: {
    color: '#333',
  },
  messageTime: {
    fontSize: 12,
    marginTop: 5,
  },
  userMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  astrologerMessageTime: {
    color: '#999',
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F8F8F8',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  attachButton: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    maxHeight: 100,
    paddingVertical: 5,
  },
  emojiButton: {
    marginLeft: 10,
    marginRight: 10,
  },
  sendButton: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: '#4CAF50',
  },
  sendButtonInactive: {
    backgroundColor: '#CCC',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
});