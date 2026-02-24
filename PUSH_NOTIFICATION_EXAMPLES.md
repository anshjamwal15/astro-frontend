# Push Notification Examples

This document provides real-world examples of how to use the push notification feature.

## 📱 Client-Side Examples

### 1. Get FCM Token on Login

```typescript
// In your login screen or auth flow
import PushNotificationService from '../services/PushNotificationService';
import { ApiService } from '../services/apiService';

async function handleLogin(email: string, password: string) {
  try {
    // Login user
    const loginResponse = await ApiService.login(email, password);
    
    if (loginResponse.success) {
      // Get FCM token
      const fcmToken = PushNotificationService.getToken();
      
      if (fcmToken) {
        // Send token to backend
        await ApiService.updateUserFCMToken(loginResponse.data.userId, fcmToken);
        console.log('FCM token saved to backend');
      }
      
      // Navigate to home screen
      router.replace('/(tabs)/home');
    }
  } catch (error) {
    console.error('Login error:', error);
  }
}
```

### 2. Handle Token Refresh

```typescript
// In app/_layout.tsx or a dedicated service
import messaging from '@react-native-firebase/messaging';
import { ApiService } from '../services/apiService';

useEffect(() => {
  // Handle token refresh
  const unsubscribe = messaging().onTokenRefresh(async (newToken) => {
    console.log('FCM token refreshed:', newToken);
    
    // Get current user ID
    const userId = await getCurrentUserId();
    
    if (userId) {
      // Update token in backend
      await ApiService.updateUserFCMToken(userId, newToken);
    }
  });

  return unsubscribe;
}, []);
```

### 3. Clear Token on Logout

```typescript
// In your logout function
import PushNotificationService from '../services/PushNotificationService';
import { ApiService } from '../services/apiService';

async function handleLogout() {
  try {
    const userId = await getCurrentUserId();
    const fcmToken = PushNotificationService.getToken();
    
    if (userId && fcmToken) {
      // Remove token from backend
      await ApiService.removeUserFCMToken(userId, fcmToken);
    }
    
    // Clear local data
    await clearUserData();
    
    // Navigate to login
    router.replace('/auth/signin');
  } catch (error) {
    console.error('Logout error:', error);
  }
}
```

## 🖥️ Backend Examples

### 1. Store FCM Token (Node.js + Express)

```typescript
// routes/users.ts
import express from 'express';
import { db } from '../config/database';

const router = express.Router();

// Update user FCM token
router.post('/users/:userId/fcm-token', async (req, res) => {
  try {
    const { userId } = req.params;
    const { fcmToken } = req.body;
    
    if (!fcmToken) {
      return res.status(400).json({ error: 'FCM token is required' });
    }
    
    // Store token in database
    await db.collection('users').doc(userId).update({
      fcmToken: fcmToken,
      fcmTokenUpdatedAt: new Date(),
    });
    
    res.json({ success: true, message: 'FCM token updated' });
  } catch (error) {
    console.error('Error updating FCM token:', error);
    res.status(500).json({ error: 'Failed to update FCM token' });
  }
});

// Remove user FCM token
router.delete('/users/:userId/fcm-token', async (req, res) => {
  try {
    const { userId } = req.params;
    
    await db.collection('users').doc(userId).update({
      fcmToken: null,
      fcmTokenUpdatedAt: new Date(),
    });
    
    res.json({ success: true, message: 'FCM token removed' });
  } catch (error) {
    console.error('Error removing FCM token:', error);
    res.status(500).json({ error: 'Failed to remove FCM token' });
  }
});

export default router;
```

### 2. Send Video Call Notification

