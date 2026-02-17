import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ApiService } from '../../../services/apiService';

interface ChatRoom {
  id: string;
  name: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  clientName: string;
  clientImage?: string;
  isOnline: boolean;
}

export default function MentorChat() {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [mentorData] = useState({
    id: 'mentor_1',
    name: 'Dr. Rajesh Sharma',
    isOnline: true,
  });

  useEffect(() => {
    loadChatRooms();
  }, []);

  const loadChatRooms = async () => {
    try {
      setIsLoading(true);
      
      // Try to get real chat rooms for the mentor from the API
      const response = await ApiService.getUserChatRooms(mentorData.id);
      
      if (response.success && response.data) {
        // Transform API data to match our ChatRoom interface
        const transformedRooms: ChatRoom[] = response.data.map((room: any) => ({
          id: room.id,
          name: room.name,
          lastMessage: 'Start a conversation...',
          lastMessageTime: new Date().toISOString(),
          unreadCount: 0,
          clientName: room.name.replace('chat_', '').replace('_mentor1', '') || 'Client',
          clientImage: 'https://randomuser.me/api/portraits/lego/1.jpg',
          isOnline: false,
        }));
        
        setChatRooms(transformedRooms);
      } else {
        console.log('No chat rooms found for mentor');
        setChatRooms([]);
      }
    } catch (error) {
      console.error('Error loading chat rooms:', error);
      Alert.alert('Error', 'Failed to load chats. Please try again.');
      setChatRooms([]);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadChatRooms();
    setRefreshing(false);
  };

  const handleChatPress = (chatRoom: ChatRoom) => {
    // Navigate to mentor chatbox with client details
    router.push({
      pathname: '/mentor/mentor-chatbox',
      params: {
        chatRoomId: chatRoom.id,
        clientName: chatRoom.clientName,
        clientImage: chatRoom.clientImage || 'https://randomuser.me/api/portraits/lego/1.jpg',
        isOnline: chatRoom.isOnline.toString(),
      }
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
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
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>My Chats</Text>
            {getTotalUnreadCount() > 0 && (
              <View style={styles.totalUnreadBadge}>
                <Text style={styles.totalUnreadText}>{getTotalUnreadCount()}</Text>
              </View>
            )}
          </View>
          
          <View style={styles.headerRight}>
            <View style={styles.onlineStatusContainer}>
              <View style={[styles.statusDot, { backgroundColor: mentorData.isOnline ? '#4CAF50' : '#FF5722' }]} />
              <Text style={styles.statusText}>
                {mentorData.isOnline ? 'Online' : 'Offline'}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Chat List */}
      <ScrollView 
        style={styles.chatList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading chats...</Text>
          </View>
        ) : chatRooms.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={64} color="#CCC" />
            <Text style={styles.emptyTitle}>No Chats Yet</Text>
            <Text style={styles.emptySubtitle}>
              Your client conversations will appear here
            </Text>
          </View>
        ) : (
          chatRooms.map((chatRoom) => (
            <TouchableOpacity
              key={chatRoom.id}
              style={styles.chatItem}
              onPress={() => handleChatPress(chatRoom)}
              activeOpacity={0.7}
            >
              <View style={styles.clientImageContainer}>
                <Image 
                  source={{ uri: chatRoom.clientImage }}
                  style={styles.clientImage}
                />
                {chatRoom.isOnline && <View style={styles.onlineIndicator} />}
              </View>
              
              <View style={styles.chatContent}>
                <View style={styles.chatHeader}>
                  <Text style={styles.clientName}>{chatRoom.clientName}</Text>
                  <Text style={styles.messageTime}>
                    {formatTime(chatRoom.lastMessageTime || '')}
                  </Text>
                </View>
                
                <View style={styles.chatFooter}>
                  <Text 
                    style={[
                      styles.lastMessage,
                      chatRoom.unreadCount > 0 && styles.unreadMessage
                    ]}
                    numberOfLines={1}
                  >
                    {chatRoom.lastMessage || 'No messages yet'}
                  </Text>
                  
                  {chatRoom.unreadCount > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadCount}>
                        {chatRoom.unreadCount > 99 ? '99+' : chatRoom.unreadCount}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Link href="/mentor/broadcast" asChild>
          <TouchableOpacity style={styles.quickActionButton}>
            <Ionicons name="megaphone" size={20} color="#0052CC" />
            <Text style={styles.quickActionText}>Broadcast</Text>
          </TouchableOpacity>
        </Link>
        
        <Link href="/mentor/(tabs)/settings" asChild>
          <TouchableOpacity style={styles.quickActionButton}>
            <Ionicons name="settings" size={20} color="#0052CC" />
            <Text style={styles.quickActionText}>Settings</Text>
          </TouchableOpacity>
        </Link>
        
        <Link href="/mentor/chat-analytics" asChild>
          <TouchableOpacity style={styles.quickActionButton}>
            <Ionicons name="analytics" size={20} color="#0052CC" />
            <Text style={styles.quickActionText}>Analytics</Text>
          </TouchableOpacity>
        </Link>
      </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginRight: 10,
  },
  totalUnreadBadge: {
    backgroundColor: '#FF4444',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  totalUnreadText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  onlineStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
  chatList: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  chatItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  clientImageContainer: {
    position: 'relative',
    marginRight: 15,
  },
  clientImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
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
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  messageTime: {
    fontSize: 12,
    color: '#999',
  },
  chatFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    marginRight: 10,
  },
  unreadMessage: {
    color: '#333',
    fontWeight: '500',
  },
  unreadBadge: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  unreadCount: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    justifyContent: 'space-around',
  },
  quickActionButton: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  quickActionText: {
    fontSize: 12,
    color: '#0052CC',
    fontWeight: '500',
    marginTop: 4,
  },
});