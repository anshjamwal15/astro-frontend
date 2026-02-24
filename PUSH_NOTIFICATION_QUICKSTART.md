# Push Notification Quick Start Guide

## 🚀 Quick Setup (5 Minutes)

### Step 1: Build the App
Since we've added native modules, you need to rebuild the app:

```bash
# For Android
cd android
./gradlew clean
cd ..
npx expo run:android

# For iOS (on Mac)
cd ios
pod install
cd ..
npx expo run:ios
```

### Step 2: Get Your FCM Token
1. Run the app
2. Check the console logs
3. Look for: `FCM Token: ey...`
4. Copy this token

### Step 3: Test Notifications

#### Option A: Using Firebase Console (Easiest)
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to Cloud Messaging
4. Click "Send your first message"
5. Click "Send test message"
6. Paste your FCM token
7. Click "Test"

#### Option B: Using the Test Component
1. Add the tester component to any screen:
```typescript
import PushNotificationTester from '../components/PushNotificationTester';

// In your component
<PushNotificationTester />
```

2. Use the UI to copy payloads and test

#### Option C: Using cURL (For Backend Testing)
```bash
# Replace YOUR_SERVER_KEY with your Firebase Server Key
# Replace USER_FCM_TOKEN with the token from Step 2

# Test Video Call
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

# Test Message
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

## 📱 Testing Different States

### Foreground (App Open)
- Send notification while app is open
- Should see CallKeep UI for calls
- Should see in-app notification for messages

### Background (App Minimized)
- Minimize the app
- Send notification
- Should see system notification
- Tap to open app

### Killed State (App Closed)
- Force close the app
- Send notification
- Should see system notification
- Tap to open app

## 🔑 Get Your Firebase Server Key

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click the gear icon ⚙️ > Project settings
4. Go to "Cloud Messaging" tab
5. Copy the "Server key"

## 🎯 Expected Behavior

### Video/Voice Call Notifications
- Shows incoming call UI (like WhatsApp)
- Displays caller name
- Shows "Pick up" and "End call" buttons
- Tapping "Pick up" opens call screen
- Tapping "End call" dismisses notification

### Message Notifications
- Shows sender name
- Shows message content
- Tapping opens chat screen with sender

## ⚠️ Common Issues

### "Notifications not received"
- Make sure you're testing on a real device (not emulator)
- Check if notification permissions are granted
- Verify FCM token is correct
- Check Firebase Console for delivery status

### "CallKeep not working"
- Requires Android 10+ or iOS 13+
- Check if all permissions are granted
- Verify CallKeep is properly initialized

### "App not opening on tap"
- Check if router navigation is working
- Verify notification data structure
- Check console logs for errors

## 📚 Next Steps

1. **Backend Integration**
   - Store FCM tokens in your database
   - Implement notification sending logic
   - Handle token refresh

2. **Production Setup**
   - Upload APNs key for iOS
   - Configure production Firebase project
   - Test on production builds

3. **Advanced Features**
   - Custom notification sounds
   - Notification grouping
   - Action buttons
   - Notification history

## 📖 Full Documentation

See `PUSH_NOTIFICATION_SETUP.md` for complete documentation including:
- Detailed architecture
- iOS configuration
- Backend integration examples
- Production best practices
- Troubleshooting guide

## 🆘 Need Help?

1. Check console logs for errors
2. Verify all configuration steps
3. Test with different notification types
4. Review Firebase Console logs
5. Check device notification settings
