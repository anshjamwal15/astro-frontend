import React, { useState, useEffect, useCallback } from 'react';
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
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUser, getFirstName } from '../../contexts/UserContext';
import { WalletService } from '../../services/WalletService';
import WalletBalance from '../../components/WalletBalance';
import { ApiService } from '../../services/apiService';
import { generateVideoRoomName, generateSessionId } from '../../utils/roomNameGenerator';

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
  rate?: number;
  originalPrice?: number;
  isOnline: boolean;
  hasSpecialOffer?: boolean;
  photo?: string;
}

interface FilterState {
  category: string;
  totalExp: string;
  totalRatings: string;
  nationality: string;
}

const PAGE_SIZE = 10;

export default function MentorsScreen() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [pendingFilters, setPendingFilters] = useState<FilterState>({
    category: '',
    totalExp: '',
    totalRatings: '',
    nationality: '',
  });
  const [appliedFilters, setAppliedFilters] = useState<FilterState>({
    category: '',
    totalExp: '',
    totalRatings: '',
    nationality: '',
  });

  const { user } = useUser();
  const firstName = user ? getFirstName(user.name) : 'User';

  const hasActiveFilters =
    appliedFilters.totalExp !== '' ||
    appliedFilters.totalRatings !== '' ||
    appliedFilters.nationality !== '';

  const buildParams = useCallback(
    (pageNum: number, filters: FilterState, category: string) => {
      const params: Parameters<typeof ApiService.getMentors>[0] = {
        page: pageNum,
        size: PAGE_SIZE,
      };
      const cat = category !== 'All' ? category : filters.category;
      if (cat) params.category = cat;
      if (filters.totalExp) params.totalExp = Number(filters.totalExp);
      if (filters.totalRatings) params.totalRatings = Number(filters.totalRatings);
      if (filters.nationality) params.nationality = filters.nationality;
      return params;
    },
    []
  );

  const loadCategories = async () => {
    try {
      const response = await ApiService.getAllCategories();
      if (response.success && response.data) {
        setCategories(['All', ...response.data.map(c => c.name)]);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadMentors = useCallback(
    async (pageNum: number, filters: FilterState, category: string, append = false) => {
      try {
        append ? setLoadingMore(true) : setLoading(true);
        const params = buildParams(pageNum, filters, category);
        const response = await ApiService.getMentors(params);
        if (response.success && response.data) {
          const mapped = response.data.map((mentor: any) => ({
            ...mentor,
            specialization: mentor.specialization || mentor.expertise?.join(', ') || 'General',
            languages: mentor.languages || 'English',
            price: mentor.price || 17,
            originalPrice: mentor.originalPrice || 21,
            isOnline: Math.random() > 0.3,
            hasSpecialOffer: Math.random() > 0.5,
            photo:
              mentor.photo ||
              `https://via.placeholder.com/60x60/4A90E2/FFFFFF?text=${mentor.name.charAt(0)}`,
          }));
          setMentors(prev => (append ? [...prev, ...mapped] : mapped));
          setTotal(response.pagination?.total ?? mapped.length);
        }
      } catch (error) {
        console.error('Error loading mentors:', error);
        Alert.alert('Error', 'Failed to load mentors. Please try again.');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [buildParams]
  );

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (user?.id) {
      setPage(1);
      setMentors([]);
      loadMentors(1, appliedFilters, selectedCategory);
    }
  }, [user?.id, appliedFilters, selectedCategory]);

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
  };

  const handleApplyFilters = () => {
    setAppliedFilters(pendingFilters);
    setFilterModalVisible(false);
  };

  const handleClearFilters = () => {
    const empty: FilterState = { category: '', totalExp: '', totalRatings: '', nationality: '' };
    setPendingFilters(empty);
    setAppliedFilters(empty);
    setFilterModalVisible(false);
  };

  const handleLoadMore = () => {
    const totalPages = Math.ceil(total / PAGE_SIZE);
    if (loadingMore || page >= totalPages) return;
    const nextPage = page + 1;
    setPage(nextPage);
    loadMentors(nextPage, appliedFilters, selectedCategory, true);
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
            { text: 'Add Money', onPress: () => Alert.alert('Add Money', 'Use the "Add Money" button in the wallet section above.') },
          ]
        );
        return;
      }
      const sessionId = generateSessionId('chat');
      const sessionStatus = await WalletService.startSession(sessionId, user.id, mentor.id, 'CHAT');
      if (sessionStatus.status === 'STARTED') {
        router.push({
          pathname: '/chatbox',
          params: {
            astrologerId: mentor.id,
            astrologerName: mentor.name,
            astrologerImage: mentor.photo,
            isOnline: mentor.isOnline.toString(),
            sessionId,
            ratePerMinute: sessionStatus.ratePerMinute.toString(),
          },
        });
      } else {
        Alert.alert('Error', sessionStatus.message || 'Failed to start chat session');
      }
    } catch (error: any) {
      Alert.alert('Error', 'Unable to check balance. Please try again.');
    }
  };

  const handleVideoCallPress = async (mentor: Mentor) => {
    if (!user?.id) {
      Alert.alert('Error', 'Please login to start a video call.');
      return;
    }
    const videoRate = (mentor.rate || mentor.price || 17) * 2;
    const sessionId = generateSessionId('video');
    const roomName = generateVideoRoomName();
    Alert.alert(
      'Start Video Call',
      `Video call with ${mentor.name}\nRate: ₹${videoRate}/min\n\nDo you want to start the call?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start Call',
          onPress: () =>
            router.push({
              pathname: '/video-call-screen',
              params: { roomName, isHost: 'true', mentorId: mentor.id, sessionId, ratePerMinute: videoRate.toString() },
            }),
        },
      ]
    );
  };

  const renderStars = (rating: number, mentorId: string) =>
    Array.from({ length: 5 }, (_, i) => (
      <Text key={`star-${mentorId}-${i}`} style={styles.star}>
        {i < rating ? '★' : '☆'}
      </Text>
    ));

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#0052CC" />

      <LinearGradient colors={['#0052CC', '#0066FF']} style={styles.header}>
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

      {/* Filter bar */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, hasActiveFilters && styles.filterButtonActive]}
          onPress={() => {
            setPendingFilters(appliedFilters);
            setFilterModalVisible(true);
          }}
        >
          <Ionicons name="options-outline" size={16} color={hasActiveFilters ? '#0052CC' : '#666'} />
          <Text style={[styles.filterText, hasActiveFilters && styles.filterTextActive]}>Filter</Text>
          {hasActiveFilters && <View style={styles.filterBadge} />}
        </TouchableOpacity>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {loadingCategories ? (
            <ActivityIndicator size="small" color="#0052CC" style={{ marginLeft: 8 }} />
          ) : (
            categories.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[styles.filterTab, selectedCategory === cat && styles.activeFilterTab]}
                onPress={() => handleCategorySelect(cat)}
              >
                <Text style={[styles.filterTabText, selectedCategory === cat && styles.activeFilterTabText]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>

      {/* Results count */}
      {!loading && (
        <View style={styles.resultsBar}>
          <Text style={styles.resultsText}>{total} mentor{total !== 1 ? 's' : ''} found</Text>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0052CC" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {mentors.length > 0 ? (
            <>
              {mentors.map(mentor => (
                <View key={mentor.id} style={styles.astrologerCard}>
                  <View style={styles.astrologerInfo}>
                    <View style={styles.astrologerImageContainer}>
                      {imageErrors.has(mentor.id) ? (
                        <View style={[styles.astrologerImage, styles.fallbackIconContainer]}>
                          <Ionicons name="person" size={36} color="#999" />
                        </View>
                      ) : (
                        <Image
                          source={{ uri: mentor.photo }}
                          style={styles.astrologerImage}
                          onError={() => setImageErrors(prev => new Set(prev).add(mentor.id))}
                        />
                      )}
                      {mentor.isOnline && <View style={styles.onlineIndicator} />}
                    </View>

                    <View style={styles.astrologerDetails}>
                      <Text style={styles.astrologerName}>{mentor.name}</Text>
                      <Text style={styles.specialization}>{mentor.specialization}</Text>
                      <Text style={styles.languages}>{mentor.languages}</Text>
                      {mentor.experience ? <Text style={styles.experience}>Exp- {mentor.experience}</Text> : null}
                      <View style={styles.ratingContainer}>
                        <View style={styles.stars}>{renderStars(mentor.rating, mentor.id)}</View>
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
                      <View style={styles.rateRow}>
                        <Ionicons name="chatbubbles-outline" size={12} color="#4CAF50" />
                        <Text style={styles.rateText}>₹{mentor.rate || mentor.price || 17}/min</Text>
                      </View>
                      <View style={styles.rateRow}>
                        <Ionicons name="videocam-outline" size={12} color="#FF6B6B" />
                        <Text style={styles.rateText}>₹{(mentor.rate || mentor.price || 17) * 2}/min</Text>
                      </View>
                    </View>
                    <View style={styles.actionButtons}>
                      <TouchableOpacity style={styles.chatButton} onPress={() => handleChatPress(mentor)}>
                        <Ionicons name="chatbubbles" size={14} color="#4CAF50" />
                        <Text style={styles.chatButtonText}>Chat</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.videoCallButton} onPress={() => handleVideoCallPress(mentor)}>
                        <Ionicons name="videocam" size={14} color="#FFFFFF" />
                        <Text style={styles.videoCallButtonText}>Video</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}

              {/* Load more */}
              {page < totalPages && (
                <TouchableOpacity style={styles.loadMoreButton} onPress={handleLoadMore} disabled={loadingMore}>
                  {loadingMore ? (
                    <ActivityIndicator size="small" color="#0052CC" />
                  ) : (
                    <Text style={styles.loadMoreText}>Load more ({mentors.length}/{total})</Text>
                  )}
                </TouchableOpacity>
              )}
            </>
          ) : (
            <View style={styles.noResultsContainer}>
              <Ionicons name="search-outline" size={48} color="#CCC" />
              <Text style={styles.noResultsText}>No mentors found</Text>
              <Text style={styles.noResultsSubtext}>Try adjusting your filters</Text>
              {hasActiveFilters && (
                <TouchableOpacity style={styles.clearFiltersButton} onPress={handleClearFilters}>
                  <Text style={styles.clearFiltersText}>Clear filters</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </ScrollView>
      )}

      {/* Filter Modal */}
      <Modal visible={filterModalVisible} animationType="slide" transparent onRequestClose={() => setFilterModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Mentors</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled">
              <Text style={styles.inputLabel}>Category</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Java, System Design"
                placeholderTextColor="#AAA"
                value={pendingFilters.category}
                onChangeText={v => setPendingFilters(p => ({ ...p, category: v }))}
              />

              <Text style={styles.inputLabel}>Nationality</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. India, USA"
                placeholderTextColor="#AAA"
                value={pendingFilters.nationality}
                onChangeText={v => setPendingFilters(p => ({ ...p, nationality: v }))}
              />

              <Text style={styles.inputLabel}>Min. Experience (years)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 3"
                placeholderTextColor="#AAA"
                keyboardType="numeric"
                value={pendingFilters.totalExp}
                onChangeText={v => setPendingFilters(p => ({ ...p, totalExp: v.replace(/[^0-9]/g, '') }))}
              />

              <Text style={styles.inputLabel}>Min. Rating</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 4 or 4.5"
                placeholderTextColor="#AAA"
                keyboardType="decimal-pad"
                value={pendingFilters.totalRatings}
                onChangeText={v => setPendingFilters(p => ({ ...p, totalRatings: v.replace(/[^0-9.]/g, '') }))}
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.clearButton} onPress={handleClearFilters}>
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyButton} onPress={handleApplyFilters}>
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { paddingTop: 50, paddingBottom: 15, paddingHorizontal: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  userInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  userAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  greeting: { fontSize: 18, fontWeight: '600', color: '#333' },
  loadingContainer: { flex: 1, alignItems: 'center', paddingVertical: 50 },
  loadingText: { fontSize: 16, color: '#666', marginTop: 10 },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterButton: { flexDirection: 'row', alignItems: 'center', marginRight: 15, position: 'relative' },
  filterButtonActive: {},
  filterBadge: {
    position: 'absolute',
    top: -2,
    right: -6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0052CC',
  },
  filterText: { fontSize: 14, color: '#666', marginLeft: 4 },
  filterTextActive: { color: '#0052CC', fontWeight: '600' },
  filterScroll: { flex: 1 },
  filterTab: { paddingHorizontal: 20, paddingVertical: 8, marginRight: 10, borderRadius: 20, backgroundColor: '#F0F0F0' },
  activeFilterTab: { backgroundColor: '#0052CC' },
  filterTabText: { fontSize: 14, color: '#666', fontWeight: '500' },
  activeFilterTabText: { color: '#FFFFFF', fontWeight: '600' },
  resultsBar: { paddingHorizontal: 20, paddingVertical: 8, backgroundColor: '#F9F9F9' },
  resultsText: { fontSize: 12, color: '#999' },
  content: { flex: 1, backgroundColor: '#FFFFFF' },
  astrologerCard: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  astrologerInfo: { flex: 1, flexDirection: 'row' },
  astrologerImageContainer: { position: 'relative', marginRight: 15 },
  astrologerImage: { width: 60, height: 60, borderRadius: 30 },
  fallbackIconContainer: { backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center' },
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
  astrologerDetails: { flex: 1 },
  astrologerName: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 4 },
  specialization: { fontSize: 14, color: '#666', marginBottom: 2 },
  languages: { fontSize: 14, color: '#666', marginBottom: 2 },
  experience: { fontSize: 14, color: '#666', marginBottom: 8 },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  stars: { flexDirection: 'row', marginRight: 10 },
  star: { fontSize: 14, color: '#FF8C42' },
  orders: { fontSize: 12, color: '#999' },
  specialOfferContainer: { flexDirection: 'row', alignItems: 'center' },
  specialOfferIcon: { fontSize: 12, marginRight: 5 },
  specialOfferText: { fontSize: 12, color: '#999' },
  priceAndAction: { alignItems: 'flex-end', justifyContent: 'space-between' },
  priceContainer: { alignItems: 'flex-end', marginBottom: 10, gap: 4 },
  rateRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rateText: { fontSize: 12, fontWeight: '600', color: '#333' },
  actionButtons: { gap: 8 },
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
  chatButtonText: { fontSize: 14, fontWeight: '600', color: '#4CAF50' },
  videoCallButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  videoCallButtonText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  loadMoreButton: {
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  loadMoreText: { fontSize: 14, color: '#0052CC', fontWeight: '600' },
  noResultsContainer: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 20 },
  noResultsText: { fontSize: 16, color: '#666', marginTop: 12, marginBottom: 5, textAlign: 'center' },
  noResultsSubtext: { fontSize: 14, color: '#999', textAlign: 'center' },
  clearFiltersButton: { marginTop: 16, paddingHorizontal: 24, paddingVertical: 10, backgroundColor: '#0052CC', borderRadius: 20 },
  clearFiltersText: { color: '#FFF', fontWeight: '600', fontSize: 14 },
  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalSheet: { backgroundColor: '#FFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%' },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#333' },
  modalBody: { padding: 20 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6, marginTop: 14 },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#333',
    backgroundColor: '#FAFAFA',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  clearButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDD',
    alignItems: 'center',
  },
  clearButtonText: { fontSize: 15, fontWeight: '600', color: '#666' },
  applyButton: { flex: 2, paddingVertical: 14, borderRadius: 12, backgroundColor: '#0052CC', alignItems: 'center' },
  applyButtonText: { fontSize: 15, fontWeight: '600', color: '#FFF' },
});
