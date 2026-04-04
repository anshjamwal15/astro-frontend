import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useUser } from '../contexts/UserContext';
import Colors from '../constants/Colors';

interface ReviewData {
  rating: number;
  comment: string;
}

export default function MentorReviewScreen() {
  const params = useLocalSearchParams();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [review, setReview] = useState<ReviewData>({
    rating: 0,
    comment: '',
  });

  const mentorName = params.mentorName as string || 'Mentor';
  const mentorId = params.mentorId as string || '';
  const callId = params.callId as string || '';
  const callType = params.callType as string || 'call';

  const handleRatingChange = (field: keyof ReviewData, value: number) => {
    setReview(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmitReview = async () => {
    if (review.rating === 0) {
      Alert.alert('Required', 'Please provide an overall rating');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        userId: user?.id,
        mentorId,
        rating: review.rating,
        review: review.comment || '',
      };

      const response = await fetch('http://3.108.112.130:3000/api/reviews', {
        method: 'POST',
        headers: {
          'accept': 'application/hal+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      Alert.alert('Success', 'Thank you for your review!', [
        {
          text: 'OK',
          onPress: () => {
            router.replace('/home');
          },
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to submit review. Please try again.');
      console.error('Review submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    Alert.alert('Skip Review', 'Are you sure you want to skip this review?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Skip',
        onPress: () => router.replace('/home'),
        style: 'destructive',
      },
    ]);
  };

  const StarRating = ({ value, onChange, size = 32 }: any) => (
    <View style={styles.starContainer}>
      {[1, 2, 3, 4, 5].map(star => (
        <TouchableOpacity
          key={star}
          onPress={() => onChange(star)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={star <= value ? 'star' : 'star-outline'}
            size={size}
            color={star <= value ? Colors.secondary : Colors.textMuted}
            style={styles.star}
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* Header */}
      <LinearGradient
        colors={['#0052CC', '#0066FF']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={handleSkip}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Rate Your Experience</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Mentor Info Card */}
        <View style={styles.mentorCard}>
          <View style={styles.mentorAvatar}>
            <Ionicons name="person-circle" size={60} color={Colors.primary} />
          </View>
          <View style={styles.mentorInfo}>
            <Text style={styles.mentorName}>{mentorName}</Text>
            <Text style={styles.callTypeLabel}>
              {callType === 'video' ? '📹 Video Call' : 'Chat'}
            </Text>
          </View>
        </View>

        {/* Overall Rating */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overall Rating</Text>
          <Text style={styles.sectionDescription}>
            How would you rate this {callType}?
          </Text>
          <StarRating
            value={review.rating}
            onChange={(value: number) => handleRatingChange('rating', value)}
            size={40}
          />
        </View>

        {/* Comments */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Comments</Text>
          <Text style={styles.sectionDescription}>
            Share your thoughts (optional)
          </Text>
          <TextInput
            style={styles.commentInput}
            placeholder="Tell us about your experience..."
            placeholderTextColor={Colors.textMuted}
            multiline
            numberOfLines={4}
            value={review.comment}
            onChangeText={(text) => handleRatingChange('comment', text as any)}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>
            {review.comment.length}/500
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            disabled={loading}
          >
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.submitButton,
              loading && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmitReview}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>Submit Review</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
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
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  mentorCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  mentorAvatar: {
    marginRight: 16,
  },
  mentorInfo: {
    flex: 1,
  },
  mentorName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  callTypeLabel: {
    fontSize: 14,
    color: Colors.textLight,
  },
  section: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 16,
  },
  starContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 12,
  },
  star: {
    marginHorizontal: 8,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: Colors.gray,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: Colors.text,
    minHeight: 100,
    fontFamily: 'System',
  },
  charCount: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 8,
    textAlign: 'right',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  skipButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  submitButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
