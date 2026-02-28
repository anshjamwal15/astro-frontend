# Call Notification Implementation

## Overview
Implemented a comprehensive call notification system that sends notifications to the backend API whenever a user initiates a video call, voice call, or chat session.

## Backend API Endpoint
```
POST http://192.168.1.9:3000/api/notifications/call
```

### Request Headers
- `Accept: application/hal+json`
- `Content-Type: application/json`

### Request Body
```json
{
  "type": "VIDEO_CALL" | "VOICE_CALL" | "CHAT",
  "device_token": "string",
  "callerName": "string",
  "callerId": "string",
  "roomName": "string",
  "callId": "string"
}
```

## Implementation Details

### 1. Call Notification Service (`services/CallNotificationService.ts`)

A new service that handles all call notification operations:

#### Key Features
- **Automatic notification sending**: Sends notifications when calls/chats start
- **Type-specific methods**: Separate methods for video, voice, and chat notifications
- **Device token management**: Handles device token retrieval (mock implementation for now)
- **Error handling**: Graceful fallback if notification fails
- **Logging**: Comprehensive logging for debugging

#### Main Methods

##### `sendCallNotification(payload)`
Core method that sends the notification to the backend API.

##### `sendVideoCallNotification(deviceToken, callerName, callerId, roomName, callId)`
Sends a video call notification.

##### `sendVoiceCallNotification(deviceToken, callerName, callerId, roomName, callId)`
Sends a voice call notification.

##### `sendChatNotification(deviceToken, callerName, callerId, roomName, callId)`
Sends a chat notification.

##### `sendNotificationWithAutoToken(type, callerName, callerId, mentorId, roomName, callId)`
Helper method that automatically retrieves device token and sends notification.

### 2. Video Call Screen Integration (`app/video-call-screen.tsx`)

#### When Notification is Sent
- **Trigger**: When `initializeCall()` is called (as soon as user enters video call screen)
- **Timing**: Before WebRTC connection is established
- **Type**: `VIDEO_CALL`

#### Notification Payload Example
```json
{
  "type": "VIDEO_CALL",
  "device_token": "device_token_mentor123_1234567890",
  "callerName": "John Doe",
  "callerId": "user_uuid_123",
  "roomName": "room_video_user123_mentor456_1234567890",
  "callId": "video_user123_mentor456_1234567890"
}
```

#### Flow
1. User clicks "Start Video Call" on home/mentors page
2. Navigates to video call screen with session parameters
3. `initializeCall()` is triggered
4. Notification is sent to mentor's device
5. WebRTC connection is established
6. Call proceeds normally

### 3. Chat Screen Integration (`app/chatbox.tsx`)

#### When Notifications are Sent

##### Chat Notification
- **Trigger**: When `initializeChatRoom()` is called (as soon as user enters chat screen)
- **Timing**: Before chat room is created/joined
- **Type**: `CHAT`

##### Voice Call Notification
- **Trigger**: When user clicks the voice call button in chat header
- **Timing**: After user confirms they want to start the call
- **Type**: `VOICE_CALL`

##### Video Call Notification (from chat)
- **Trigger**: When user clicks the video call button in chat header
- **Timing**: After user confirms they want to start the call
- **Type**: `VIDEO_CALL`

#### Notification Payload Examples

**Chat Notification:**
```json
{
  "type": "CHAT",
  "device_token": "device_token_mentor123_1234567890",
  "callerName": "John Doe",
  "callerId": "user_uuid_123",
  "roomName": "chat_user123_mentor456",
  "callId": "chat_user123_mentor456_1234567890"
}
```

**Voice Call Notification:**
```json
{
  "type": "VOICE_CALL",
  "device_token": "device_token_mentor123_1234567890",
  "callerName": "John Doe",
  "callerId": "user_uuid_123",
  "roomName": "voice_room_voice_user123_mentor456_1234567890",
  "callId": "voice_user123_mentor456_1234567890"
}
```

### 4. Error Handling

The notification system is designed to be non-blocking:
- If notification fails, the call/chat continues normally
- Errors are logged but don't interrupt the user experience
- User is only notified if there's a critical failure

### 5. Device Token Management

#### Current Implementation (Mock)
```typescript
static async getDeviceToken(userId: string): Promise<string> {
  return `device_token_${userId}_${Date.now()}`;
}
```

#### Future Implementation
The device token should be:
1. Retrieved from push notification registration (FCM/APNs)
2. Stored in AsyncStorage or secure storage
3. Associated with the user's account
4. Updated when the app is reinstalled or token refreshes

### 6. Notification Flow Diagram

```
User Action (Start Call/Chat)
         ↓
Generate Call/Session ID
         ↓
Get Mentor's Device Token
         ↓
Send Notification to Backend API
         ↓
Backend Sends Push Notification to Mentor
         ↓
Mentor Receives Notification
         ↓
Proceed with Call/Chat Setup
```

## Testing

### Manual Testing
1. Start a video call from home or mentors page
2. Check console logs for notification sending
3. Verify API receives the correct payload
4. Check mentor's device for push notification

### Console Logs to Look For
- `📞 Sending video call notification to mentor...`
- `✅ Video call notification sent successfully`
- `💬 Sending chat notification to mentor...`
- `✅ Chat notification sent successfully`
- `⚠️ Failed to send notification:` (if error occurs)

## API Response Handling

The service handles various response scenarios:
- **Success (200-299)**: Logs success and continues
- **Error (400+)**: Logs error but doesn't block the call
- **Network Error**: Logs error but doesn't block the call
- **Invalid JSON**: Treats as success if status is OK

## Configuration

The base URL is configured in `config/auth.ts`:
```typescript
API: {
  BASE_URL: 'http://192.168.1.9:3000'
}
```

## Future Enhancements

1. **Real Device Token Integration**
   - Integrate with Firebase Cloud Messaging (FCM)
   - Store tokens in backend database
   - Handle token refresh

2. **Notification Acknowledgment**
   - Track if mentor received the notification
   - Retry logic if notification fails
   - Fallback to SMS/email if push fails

3. **Rich Notifications**
   - Include caller's profile picture
   - Add accept/reject actions
   - Show estimated wait time

4. **Notification History**
   - Store notification logs
   - Analytics on notification delivery
   - User preferences for notification types

5. **Multi-Device Support**
   - Send to all mentor's devices
   - Handle notification on multiple devices
   - Sync notification state across devices

## Troubleshooting

### Notification Not Received
1. Check if API endpoint is accessible
2. Verify device token is valid
3. Check backend logs for errors
4. Ensure mentor has notifications enabled

### API Errors
1. Check network connectivity
2. Verify API endpoint URL
3. Check request payload format
4. Review backend API logs

### Console Warnings
- `⚠️ Failed to send notification`: Non-critical, call continues
- Check the error message for specific details
- Verify backend API is running and accessible
