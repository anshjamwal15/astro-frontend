import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TextInput,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useUser } from '../../contexts/UserContext';
import { ApiService } from '../../services/apiService';

// Fallback BlurView component for compatibility
const BlurView = ({ children, style }: any) => {
  return (
    <View style={[style, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]}>
      {children}
    </View>
  );
};

const { width, height } = Dimensions.get('window');

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  timestamp: string;
  read: boolean;
}

export default function NotificationsScreen() {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Welcome to ADVIJR',
      message: 'Your journey begins now! Explore services and connect with expert advisors.',
      type: 'welcome',
      timestamp: new Date().toISOString(),
      read: false,
    },
    {
      id: '2',
      title: 'Daily Horoscope Ready',
      message: 'Your personalized horoscope for today is ready. Check what the stars have in store for you!',
      type: 'horoscope',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      read: true,
    },
    {
      id: '3',
      title: 'New Astrologer Available',
      message: 'Priya Sharma, a renowned tarot card reader, is now available for consultations.',
      type: 'promotion',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      read: true,
    },
    {
      id: '4',
      title: 'Consultation Reminder',
      message: 'Your consultation with Mahesh Pandit is scheduled for tomorrow at 3:00 PM.',
      type: 'reminder',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      read: false,
    },
  ]);

  const handleRefresh = async () => {
    setLoading(true);
    // Simulate loading new notifications
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'welcome': return '🎉';
      case 'horoscope': return '🌟';
      case 'reminder': return '⏰';
      case 'promotion': return '🎁';
      default: return '📢';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <View style={styles.cosmicBackground}>
        <LinearGradient
          colors={['#0B1426', '#1A0B3D', '#2D1B69', '#0B1426']}
          locations={[0, 0.3, 0.7, 1]}
          style={styles.cosmicGradient}
        />

        <LinearGradient
          colors={['rgba(11,20,38,0.3)', 'rgba(26,11,61,0.6)', 'rgba(45,27,105,0.8)', 'rgba(11,20,38,0.9)']}
          locations={[0, 0.3, 0.7, 1]}
          style={styles.overlay}
        >
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Text style={styles.backButtonText}>←</Text>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Notifications</Text>
              <TouchableOpacity 
                style={styles.refreshButton}
                onPress={handleRefresh}
              >
                <Text style={styles.refreshButtonText}>🔄</Text>
              </TouchableOpacity>
            </View>

            {/* Stats Section */}
            <View style={styles.section}>
              <BlurView style={styles.statsCard}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{notifications.length}</Text>
                  <Text style={styles.statLabel}>Total Notifications</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {notifications.filter(n => !n.read).length}
                  </Text>
                  <Text style={styles.statLabel}>Unread</Text>
                </View>
              </BlurView>
            </View>

            {/* Notifications List */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Notifications</Text>
              
              {notifications.map((notification) => (
                <TouchableOpacity
                  key={notification.id}
                  style={styles.notificationCard}
                  onPress={() => markAsRead(notification.id)}
                >
                  <BlurView style={[
                    styles.notificationContent,
                    !notification.read && styles.unreadNotification
                  ]}>
                    <View style={styles.notificationHeader}>
                      <View style={styles.notificationIcon}>
                        <Text style={styles.notificationIconText}>
                          {getNotificationIcon(notification.type)}
                        </Text>
                      </View>
                      <View style={styles.notificationMeta}>
                        <Text style={styles.notificationTitle}>{notification.title}</Text>
                        <Text style={styles.notificationTimestamp}>
                          {formatTimestamp(notification.timestamp)}
                        </Text>
                      </View>
                      {!notification.read && (
                        <View style={styles.unreadDot} />
                      )}
                    </View>
                    <Text style={styles.notificationMessage}>{notification.message}</Text>
                    <View style={styles.notificationFooter}>
                      <Text style={styles.notificationTypeLabel}>
                        {notification.type.toUpperCase()}
                      </Text>
                    </View>
                  </BlurView>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ height: 100 }} />
          </ScrollView>
        </LinearGradient>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1426',
  },
  cosmicBackground: {
    flex: 1,
    width: width,
    height: height,
  },
  cosmicGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlay: {
    flex: 1,
    paddingTop: StatusBar.currentHeight || 0,
  },
  scrollView: {
    flex: 1,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: 'white',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
  },
  placeholder: {
    width: 44,
  },
  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 82, 204, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshButtonText: {
    fontSize: 20,
  },

  // Stats
  statsCard: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0052CC',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 20,
  },

  // Sections
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    marginBottom: 16,
  },

  // Form
  formCard: {
    borderRadius: 20,
    padding: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  textInput: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: '500',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: 'white',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  typeButtonActive: {
    backgroundColor: 'rgba(0, 82, 204, 0.2)',
    borderColor: '#0052CC',
  },
  typeButtonText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontWeight: '600',
  },
  typeButtonTextActive: {
    color: '#0052CC',
  },
  sendButton: {
    marginTop: 8,
  },
  sendButtonGradient: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '700',
  },

  // Notifications
  notificationCard: {
    marginBottom: 12,
  },
  notificationContent: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  unreadNotification: {
    backgroundColor: 'rgba(0, 82, 204, 0.1)',
    borderColor: 'rgba(0, 82, 204, 0.3)',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 82, 204, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationIconText: {
    fontSize: 20,
  },
  notificationMeta: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    marginBottom: 2,
  },
  notificationTimestamp: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0052CC',
  },
  notificationMessage: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationFooter: {
    alignItems: 'flex-start',
  },
  notificationTypeLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0052CC',
    backgroundColor: 'rgba(0, 82, 204, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
});