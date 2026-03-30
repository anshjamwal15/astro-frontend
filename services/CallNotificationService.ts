import { AUTH_CONFIG } from '../config/auth';

export interface CallNotificationPayload {
  type: 'VIDEO_CALL' | 'VOICE_CALL' | 'CHAT';
  device_token: string;
  callerName: string;
  callerId: string;
  roomName: string;
  callId: string;
}

export interface CallNotificationResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface MentorData {
  id: string;
  name: string;
  email: string;
  mobile: string;
  country: string | null;
  status: string;
  about: string | null;
  expertise: string[];
  rating: number;
  ratingCount: number;
  createdAt: string;
  jwtToken: string | null;
  userId: string;
  deviceToken: string | null;
}

export class CallNotificationService {
  private static baseUrl = AUTH_CONFIG.API.BASE_URL;
  private static mentorListCache: MentorData[] = [];
  private static mentorListCacheTime: number = 0;
  private static CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

  /**
   * Send call notification to backend
   */
  static async sendCallNotification(
    payload: CallNotificationPayload
  ): Promise<CallNotificationResponse> {
    try {
      console.log('📞 Sending call notification:', payload);

      const response = await fetch(`${this.baseUrl}/api/notifications/call`, {
        method: 'POST',
        headers: {
          'Accept': 'application/hal+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      console.log('Call notification response:', response.status, responseText);

      if (!response.ok) {
        console.error('❌ Call notification failed:', response.status, responseText);
        return {
          success: false,
          error: `HTTP ${response.status}`,
          message: responseText || 'Failed to send call notification',
        };
      }

      // Try to parse JSON response
      let data;
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.warn('Response is not JSON, treating as success');
        data = { message: 'Notification sent' };
      }

      console.log('✅ Call notification sent successfully');
      return {
        success: true,
        message: data.message || 'Notification sent successfully',
      };
    } catch (error: any) {
      console.error('❌ Error sending call notification:', error);
      return {
        success: false,
        error: error.message || 'Network error',
        message: 'Failed to send call notification',
      };
    }
  }

  /**
   * Send video call notification
   */
  static async sendVideoCallNotification(
    deviceToken: string,
    callerName: string,
    callerId: string,
    roomName: string,
    callId: string
  ): Promise<CallNotificationResponse> {
    return this.sendCallNotification({
      type: 'VIDEO_CALL',
      device_token: deviceToken,
      callerName,
      callerId,
      roomName,
      callId,
    });
  }

  /**
   * Send voice call notification
   */
  static async sendVoiceCallNotification(
    deviceToken: string,
    callerName: string,
    callerId: string,
    roomName: string,
    callId: string
  ): Promise<CallNotificationResponse> {
    return this.sendCallNotification({
      type: 'VOICE_CALL',
      device_token: deviceToken,
      callerName,
      callerId,
      roomName,
      callId,
    });
  }

  /**
   * Send chat notification (if needed)
   */
  static async sendChatNotification(
    deviceToken: string,
    callerName: string,
    callerId: string,
    roomName: string,
    callId: string
  ): Promise<CallNotificationResponse> {
    return this.sendCallNotification({
      type: 'CHAT',
      device_token: deviceToken,
      callerName,
      callerId,
      roomName,
      callId,
    });
  }

  /**
   * Fetch mentor list from backend with caching
   */
  static async fetchMentorList(): Promise<MentorData[]> {
    try {
      // Check if cache is still valid
      const now = Date.now();
      if (this.mentorListCache.length > 0 && (now - this.mentorListCacheTime) < this.CACHE_DURATION) {
        console.log('📋 Using cached mentor list');
        return this.mentorListCache;
      }

      console.log('📋 Fetching mentor list from backend...');
      
      const response = await fetch(`${this.baseUrl}/api/mentor/list`, {
        method: 'GET',
        headers: {
          'Accept': 'application/hal+json',
        },
      });

      if (!response.ok) {
        console.error('❌ Failed to fetch mentor list:', response.status);
        // Return cached data if available, even if expired
        return this.mentorListCache;
      }

      const paginated: { items: MentorData[]; page: number; size: number; total: number } = await response.json();
      const mentors = paginated.items;
      console.log(`✅ Fetched ${mentors.length} mentors from backend (total: ${paginated.total})`);
      
      // Update cache
      this.mentorListCache = mentors;
      this.mentorListCacheTime = now;
      
      return mentors;
    } catch (error: any) {
      console.error('❌ Error fetching mentor list:', error);
      // Return cached data if available
      return this.mentorListCache;
    }
  }

  /**
   * Clear the mentor list cache (useful after mentor updates)
   */
  static clearMentorCache(): void {
    console.log('🗑️ Clearing mentor list cache');
    this.mentorListCache = [];
    this.mentorListCacheTime = 0;
  }

  /**
   * Get device token for a specific mentor by fetching their profile directly
   * @param mentorId - The mentor's ID
   * @returns Device token or null if not found
   */
  static async getDeviceToken(mentorId: string): Promise<string | null> {
    try {
      console.log(`🔍 Looking up device token for mentor: ${mentorId}`);

      const response = await fetch(`${this.baseUrl}/api/mentor/${mentorId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/hal+json',
        },
      });

      if (!response.ok) {
        console.error(`❌ Failed to fetch mentor ${mentorId}:`, response.status);
        return null;
      }

      const mentor = await response.json();

      if (!mentor.device_token) {
        console.warn(`⚠️ Mentor ${mentor.name} (${mentorId}) has no device token registered`);
        return null;
      }

      console.log(`✅ Found device token for mentor ${mentor.name} (${mentorId})`);
      console.log(`📱 Device token: ${mentor.device_token.substring(0, 50)}...`);
      return mentor.device_token;
    } catch (error: any) {
      console.error('❌ Error getting device token:', error);
      return null;
    }
  }

  /**
   * Helper method to send notification with automatic device token retrieval from mentor list
   */
  static async sendNotificationWithAutoToken(
    type: 'VIDEO_CALL' | 'VOICE_CALL' | 'CHAT',
    callerName: string,
    callerId: string,
    mentorId: string,
    roomName: string,
    callId: string
  ): Promise<CallNotificationResponse> {
    try {
      console.log(`📱 Preparing to send ${type} notification to mentor ${mentorId}`);
      console.log(`   Caller: ${callerName} (${callerId})`);
      console.log(`   Room: ${roomName}`);
      console.log(`   Call ID: ${callId}`);

      // Get device token for the mentor (recipient) from mentor list API
      const deviceToken = await this.getDeviceToken(mentorId);

      if (!deviceToken) {
        console.error(`❌ Cannot send notification: No device token found for mentor ${mentorId}`);
        return {
          success: false,
          error: 'No device token found',
          message: 'Mentor has not registered their device for push notifications',
        };
      }

      console.log(`✅ Device token retrieved, sending ${type} notification...`);

      return this.sendCallNotification({
        type,
        device_token: deviceToken,
        callerName,
        callerId,
        roomName,
        callId,
      });
    } catch (error: any) {
      console.error('❌ Error in sendNotificationWithAutoToken:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to send notification',
      };
    }
  }
}
