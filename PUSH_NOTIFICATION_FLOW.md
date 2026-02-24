# Push Notification Flow Diagram

## 🔄 Complete Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND SERVER                          │
│                                                                 │
│  1. User initiates action (call/message)                       │
│  2. Backend gets recipient's FCM token from database           │
│  3. Backend sends notification to FCM                          │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  FIREBASE CLOUD MESSAGING (FCM)                 │
│                                                                 │
│  - Receives notification from backend                          │
│  - Routes to appropriate device                                │
│  - Handles delivery based on device state                      │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    REACT NATIVE APP                             │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         PushNotificationService.ts                       │  │
│  │                                                          │  │
│  │  - Receives notification from FCM                       │  │
│  │  - Parses notification data                             │  │
│  │  - Routes to appropriate handler                        │  │
│  └────────────┬─────────────────────────────┬───────────────┘  │
│               │                             │                   │
│               ▼                             ▼                   │
│  ┌────────────────────────┐   ┌────────────────────────────┐  │
│  │   CALL NOTIFICATIONS   │   │  MESSAGE NOTIFICATIONS     │  │
│  │                        │   │                            │  │
│  │  CallKeep Integration  │   │  Expo Notifications        │  │
│  │  - Video Call          │   │  - Chat Messages           │  │
│  │  - Voice Call          │   │  - Sender Name             │  │
│  │  - Caller Name         │   │  - Message Content         │  │
│  │  - Pick Up Button      │   │  - Tap to Open Chat        │  │
│  │  - End Call Button     │   │                            │  │
│  └────────────┬───────────┘   └────────────┬───────────────┘  │
│               │                             │                   │
│               └──────────────┬──────────────┘                   │
│                              │                                  │
│                              ▼                                  │
│                   ┌──────────────────────┐                      │
│                   │  USER INTERACTION    │                      │
│                   │                      │                      │
│                   │  - Tap notification  │                      │
│                   │  - Pick up call      │                      │
│                   │  - End call          │                      │
│                   └──────────┬───────────┘                      │
│                              │                                  │
│                              ▼                                  │
│                   ┌──────────────────────┐                      │
│                   │   DEEP LINKING       │                      │
│                   │                      │                      │
│                   │  - Video Call Screen │                      │
│                   │  - Voice Call Screen │                      │
│                   │  - Chat Screen       │                      │
│                   └──────────────────────┘                      │
└─────────────────────────────────────────────────────────────────┘
```

## 📱 App State Handling

### Foreground (App Open)
```
Notification Received
    ↓
PushNotificationService.onMessage()
    ↓
Parse notification type
    ↓
├── Video/Voice Call → CallKeep.displayIncomingCall()
│                      ↓
│                      User sees incoming call UI
│                      ↓
│                      User taps "Pick Up" or "End Call"
│                      ↓
│                      Navigate to call screen or dismiss
│
└── Message → Expo Notifications.scheduleNotificationAsync()
              ↓
              User sees in-app notification
              ↓
              User taps notification
              ↓
              Navigate to chat screen
```

### Background (App Minimized)
```
Notification Received
    ↓
index.js: setBackgroundMessageHandler()
    ↓
PushNotificationService processes notification
    ↓
├── Video/Voice Call → CallKeep shows system call UI
│                      ↓
│                      User sees incoming call (like phone call)
│                      ↓
│                      User answers or declines
│                      ↓
│                      App opens to call screen or dismisses
│
└── Message → System notification displayed
              ↓
              User taps notification
              ↓
              App opens to chat screen
```

### Killed State (App Closed)
```
Notification Received
    ↓
System wakes app
    ↓
index.js: setBackgroundMessageHandler()
    ↓
PushNotificationService processes notification
    ↓
├── Video/Voice Call → CallKeep shows system call UI
│                      ↓
│                      User sees incoming call
│                      ↓
│                      User answers
│                      ↓
│                      App launches to call screen
│
└── Message → System notification displayed
              ↓
              User taps notification
              ↓
              App launches to chat screen
```

## 🔔 Notification Types Flow

### Video Call Notification
```
Backend sends notification
    ↓
{
  type: "video_call",
  callerName: "Dr. Rajesh Sharma",
  callerId: "mentor_123",
  roomName: "room_abc123",
  callId: "call_1234567890"
}
    ↓
PushNotificationService.handleCallNotification()
    ↓
CallKeep.displayIncomingCall(
  callUUID,
  callerName,
  hasVideo: true
)
    ↓
User sees: "Dr. Rajesh Sharma is calling..."
           [Pick Up] [End Call]
    ↓
User taps "Pick Up"
    ↓
Navigate to: /video-call-screen
    params: {
      roomName: "room_abc123",
      isHost: false,
      callerName: "Dr. Rajesh Sharma"
    }
```

### Voice Call Notification
```
Backend sends notification
    ↓
{
  type: "voice_call",
  callerName: "Dr. Rajesh Sharma",
  callerId: "mentor_123",
  roomName: "room_abc123",
  callId: "call_1234567890"
}
    ↓
PushNotificationService.handleCallNotification()
    ↓
CallKeep.displayIncomingCall(
  callUUID,
  callerName,
  hasVideo: false
)
    ↓
User sees: "Dr. Rajesh Sharma is calling..."
           [Pick Up] [End Call]
    ↓
User taps "Pick Up"
    ↓
Navigate to: /(tabs)/call
    params: {
      roomName: "room_abc123",
      isHost: false,
      callerName: "Dr. Rajesh Sharma"
    }
