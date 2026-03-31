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
import { useMentor } from '../../../contexts/MentorContext';
import { ChatService, ChatRoom } from '../../../services/chatService';

export default function MentorChat() {
  const { mentor } = useMentor();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (mentor?.id) {
      loadChatRooms();
    }
  }, [mentor?.id]);

  const loadChatRooms = async () => {
    if (!mentor?.id) return;
    try {
      setIsLoading(true);
      const rooms = await ChatService.getUserChatRooms(mentor.id);
      setChatRooms(rooms);
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
    // Derive the client name from the room name (format: "ClientName & MentorName")
    const clientName = chatRoom.name.split(' & ')[0] ?? chatRoom.name;
    router.push({
      pathname: '/chatbox',
      params: {
        roomId: chatRoom.id,
        roomName: chatRoom.roomName ?? '',
        astrologerName: clientName,
        astrologerImage: '',
        isOnline: 'false',
        currentUserId: mentor?.id ?? '',
      },
    });
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
          <Text style={styles.headerTitle}>My Chats</Text>
          <View style={styles.onlineStatusContainer}>
            <View style={[styles.statusDot, { backgroundColor: '#4CAF50' }]} />
            <Text style={styles.statusText}>Online</Text>
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
            <Text style={styles.emptySubtitle}>Your client conversations will appear here</Text>
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
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={24} color="#0052CC" />
                </View>
              </View>
              
              <View style={styles.chatContent}>
                <View style={styles.chatHeader}>
                  <Text style={styles.clientName}>{chatRoom.name.split(' & ')[0]}</Text>
                  <Text style={styles.messageTime}>
                    {chatRoom.lastMessageAt ? formatTime(chatRoom.lastMessageAt?.toDate?.()?.toISOString?.() ?? '') : ''}
                  </Text>
                </View>
                <Text style={styles.lastMessage} numberOfLines={1}>
                  {chatRoom.lastMessage ?? 'No messages yet'}
                </Text>
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
  container: { flex: 1, backgroundColor: '#F8F8F8' },
  header: { paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: '600', color: '#FFFFFF' },
  onlineStatusContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 15, paddingHorizontal: 12, paddingVertical: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusText: { fontSize: 12, fontWeight: '500', color: '#FFFFFF' },
  chatList: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  loadingText: { fontSize: 16, color: '#666' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: '#333', marginTop: 20, marginBottom: 8 },
  emptySubtitle: { fontSize: 16, color: '#666', textAlign: 'center', paddingHorizontal: 40 },
  chatItem: { flexDirection: 'row', backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  clientImageContainer: { marginRight: 15 },
  avatarPlaceholder: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#E8F0FE', alignItems: 'center', justifyContent: 'center' },
  chatContent: { flex: 1 },
  chatHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  clientName: { fontSize: 16, fontWeight: '600', color: '#333', flex: 1 },
  messageTime: { fontSize: 12, color: '#999' },
  lastMessage: { fontSize: 14, color: '#666' },
  quickActions: { flexDirection: 'row', backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingVertical: 15, borderTopWidth: 1, borderTopColor: '#E0E0E0', justifyContent: 'space-around' },
  quickActionButton: { alignItems: 'center', paddingVertical: 8, paddingHorizontal: 16 },
  quickActionText: { fontSize: 12, color: '#0052CC', fontWeight: '500', marginTop: 4 },
});