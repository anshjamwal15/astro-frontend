# Push Notification Implementation Guide

This document provides a complete guide for the push notification feature implemented in the ADVIJR app.

## Features Implemented

✅ **Video Call Notifications**
- WhatsApp-like incoming call UI with pickup and end call buttons
- Shows caller name
- Clicking notification opens video call screen
- Works in foreground, background, and killed state

✅ **Voice Call Notifications**
- Similar to video call with audio-only interface
- Shows caller name
- Clicking notification opens voice call screen
- Works in foreground, background, and killed state

✅ **Chat Message Notifications**
- Shows sender name and message content
- Clicking notification opens chat screen with the sender
- Works in foreground, background, and killed state

## Architecture

```
Backend Server
    ↓
Firebase Cloud Messaging (FCM)
    ↓
React Native App
    ↓
PushNotificationService
    ↓
├── CallKeep (for call notifications)
└── Expo Notifications (for message notifications)
```

## Files Created/Modified

### New Files
1. `services/PushNotificationService.ts` - Main push notification service
2. `utils/pushNotificationHelper.ts` - Helper functions and payload examples
3. `index.js` - Background message handler
4. `PUSH_NOTIFICATION_SETUP.md` - This documentation

### Modified Files
1. `app/_layout.tsx` - Initialize push notification service
2. `android/app/src/main/AndroidManifest.xml` - Added permissions
3. `package.json` - Added dependencies

## Dependencies Installed

```json
{
  "@react-native-firebase/messaging": "^23.8.6",
  "expo-notifications": "latest",
  "react-native-callkeep": "latest"
}
```

## Android Configuration

### Permissions Added (AndroidManifest.xml)
```xml
<!-- Push Notification Permissions -->
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
<uses-permission android:name="android.permission.WAKE_LOCK" />

<!-- CallKeep Permissions -->
<uses-permission android:name="android.permission.BIND_TELECOM_SERVICE" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.READ_PHONE_STATE" />
<uses-permission android:name="android.permission.CALL_PHONE" />
<uses-permission android:name="android.permission.READ_CALL_LOG" />
<uses-permission android:name="android.permission.WRITE_CALL_LOG" />
<uses-permission android:name="android.permission.MANAGE_OWN_CALLS" />
```

### Build Configuration
- `android/build.gradle` - Already has google-services classpath
- `android/app/build.gradle` - Already has google-services plugin applied

## iOS Configuration (Required for iOS)

### 1. Enable Capabilities in Xcode
- Open `ios/ADVIJR.xcworkspace` in Xcode
- Select your project target
- Go to "Signing & Capabilities"
- Add the following capabilities:
  - Push Notifications
  - Background Modes (enable "Remote notifications")

### 2. Upload APNs Key to Firebase
1. Go to Apple Developer Portal
2. Create an APNs Authentication Key
3. Download the .p8 file
4. Go to Firebase Console > Project Settings > Cloud Messaging
5. Upload the APNs key

### 3. Update Info.plist
Add the following to `ios/ADVIJR/Info.plist`:
```xml
<key>UIBackgroundModes</key>
<array>
  <string>remote-notification</string>
  <string>voip</string>
</array>
```

## Usage

### 1. Initialize Service (Already Done)
The service is automatically initialized in `app/_layout.tsx`:
```typescript
useEffect(() => {
  const initPushNotifications = async () => {
    await PushNotificationService.initialize();
    await PushNotificationService.handleInitialNotification();
    PushNotificationService.setupNotificationTapHandler();
  };
  initPushNotifications();
}, []);
```

### 2. Get FCM Token
```typescript
import PushNotificationService from '../services/PushNotificationService';

const token = PushNotificationService.getToken();
console.log('FCM Token:', token);

// Send this token to your backend to store with user profile
```

### 3. Send Notifications from Backend

#### Video Call Notification
```typescript
// Using Firebase Admin SDK
import * as admin from 'firebase-admin';

await admin.messaging().send({
  token: userFCMToken,
  data: {
    type: 'video_call',
    callerName: 'Dr. Rajesh Sharma',
    callerId: 'mentor_123',
    roomName: 'room_abc123',
    callId: 'call_1234567890',
  },
  android: {
    priority: 'high',
  },
  apns: {
    headers: {
      'apns-priority': '10',
    },
  },
});
```

#### Voice Call Notification
```typescript
await admin.messaging().send({
  token: userFCMToken,
  data: {
    type: 'voice_call',
    callerName: 'Dr. Rajesh Sharma',
    callerId: 'mentor_123',
    roomName: 'room_abc123',
    callId: 'call_1234567890',
  },
  android: {
    priority: 'high',
  },
  apns: {
    headers: {
      'apns-priority': '10',
    },
  },
});
```

#### Chat Message Notification
```typescript
await admin.messaging().send({
  token: userFCMToken,
  data: {
    type: 'message',
    senderName: 'Dr. Rajesh Sharma',
    senderId: 'mentor_123',
    message: 'Hello! How can I help you today?',
    chatRoomId: 'chat_room_456',
  },
  android: {
    priority: 'high',
  },
  apns: {
    headers: {
      'apns-priority': '10',
    },
  },
});
```