```

### Message Notification
```
Backend sends notification
    ↓
{
  type: "message",
  senderName: "Dr. Rajesh Sharma",
  senderId: "mentor_123",
  message: "Hello! How can I help you?",
  chatRoomId: "chat_room_456"
}
    ↓
PushNotificationService.handleMessageNotification()
    ↓
Expo Notifications.scheduleNotificationAsync({
  title: "Dr. Rajesh Sharma",
  body: "Hello! How can I help you?",
  style: MESSAGING
})
    ↓
User sees: "Dr. Rajesh Sharma"
           "Hello! How can I help you?"
    ↓
User taps notification
    ↓
Navigate to: /chatbox
    params: {
      astrologerId: "mentor_123",
      astrologerName: "Dr. Rajesh Sharma",
      chatRoomId: "chat_room_456"
    }
```

## 🔄 Token Management Flow

### Initial Setup
```
App launches
    ↓
app/_layout.tsx: useEffect()
    ↓
PushNotificationService.initialize()
    ↓
Request notification permission
    ↓
Permission granted?
    ├── Yes → Get FCM token
    │         ↓
    │         Store token locally
    │         ↓
    │         Send token to backend
    │         ↓
    │         Backend stores in database
    │
    └── No → Log permission denied
             User won't receive notifications
```

### Token Refresh
```
FCM token expires or changes
    ↓
messaging().onTokenRefresh()
    ↓
Get new FCM token
    ↓
Update local storage
    ↓
Send new token to backend
    ↓
Backend updates database
```

### Logout
```
User logs out
    ↓
Get current FCM token
    ↓
Send token removal request to backend
    ↓
Backend removes token from user profile
    ↓
Clear local data
    ↓
User won't receive notifications until next login
```

## 🎯 Backend Integration Flow

### Sending Video Call Notification
```
Mentor initiates video call
    ↓
Frontend calls: POST /calls/initiate
    {
      callerId: "mentor_123",
      callerName: "Dr. Rajesh Sharma",
      recipientId: "user_456",
      roomName: "room_abc123"
    }
    ↓
Backend receives request
    ↓
Query database for recipient's FCM token
    ↓
FCM token found?
    ├── Yes → Send notification via Firebase Admin SDK
    │         ↓
    │         admin.messaging().send({
    │           token: recipientFCMToken,
    │           data: {
    │             type: "video_call",
    │             callerName: "Dr. Rajesh Sharma",
    │             ...
    │           }
    │         })
    │         ↓
    │         Return success to frontend
    │         ↓
    │         Mentor navigates to call screen
    │
    └── No → Return error
             "Recipient doesn't have notifications enabled"
```

### Sending Message Notification
```
User sends message
    ↓
Frontend calls: POST /messages
    {
      senderId: "user_123",
      senderName: "John Doe",
      recipientId: "mentor_456",
      message: "Hello!",
      chatRoomId: "chat_room_789"
    }
    ↓
Backend receives request
    ↓
Save message to database
    ↓
Query database for recipient's FCM token
    ↓
FCM token found?
    ├── Yes → Send notification via Firebase Admin SDK
    │         ↓
    │         admin.messaging().send({
    │           token: recipientFCMToken,
    │           data: {
    │             type: "message",
    │             senderName: "John Doe",
    │             message: "Hello!",
    │             ...
    │           }
    │         })
    │         ↓
    │         Return success to frontend
    │
    └── No → Return success (message saved, no notification)
```

## 🧪 Testing Flow

### Test with Firebase Console
```
1. Get FCM token from app console
    ↓
2. Open Firebase Console
    ↓
3. Go to Cloud Messaging
    ↓
4. Click "Send test message"
    ↓
5. Paste FCM token
    ↓
6. Add custom data:
   - type: "video_call"
   - callerName: "Test Caller"
   - callerId: "test_123"
   - roomName: "test_room"
   - callId: "call_123"
    ↓
7. Click "Test"
    ↓
8. Notification received on device
    ↓
9. Verify incoming call UI appears
    ↓
10. Test "Pick Up" and "End Call" buttons
```

### Test with cURL
```
1. Get FCM token from app
    ↓
2. Get Firebase Server Key from console
    ↓
3. Run cURL command:
   curl -X POST https://fcm.googleapis.com/fcm/send \
     -H "Authorization: key=SERVER_KEY" \
     -H "Content-Type: application/json" \
     -d '{"to":"FCM_TOKEN","data":{...}}'
    ↓
4. Notification received on device
    ↓
5. Verify behavior
```

## 📊 Error Handling Flow

### Invalid FCM Token
```
Backend sends notification
    ↓
FCM returns error: "Invalid token"
    ↓
Backend logs error
    ↓
Backend marks token as invalid in database
    ↓
Next time user opens app
    ↓
App gets new token
    ↓
App sends new token to backend
    ↓
Backend updates database
```

### Permission Denied
```
App requests notification permission
    ↓
User denies permission
    ↓
PushNotificationService logs denial
    ↓
App continues without notifications
    ↓
User can enable later in settings
    ↓
App checks permission on next launch
```

### Network Error
```
Backend tries to send notification
    ↓
Network error occurs
    ↓
Backend catches error
    ↓
Backend logs error
    ↓
Backend retries (with exponential backoff)
    ↓
Success or max retries reached
```

---

This flow diagram shows the complete journey of a push notification from backend to user interaction. Each step is handled by the implemented system.
