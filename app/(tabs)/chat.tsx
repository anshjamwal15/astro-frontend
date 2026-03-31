import React, { useState, useEffect, useRef } from 'react';
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
import AppHeader from '../../components/AppHeader';
import { ChatService, ChatRoom as FirestoreChatRoom } from '../../services/chatService';
import { logger } from '../../utils/Logger';

export default function ChatScreen() {
  const [chatRooms, setChatRooms] = useState<FirestoreChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useUser();
  const firstName = user ? getFirstName(user.name) : 'User';
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (user?.id) {
      subscribeToRooms();
    }
    return () => {
      unsubscribeRef.current?.();
    };
  }, [user?.id]);

  const subscribeToRooms = () => {
    setLoading(true);
    unsubscribeRef.current = ChatService.subscribeToUserRooms(
      user!.id,
      (rooms) => {
        setChatRooms(rooms);
        setLoading(false);
        setRefreshing(false);
      },
      (err) => {
        console.error('subscribeToUserRooms error:', err);
        setLoading(false);
        setRefreshing(false);
      }
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    unsubscribeRef.current?.();
    subscribeToRooms();
  };

  const handleChatPress = (room: FirestoreChatRoom) => {
    // Derive the other member's id (mentor) — the one that isn't the current user
    const mentorId = room.members.find((m) => m !== user?.id) ?? '';
    router.push({
      pathname: '/chatbox',
      params: {
        roomId: room.id,
        roomName: room.roomName ?? '',
        astrologerId: mentorId,
        astrologerName: room.name,
        astrologerImage: '',
        isOnline: 'false',
      },
    });
  };

  const formatTime = (timestamp: any): string => {
    if (!timestamp) return '';
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h`;
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
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
          {chatRooms.map((room) => (
            <TouchableOpacity
              key={room.id}
              style={styles.chatItem}
              onPress={() => handleChatPress(room)}
              activeOpacity={0.7}
            >
              <View style={styles.avatarContainer}>
                <View style={styles.avatarFallback}>
                  <Ionicons name="person" size={32} color="#666" />
                </View>
              </View>

              <View style={styles.chatContent}>
                <View style={styles.chatHeader}>
                  <Text style={styles.mentorName} numberOfLines={1}>
                    {room.name ?? room.id}
                  </Text>
                  <Text style={styles.timeText}>
                    {formatTime(room.lastMessageAt)}
                  </Text>
                </View>

                <View style={styles.chatFooter}>
                  <Text style={styles.lastMessage} numberOfLines={1}>
                    {room.lastMessage ?? 'No messages yet'}
                  </Text>
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
  roomNameHint: {
    fontSize: 13,
    fontWeight: '400',
    color: '#999',
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
