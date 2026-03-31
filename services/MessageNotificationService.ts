import { AUTH_CONFIG } from '../config/auth';

export interface MessageNotificationPayload {
  device_token: string;
  senderName: string;
  senderId: string;
  message: string;
  chatRoomId: string;
}

export interface MessageNotificationResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export class MessageNotificationService {
  private static baseUrl = AUTH_CONFIG.API.BASE_URL;

  /**
   * Send a chat message push notification via backend
   */
  static async sendMessageNotification(
    payload: MessageNotificationPayload
  ): Promise<MessageNotificationResponse> {
    try {
      console.log('💬 Sending message notification:', payload);

      const response = await fetch(`${this.baseUrl}/api/notifications/message`, {
        method: 'POST',
        headers: {
          Accept: 'application/hal+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      console.log('Message notification response:', response.status, responseText);

      if (!response.ok) {
        console.error('❌ Message notification failed:', response.status, responseText);
        return {
          success: false,
          error: `HTTP ${response.status}`,
          message: responseText || 'Failed to send message notification',
        };
      }

      let data: any = {};
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch {
        data = { message: 'Notification sent' };
      }

      console.log('✅ Message notification sent successfully');
      return {
        success: true,
        message: data.message || 'Notification sent successfully',
      };
    } catch (error: any) {
      console.error('❌ Error sending message notification:', error);
      return {
        success: false,
        error: error.message || 'Network error',
        message: 'Failed to send message notification',
      };
    }
  }

  /**
   * Get the device token for a user (mentor or regular user) by their ID
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
   * Send a message notification with automatic device token lookup.
   * Call this right after ChatService.sendMessage().
   *
   * @param recipientId   - The mentor ID who should receive the notification
   * @param senderName    - Display name of the sender
   * @param senderId      - ID of the sender
   * @param messageText   - The message text (truncated for the notification body)
   * @param chatRoomId    - Firestore chat room ID (used for deep-link on tap)
   */
  static async notify(
    recipientId: string,
    senderName: string,
    senderId: string,
    messageText: string,
    chatRoomId: string,
  ): Promise<MessageNotificationResponse> {
    try {
      const deviceToken = await this.getDeviceToken(recipientId);

      if (!deviceToken) {
        return {
          success: false,
          error: 'No device token found',
          message: 'Recipient has not registered their device for push notifications',
        };
      }

      // Truncate long messages so the notification body stays readable
      const preview =
        messageText.length > 100 ? messageText.substring(0, 97) + '...' : messageText;

      return this.sendMessageNotification({
        device_token: deviceToken,
        senderName,
        senderId,
        message: preview,
        chatRoomId,
      });
    } catch (error: any) {
      console.error('❌ Error in MessageNotificationService.notify:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to send notification',
      };
    }
  }
}