```typescript
// services/notificationService.ts
import * as admin from 'firebase-admin';

// Initialize Firebase Admin (do this once in your app)
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
});

export async function sendVideoCallNotification(
  userFCMToken: string,
  callerName: string,
  callerId: string,
  roomName: string
): Promise<void> {
  try {
    const message = {
      token: userFCMToken,
      data: {
        type: 'video_call',
        callerName: callerName,
        callerId: callerId,
        roomName: roomName,
        callId: `call_${Date.now()}`,
        timestamp: Date.now().toString(),
      },
      android: {
        priority: 'high' as const,
      },
      apns: {
        headers: {
          'apns-priority': '10',
        },
      },
    };
    
    const response = await admin.messaging().send(message);
    console.log('Video call notification sent:', response);
  } catch (error) {
    console.error('Error sending video call notification:', error);
    throw error;
  }
}

export async function sendVoiceCallNotification(
  userFCMToken: string,
  callerName: string,
  callerId: string,
  roomName: string
): Promise<void> {
  try {
    const message = {
      token: userFCMToken,
      data: {
        type: 'voice_call',
        callerName: callerName,
        callerId: callerId,
        roomName: roomName,
        callId: `call_${Date.now()}`,
        timestamp: Date.now().toString(),
      },
      android: {
        priority: 'high' as const,
      },
      apns: {
        headers: {
          'apns-priority': '10',
        },
      },
    };
    
    const response = await admin.messaging().send(message);
    console.log('Voice call notification sent:', response);
  } catch (error) {
    console.error('Error sending voice call notification:', error);
    throw error;
  }
}

export async function sendChatMessageNotification(
  userFCMToken: string,
  senderName: string,
  senderId: string,
  message: string,
  chatRoomId: string
): Promise<void> {
  try {
    const notification = {
      token: userFCMToken,
      data: {
        type: 'message',
        senderName: senderName,
        senderId: senderId,
        message: message,
        chatRoomId: chatRoomId,
        timestamp: Date.now().toString(),
      },
      android: {
        priority: 'high' as const,
      },
      apns: {
        headers: {
          'apns-priority': '10',
        },
      },
    };
    
    const response = await admin.messaging().send(notification);
    console.log('Chat message notification sent:', response);
  } catch (error) {
    console.error('Error sending chat message notification:', error);
    throw error;
  }
}
```

### 3. Initiate Video Call with Notification

```typescript
// routes/calls.ts
import express from 'express';
import { db } from '../config/database';
import { sendVideoCallNotification } from '../services/notificationService';

const router = express.Router();

router.post('/calls/initiate', async (req, res) => {
  try {
    const { callerId, callerName, recipientId, roomName } = req.body;
    
    // Get recipient's FCM token
    const recipientDoc = await db.collection('users').doc(recipientId).get();
    const recipientData = recipientDoc.data();
    
    if (!recipientData?.fcmToken) {
      return res.status(400).json({ 
        error: 'Recipient does not have push notifications enabled' 
      });
    }
    
    // Create call record in database
    const callDoc = await db.collection('calls').add({
      callerId,
      callerName,
      recipientId,
      roomName,
      status: 'ringing',
      createdAt: new Date(),
    });
    
    // Send push notification
    await sendVideoCallNotification(
      recipientData.fcmToken,
      callerName,
      callerId,
      roomName
    );
    
    res.json({ 
      success: true, 
      callId: callDoc.id,
      message: 'Call initiated and notification sent' 
    });
  } catch (error) {
    console.error('Error initiating call:', error);
    res.status(500).json({ error: 'Failed to initiate call' });
  }
});

export default router;
```

### 4. Send Message with Notification

