import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUser, getFirstName } from '../../contexts/UserContext';
import { ApiService } from '../../services/apiService';
import { WalletService } from '../../services/WalletService';
import { generateVideoRoomName, generateSessionId } from '../../utils/roomNameGenerator';
import PermissionRequest from '../../components/PermissionRequest';
import AppHeader from '../../components/AppHeader';

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [astrologers, setAstrologers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [filteredServices, setFilteredServices] = useState<any[]>([]);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const { user } = useUser();

  // Get user's first name for greeting
  const firstName = user ? getFirstName(user.name) : 'User';

  useEffect(() => {
    loadAstrologers();
    loadCategories();
  }, []);

  const loadAstrologers = async () => {
    setLoading(true);
    try {
      console.log('🔮 Loading astrologers from real API...');
      const astrologersResponse = await ApiService.getMentors();
      if (astrologersResponse.success && astrologersResponse.data) {
        console.log('✅ Astrologers loaded from API:', astrologersResponse.data.length);
        setAstrologers(astrologersResponse.data.slice(0, 3)); // Show first 3
      } else {
        console.log('❌ Failed to load astrologers from API');
        setAstrologers([]);
      }
    } catch (error) {
      console.error('❌ Error loading astrologers:', error);
      setAstrologers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch('http://3.108.112.130:3000/api/category/list', {
        headers: { accept: 'application/hal+json' },
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        // Map API categories to service card shape
        const categoryIconMap: Record<string, string> = {
          'marriage': 'heart',
          'career': 'briefcase',
          'business': 'trending-up',
          'buisness': 'trending-up',
          'study': 'book',
          'health': 'fitness',
          'women': 'female',
        };
        const mapped = data.map((cat: any) => {
          const key = Object.keys(categoryIconMap).find(k =>
            cat.name.toLowerCase().includes(k)
          );
          return {
            id: cat.id,
            title: cat.name,
            description: cat.description,
            icon: key ? categoryIconMap[key] : 'grid',
            keywords: [cat.name.toLowerCase(), cat.description?.toLowerCase() ?? ''],
          };
        });
        setServices(mapped);
        setFilteredServices(mapped);
      }
    } catch (error) {
      console.error('❌ Error loading categories:', error);
    }
  };

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredServices(services);
    } else {
      const filtered = services.filter(service => 
        service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.keywords.some((keyword: string) => 
          keyword.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
      setFilteredServices(filtered);
    }
  }, [searchQuery, services]);

  const handleServicePress = (service: any) => {
    // if (service.title.includes('Buisness\nHelp')) {
      router.push('/(tabs)/mentors');
    // } 

    // } else if (service.title.includes('Kundli')) {
    //   Alert.alert('Coming Soon', 'This feature will be available soon!');
    // } else if (service.title.includes('Horoscope')) {
    //   router.push('/(tabs)/mentors');
    // }
  };

  const handleVideoCall = (astrologer?: any) => {
    if (!user?.id) {
      Alert.alert('Error', 'Please login to start a video call.');
      return;
    }

    if (!astrologer) {
      Alert.alert('Coming Soon', 'Video call feature will be available soon!');
      return;
    }

    const videoRate = (astrologer.rate || astrologer.price || 17) * 2;
    const sessionId = generateSessionId('video'); // Short unique ID
    const roomName = generateVideoRoomName(); // Short unique room name

    Alert.alert(
      'Start Video Call',
      `Video call with ${astrologer.name}\nRate: ₹${videoRate}/min\n\nDo you want to start the call?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start Call',
          onPress: () => {
            router.push({
              pathname: '/video-call-screen',
              params: {
                roomName: roomName,
                isHost: 'true',
                mentorId: astrologer.id,
                sessionId: sessionId,
                ratePerMinute: videoRate.toString(),
              }
            });
          }
        }
      ]
    );
  };

  const handleConsultation = async (astrologer?: any) => {
    if (!user?.id) {
      Alert.alert('Error', 'Please login to start a chat.');
      return;
    }
    if (!astrologer) {
      Alert.alert('Error', 'No mentor selected.');
      return;
    }

    try {
      setLoading(true);
      const { ChatService } = await import('../../services/chatService');
      const { MessageNotificationService } = await import('../../services/MessageNotificationService');
      const roomName = `${user.name} & ${astrologer.name}`;
      const room = await ChatService.createChatRoom(roomName, user.id, astrologer.id);

      // Notify the astrologer about the new chat
      MessageNotificationService.notify(
        astrologer.id,
        user.name,
        user.id,
        `${user.name} wants to start a consultation with you.`,
        room.id,
      ).catch((err) => console.warn('Notification failed:', err));

      router.push({
        pathname: '/chatbox',
        params: {
          roomId: room.id,
          roomName: room.roomName ?? '',
          astrologerId: astrologer.id,
          astrologerName: astrologer.name,
          astrologerImage: astrologer.image ?? '',
          isOnline: (astrologer.isOnline ?? false).toString(),
        },
      });
    } catch (error: any) {
      Alert.alert('Error', error.message ?? 'Failed to create chat room.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0052CC" />
      
      {/* Permission Request Modal */}
      <PermissionRequest onComplete={() => setPermissionsGranted(true)} />
      
      {/* Blue Header */}
      <AppHeader
        firstName={firstName}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={() => {
          if (searchQuery.trim()) console.log('Searching for:', searchQuery);
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Services Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {searchQuery ? `Search Results (${filteredServices.length})` : 'Our Services'}
          </Text>
          <View style={styles.servicesGrid}>
            {filteredServices.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={styles.serviceCard}
                onPress={() => handleServicePress(service)}
              >
                <Ionicons name={service.icon as any} size={30} color="#0052CC" />
                <Text style={styles.serviceTitle}>{service.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
        </View>
        {/* Top Astrologers */}
        <View style={[styles.section, styles.mentorsSection]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Mentors</Text>
            {/* <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity> */}
          </View>
          
          {loading ? (
            <ActivityIndicator size="large" color="#0052CC" style={styles.loader} />
          ) : (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.astrologerScrollContent}
            >
              {astrologers.map((astrologer, index) => (
                <TouchableOpacity
                  key={`astrologer-${astrologer.id}-${index}`}
                  style={styles.astrologerCard}
                  activeOpacity={0.92}
                >
                  {/* Card top gradient strip */}
                  <LinearGradient
                    colors={['#0052CC', '#0066FF']}
                    style={styles.astrologerCardHeader}
                  >
                    <View style={styles.astrologerImageContainer}>
                      {astrologer.image ? (
                        <Image
                          source={astrologer.image}
                          style={styles.astrologerImage}
                        />
                      ) : (
                        <View style={styles.astrologerImagePlaceholder}>
                          <Ionicons name="person" size={30} color="#0052CC" />
                        </View>
                      )}
                      {astrologer.isOnline && <View style={styles.onlineIndicator} />}
                    </View>
                  </LinearGradient>

                  {/* Card body */}
                  <View style={styles.astrologerCardBody}>
                    <Text style={styles.astrologerName} numberOfLines={1}>{astrologer.name}</Text>

                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={11} color="#FFB800" />
                      <Text style={styles.ratingText}>{astrologer.rating ?? '4.5'}</Text>
                    </View>

                    {/* Price rows */}
                    <View style={styles.priceDivider} />
                    <View style={styles.priceRow}>
                      <View style={styles.priceItem}>
                        <Ionicons name="chatbubble-ellipses" size={11} color="#0052CC" />
                        <Text style={styles.priceLabel}>Chat</Text>
                        <Text style={styles.priceText}>₹{astrologer.rate || astrologer.price || 17}/m</Text>
                      </View>
                      <View style={styles.priceSeparator} />
                      <View style={styles.priceItem}>
                        <Ionicons name="videocam" size={11} color="#FF6B6B" />
                        <Text style={styles.priceLabel}>Video</Text>
                        <Text style={styles.priceText}>₹{(astrologer.rate || astrologer.price || 17) * 2}/m</Text>
                      </View>
                    </View>
                    <View style={styles.priceDivider} />

                    {/* Buttons */}
                    <View style={styles.buttonRow}>
                      <TouchableOpacity
                        style={styles.consultButton}
                        onPress={() => handleConsultation(astrologer)}
                      >
                        <Ionicons name="chatbubble-ellipses" size={13} color="#FFFFFF" />
                        <Text style={styles.consultButtonText}>Chat</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.videoCallButton}
                        onPress={() => handleVideoCall(astrologer)}
                      >
                        <Ionicons name="videocam" size={13} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Bottom Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
          >
            <Ionicons name="call" size={24} color="#333" />
            <Text style={styles.actionButtonText}>Call an Mentor</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
              if (astrologers.length > 0) {
                handleConsultation(astrologers[0]);
              } else {
                router.push('/(tabs)/mentors');
              }
            }}
          >
            <Ionicons name="chatbubbles" size={24} color="#333" />
            <Text style={styles.actionButtonText}>Chat with Expert</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.videoRoomButton]}
            onPress={() => router.push('/video-room')}
          >
            <Ionicons name="videocam" size={24} color="#FFFFFF" />
            <Text style={[styles.actionButtonText, styles.videoRoomButtonText]}>Join Video Room</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    marginBottom: 20,
  },
  greetingSection: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  subGreeting: {
    fontSize: 16,
    color: '#E8F0FE',
    marginTop: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  walletButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 10,
  },
  searchButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    paddingBottom: 10,
  },
  viewAllText: {
    fontSize: 14,
    color: '#0052CC',
    fontWeight: '500',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
    marginTop: 10,
  },
  bannerContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  banner: {
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: '#E8F0FE',
    marginBottom: 15,
  },
  bannerButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  bannerButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  loader: {
    marginVertical: 20,
  },
  mentorsSection: {
    paddingBottom: 28,
    paddingTop: 20,
  },
  astrologerScrollContent: {
    paddingRight: 20,
    paddingBottom: 16,
    paddingTop: 8,
  },
  astrologerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginRight: 14,
    width: 148,
    overflow: 'hidden',
    shadowColor: '#0052CC',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 2,
    elevation: 10,
  },
  astrologerCardHeader: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 20,
  },
  astrologerCardBody: {
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingBottom: 12,
    marginTop: -14,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  astrologerImageContainer: {
    position: 'relative',
  },
  astrologerImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  astrologerImagePlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E8F0FE',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
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
  astrologerName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A2E',
    marginTop: 8,
    marginBottom: 3,
    textAlign: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E7',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 20,
    gap: 3,
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 11,
    color: '#B8860B',
    fontWeight: '600',
  },
  priceDivider: {
    width: '100%',
    height: 1,
    backgroundColor: '#F0F4FF',
    marginVertical: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-around',
  },
  priceItem: {
    alignItems: 'center',
    gap: 2,
    flex: 1,
  },
  priceSeparator: {
    width: 1,
    height: 28,
    backgroundColor: '#E8EEFF',
  },
  priceLabel: {
    fontSize: 10,
    color: '#888',
    fontWeight: '500',
  },
  priceText: {
    fontSize: 11,
    color: '#0052CC',
    fontWeight: '700',
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: '100%',
    marginTop: 4,
  },
  consultButton: {
    flex: 1,
    backgroundColor: '#0052CC',
    paddingVertical: 8,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  consultButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  videoCallButton: {
    backgroundColor: '#FF6B6B',
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoCallButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  actionButtonsContainer: {
    padding: 20,
    gap: 15,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginLeft: 15,
  },
  videoRoomButton: {
    backgroundColor: '#0052CC',
  },
  videoRoomButtonText: {
    color: '#FFFFFF',
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  noResultsText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});