## Notification Payload Structure

### Video/Voice Call
```json
{
  "to": "USER_FCM_TOKEN",
  "priority": "high",
  "data": {
    "type": "video_call" | "voice_call",
    "callerName": "Caller Name",
    "callerId": "caller_id",
    "roomName": "room_name",
    "callId": "unique_call_id"
  }
}
```

### Chat Message
```json
{
  "to": "USER_FCM_TOKEN",
  "priority": "high",
  "data": {
    "type": "message",
    "senderName": "Sender Name",
    "senderId": "sender_id",
    "message": "Message content",
    "chatRoomId": "chat_room_id"
  }
}
```

## Testing

### 1. Get FCM Token
- Run the app
- Check console logs for "FCM Token: ..."
- Copy the token

### 2. Test Using Firebase Console
1. Go to Firebase Console > Cloud Messaging
2. Click "Send your first message"
3. Enter notification details
4. Click "Send test message"
5. Paste the FCM token
6. In "Additional options", add custom data:
   - Key: `type`, Value: `video_call`
   - Key: `callerName`, Value: `Test Caller`
   - Key: `callerId`, Value: `test_123`
   - Key: `roomName`, Value: `test_room`

### 3. Test Using cURL
```bash
# Video Call
curl -X POST https://fcm.googleapis.com/fcm/send \
  -H "Authorization: key=YOUR_SERVER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "USER_FCM_TOKEN",
    "priority": "high",
    "data": {
      "type": "video_call",
      "callerName": "Dr. Rajesh Sharma",
      "callerId": "mentor_123",
      "roomName": "room_abc123",
      "callId": "call_1234567890"
    }
  }'

# Chat Message
curl -X POST https://fcm.googleapis.com/fcm/send \
  -H "Authorization: key=YOUR_SERVER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "USER_FCM_TOKEN",
    "priority": "high",
    "data": {
      "type": "message",
      "senderName": "Dr. Rajesh Sharma",
      "senderId": "mentor_123",
      "message": "Hello! How can I help you today?",
      "chatRoomId": "chat_room_456"
    }
  }'
```

## Notification Behavior

### Foreground (App Open)
- **Call**: Shows CallKeep incoming call UI with pickup/end buttons
- **Message**: Shows in-app notification banner

### Background (App Minimized)
- **Call**: Shows CallKeep incoming call UI with pickup/end buttons
- **Message**: Shows system notification with sender name and message

### Killed State (App Closed)
- **Call**: Shows CallKeep incoming call UI with pickup/end buttons
- **Message**: Shows system notification with sender name and message

### Notification Tap Actions
- **Video Call**: Opens video call screen with room details
- **Voice Call**: Opens voice call screen with room details
- **Message**: Opens chat screen with the sender

## Production Best Practices

1. **Always use data-only push notifications** (no `notification` field)
2. **Set priority to "high"** for immediate delivery
3. **Handle token refresh** - Update backend when token changes
4. **Disable battery optimization** for testing on Android
5. **Test on real devices** - Push notifications don't work on emulators
6. **Store FCM tokens** in your backend database with user profiles
7. **Handle token expiration** - Tokens can expire, implement refresh logic
8. **Add error handling** for failed notification sends
9. **Implement notification analytics** to track delivery and engagement

## Troubleshooting

### Notifications Not Received
1. Check if FCM token is valid
2. Verify Firebase project configuration
3. Check if google-services.json is up to date
4. Ensure app has notification permissions
5. Test on a real device (not emulator)
6. Check Firebase Console for delivery status

### CallKeep Not Working
1. Verify all permissions are granted
2. Check if CallKeep is properly initialized
3. Test on Android 10+ (CallKeep requires Android 10+)
4. Check logs for CallKeep errors

### App Not Opening on Notification Tap
1. Verify notification data structure
2. Check if router navigation is working
3. Ensure app is properly handling deep links
4. Check logs for navigation errors

## Next Steps

1. **Backend Integration**
   - Implement FCM token storage in user profiles
   - Add notification sending logic to your backend
   - Implement token refresh handling

2. **Enhanced Features**
   - Add notification sound customization
   - Implement notification grouping
   - Add notification action buttons
   - Implement notification history

3. **Analytics**
   - Track notification delivery rates
   - Monitor notification engagement
   - Analyze user response times

## Support

For issues or questions:
1. Check Firebase Console logs
2. Review device logs (adb logcat for Android)
3. Verify all configuration steps are completed
4. Test with different notification types

## References

- [Firebase Cloud Messaging Documentation](https://firebase.google.com/docs/cloud-messaging)
- [React Native Firebase Messaging](https://rnfirebase.io/messaging/usage)
- [Expo Notifications Documentation](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [React Native CallKeep](https://github.com/react-native-webrtc/react-native-callkeep)