```typescript
// routes/messages.ts
import express from 'express';
import { db } from '../config/database';
import { sendChatMessageNotification } from '../services/notificationService';

const router = express.Router();

router.post('/messages', async (req, res) => {
  try {
    const { senderId, senderName, recipientId, message, chatRoomId } = req.body;
    
    // Save message to database
    const messageDoc = await db.collection('messages').add({
      senderId,
      senderName,
      recipientId,
      message,
      chatRoomId,
      createdAt: new Date(),
      read: false,
    });
    
    // Get recipient's FCM token
    const recipientDoc = await db.collection('users').doc(recipientId).get();
    const recipientData = recipientDoc.data();
    
    // Send push notification if recipient has FCM token
    if (recipientData?.fcmToken) {
      await sendChatMessageNotification(
        recipientData.fcmToken,
        senderName,
        senderId,
        message,
        chatRoomId
      );
    }
    
    res.json({ 
      success: true, 
      messageId: messageDoc.id,
      message: 'Message sent' 
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

export default router;
```

### 5. Batch Notifications

```typescript
// services/notificationService.ts
export async function sendBatchNotifications(
  notifications: Array<{
    token: string;
    data: Record<string, string>;
  }>
): Promise<void> {
  try {
    const messages = notifications.map(notif => ({
      token: notif.token,
      data: notif.data,
      android: {
        priority: 'high' as const,
      },
      apns: {
        headers: {
          'apns-priority': '10',
        },
      },
    }));
    
    const response = await admin.messaging().sendEach(messages);
    
    console.log(`${response.successCount} notifications sent successfully`);
    console.log(`${response.failureCount} notifications failed`);
    
    // Handle failures
    response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        console.error(`Failed to send to ${notifications[idx].token}:`, resp.error);
      }
    });
  } catch (error) {
    console.error('Error sending batch notifications:', error);
    throw error;
  }
}
```

## 🧪 Testing Examples

### 1. Test with cURL

```bash
# Set your variables
SERVER_KEY="YOUR_FIREBASE_SERVER_KEY"
FCM_TOKEN="USER_FCM_TOKEN"

# Test Video Call
curl -X POST https://fcm.googleapis.com/fcm/send \
  -H "Authorization: key=$SERVER_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"to\": \"$FCM_TOKEN\",
    \"priority\": \"high\",
    \"data\": {
      \"type\": \"video_call\",
      \"callerName\": \"Dr. Rajesh Sharma\",
      \"callerId\": \"mentor_123\",
      \"roomName\": \"room_abc123\",
      \"callId\": \"call_$(date +%s)\"
    }
  }"

# Test Voice Call
curl -X POST https://fcm.googleapis.com/fcm/send \
  -H "Authorization: key=$SERVER_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"to\": \"$FCM_TOKEN\",
    \"priority\": \"high\",
    \"data\": {
      \"type\": \"voice_call\",
      \"callerName\": \"Dr. Rajesh Sharma\",
      \"callerId\": \"mentor_123\",
      \"roomName\": \"room_abc123\",
      \"callId\": \"call_$(date +%s)\"
    }
  }"

# Test Message
curl -X POST https://fcm.googleapis.com/fcm/send \
  -H "Authorization: key=$SERVER_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"to\": \"$FCM_TOKEN\",
    \"priority\": \"high\",
    \"data\": {
      \"type\": \"message\",
      \"senderName\": \"Dr. Rajesh Sharma\",
      \"senderId\": \"mentor_123\",
      \"message\": \"Hello! How can I help you today?\",
      \"chatRoomId\": \"chat_room_456\"
    }
  }"
```

### 2. Test with Postman

```json
// POST https://fcm.googleapis.com/fcm/send
// Headers:
// Authorization: key=YOUR_SERVER_KEY
// Content-Type: application/json

// Body (Video Call):
{
  "to": "USER_FCM_TOKEN",
  "priority": "high",
  "data": {
    "type": "video_call",
    "callerName": "Dr. Rajesh Sharma",
    "callerId": "mentor_123",
    "roomName": "room_abc123",
    "callId": "call_1234567890"
  }
}

// Body (Message):
{
  "to": "USER_FCM_TOKEN",
  "priority": "high",
  "data": {
    "type": "message",
    "senderName": "Dr. Rajesh Sharma",
    "senderId": "mentor_123",
    "message": "Hello! How can I help you today?",
    "chatRoomId": "chat_room_456"
  }
}
```

