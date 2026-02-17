import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUser, getFirstName } from '../../contexts/UserContext';
import { ApiService } from '../../services/apiService';

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [astrologers, setAstrologers] = useState<any[]>([]);
  const [filteredServices, setFilteredServices] = useState<any[]>([]);
  const { user } = useUser();

  // Get user's first name for greeting
  const firstName = user ? getFirstName(user.name) : 'User';

  useEffect(() => {
    loadAstrologers();
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

  const services = [
    { id: 1, title: 'Buisness\nHelp', icon: 'sunny', keywords: ['horoscope', 'daily', 'astrology', 'prediction'] },
    { id: 2, title: 'Free\nKundli', icon: 'analytics', keywords: ['kundli', 'birth chart', 'free', 'astrology'] },
    { id: 3, title: 'Kundli\nMatching', icon: 'heart', keywords: ['matching', 'compatibility', 'marriage', 'kundli'] },
    { id: 4, title: 'Free\nChat', icon: 'chatbubbles', keywords: ['chat', 'free', 'talk', 'astrologer'] },
  ];

  useEffect(() => {
    setFilteredServices(services);
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredServices(services);
    } else {
      const filtered = services.filter(service => 
        service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.keywords.some(keyword => 
          keyword.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
      setFilteredServices(filtered);
    }
  }, [searchQuery]);

  const handleServicePress = (service: any) => {
    if (service.title.includes('Chat')) {
      router.push('/(tabs)/chat');
    } else if (service.title.includes('Kundli')) {
      Alert.alert('Coming Soon', 'This feature will be available soon!');
    } else if (service.title.includes('Horoscope')) {
      router.push('/(tabs)/horoscope');
    }
  };

  const handleVideoCall = (astrologer?: any) => {
    Alert.alert(
      'Coming Soon',
      'Video call feature will be available soon!',
      [{ text: 'OK' }]
    );
  };

  const handleConsultation = (astrologer?: any) => {
    // If astrologer data is provided, navigate to chatbox directly
    if (astrologer) {
      router.push({
        pathname: '/chatbox',
        params: {
          astrologerId: astrologer.id.toString(),
          astrologerName: astrologer.name,
          astrologerImage: 'https://via.placeholder.com/60x60/4A90E2/FFFFFF?text=' + astrologer.name.charAt(0),
          isOnline: astrologer.isOnline.toString()
        }
      });
    } else {
      // Navigate to chat list
      router.push('/(tabs)/chat');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0052CC" />
      
      {/* Blue Header */}
      <LinearGradient
        colors={['#0052CC', '#0066FF']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.greetingSection}>
            <Text style={styles.greeting}>Hello, {firstName}!</Text>
            <Text style={styles.subGreeting}>Welcome to ADVIJR</Text>
          </View>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <Ionicons name="person" size={20} color="#333" />
          </TouchableOpacity>
        </View>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search astrologers, services..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity 
            style={styles.searchButton}
            onPress={() => {
              if (searchQuery.trim()) {
                // Search functionality is handled by useEffect
                console.log('Searching for:', searchQuery);
              }
            }}
          >
            <Ionicons name="search" size={18} color="#666" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

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

        {/* Promotional Banner */}
        <View style={styles.bannerContainer}>
          <LinearGradient
            colors={['#0052CC', '#0066FF']}
            style={styles.banner}
          >
            <Text style={styles.bannerTitle}>Get Your First Reading</Text>
            <Text style={styles.bannerSubtitle}>FREE for new users!</Text>
            <TouchableOpacity style={styles.bannerButton}>
              <Text style={styles.bannerButtonText}>Claim Now</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Top Astrologers */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Astrologers</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {loading ? (
            <ActivityIndicator size="large" color="#0052CC" style={styles.loader} />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {astrologers.map((astrologer, index) => (
                <TouchableOpacity
                  key={`astrologer-${astrologer.id}-${index}`}
                  style={styles.astrologerCard}
                  onPress={() => handleConsultation(astrologer)}
                >
                  <View style={styles.astrologerImageContainer}>
                    <Image source={astrologer.image} style={styles.astrologerImage} />
                    {astrologer.isOnline && <View style={styles.onlineIndicator} />}
                  </View>
                  <Text style={styles.astrologerName}>{astrologer.name}</Text>
                  <View style={styles.ratingContainer}>
                    <Text style={styles.ratingText}>⭐ {astrologer.rating}</Text>
                  </View>
                  <Text style={styles.priceText}>{astrologer.price}</Text>
                  <TouchableOpacity 
                    style={styles.consultButton}
                    onPress={() => handleConsultation(astrologer)}
                  >
                    <Text style={styles.consultButtonText}>Chat</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.videoCallButton}
                    onPress={() => handleVideoCall(astrologer)}
                  >
                    <Ionicons name="videocam" size={12} color="#FFFFFF" />
                    <Text style={styles.videoCallButtonText}>Video</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Bottom Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/(tabs)/call')}
          >
            <Ionicons name="call" size={24} color="#333" />
            <Text style={styles.actionButtonText}>Call an Astrologer</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/(tabs)/chat')}
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
    color: '#333',
  },
  subGreeting: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
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
    color: '#333',
    marginBottom: 5,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: '#666',
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
  astrologerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    marginRight: 15,
    width: 150,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  astrologerImageContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  astrologerImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  astrologerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
    textAlign: 'center',
  },
  ratingContainer: {
    marginBottom: 5,
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
  },
  priceText: {
    fontSize: 12,
    color: '#FF8C42',
    fontWeight: '600',
    marginBottom: 10,
  },
  consultButton: {
    backgroundColor: '#0052CC',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    marginBottom: 5,
  },
  consultButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  videoCallButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
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