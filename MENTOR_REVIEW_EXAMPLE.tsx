/**
 * EXAMPLE: How to integrate the mentor review screen into your call/chat screens
 * This file shows practical examples for different scenarios
 */

// ============================================================================
// EXAMPLE 1: Integration in Video Call Screen
// ============================================================================

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useMentorReview } from '../hooks/useMentorReview';

export function VideoCallScreenExample() {
  const { openReviewScreen } = useMentorReview();
  const [callActive, setCallActive] = useState(true);

  // Mentor details (would come from your call state/params)
  const mentorDetails = {
    id: 'mentor_123',
    name: 'Dr. Rajesh Kumar',
    callId: 'call_456',
  };

  const handleEndCall = async () => {
    try {
      // End the call
      setCallActive(false);
      
      // Trigger review screen
      openReviewScreen({
        mentorId: mentorDetails.id,
        mentorName: mentorDetails.name,
        callId: mentorDetails.callId,
        callType: 'video',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to end call');
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {callActive && (
        <TouchableOpacity onPress={handleEndCall}>
          <Text>End Call</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ============================================================================
// EXAMPLE 2: Integration in Chat Screen
// ============================================================================

import { useLocalSearchParams } from 'expo-router';

export function ChatBoxExample() {
  const { openReviewScreen } = useMentorReview();
  const params = useLocalSearchParams();

  const mentorId = params.astrologerId as string;
  const mentorName = params.astrologerName as string;

  const handleEndChat = () => {
    // Close chat
    // Then open review
    openReviewScreen({
      mentorId,
      mentorName,
      callType: 'chat',
    });
  };

  return (
    <View>
      <TouchableOpacity onPress={handleEndChat}>
        <Text>End Chat & Rate</Text>
      </TouchableOpacity>
    </View>
  );
}

// ============================================================================
// EXAMPLE 3: Integration with Call History
// ============================================================================

import { FlatList } from 'react-native';

interface CallHistoryItem {
  id: string;
  mentorId: string;
  mentorName: string;
  callType: 'voice' | 'video';
  reviewed: boolean;
}

export function CallHistoryExample() {
  const { openReviewScreen } = useMentorReview();
  const [calls, setCalls] = useState<CallHistoryItem[]>([
    {
      id: 'call_1',
      mentorId: 'mentor_1',
      mentorName: 'Dr. Rajesh Kumar',
      callType: 'video',
      reviewed: false,
    },
    {
      id: 'call_2',
      mentorId: 'mentor_2',
      mentorName: 'Priya Sharma',
      callType: 'voice',
      reviewed: true,
    },
  ]);

  const handleReviewCall = (call: CallHistoryItem) => {
    if (call.reviewed) {
      Alert.alert('Already Reviewed', 'You have already reviewed this call');
      return;
    }

    openReviewScreen({
      mentorId: call.mentorId,
      mentorName: call.mentorName,
      callId: call.id,
      callType: call.callType,
    });
  };

  const renderCallItem = ({ item }: { item: CallHistoryItem }) => (
    <View style={{ padding: 16, borderBottomWidth: 1 }}>
      <Text>{item.mentorName}</Text>
      <TouchableOpacity
        onPress={() => handleReviewCall(item)}
        disabled={item.reviewed}
      >
        <Text style={{ color: item.reviewed ? '#ccc' : '#0052CC' }}>
          {item.reviewed ? 'Already Reviewed' : 'Write Review'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <FlatList
      data={calls}
      renderItem={renderCallItem}
      keyExtractor={item => item.id}
    />
  );
}

// ============================================================================
// EXAMPLE 4: Automatic Review Prompt After Call Duration
// ============================================================================

import { useEffect } from 'react';

export function AutomaticReviewPromptExample() {
  const { openReviewScreen } = useMentorReview();
  const [callDuration, setCallDuration] = useState(0);
  const [callActive, setCallActive] = useState(true);

  const MIN_CALL_DURATION_FOR_REVIEW = 60; // 1 minute in seconds

  useEffect(() => {
    if (!callActive) return;

    const interval = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [callActive]);

  const handleCallEnd = () => {
    setCallActive(false);

    // Only show review if call was at least 1 minute
    if (callDuration >= MIN_CALL_DURATION_FOR_REVIEW) {
      openReviewScreen({
        mentorId: 'mentor_123',
        mentorName: 'Dr. Rajesh Kumar',
        callId: 'call_456',
        callType: 'video',
      });
    } else {
      Alert.alert('Call Too Short', 'Call must be at least 1 minute to review');
    }
  };

  return (
    <View>
      <Text>Duration: {callDuration}s</Text>
      <TouchableOpacity onPress={handleCallEnd}>
        <Text>End Call</Text>
      </TouchableOpacity>
    </View>
  );
}

// ============================================================================
// EXAMPLE 5: Review with Retry Logic
// ============================================================================

export function ReviewWithRetryExample() {
  const { openReviewScreen } = useMentorReview();
  const [reviewAttempts, setReviewAttempts] = useState(0);
  const MAX_REVIEW_ATTEMPTS = 3;

  const handleOpenReview = () => {
    if (reviewAttempts >= MAX_REVIEW_ATTEMPTS) {
      Alert.alert(
        'Review Limit',
        'You have reached the maximum number of review attempts'
      );
      return;
    }

    setReviewAttempts(prev => prev + 1);

    openReviewScreen({
      mentorId: 'mentor_123',
      mentorName: 'Dr. Rajesh Kumar',
      callId: 'call_456',
      callType: 'video',
    });
  };

  return (
    <TouchableOpacity onPress={handleOpenReview}>
      <Text>
        Open Review ({reviewAttempts}/{MAX_REVIEW_ATTEMPTS})
      </Text>
    </TouchableOpacity>
  );
}

// ============================================================================
// EXAMPLE 6: Backend Integration with Error Handling
// ============================================================================

import axios from 'axios';

const API_BASE_URL = 'https://your-api.com';

export async function submitReviewToBackend(reviewData: {
  mentorId: string;
  callId?: string;
  userId: string;
  rating: number;
  communication: number;
  knowledge: number;
  professionalism: number;
  comment: string;
  callType: string;
}) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/reviews`,
      reviewData,
      {
        headers: {
          'Content-Type': 'application/json',
          // Add your auth token here
          // 'Authorization': `Bearer ${authToken}`,
        },
        timeout: 10000,
      }
    );

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to submit review',
        statusCode: error.response?.status,
      };
    }

    return {
      success: false,
      error: 'Network error. Please check your connection.',
    };
  }
}

// ============================================================================
// USAGE IN MENTOR-REVIEW.TSX
// ============================================================================

/*
Replace the handleSubmitReview function in app/mentor-review.tsx with:

const handleSubmitReview = async () => {
  if (review.rating === 0) {
    Alert.alert('Required', 'Please provide an overall rating');
    return;
  }

  setLoading(true);
  try {
    const result = await submitReviewToBackend({
      mentorId,
      callId,
      userId: user?.id || '',
      rating: review.rating,
      communication: review.communication,
      knowledge: review.knowledge,
      professionalism: review.professionalism,
      comment: review.comment,
      callType,
    });

    if (result.success) {
      Alert.alert('Success', 'Thank you for your review!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } else {
      Alert.alert('Error', result.error || 'Failed to submit review');
    }
  } finally {
    setLoading(false);
  }
};
*/