## 🔄 Real-World Scenarios

### Scenario 1: Mentor Initiates Video Call

```typescript
// Mentor app - Initiate call button pressed
async function initiateVideoCall(mentorId: string, mentorName: string, clientId: string) {
  try {
    // 1. Create room
    const roomName = `room_${mentorId}_${clientId}_${Date.now()}`;
    
    // 2. Call backend API to send notification
    const response = await fetch('https://your-api.com/calls/initiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callerId: mentorId,
        callerName: mentorName,
        recipientId: clientId,
        roomName: roomName,
      }),
    });
    
    if (response.ok) {
      // 3. Navigate to call screen
      router.push({
        pathname: '/video-call-screen',
        params: { roomName, isHost: 'true' },
      });
    }
  } catch (error) {
    console.error('Error initiating call:', error);
    Alert.alert('Error', 'Failed to initiate call');
  }
}
```

### Scenario 2: Client Receives and Answers Call

```typescript
// This is handled automatically by PushNotificationService
// When client taps "Pick up" button:
// 1. CallKeep triggers 'answerCall' event
// 2. PushNotificationService handles the event
// 3. App navigates to video-call-screen with room details
// 4. Client joins the call
```

### Scenario 3: Send Message with Notification

```typescript
// Chat screen - Send message button pressed
async function sendMessage(
  senderId: string,
  senderName: string,
  recipientId: string,
  message: string,
  chatRoomId: string
) {
  try {
    // Call backend API
    const response = await fetch('https://your-api.com/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        senderId,
        senderName,
        recipientId,
        message,
        chatRoomId,
      }),
    });
    
    if (response.ok) {
      console.log('Message sent and notification delivered');
    }
  } catch (error) {
    console.error('Error sending message:', error);
    Alert.alert('Error', 'Failed to send message');
  }
}
```

## 📊 Analytics Examples

### Track Notification Delivery

```typescript
// Backend - Track notification delivery
async function sendNotificationWithTracking(
  userFCMToken: string,
  notificationData: any
) {
  try {
    // Send notification
    const response = await admin.messaging().send({
      token: userFCMToken,
      data: notificationData,
    });
    
    // Log delivery
    await db.collection('notification_logs').add({
      userId: notificationData.recipientId,
      type: notificationData.type,
      status: 'sent',
      messageId: response,
      sentAt: new Date(),
    });
    
    return response;
  } catch (error) {
    // Log failure
    await db.collection('notification_logs').add({
      userId: notificationData.recipientId,
      type: notificationData.type,
      status: 'failed',
      error: error.message,
      sentAt: new Date(),
    });
    
    throw error;
  }
}
```

### Track Notification Engagement

```typescript
// Client - Track when user opens notification
import PushNotificationService from '../services/PushNotificationService';
import { ApiService } from '../services/apiService';

// In PushNotificationService.handleNotificationTap
async handleNotificationTap(data: { [key: string]: any }): Promise<void> {
  // Track engagement
  await ApiService.trackNotificationEngagement({
    notificationType: data.type,
    timestamp: Date.now(),
    userId: await getCurrentUserId(),
  });
  
  // Continue with navigation...
}
```

## 🎯 Best Practices

1. **Always validate data** before sending notifications
2. **Use meaningful notification IDs** for tracking
3. **Handle token expiration** gracefully
4. **Batch notifications** when sending to multiple users
5. **Monitor delivery rates** and adjust strategy
6. **Test on real devices** before production
7. **Respect user preferences** for notification types
8. **Implement retry logic** for failed deliveries
9. **Use appropriate priority** levels
10. **Keep payloads small** for better performance

---

For more examples and detailed documentation, see:
- `PUSH_NOTIFICATION_SETUP.md`
- `PUSH_NOTIFICATION_QUICKSTART.md`
- `utils/pushNotificationHelper.ts`
