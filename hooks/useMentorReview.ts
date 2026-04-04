import { router } from 'expo-router';

interface ReviewScreenParams {
  mentorId: string;
  mentorName: string;
  callId?: string;
  callType?: 'voice' | 'video' | 'chat';
}

/**
 * Hook to navigate to the mentor review screen
 * Usage after a call or chat session ends
 */
export const useMentorReview = () => {
  const openReviewScreen = (params: ReviewScreenParams) => {
    router.push({
      pathname: '/mentor-review',
      params: {
        mentorId: params.mentorId,
        mentorName: params.mentorName,
        callId: params.callId || '',
        callType: params.callType || 'call',
      },
    });
  };

  return { openReviewScreen };
};
