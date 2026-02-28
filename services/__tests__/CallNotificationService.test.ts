/**
 * Test file for CallNotificationService
 * 
 * To run tests:
 * npm test services/__tests__/CallNotificationService.test.ts
 */

import { CallNotificationService } from '../CallNotificationService';

describe('CallNotificationService', () => {
  describe('sendCallNotification', () => {
    it('should send video call notification with correct payload', async () => {
      const payload = {
        type: 'VIDEO_CALL' as const,
        device_token: 'test_device_token',
        callerName: 'Test User',
        callerId: 'user_123',
        roomName: 'room_test',
        callId: 'call_123',
      };

      const result = await CallNotificationService.sendCallNotification(payload);
      
      // Should not throw error
      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
    });

    it('should send voice call notification with correct payload', async () => {
      const result = await CallNotificationService.sendVoiceCallNotification(
        'test_device_token',
        'Test User',
        'user_123',
        'room_test',
        'call_123'
      );

      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
    });

    it('should send chat notification with correct payload', async () => {
      const result = await CallNotificationService.sendChatNotification(
        'test_device_token',
        'Test User',
        'user_123',
        'room_test',
        'call_123'
      );

      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
    });
  });

  describe('getDeviceToken', () => {
    it('should generate device token for user', async () => {
      const userId = 'user_123';
      const token = await CallNotificationService.getDeviceToken(userId);

      expect(token).toBeDefined();
      expect(token).toContain('device_token_');
      expect(token).toContain(userId);
    });
  });

  describe('sendNotificationWithAutoToken', () => {
    it('should send notification with auto-generated token', async () => {
      const result = await CallNotificationService.sendNotificationWithAutoToken(
        'VIDEO_CALL',
        'Test User',
        'user_123',
        'mentor_456',
        'room_test',
        'call_123'
      );

      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
    });
  });
});

/**
 * Manual Testing Guide:
 * 
 * 1. Start Video Call:
 *    - Go to home page
 *    - Click on a mentor's video call button
 *    - Check console for: "📞 Sending video call notification to mentor..."
 *    - Verify notification is sent to backend
 * 
 * 2. Start Chat:
 *    - Go to mentors page
 *    - Click on a mentor's chat button
 *    - Check console for: "💬 Sending chat notification to mentor..."
 *    - Verify notification is sent to backend
 * 
 * 3. Voice Call from Chat:
 *    - Open a chat with a mentor
 *    - Click the phone icon in header
 *    - Confirm the call
 *    - Check console for: "📞 Sending voice call notification..."
 *    - Verify notification is sent to backend
 * 
 * 4. Video Call from Chat:
 *    - Open a chat with a mentor
 *    - Click the video icon in header
 *    - Confirm the call
 *    - Check console for: "📹 Sending video call notification..."
 *    - Verify notification is sent to backend
 * 
 * Expected Console Output:
 * ✅ Success: "✅ [Type] notification sent successfully"
 * ⚠️ Warning: "⚠️ Failed to send [type] notification: [message]"
 * 
 * Backend API Verification:
 * - Check backend logs for incoming POST requests to /api/notifications/call
 * - Verify payload contains all required fields
 * - Confirm response status is 200-299
 */
