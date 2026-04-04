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
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../contexts/UserContext';
import { ChatService, ChatMessage } from '../services/chatService';
import { BillingTimerService } from '../services/BillingTimerService';

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  chatRoomId: string;
  messageType: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';
  createdAt: string;
  isUser?: boolean;
}
export default function ChatBoxScreen() {
  const params = useLocalSearchParams();
  const {
    roomId,
    roomName: roomNameParam,
    astrologerId,
    astrologerName,
    astrologerImage,
    isOnline,
    ratePerMinute,
    currentUserId: paramCurrentUserId,
  } = params;
  const { user } = useUser();

  // Support both regular users (UserContext) and mentors (currentUserId param)
  const activeUserId: string | undefined = user?.id ?? (paramCurrentUserId as string | undefined);
  const activeUserName: string = user?.name ?? 'Mentor';

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [chatRoomId, setChatRoomId] = useState<string | null>((roomId as string) ?? null);
  const [displayRoomName, setDisplayRoomName] = useState<string | undefined>(
    typeof roomNameParam === 'string' && roomNameParam.length > 0 ? roomNameParam : undefined
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [minutesPassed, setMinutesPassed] = useState(0);
  const [chatDuration, setChatDuration] = useState(0);
  const [showLowBalanceWarning, setShowLowBalanceWarning] = useState(false);
  const [estimatedMinutes, setEstimatedMinutes] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const billingSessionId = useRef<string | null>(null);

  useEffect(() => {
    if (activeUserId && (roomId || astrologerId)) {
      initializeChatRoom();
    }
    return () => {
      cleanup();
      if (billingSessionId.current) {
        BillingTimerService.stopTimer(billingSessionId.current);
      }
    };
  }, [activeUserId, roomId, astrologerId]);

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  useEffect(() => {
    if (!sessionActive) return;
    const interval = setInterval(() => {
      setChatDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionActive]);

  const cleanup = () => {
    unsubscribeRef.current?.();
    unsubscribeRef.current = null;
  };

  const refreshMessages = async () => {
    if (!chatRoomId && !roomId) return;
    const activeRoomId = chatRoomId ?? (roomId as string);
    setIsRefreshing(true);
    cleanup();
    console.log('🔄 [ChatBox] Manually refreshing messages for room:', activeRoomId);
    unsubscribeRef.current = ChatService.subscribeToMessages(
      activeRoomId,
      (firestoreMsgs) => {
        const mapped: Message[] = firestoreMsgs.map((m: ChatMessage) => ({
          id: m.id,
          content: m.text,
          senderId: m.createdBy,
          senderName: m.createdBy === activeUserId ? activeUserName : (astrologerName as string),
          chatRoomId: m.roomId,
          messageType: 'TEXT',
          createdAt: m.createdAt?.toDate?.()?.toISOString?.() ?? new Date().toISOString(),
          isUser: m.createdBy === activeUserId,
        }));
        setMessages(mapped);
        setIsRefreshing(false);
      },
      (err) => {
        console.error('🔄 [ChatBox] Refresh listener error:', err);
        setIsRefreshing(false);
      }
    );
  };

  const initializeChatRoom = async () => {
    try {
      setIsLoading(true);
      let activeRoomId = roomId as string;

      // If no roomId passed, create a new room
      if (!activeRoomId && activeUserId && astrologerId) {
        const room = await ChatService.createChatRoom(
          `${activeUserName} & ${astrologerName}`,
          activeUserId,
          astrologerId as string
        );
        activeRoomId = room.id;
        if (room.roomName) {
          setDisplayRoomName(room.roomName);
        }
      }

      setChatRoomId(activeRoomId);

      // Subscribe to real-time messages
      unsubscribeRef.current = ChatService.subscribeToMessages(
        activeRoomId,
        (firestoreMsgs) => {
          const mapped: Message[] = firestoreMsgs.map((m: ChatMessage) => ({
            id: m.id,
            content: m.text,
            senderId: m.createdBy,
            senderName: m.createdBy === activeUserId ? activeUserName : (astrologerName as string),
            chatRoomId: m.roomId,
            messageType: 'TEXT',
            createdAt: m.createdAt?.toDate?.()?.toISOString?.() ?? new Date().toISOString(),
            isUser: m.createdBy === activeUserId,
          }));
          setMessages(mapped);
        },
        (err) => console.error('Chat listener error:', err)
      );

      // Start billing timer if rate is provided and valid
      const rate = parseFloat(ratePerMinute as string);
      if (ratePerMinute && !isNaN(rate) && rate > 0 && activeUserId && astrologerId) {
        startBillingTimer();
      }
    } catch (error: any) {
      Alert.alert('Error', error.message ?? 'Failed to load chat.');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    const text = inputText.trim();
    if (!text || !chatRoomId || !activeUserId) return;
    setInputText('');
    try {
      await ChatService.sendMessage(chatRoomId, text, activeUserId, activeUserName);
    } catch (error: any) {
      Alert.alert('Error', error.message ?? 'Failed to send message.');
    }
  };

  const startBillingTimer = () => {
    if (!activeUserId || !astrologerId || !ratePerMinute) return;

    const sessionId = `chat_${activeUserId}_${astrologerId}_${Date.now()}`;
    billingSessionId.current = sessionId;
    const rate = parseFloat(ratePerMinute as string);

    console.log(`Starting chat billing timer: ₹${rate}/min`);

    BillingTimerService.startTimer({
      sessionId,
      userId: activeUserId,
      mentorId: astrologerId as string,
      sessionType: 'CHAT',
      ratePerMinute: rate,
      onMinuteComplete: (minutes, amountDeducted, remainingBalance) => {
        console.log(`Chat minute ${minutes} completed. Deducted: ₹${amountDeducted}`);
        setMinutesPassed(minutes);
        setCurrentBalance(remainingBalance);

        // Show low balance warning if less than 3 minutes remain
        const minsLeft = Math.floor(remainingBalance / rate);
        if (minsLeft <= 3) {
          setEstimatedMinutes(minsLeft);
          setShowLowBalanceWarning(true);
        }

        BillingTimerService.showContinueDialog(
          minutes,
          amountDeducted,
          remainingBalance,
          () => {
            console.log('User chose to continue chat');
          },
          () => {
            console.log('User chose to end chat');
            endChatSession('USER_CANCELLED');
          }
        );
      },
      onInsufficientBalance: (minutes, totalCost) => {
        console.log(`Insufficient balance after ${minutes} minutes of chat`);
        setMinutesPassed(minutes);

        BillingTimerService.showInsufficientBalanceDialog(
          minutes,
          totalCost,
          () => {
            Alert.alert('Add Money', 'Please use the wallet section to add money.');
            endChatSession('INSUFFICIENT_BALANCE');
          },
          () => {
            endChatSession('INSUFFICIENT_BALANCE');
          }
        );
      },
      onSessionEnd: (summary) => {
        console.log('Chat session ended:', summary);
      },
    });

    setSessionActive(true);
  };

  const endChatSession = async (reason: 'USER_CANCELLED' | 'INSUFFICIENT_BALANCE' | 'NORMAL_END' = 'NORMAL_END') => {
    const sessionId = billingSessionId.current;
    if (!sessionId) {
      router.back();
      return;
    }

    const summary = await BillingTimerService.endSession(sessionId, reason);
    billingSessionId.current = null;
    setSessionActive(false);

    const message =
      reason === 'INSUFFICIENT_BALANCE'
        ? `Chat ended due to insufficient balance.\n\nDuration: ${summary.totalMinutes} minute${summary.totalMinutes !== 1 ? 's' : ''}\nTotal Cost: ₹${summary.totalCost.toFixed(2)}`
        : reason === 'USER_CANCELLED'
        ? `Chat cancelled.\n\nDuration: ${summary.totalMinutes} minute${summary.totalMinutes !== 1 ? 's' : ''}\nTotal Cost: ₹${summary.totalCost.toFixed(2)}\nRemaining Balance: ₹${summary.remainingBalance.toFixed(2)}`
        : `Chat ended.\n\nDuration: ${summary.totalMinutes} minute${summary.totalMinutes !== 1 ? 's' : ''}\nTotal Cost: ₹${summary.totalCost.toFixed(2)}\nRemaining Balance: ₹${summary.remainingBalance.toFixed(2)}`;

    Alert.alert('Chat Summary', message, [
      {
        text: 'OK',
        onPress: () => {
          // Navigate to mentor review screen
          router.push({
            pathname: '/mentor-review',
            params: {
              mentorId: astrologerId,
              mentorName: astrologerName || 'Mentor',
              callId: sessionId,
              callType: 'chat',
            },
          });
        },
      },
    ]);
  };

  const handleCallPress = async () => {
    // TODO: implement
  };

  const handleVideoCallPress = async () => {
    // TODO: implement
  };

  const formatTime = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
      <StatusBar barStyle="light-content" backgroundColor="#4CAF50" translucent={false} />
      {/* Header */}
      <LinearGradient
        colors={['#4CAF50', '#45A049']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (sessionActive) {
                Alert.alert(
                  'End Chat',
                  'Are you sure you want to end this chat session?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'End Chat', style: 'destructive', onPress: () => endChatSession('USER_CANCELLED') },
                  ]
                );
              } else {
                router.replace("/home");
              }
            }}
          >
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.astrologerInfo}>
            <View style={styles.astrologerImageContainer}>
              {astrologerImage ? (
                <Image
                  source={{ uri: astrologerImage as string }}
                  style={styles.astrologerImage}
                />
              ) : (
                <View style={[styles.astrologerImage, styles.defaultAvatarContainer]}>
                  <Ionicons name="person" size={28} color="#FFFFFF" />
                </View>
              )}
              {isOnline === 'true' && <View style={styles.onlineIndicator} />}
            </View>
            <View style={styles.astrologerDetails}>
              <Text style={styles.astrologerName}>{astrologerName}</Text>
              {/* {displayRoomName ? (
                <Text style={styles.roomNameLabel} numberOfLines={1}>
                  {displayRoomName}
                </Text>
              ) : null} */}
              <Text style={styles.onlineStatus}>
                {/* {isOnline === 'true' ? 'Online' : 'Offline'} */} {/* TODO: add online status from server side first */}
              </Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={refreshMessages}
              disabled={isRefreshing}
            >
              <Ionicons name={isRefreshing ? 'hourglass' : 'refresh'} size={16} color="#FFFFFF" />
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
        scrollIndicatorInsets={{ right: 1 }}
      >
        {sessionActive && (
          <View style={styles.timerContainer}>
            <View style={styles.timerPill}>
              <View style={styles.timerDot} />
              <Text style={styles.timerText}>{formatDuration(chatDuration)}</Text>
              <Text style={styles.timerBilling}> • ₹{ratePerMinute}/min • ₹{currentBalance.toFixed(0)} left</Text>
            </View>
          </View>
        )}
        {messages.length === 0 ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 }}>
            <Ionicons name="chatbubbles-outline" size={48} color="#D1D5DB" />
            <Text style={{ fontSize: 16, color: '#9CA3AF', marginTop: 12, fontWeight: '500' }}>
              No messages yet
            </Text>
            <Text style={{ fontSize: 13, color: '#D1D5DB', marginTop: 4 }}>
              Start the conversation
            </Text>
          </View>
        ) : (
          messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageContainer,
                message.isUser ? styles.userMessageContainer : styles.astrologerMessageContainer
              ]}
            >
              {!message.isUser && (
                astrologerImage ? (
                  <Image
                    source={{ uri: astrologerImage as string }}
                    style={styles.messageAvatar}
                  />
                ) : (
                  <View style={[styles.messageAvatar, styles.defaultMessageAvatarContainer]}>
                    <Ionicons name="person" size={16} color="#FFFFFF" />
                  </View>
                )
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
          ))
        )}
      </ScrollView>

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TouchableOpacity style={styles.attachButton} activeOpacity={0.6}>
            <Ionicons name="attach" size={18} color="#6B7280" />
          </TouchableOpacity>

          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor="#9CA3AF"
            multiline
            maxLength={500}
          />

          <TouchableOpacity style={styles.emojiButton} activeOpacity={0.6}>
            <Ionicons name="happy" size={18} color="#6B7280" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.sendButton,
              inputText.trim() ? styles.sendButtonActive : styles.sendButtonInactive
            ]}
            onPress={sendMessage}
            disabled={!inputText.trim()}
            activeOpacity={0.8}
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
    backgroundColor: '#FAFAFA',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
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
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  astrologerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  astrologerImageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  astrologerImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
  },
  defaultAvatarContainer: {
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10B981',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  astrologerDetails: {
    flex: 1,
  },
  astrologerName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  roomNameLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  onlineStatus: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  billingInfo: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    marginTop: 2,
  },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  timerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF4757',
    marginRight: 6,
  },
  timerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000000',
  },
  timerBilling: {
    fontSize: 11,
    fontWeight: '500',
    color: '#000000',
  },
  endChatButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.85)',
  },
  lowBalanceWarning: {
    backgroundColor: '#FEF3C7',
    borderBottomWidth: 1,
    borderBottomColor: '#FCD34D',
  },
  warningContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  warningText: {
    flex: 1,
    color: '#92400E',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 10,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  timerContainer: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 8,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  astrologerMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  defaultMessageAvatarContainer: {
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageBubble: {
    maxWidth: '78%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  userMessageBubble: {
    backgroundColor: '#4CAF50',
    borderBottomRightRadius: 4,
  },
  astrologerMessageBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: 0.2,
  },
  userMessageText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  astrologerMessageText: {
    color: '#1F2937',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  userMessageTime: {
    color: 'rgba(255, 255, 255, 0.75)',
    textAlign: 'right',
  },
  astrologerMessageTime: {
    color: '#9CA3AF',
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F3F4F6',
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  attachButton: {
    marginRight: 8,
    padding: 4,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
    maxHeight: 100,
    paddingVertical: 6,
    fontWeight: '500',
  },
  emojiButton: {
    marginLeft: 8,
    marginRight: 8,
    padding: 4,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: '#4CAF50',
  },
  sendButtonInactive: {
    backgroundColor: '#D1D5DB',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
});
