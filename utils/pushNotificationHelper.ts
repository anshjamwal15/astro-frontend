/**
 * Push Notification Helper
 * 
 * This file contains helper functions and payload examples for sending push notifications
 * from your backend server to the React Native app via Firebase Cloud Messaging (FCM).
 */

/**
 * Example: Video Call Notification Payload
 * 
 * Send this payload from your backend to FCM to trigger an incoming video call notification
 */
export const createVideoCallNotificationPayload = (
  userFCMToken: string,
  callerName: string,
  callerId: string,
  roomName: string,
  callId?: string
) => {
  return {
    to: userFCMToken,
    priority: 'high',
    data: {
      type: 'video_call',
      callerName: callerName,
      callerId: callerId,
      roomName: roomName,
      callId: callId || `call_${Date.now()}`,
      timestamp: Date.now().toString(),
    },
  };
};

/**
 * Example: Voice Call Notification Payload
 * 
 * Send this payload from your backend to FCM to trigger an incoming voice call notification
 */
export const createVoiceCallNotificationPayload = (
  userFCMToken: string,
  callerName: string,
  callerId: string,
  roomName: string,
  callId?: string
) => {
  return {
    to: userFCMToken,
    priority: 'high',
    data: {
      type: 'voice_call',
      callerName: callerName,
      callerId: callerId,
      roomName: roomName,
      callId: callId || `call_${Date.now()}`,
      timestamp: Date.now().toString(),
    },
  };
};

/**
 * Example: Chat Message Notification Payload
 * 
 * Send this payload from your backend to FCM to trigger a chat message notification
 */
export const createChatMessageNotificationPayload = (
  userFCMToken: string,
  senderName: string,
  senderId: string,
  message: string,
  chatRoomId: string
) => {
  return {
    to: userFCMToken,
    priority: 'high',
    data: {
      type: 'message',
      senderName: senderName,
      senderId: senderId,
      message: message,
      chatRoomId: chatRoomId,
      timestamp: Date.now().toString(),
    },
  };
};

/**
 * Backend Example: Send Push Notification via FCM
 * 
 * This is an example of how to send a push notification from your Node.js backend
 * using the Firebase Admin SDK.
 * 
 * Installation:
 * npm install firebase-admin
 * 
 * Usage:
 * 
 * ```typescript
 * import * as admin from 'firebase-admin';
 * 
 * // Initialize Firebase Admin (do this once in your app)
 * admin.initializeApp({
 *   credential: admin.credential.cert({
 *     projectId: 'your-project-id',
 *     clientEmail: 'your-client-email',
 *     privateKey: 'your-private-key',
 *   }),
 * });
 * 
 * // Send video call notification
 * async function sendVideoCallNotification(
 *   userFCMToken: string,
 *   callerName: string,
 *   callerId: string,
 *   roomName: string
 * ) {
 *   const payload = createVideoCallNotificationPayload(
 *     userFCMToken,
 *     callerName,
 *     callerId,
 *     roomName
 *   );
 * 
 *   try {
 *     const response = await admin.messaging().send({
 *       token: payload.to,
 *       data: payload.data,
 *       android: {
 *         priority: 'high',
 *       },
 *       apns: {
 *         headers: {
 *           'apns-priority': '10',
 *         },
 *       },
 *     });
 *     console.log('Successfully sent message:', response);
 *     return response;
 *   } catch (error) {
 *     console.error('Error sending message:', error);
 *     throw error;
 *   }
 * }
 * 
 * // Send chat message notification
 * async function sendChatMessageNotification(
 *   userFCMToken: string,
 *   senderName: string,
 *   senderId: string,
 *   message: string,
 *   chatRoomId: string
 * ) {
 *   const payload = createChatMessageNotificationPayload(
 *     userFCMToken,
 *     senderName,
 *     senderId,
 *     message,
 *     chatRoomId
 *   );
 * 
 *   try {
 *     const response = await admin.messaging().send({
 *       token: payload.to,
 *       data: payload.data,
 *       android: {
 *         priority: 'high',
 *       },
 *       apns: {
 *         headers: {
 *           'apns-priority': '10',
 *         },
 *       },
 *     });
 *     console.log('Successfully sent message:', response);
 *     return response;
 *   } catch (error) {
 *     console.error('Error sending message:', error);
 *     throw error;
 *   }
 * }
 * ```
 */

/**
 * cURL Example: Send Push Notification via FCM REST API
 * 
 * You can also send notifications using the FCM REST API directly.
 * Replace YOUR_SERVER_KEY with your Firebase Server Key from Firebase Console.
 * 
 * Video Call Notification:
 * ```bash
 * curl -X POST https://fcm.googleapis.com/fcm/send \
 *   -H "Authorization: key=YOUR_SERVER_KEY" \
 *   -H "Content-Type: application/json" \
 *   -d '{
 *     "to": "USER_FCM_TOKEN",
 *     "priority": "high",
 *     "data": {
 *       "type": "video_call",
 *       "callerName": "Dr. Rajesh Sharma",
 *       "callerId": "mentor_123",
 *       "roomName": "room_abc123",
 *       "callId": "call_1234567890"
 *     }
 *   }'
 * ```
 * 
 * Chat Message Notification:
 * ```bash
 * curl -X POST https://fcm.googleapis.com/fcm/send \
 *   -H "Authorization: key=YOUR_SERVER_KEY" \
 *   -H "Content-Type: application/json" \
 *   -d '{
 *     "to": "USER_FCM_TOKEN",
 *     "priority": "high",
 *     "data": {
 *       "type": "message",
 *       "senderName": "Dr. Rajesh Sharma",
 *       "senderId": "mentor_123",
 *       "message": "Hello! How can I help you today?",
 *       "chatRoomId": "chat_room_456"
 *     }
 *   }'
 * ```
 */

/**
 * Testing Push Notifications
 * 
 * 1. Get the FCM token from the app:
 *    - The token is logged in the console when the app starts
 *    - You can also get it from PushNotificationService.getToken()
 * 
 * 2. Use Firebase Console to send test notifications:
 *    - Go to Firebase Console > Cloud Messaging
 *    - Click "Send your first message"
 *    - Enter notification details
 *    - In "Additional options", add custom data fields
 * 
 * 3. Use the FCM REST API with cURL (see examples above)
 * 
 * 4. Implement in your backend using Firebase Admin SDK (see examples above)
 */

export default {
  createVideoCallNotificationPayload,
  createVoiceCallNotificationPayload,
  createChatMessageNotificationPayload,
};
