# Notification Fix Implementation Guide

## Changes Made

### 1. Updated PushNotificationService.ts
- Added Android notification channels (default, calls, messages) with proper importance levels
- Fixed foreground notification display to show local notifications
- Added proper sound configuration ('default' instead of boolean)
- Added channelId for Android notifications
- Improved permission handling for both FCM and Expo Notifications
- Added displayLocalNotification method for foreground messages

### 2. Updated app.json
- Added expo-notifications plugin configuration
- Added @react-native-firebase/app and @react-native-firebase/messaging plugins

### 3. Background Handler
- Background message handler already properly configured in index.js
- Runs outside of any component as required by Firebase

## How Notifications Work Now

### Foreground (App Open)
1. FCM message received → `onMessage` handler
2. Local notification displayed using Expo Notifications
3. Shows in notification tray with sound and vibration
4. User can tap to navigate to relevant screen

### Background (App Minimized)
1. FCM message received → background handler in index.js
2. Android system automatically displays notification
3. Notification data processed for any background tasks
4. User can tap to open app and navigate

### Killed (App Not Running)
1. FCM message received → Android system handles
2. Notification displayed automatically by system
3. App opens when tapped → `getInitialNotification` handles navigation

## Testing Steps

### 1. Rebuild the App
```bash
# Clean and rebuild
cd android
./gradlew clean
cd ..
npx expo run:android
```

### 2. Test Foreground Notifications
1. Open the app
2. Send a notification from your server
3. You should see the notification appear at the top of the screen
4. Check logs: `npx react-native log-android`

### 3. Test Background Notifications
1. Minimize the app (press home button)
2. Send a notification from your server
3. Notification should appear in notification tray
4. Tap notification to open app

### 4. Test Killed State Notifications
1. Force close the app (swipe away from recent apps)
2. Send a notification from your server
3. Notification should appear in notification tray
4. Tap notification to launch app

## Server Payload Format

Your server should send notifications in this format:

### For Video/Voice Calls
```json
{
  "token": "device_fcm_token",
  "notification": {
    "title": "Incoming Video Call",
    "body": "John Doe is calling..."
  },
  "data": {
    "type": "video_call",
    "callerName": "John Doe",
    "callerId": "user123",
    "roomName": "room456",
    "callId": "call789"
  },
  "android": {
    "priority": "high",
    "notification": {
      "channelId": "calls",
      "sound": "default",
      "priority": "max"
    }
  }
}
```

### For Messages
```json
{
  "token": "device_fcm_token",
  "notification": {
    "title": "John Doe",
    "body": "Hello, how are you?"
  },
  "data": {
    "type": "message",
    "senderName": "John Doe",
    "senderId": "user123",
    "chatRoomId": "chat456",
    "message": "Hello, how are you?"
  },
  "android": {
    "priority": "high",
    "notification": {
      "channelId": "messages",
      "sound": "default"
    }
  }
}
```

## Important Notes

1. **Always include both `notification` and `data` fields** in your FCM payload
   - `notification`: For automatic display by system (background/killed state)
   - `data`: For custom handling (foreground state)

2. **Android Channels**: Notifications are categorized into:
   - `calls`: High priority with persistent vibration
   - `messages`: High priority with standard vibration
   - `default`: For other notifications

3. **Permissions**: The app requests both FCM and Expo notification permissions on startup

4. **Testing on Physical Device**: Notifications work best on physical devices, not emulators

## Troubleshooting

### Notifications Not Showing in Foreground
- Check if notification handler is properly configured
- Verify logs show "Foreground message received"
- Ensure notification channels are created

### Notifications Not Showing in Background
- Verify background handler is registered in index.js
- Check if FCM payload includes `notification` field
- Ensure app has notification permissions

### Notifications Not Showing When Killed
- FCM payload MUST include `notification` field
- Check Android notification settings for the app
- Verify google-services.json is properly configured

### Check Logs
```bash
# Android logs
npx react-native log-android

# Or use adb
adb logcat | grep -i "notification\|firebase\|fcm"
```

## Next Steps

1. Rebuild your app: `npx expo run:android`
2. Test all three states (foreground, background, killed)
3. Verify server logs show successful FCM delivery
4. Check device logs for any errors
5. Ensure notification permissions are granted in device settings
