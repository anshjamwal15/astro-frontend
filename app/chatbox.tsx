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
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ApiService } from '../services/apiService';
import { chatService, ChatMessageResponse } from '../services/ChatService';import { useUser } from '../contexts/UserContext';
import { BillingTimerService } from '../services/BillingTimerService';
import { CallNotificationService } from '../services/CallNotificationService';
import {
  generateVideoRoomName,
  generateVoiceRoomName,
  generateCallId,
  getOrCreateChatRoomKey,
} from '../utils/roomNameGenerator';

interface Message {
  id: string;
  content: string;
  senderId: string;
  chatRoomId: string;
  sentAt: string;
  isUser: boolean;
}

function toLocalMessage(msg: ChatMessageResponse, userId: string): Message {
  return {
    id: `${msg.sender_user_id}-${msg.sent_at}`,
    content: msg.content,
    senderId: msg.sender_user_id,
    chatRoomId: msg.chat_room_id,
    sentAt: msg.sent_at,
    isUser: msg.sender_user_id === userId,
  };
}

export default function ChatBoxScreen() {
  const params = useLocalSearchParams();
  const { astrologerId, astrologerName, astrologerImage, isOnline, sessionId, ratePerMinute, chatRoomId: incomingRoomId } = params;
  const { user } = useUser();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [chatRoomId, setChatRoomId] = useState<string | null>(null);
  const [isLoading] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [showLowBalanceWarning, setShowLowBalanceWarning] = useState(false);
  const [minutesPassed, setMinutesPassed] = useState(0);
  const [isSending, setIsSending] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);
  const unsubscribeMessages = useRef<(() => void) | null>(null);
  const balanceCheckInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (user && astrologerId) {
      initializeChatRoom();
      if (sessionId && ratePerMinute) {
        startBillingTimer();
        setSessionActive(true);
      }
    }
    return () => { cleanup(); };
  }, [user, astrologerId, sessionId, ratePerMinute]);

  useEffect(() => {
    setTimeout(() => { scrollViewRef.current?.scrollToEnd({ animated: true }); }, 100);
  }, [messages]);

  const cleanup = () => {
    unsubscribeMessages.current?.();
    unsubscribeMessages.current = null;
    if (balanceCheckInterval.current) {
      clearInterval(balanceCheckInterval.current);
      balanceCheckInterval.current = null;
    }
    if (sessionId) {
      BillingTimerService.stopTimer(sessionId as string);
    }
  };

  const startBillingTimer = () => {
    if (!sessionId || !user || !astrologerId || !ratePerMinute) return;
    const rate = parseFloat(ratePerMinute as string);
    BillingTimerService.startTimer({
      sessionId: sessionId as string,
      userId: user.id,
      mentorId: astrologerId as string,
      sessionType: 'CHAT',
      ratePerMinute: rate,
      onMinuteComplete: (minutes, amountDeducted, remainingBalance) => {
        setMinutesPassed(minutes);
        setCurrentBalance(remainingBalance);
        BillingTimerService.showContinueDialog(
          minutes, amountDeducted, remainingBalance,
          () => {},
          () => { endChatSession('USER_CANCELLED'); },
        );
      },
      onInsufficientBalance: (minutes, totalCost) => {
        setMinutesPassed(minutes);
        BillingTimerService.showInsufficientBalanceDialog(
          minutes, totalCost,
          () => {
            Alert.alert('Add Money', 'Please use the wallet section to add money.');
            endChatSession('INSUFFICIENT_BALANCE');
          },
          () => { endChatSession('INSUFFICIENT_BALANCE'); },
        );
      },
      onSessionEnd: (summary) => { console.log('Session ended:', summary); },
    });
  };

  const endChatSession = async (reason: 'USER_CANCELLED' | 'INSUFFICIENT_BALANCE' | 'NORMAL_END' = 'NORMAL_END') => {
    if (!sessionId) return;
    try {
      setSessionActive(false);
      const summary = await BillingTimerService.endSession(sessionId as string, reason);
      const msg =
        reason === 'INSUFFICIENT_BALANCE'
          ? `Chat ended due to insufficient balance.\n\nDuration: ${summary.totalMinutes} min\nTotal Cost: Rs.${summary.totalCost.toFixed(2)}`
          : `Chat ended.\n\nDuration: ${summary.totalMinutes} min\nTotal Cost: Rs.${summary.totalCost.toFixed(2)}\nRemaining: Rs.${summary.remainingBalance.toFixed(2)}`;
      Alert.alert('Chat Summary', msg, [{ text: 'OK', onPress: () => router.back() }]);
    } catch {
      router.back();
    } finally {
      cleanup();
    }
  };

  const initializeChatRoom = async () => {
    try {
      if (user && astrologerId && sessionId) {
        await CallNotificationService.sendNotificationWithAutoToken(
          'CHAT', user.name || 'User', user.id,
          astrologerId as string, '', sessionId as string,
        ).catch(() => {});
      }

      let roomId: string;

      if (incomingRoomId) {
        roomId = incomingRoomId as string;
        const joinRes = await ApiService.joinChatRoom(roomId, user!.id);
        if (!joinRes.success) {
          console.warn('Join room failed (may already be a member):', joinRes.message);
        }
      } else {
        // Get or create a short persistent room name for this user-mentor pair
        const roomName = await getOrCreateChatRoomKey(user!.id, astrologerId as string);
        const userRoomsResponse = await ApiService.getUserChatRooms(user!.id);

        let existingRoom: any = null;
        if (userRoomsResponse.success && userRoomsResponse.data) {
          existingRoom = userRoomsResponse.data.find((r: any) => r.name === roomName);
        }

        if (existingRoom) {
          roomId = existingRoom.id;
        } else {
          const createRes = await ApiService.createChatRoom(roomName);
          if (!createRes.success) throw new Error('Failed to create chat room');
          roomId = createRes.data.id;
          await ApiService.joinChatRoom(roomId, user!.id);
        }
      }

      setChatRoomId(roomId);
      // No message history loading — real-time only via STOMP

      try {
        await chatService.connect();
        unsubscribeMessages.current = chatService.subscribeToRoomMessages(roomId, (wsMsg) => {
          setMessages((prev) => {
            const id = `${wsMsg.sender_user_id}-${wsMsg.sent_at}`;
            if (prev.some((m) => m.id === id)) return prev;
            return [...prev, toLocalMessage(wsMsg, user!.id)];
          });
        });
      } catch (wsErr) {
        console.warn('WebSocket connection failed:', wsErr);
      }
    } catch (error) {
      console.error('Error initializing chat room:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || !chatRoomId || !user || isSending) return;
    const messageText = inputText.trim();
    setInputText('');
    setIsSending(true);

    // Optimistic message shown immediately
    const optimisticId = `optimistic-${Date.now()}`;
    const optimisticMsg: Message = {
      id: optimisticId,
      content: messageText,
      senderId: user.id,
      chatRoomId,
      sentAt: new Date().toISOString(),
      isUser: true,
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      // Ensure socket is connected before sending
      if (!chatService.isConnected()) {
        await chatService.connect();
      }
      chatService.sendMessage(chatRoomId, user.id, messageText);

      // Notify recipient via push
      if (astrologerId) {
        chatService.sendMessageNotification({
          recipientMentorId: astrologerId as string,
          senderName: user.name || 'User',
          senderId: user.id,
          chatRoomId,
          message: messageText,
        }).catch(() => {});
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove optimistic message on failure and restore input
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      setInputText(messageText);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleCallPress = async () => {
    if (!user?.id || !astrologerId) return;
    Alert.alert('Voice Call', `Start voice call with ${astrologerName}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Call',
        onPress: async () => {
          try {
            const callId = generateCallId();
            const roomName = generateVoiceRoomName();
            const result = await CallNotificationService.sendNotificationWithAutoToken(
              'VOICE_CALL', user.name || 'User', user.id,
              astrologerId as string, roomName, callId,
            );
            if (result.success) {
              Alert.alert('Calling...', 'Voice call feature will be available soon!');
            } else {
              Alert.alert('Error', 'Failed to initiate call. Please try again.');
            }
          } catch {
            Alert.alert('Error', 'Failed to start call. Please try again.');
          }
        },
      },
    ]);
  };

  const handleVideoCallPress = async () => {
    if (!user?.id || !astrologerId) return;
    Alert.alert('Video Call', `Start video call with ${astrologerName}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Start',
        onPress: async () => {
          try {
            const callId = generateCallId();
            const roomName = generateVideoRoomName();
            const result = await CallNotificationService.sendNotificationWithAutoToken(
              'VIDEO_CALL', user.name || 'User', user.id,
              astrologerId as string, roomName, callId,
            );
            if (result.success) {
              Alert.alert('Starting...', 'Video call feature will be available soon!');
            } else {
              Alert.alert('Error', 'Failed to initiate video call. Please try again.');
            }
          } catch {
            Alert.alert('Error', 'Failed to start video call. Please try again.');
          }
        },
      },
    ]);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#4CAF50" />
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

      <LinearGradient colors={['#4CAF50', '#45A049']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.astrologerInfo}>
            <View style={styles.astrologerImageContainer}>
              <Image source={{ uri: astrologerImage as string }} style={styles.astrologerImage} />
              {isOnline === 'true' && <View style={styles.onlineIndicator} />}
            </View>
            <View style={styles.astrologerDetails}>
              <Text style={styles.astrologerName}>{astrologerName}</Text>
              <Text style={styles.onlineStatus}>{isOnline === 'true' ? 'Online' : 'Offline'}</Text>
              {sessionActive && (
                <Text style={styles.billingInfo}>
                  Rs.{ratePerMinute}/min - {minutesPassed} min - Balance: Rs.{currentBalance.toFixed(2)}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleCallPress}>
              <Ionicons name="call" size={16} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleVideoCallPress}>
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
          </View>
        </View>
      </LinearGradient>

      {showLowBalanceWarning && sessionActive && (
        <View style={styles.lowBalanceWarning}>
          <View style={styles.warningContent}>
            <Ionicons name="warning" size={20} color="#f59e0b" />
            <Text style={styles.warningText}>Low balance — please add funds</Text>
            <TouchableOpacity onPress={() => setShowLowBalanceWarning(false)}>
              <Ionicons name="close" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>
      )}

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
              message.isUser ? styles.userMessageContainer : styles.astrologerMessageContainer,
            ]}
          >
            {!message.isUser && (
              <Image source={{ uri: astrologerImage as string }} style={styles.messageAvatar} />
            )}
            <View
              style={[
                styles.messageBubble,
                message.isUser ? styles.userMessageBubble : styles.astrologerMessageBubble,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  message.isUser ? styles.userMessageText : styles.astrologerMessageText,
                ]}
              >
                {message.content}
              </Text>
              <Text
                style={[
                  styles.messageTime,
                  message.isUser ? styles.userMessageTime : styles.astrologerMessageTime,
                ]}
              >
                {formatTime(message.sentAt)}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type your message..."
            placeholderTextColor="#999"
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              inputText.trim() && !isSending ? styles.sendButtonActive : styles.sendButtonInactive,
            ]}
            onPress={sendMessage}
            disabled={!inputText.trim() || isSending}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="send" size={16} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  loadingContainer: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16, color: '#666', marginTop: 12 },
  header: { paddingTop: 50, paddingBottom: 15, paddingHorizontal: 15 },
  headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center',
  },
  astrologerInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: 15 },
  astrologerImageContainer: { position: 'relative', marginRight: 12 },
  astrologerImage: { width: 45, height: 45, borderRadius: 22.5, borderWidth: 2, borderColor: '#FFFFFF' },
  onlineIndicator: {
    position: 'absolute', bottom: 2, right: 2,
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: '#4CAF50', borderWidth: 2, borderColor: '#FFFFFF',
  },
  astrologerDetails: { flex: 1 },
  astrologerName: { fontSize: 18, fontWeight: '600', color: '#FFFFFF' },
  onlineStatus: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  billingInfo: { fontSize: 12, color: 'rgba(255,255,255,0.9)', fontWeight: '500', marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: 10 },
  actionButton: {
    width: 35, height: 35, borderRadius: 17.5,
    backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center',
  },
  endChatButton: { backgroundColor: 'rgba(255,68,68,0.8)' },
  lowBalanceWarning: { backgroundColor: '#fef3c7', borderBottomWidth: 1, borderBottomColor: '#fde68a' },
  warningContent: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  warningText: { flex: 1, color: '#92400e', fontSize: 14, fontWeight: '600', marginLeft: 8 },
  messagesContainer: { flex: 1, paddingHorizontal: 15, paddingVertical: 10 },
  messageContainer: { flexDirection: 'row', marginBottom: 15, alignItems: 'flex-end' },
  userMessageContainer: { justifyContent: 'flex-end' },
  astrologerMessageContainer: { justifyContent: 'flex-start' },
  messageAvatar: { width: 30, height: 30, borderRadius: 15, marginRight: 8 },
  messageBubble: { maxWidth: '75%', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 20 },
  userMessageBubble: { backgroundColor: '#4CAF50', borderBottomRightRadius: 5 },
  astrologerMessageBubble: {
    backgroundColor: '#FFFFFF', borderBottomLeftRadius: 5,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, shadowRadius: 2, elevation: 2,
  },
  messageText: { fontSize: 16, lineHeight: 20 },
  userMessageText: { color: '#FFFFFF' },
  astrologerMessageText: { color: '#333' },
  messageTime: { fontSize: 12, marginTop: 5 },
  userMessageTime: { color: 'rgba(255,255,255,0.7)', textAlign: 'right' },
  astrologerMessageTime: { color: '#999' },
  inputContainer: {
    backgroundColor: '#FFFFFF', paddingHorizontal: 15, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: '#E0E0E0',
  },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'flex-end',
    backgroundColor: '#F8F8F8', borderRadius: 25,
    paddingHorizontal: 15, paddingVertical: 8,
  },
  textInput: { flex: 1, fontSize: 16, color: '#333', maxHeight: 100, paddingVertical: 5 },
  sendButton: {
    width: 35, height: 35, borderRadius: 17.5,
    justifyContent: 'center', alignItems: 'center', marginLeft: 8,
  },
  sendButtonActive: { backgroundColor: '#4CAF50' },
  sendButtonInactive: { backgroundColor: '#CCC' },
});
