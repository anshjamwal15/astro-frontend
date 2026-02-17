import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUser, getFirstName } from '../../contexts/UserContext';
import { ApiService } from '../../services/apiService';

interface ChatRoom {
  id: string;
  mentorId: string;
  mentorName: string;
  mentorPhoto: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
}

export default function ChatScreen() {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useUser();
  const firstName = user ? getFirstName(user.name) : 'User';

  useEffect(() => {
    if (user?.id) {
      loadChatRooms();
    }
  }, [user?.id]);

  const loadChatRooms = async () => {
    try {
      setLoading(true);
      
      if (!user?.id) return;
      
      // Get user's chat rooms from backend
      const response = await ApiService.getUserChatRooms(user.id);
      if (response.success && response.data) {
        const chatRoomData: ChatRoom[] = await Promise.all(
          response.data.map(async (chatRoom: any) => {
            // Get the last message for each chat room
            const messagesResponse = await ApiService.getChatRoomMessagesPaginated(chatRoom.id, 0, 1);
            const lastMessage = messagesResponse.success && messagesResponse.data?.content?.length > 0 
              ? messagesResponse.data.content[0] 
              : null;

            // Get mentor info
            const mentorResponse = await ApiService.getMentorById(chatRoom.mentorId);
            const mentor = mentorResponse.success ? mentorResponse.data : null;

            return {
              id: chatRoom.id,
              mentorId: chatRoom.mentorId || 'unknown',
              mentorName: mentor?.name || chatRoom.name || 'Unknown Mentor',
              mentorPhoto: mentor?.photo || `https://via.placeholder.com/60x60/4A90E2/FFFFFF?text=${(mentor?.name || 'M').charAt(0)}`,
              lastMessage: lastMessage?.content || 'No messages yet',
              lastMessageTime: lastMessage?.createdAt || chatRoom.createdAt || new Date().toISOString(),
              unreadCount: 0, // TODO: Implement unread count logic
              isOnline: Math.random() > 0.3, // TODO: Get real online status
            };
          })
        );
        
        // Sort by last message time (most recent first)
        chatRoomData.sort((a, b) => 
          new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
        );
        
        setChatRooms(chatRoomData);
      } else {
        setChatRooms([]);
      }
    } catch (error) {
      console.error('Error loading chat rooms:', error);
      setChatRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadChatRooms();
    setRefreshing(false);
  };

  const handleChatPress = (chat: ChatRoom) => {
    router.push({
      pathname: '/chatbox',
      params: {
        astrologerId: chat.mentorId,
        astrologerName: chat.mentorName,
        astrologerImage: chat.mentorPhoto,
        isOnline: chat.isOnline.toString(),
      }
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return diffInMinutes < 1 ? 'Just now' : `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else if (diffInHours < 168) { // Less than a week
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const getTotalUnreadCount = () => {
    return chatRooms.reduce((total, room) => total + room.unreadCount, 0);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0052CC" />
      
      {/* Header */}
      <LinearGradient
        colors={['#0052CC', '#0066FF']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Chats</Text>
          {getTotalUnreadCount() > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{getTotalUnreadCount()}</Text>
            </View>
          )}
        </View>
      </LinearGradient>

      {/* Chat List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0052CC" />
          <Text style={styles.loadingText}>Loading chats...</Text>
        </View>
      ) : chatRooms.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubbles-outline" size={80} color="#CCC" />
          <Text style={styles.emptyTitle}>No Chats Yet</Text>
          <Text style={styles.emptySubtext}>
            Start a conversation with a mentor
          </Text>
          <TouchableOpacity 
            style={styles.browseMentorsButton}
            onPress={() => router.push('/(tabs)/mentors')}
          >
            <Text style={styles.browseMentorsText}>Browse Mentors</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView 
          style={styles.chatList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {chatRooms.map((chat) => (
            <TouchableOpacity
              key={chat.id}
              style={styles.chatItem}
              onPress={() => handleChatPress(chat)}
              activeOpacity={0.7}
            >
              <View style={styles.avatarContainer}>
                <Image 
                  source={{ uri: chat.mentorPhoto }}
                  style={styles.avatar}
                />
                {chat.isOnline && <View style={styles.onlineIndicator} />}
              </View>
              
              <View style={styles.chatContent}>
                <View style={styles.chatHeader}>
                  <Text style={styles.mentorName} numberOfLines={1}>
                    {chat.mentorName}
                  </Text>
                  <Text style={styles.timeText}>
                    {formatTime(chat.lastMessageTime)}
                  </Text>
                </View>
                
                <View style={styles.chatFooter}>
                  <Text 
                    style={[
                      styles.lastMessage,
                      chat.unreadCount > 0 && styles.unreadMessage
                    ]}
                    numberOfLines={1}
                  >
                    {chat.lastMessage}
                  </Text>
                  
                  {chat.unreadCount > 0 && (
                    <View style={styles.messageBadge}>
                      <Text style={styles.messageBadgeText}>
                        {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: 10,
  },
  unreadBadge: {
    backgroundColor: '#FF4444',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  browseMentorsButton: {
    backgroundColor: '#0052CC',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  browseMentorsText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  chatList: {
    flex: 1,
  },
  chatItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
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
  chatContent: {
    flex: 1,
    justifyContent: 'center',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  mentorName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    flex: 1,
    marginRight: 10,
  },
  timeText: {
    fontSize: 13,
    color: '#999',
  },
  chatFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 15,
    color: '#666',
    flex: 1,
    marginRight: 10,
  },
  unreadMessage: {
    color: '#000',
    fontWeight: '500',
  },
  messageBadge: {
    backgroundColor: '#0052CC',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 3,
    minWidth: 20,
    alignItems: 'center',
  },
  messageBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
