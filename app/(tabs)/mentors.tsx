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
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUser, getFirstName } from '../../contexts/UserContext';
import { WalletService } from '../../services/WalletService';
import WalletBalance from '../../components/WalletBalance';
import { ApiService } from '../../services/apiService';

interface Mentor {
  id: string;
  name: string;
  email: string;
  mobile: string;
  specialization?: string;
  languages?: string;
  experience?: string;
  rating: number;
  ratingCount: number;
  price?: number;
  originalPrice?: number;
  isOnline: boolean;
  hasSpecialOffer?: boolean;
  photo?: string;
}

export default function MentorsScreen() {
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [filteredMentors, setFilteredMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const filters = ['All', 'NEW!', 'Love', 'Career'];

  const firstName = user ? getFirstName(user.name) : 'User';

  useEffect(() => {
    if (user?.id) {
      loadMentors();
    }
  }, [user?.id]);

  useEffect(() => {
    filterContent();
  }, [selectedFilter, mentors]);

  const loadMentors = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getMentors();
      if (response.success && response.data) {
        const mentorsWithDefaults = response.data.map((mentor: any) => ({
          ...mentor,
          specialization: mentor.specialization || 'Vedic Astrology',
          languages: mentor.languages || 'English, Hindi',
          experience: mentor.experience || '5+ Years',
          price: mentor.price || 17,
          originalPrice: mentor.originalPrice || 21,
          isOnline: Math.random() > 0.3,
          hasSpecialOffer: Math.random() > 0.5,
          photo: mentor.photo || `https://via.placeholder.com/60x60/4A90E2/FFFFFF?text=${mentor.name.charAt(0)}`
        }));
        setMentors(mentorsWithDefaults);
      }
    } catch (error) {
      console.error('Error loading mentors:', error);
      Alert.alert('Error', 'Failed to load mentors. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterContent = () => {
    let filteredMentorsList = mentors;
    
    if (selectedFilter !== 'All') {
      filteredMentorsList = filteredMentorsList.filter(mentor => {
        switch (selectedFilter) {
          case 'Love':
            return mentor.specialization?.toLowerCase().includes('love') || 
                   mentor.specialization?.toLowerCase().includes('relationship');
          case 'Career':
            return mentor.specialization?.toLowerCase().includes('career') || 
                   mentor.specialization?.toLowerCase().includes('business');
          case 'NEW!':
            return mentor.experience?.includes('2 Years') || mentor.experience?.includes('3 Years');
          default:
            return true;
        }
      });
    }
    setFilteredMentors(filteredMentorsList);
  };

  const handleChatPress = async (mentor: Mentor) => {
    if (!user?.id) {
      Alert.alert('Error', 'Please login to start a chat.');
      return;
    }

    try {
      const balanceCheck = await WalletService.canStartSession(user.id, 'CHAT');
      
      if (!balanceCheck.canStart) {
        Alert.alert(
          'Insufficient Balance',
          balanceCheck.message + '\n\nWould you like to add money to your wallet?',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Add Money', 
              onPress: () => {
                Alert.alert('Add Money', 'Use the "Add Money" button in the wallet section above.');
              }
            }
          ]
        );
        return;
      }

      const sessionId = `chat_${user.id}_${mentor.id}_${Date.now()}`;
      
      try {
        const sessionStatus = await WalletService.startSession(
          sessionId,
          user.id,
          mentor.id,
          'CHAT'
        );

        if (sessionStatus.status === 'STARTED') {
          router.push({
            pathname: '/chatbox',
            params: {
              astrologerId: mentor.id,
              astrologerName: mentor.name,
              astrologerImage: mentor.photo,
              isOnline: mentor.isOnline.toString(),
              sessionId: sessionId,
              ratePerMinute: sessionStatus.ratePerMinute.toString(),
            }
          });
        } else {
          Alert.alert('Error', sessionStatus.message || 'Failed to start chat session');
        }
      } catch (sessionError: any) {
        console.error('Session error details:', sessionError);
        Alert.alert('Session Error', 'Unable to start session. Please try again or contact support.');
      }

    } catch (error: any) {
      console.error('Balance check error:', error);
      Alert.alert('Error', 'Unable to check balance. Please try again.');
    }
  };

  const handleVideoCallPress = async (mentor: Mentor) => {
    Alert.alert(
      'Coming Soon',
      'Video call feature will be available soon!',
      [{ text: 'OK' }]
    );
  };

  const renderStars = (rating: number, mentorId: string) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Text key={`star-${mentorId}-${index}`} style={styles.star}>
        {index < rating ? '★' : '☆'}
      </Text>
    ));
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#0052CC" />
      
      <LinearGradient
        colors={['#0052CC', '#0066FF']}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <View style={styles.userInfo}>
            <Image 
              source={{ uri: user?.profilePicture || `https://via.placeholder.com/40x40/4A90E2/FFFFFF?text=${firstName.charAt(0)}` }}
              style={styles.userAvatar}
            />
            <Text style={styles.greeting}>Hi {firstName}</Text>
          </View>
          
          <WalletBalance showAddMoney={true} />
        </View>
      </LinearGradient>

      <View style={styles.filterContainer}>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterIcon}>⚙️</Text>
          <Text style={styles.filterText}>Filter</Text>
        </TouchableOpacity>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterTab,
                selectedFilter === filter && styles.activeFilterTab
              ]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text style={[
                styles.filterTabText,
                selectedFilter === filter && styles.activeFilterTabText
              ]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0052CC" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {filteredMentors.length > 0 ? (
            filteredMentors.map((mentor) => (
              <View key={mentor.id} style={styles.astrologerCard}>
                <View style={styles.astrologerInfo}>
                  <View style={styles.astrologerImageContainer}>
                    <Image 
                      source={{ uri: mentor.photo }}
                      style={styles.astrologerImage}
                    />
                    {mentor.isOnline && <View style={styles.onlineIndicator} />}
                  </View>
                  
                  <View style={styles.astrologerDetails}>
                    <Text style={styles.astrologerName}>{mentor.name}</Text>
                    <Text style={styles.specialization}>{mentor.specialization}</Text>
                    <Text style={styles.languages}>{mentor.languages}</Text>
                    <Text style={styles.experience}>Exp- {mentor.experience}</Text>
                    
                    <View style={styles.ratingContainer}>
                      <View style={styles.stars}>
                        {renderStars(mentor.rating, mentor.id)}
                      </View>
                      <Text style={styles.orders}>{mentor.ratingCount} ratings</Text>
                    </View>
                    
                    {mentor.hasSpecialOffer && (
                      <View style={styles.specialOfferContainer}>
                        <Text style={styles.specialOfferIcon}>🎁</Text>
                        <Text style={styles.specialOfferText}>Special offer for new users</Text>
                      </View>
                    )}
                  </View>
                </View>
                
                <View style={styles.priceAndAction}>
                  <View style={styles.priceContainer}>
                    <Text style={styles.originalPrice}>₹ {mentor.originalPrice}</Text>
                    <Text style={styles.currentPrice}>₹ {mentor.price}/min</Text>
                  </View>
                  
                  <View style={styles.actionButtons}>
                    <TouchableOpacity 
                      style={styles.chatButton}
                      onPress={() => handleChatPress(mentor)}
                    >
                      <Ionicons name="chatbubbles" size={14} color="#4CAF50" />
                      <Text style={styles.chatButtonText}>Chat</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.videoCallButton}
                      onPress={() => handleVideoCallPress(mentor)}
                    >
                      <Ionicons name="videocam" size={14} color="#FFFFFF" />
                      <Text style={styles.videoCallButtonText}>Video</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.noResultsContainer}>
              <Text style={styles.noResultsText}>No mentors available</Text>
              <Text style={styles.noResultsSubtext}>Please try again later</Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  greeting: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  filterIcon: {
    fontSize: 16,
    marginRight: 5,
  },
  filterText: {
    fontSize: 14,
    color: '#666',
  },
  filterScroll: {
    flex: 1,
  },
  filterTab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
  },
  activeFilterTab: {
    backgroundColor: '#0052CC',
  },
  filterTabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeFilterTabText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  astrologerCard: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  astrologerInfo: {
    flex: 1,
    flexDirection: 'row',
  },
  astrologerImageContainer: {
    position: 'relative',
    marginRight: 15,
  },
  astrologerImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  astrologerDetails: {
    flex: 1,
  },
  astrologerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  specialization: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  languages: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  experience: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stars: {
    flexDirection: 'row',
    marginRight: 10,
  },
  star: {
    fontSize: 14,
    color: '#FF8C42',
  },
  orders: {
    fontSize: 12,
    color: '#999',
  },
  specialOfferContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  specialOfferIcon: {
    fontSize: 12,
    marginRight: 5,
  },
  specialOfferText: {
    fontSize: 12,
    color: '#999',
  },
  priceAndAction: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  priceContainer: {
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  originalPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  actionButtons: {
    gap: 8,
  },
  chatButton: {
    backgroundColor: '#E8F5E8',
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chatButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  videoCallButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  videoCallButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  noResultsText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
    textAlign: 'center',
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
