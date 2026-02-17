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
import { ApiService } from '../../services/apiService';

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  chatRoomId: string;
  messageType: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';
  createdAt: string;
  isMentor?: boolean; // Helper property for UI
}

export default function MentorChatBoxScreen() {
  const params = useLocalSearchParams();
  const { chatRoomId, clientName, clientImage, isOnline } = params;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [mentorData] = useState({
    id: 'mentor_1',
    name: 'Dr. Rajesh Sharma',
    isOnline: true,
  });
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (chatRoomId) {
      loadMessages();
    }
  }, [chatRoomId]);

  useEffect(() => {
    // Auto scroll to bottom when new messages are added
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      
      // Try to load real messages from the API
      const response = await ApiService.getChatRoomMessages(chatRoomId as string);
      
      if (response.success && response.data) {
        const formattedMessages = response.data.map((msg: any) => ({
          ...msg,
          isMentor: msg.senderId === mentorData.id,
        }));
        setMessages(formattedMessages);
      } else {
        console.log('No messages found for chat room');
        setMessages([]);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      Alert.alert('Error', 'Failed to load messages. Please try again.');
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || !chatRoomId) {
      return;
    }

    const messageText = inputText.trim();
    setInputText('');

    try {
      // Create new message object
      const newMessage: Message = {
        id: Date.now().toString(),
        content: messageText,
        senderId: mentorData.id,
        senderName: mentorData.name,
        chatRoomId: chatRoomId as string,
        messageType: 'TEXT',
        createdAt: new Date().toISOString(),
        isMentor: true,
      };

      // Add message to local state immediately for better UX
      setMessages(prev => [...prev, newMessage]);

      // Send message to API
      const response = await ApiService.sendMessage({
        content: messageText,
        senderId: mentorData.id,
        chatRoomId: chatRoomId as string,
        messageType: 'TEXT',
      });

      if (response.success && response.data) {
        // Update the message with the API response
        setMessages(prev => prev.map(msg => 
          msg.id === newMessage.id ? { ...response.data, isMentor: true } : msg
        ));
      } else {
        // Remove the message if API call failed
        setMessages(prev => prev.filter(msg => msg.id !== newMessage.id));
        Alert.alert('Error', 'Failed to send message. Please try again.');
        setInputText(messageText);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
      setInputText(messageText); // Restore the message
    }
  };

  const handleCallPress = () => {
    Alert.alert(
      'Voice Call',
      `Start voice call with ${clientName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => Alert.alert('Calling...', 'Voice call feature will be available soon!') }
      ]
    );
  };

  const handleVideoCallPress = () => {
    Alert.alert(
      'Video Call',
      `Start video call with ${clientName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Start Call', onPress: () => Alert.alert('Starting Video Call...', 'Video call feature will be available soon!') }
      ]
    );
  };

  const handleClientProfile = () => {
    Alert.alert('Client Profile', `View ${clientName}'s profile and consultation history.`, [
      { text: 'OK' }
    ]);
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
      <StatusBar barStyle="light-content" backgroundColor="#0052CC" />
      
      {/* Header */}
      <LinearGradient
        colors={['#0052CC', '#0066FF']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color="#333" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.clientInfo}
            onPress={handleClientProfile}
          >
            <View style={styles.clientImageContainer}>
              <Image 
                source={{ uri: clientImage as string }}
                style={styles.clientImage}
              />
              {isOnline === 'true' && <View style={styles.onlineIndicator} />}
            </View>
            <View style={styles.clientDetails}>
              <Text style={styles.clientName}>{clientName}</Text>
              <Text style={styles.onlineStatus}>
                {isOnline === 'true' ? 'Online' : 'Last seen recently'}
              </Text>
            </View>
          </TouchableOpacity>
          
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleCallPress}
            >
              <Ionicons name="call" size={16} color="#333" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleVideoCallPress}
            >
              <Ionicons name="videocam" size={16} color="#333" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => Alert.alert('Options', 'More options coming soon!')}
            >
              <Ionicons name="ellipsis-vertical" size={16} color="#333" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

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
              message.isMentor ? styles.mentorMessageContainer : styles.clientMessageContainer
            ]}
          >
            {!message.isMentor && (
              <Image 
                source={{ uri: clientImage as string }}
                style={styles.messageAvatar}
              />
            )}
            <View
              style={[
                styles.messageBubble,
                message.isMentor ? styles.mentorMessageBubble : styles.clientMessageBubble
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  message.isMentor ? styles.mentorMessageText : styles.clientMessageText
                ]}
              >
                {message.content}
              </Text>
              <Text
                style={[
                  styles.messageTime,
                  message.isMentor ? styles.mentorMessageTime : styles.clientMessageTime
                ]}
              >
                {formatTime(message.createdAt)}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Quick Responses */}
      <View style={styles.quickResponsesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity 
            style={styles.quickResponseButton}
            onPress={() => setInputText('Thank you for sharing your birth details. Let me analyze your chart.')}
          >
            <Text style={styles.quickResponseText}>Analyzing chart...</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickResponseButton}
            onPress={() => setInputText('Based on your planetary positions, I can see...')}
          >
            <Text style={styles.quickResponseText}>Planetary analysis</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickResponseButton}
            onPress={() => setInputText('I recommend performing these remedies for better results.')}
          >
            <Text style={styles.quickResponseText}>Remedies</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickResponseButton}
            onPress={() => setInputText('Would you like to schedule a detailed consultation?')}
          >
            <Text style={styles.quickResponseText}>Schedule consultation</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

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
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clientInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
  },
  clientImageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  clientImage: {
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
  clientDetails: {
    flex: 1,
  },
  clientName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  onlineStatus: {
    fontSize: 14,
    color: '#666',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
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
  mentorMessageContainer: {
    justifyContent: 'flex-end',
  },
  clientMessageContainer: {
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
  mentorMessageBubble: {
    backgroundColor: '#0052CC',
    borderBottomRightRadius: 5,
  },
  clientMessageBubble: {
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
  mentorMessageText: {
    color: '#FFFFFF',
  },
  clientMessageText: {
    color: '#333',
  },
  messageTime: {
    fontSize: 12,
    marginTop: 5,
  },
  mentorMessageTime: {
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'right',
  },
  clientMessageTime: {
    color: '#999',
  },
  quickResponsesContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  quickResponseButton: {
    backgroundColor: '#E6F2FF',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 5,
    marginLeft: 15,
  },
  quickResponseText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
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
    backgroundColor: '#0052CC',
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