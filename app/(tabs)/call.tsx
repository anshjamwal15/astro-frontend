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

interface CallHistory {
  id: string;
  mentorId: string;
  mentorName: string;
  mentorPhoto: string;
  callType: 'voice' | 'video';
  callStatus: 'completed' | 'missed' | 'declined';
  duration: string;
  timestamp: string;
  cost: number;
}

export default function CallScreen() {
  const [selectedTab, setSelectedTab] = useState<'mentors' | 'history'>('mentors');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [filteredMentors, setFilteredMentors] = useState<Mentor[]>([]);
  const [callHistory, setCallHistory] = useState<CallHistory[]>([]);
  const [filteredCalls, setFilteredCalls] = useState<CallHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const filters = ['All', 'NEW!', 'Love', 'Career'];

  // Get user's first name for greeting
  const firstName = user ? getFirstName(user.name) : 'User';

  useEffect(() => {
    if (user?.id) {
      loadMentors();
      loadCallHistory();
    }
  }, [user?.id]);

  useEffect(() => {
    if (selectedTab === 'mentors') {
      filterMentors();
    } else {
      setFilteredCalls(callHistory);
    }
  }, [selectedFilter, mentors, callHistory, selectedTab]);

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
          isOnline: Math.random() > 0.3, // Random online status for demo
          hasSpecialOffer: Math.random() > 0.5,
          photo: mentor.photo || `https://via.placeholder.com/60x60/4A90E2/FFFFFF?text=${mentor.name.charAt(0)}`
        }));
        setMentors(mentorsWithDefaults);
      } else {
        Alert.alert('Error', 'Failed to load mentors. Please try again.');
      }
    } catch (error: any) {
      console.error('Error loading mentors:', error);
      Alert.alert('Error', 'Failed to load mentors. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const loadCallHistory = async () => {
    try {
      if (!user?.id) return;
      
      // Get user's video sessions (call history) from backend
      const response = await ApiService.getUserBookings(user.id);
      if (response.success && response.data) {
        const callHistoryData: CallHistory[] = await Promise.all(
          response.data
            .filter((booking: any) => booking.serviceType === 'VIDEO_CALL' || booking.serviceType === 'AUDIO_CALL')
            .map(async (booking: any) => {
              // Get mentor info
              const mentorResponse = await ApiService.getMentorById(booking.mentorId);
              const mentor = mentorResponse.success ? mentorResponse.data : null;

              return {
                id: booking.id,
                mentorId: booking.mentorId,
                mentorName: mentor?.name || 'Unknown Mentor',
                mentorPhoto: mentor?.photo || `https://via.placeholder.com/60x60/4A90E2/FFFFFF?text=${(mentor?.name || 'M').charAt(0)}`,
                callType: booking.serviceType === 'VIDEO_CALL' ? 'video' : 'voice',
                callStatus: booking.status === 'COMPLETED' ? 'completed' : 
                          booking.status === 'CANCELLED' ? 'declined' : 'missed',
                duration: booking.duration ? `${Math.floor(booking.duration / 60)}:${(booking.duration % 60).toString().padStart(2, '0')}` : '0:00',
                timestamp: booking.scheduledTime || booking.createdAt || new Date().toISOString(),
                cost: booking.totalCost || 0,
              };
            })
        );
        
        // Sort by timestamp (most recent first)
        callHistoryData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        
        setCallHistory(callHistoryData);
      } else {
        setCallHistory([]);
      }
    } catch (error) {
      console.error('Error loading call history:', error);
      setCallHistory([]);
    }
  };

  const filterMentors = () => {
    let filtered = mentors;
    
    // Filter by category only
    if (selectedFilter !== 'All') {
      filtered = filtered.filter(mentor => {
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
    
    setFilteredMentors(filtered);
  };

  const handleCallPress = async (mentor: Mentor) => {
    Alert.alert(
      'Coming Soon',
      'Audio call feature will be available soon!',
      [{ text: 'OK' }]
    );
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
      <Text key={`${mentorId}-star-${index}`} style={styles.star}>
        {index < rating ? '★' : '☆'}
      </Text>
    ));
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const getCallStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'missed': return '#FF9800';
      case 'declined': return '#F44336';
      default: return '#666';
    }
  };

  const getCallStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return 'checkmark-circle';
      case 'missed': return 'alert-circle';
      case 'declined': return 'close-circle';
      default: return 'help-circle';
    }
  };

  const handleCallHistoryPress = (call: CallHistory) => {
    Alert.alert(
      'Call Details',
      `Mentor: ${call.mentorName}\nType: ${call.callType}\nDuration: ${call.duration}\nCost: ₹${call.cost.toFixed(2)}`,
      [{ text: 'OK' }]
    );
  };

  const renderCallHistory = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      {filteredCalls.length > 0 ? (
        filteredCalls.map((call) => (
          <TouchableOpacity
            key={call.id}
            style={styles.historyItem}
            onPress={() => handleCallHistoryPress(call)}
          >
            <View style={styles.historyImageContainer}>
              <Image source={{ uri: call.mentorPhoto }} style={styles.historyImage} />
            </View>
            
            <View style={styles.historyContent}>
              <View style={styles.historyHeader}>
                <Text style={styles.historyName}>{call.mentorName}</Text>
                <Text style={styles.historyTime}>{formatTime(call.timestamp)}</Text>
              </View>
              
              <View style={styles.historyFooter}>
                <View style={styles.callInfo}>
                  <Ionicons 
                    name={call.callType === 'video' ? 'videocam' : 'call'} 
                    size={16} 
                    color={getCallStatusColor(call.callStatus)} 
                  />
                  <Text style={[styles.callType, { color: getCallStatusColor(call.callStatus) }]}>
                    {call.callType === 'video' ? 'Video' : 'Voice'} • {call.duration}
                  </Text>
                </View>
                
                <View style={styles.callStatusContainer}>
                  <Ionicons 
                    name={getCallStatusIcon(call.callStatus)} 
                    size={16} 
                    color={getCallStatusColor(call.callStatus)} 
                  />
                  {call.cost > 0 && (
                    <Text style={styles.callCost}>₹{call.cost.toFixed(2)}</Text>
                  )}
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))
      ) : (
        <View style={styles.noResultsContainer}>
          <Ionicons name="call-outline" size={64} color="#CCC" />
          <Text style={styles.noResultsText}>No call history</Text>
          <Text style={styles.noResultsSubtext}>Your calls will appear here</Text>
        </View>
      )}
    </ScrollView>
  );

  const renderTabContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0052CC" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      );
    }

    return selectedTab === 'history' ? renderCallHistory() : renderMentors();
  };

  const renderMentors = () => (
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
                  style={styles.callButton}
                  onPress={() => handleCallPress(mentor)}
                >
                  <Ionicons name="call" size={14} color="#4CAF50" />
                  <Text style={styles.callButtonText}>Call</Text>
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
          <Text style={styles.noResultsText}>
            No mentors available
          </Text>
          <Text style={styles.noResultsSubtext}>
            Please try again later
          </Text>
        </View>
      )}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#0052CC" />
      
      {/* Header */}
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
          
          <WalletBalance 
            onBalanceUpdate={() => {}} // No need for callback since WalletBalance handles its own state
            showAddMoney={true}
          />
        </View>
      </LinearGradient>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'mentors' && styles.activeTab]}
          onPress={() => setSelectedTab('mentors')}
        >
          <Ionicons 
            name="people" 
            size={20} 
            color={selectedTab === 'mentors' ? '#0052CC' : '#666'} 
          />
          <Text style={[styles.tabText, selectedTab === 'mentors' && styles.activeTabText]}>
            Mentors
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'history' && styles.activeTab]}
          onPress={() => setSelectedTab('history')}
        >
          <Ionicons 
            name="time" 
            size={20} 
            color={selectedTab === 'history' ? '#0052CC' : '#666'} 
          />
          <Text style={[styles.tabText, selectedTab === 'history' && styles.activeTabText]}>
            Call History
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs - Only show for mentors tab */}
      {selectedTab === 'mentors' && (
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
      )}

      {/* Content */}
      {renderTabContent()}
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
    marginBottom: 15,
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
  callButton: {
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
  callButtonText: {
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
  
  // Tab Navigation Styles
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#0052CC',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#0052CC',
    fontWeight: '600',
  },
  
  // History Item Styles
  historyItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  historyImageContainer: {
    position: 'relative',
    marginRight: 15,
  },
  historyImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  historyContent: {
    flex: 1,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  historyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  historyTime: {
    fontSize: 12,
    color: '#999',
  },
  historyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  // Call History Styles
  callInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  callType: {
    fontSize: 14,
    marginLeft: 6,
    fontWeight: '500',
  },
  callStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  callCost: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
  },
});