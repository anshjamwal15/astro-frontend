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
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUser, getFirstName } from '../../contexts/UserContext';
import { ApiService } from '../../services/apiService';
import AppHeader from '../../components/AppHeader';

interface ChatRoom {
  id: string;
  mentorId: string;
  mentorName: string;
  mentorPhoto: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
  imageError?: boolean;
}

export default function ChatScreen() {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useUser();
  const firstName = user ? getFirstName(user.name) : 'User';

  useEffect(() => {
    if (user?.id) {
      loadChatRooms();
    }
  }, [user?.id]);

  const loadChatRooms = async () => {
    // TODO: implement
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

  const handleImageError = (chatId: string) => {
    setChatRooms(prevRooms =>
      prevRooms.map(room =>
        room.id === chatId ? { ...room, imageError: true } : room
      )
    );
  };

  const formatTime = (dateString: string): string => {
    // TODO: implement
    return '';
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0052CC" />

      <AppHeader
        firstName={firstName}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

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
                {chat.imageError ? (
                  <View style={styles.avatarFallback}>
                    <Ionicons name="person" size={32} color="#666" />
                  </View>
                ) : (
                  <Image
                    source={{ uri: chat.mentorPhoto }}
                    style={styles.avatar}
                    onError={() => handleImageError(chat.id)}
                  />
                )}
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
  avatarFallback: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
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
