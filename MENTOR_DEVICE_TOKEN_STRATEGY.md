# Mentor Device Token Strategy Update

## Overview
Updated the call notification system to fetch device tokens dynamically from the mentor list API instead of using hardcoded or locally stored tokens.

## Changes Made

### 1. Updated `CallNotificationService.ts`

#### Added Mentor Data Interface
```typescript
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
  rating_count: number;
  created_at: string;
  jwt_token: string | null;
  user_id: string;
  device_token: string | null;
}
```

#### Implemented Caching Mechanism
- Cache duration: 5 minutes
- Reduces API calls for better performance
- Falls back to cached data if API fails
- `clearMentorCache()` method to manually invalidate cache

#### New Methods

**`fetchMentorList()`**
- Fetches mentor list from `GET /api/mentor/list`
- Implements 5-minute caching to reduce API calls
- Returns cached data on network errors

**`getDeviceToken(mentorId: string)`**
- Fetches mentor list from API
- Searches for mentor by `id` or `user_id` field
- Returns device token or null if not found
- Provides detailed logging for debugging

**`sendNotificationWithAutoToken()` (Updated)**
- Now fetches device token from mentor list API
- Returns error if no device token found
- Provides clear error messages for debugging

## API Integration

### Mentor List Endpoint
```bash
curl -X 'GET' \
  'http://localhost:3000/api/mentor/list' \
  -H 'accept: application/hal+json'
```

### Response Format
```json
[
  {
    "id": "c80776ec-8bc8-46df-82ed-7968c39147e0",
    "name": "vinod",
    "email": "vinod@gmail.com",
    "mobile": "73038294931",
    "country": null,
    "status": "INACTIVE",
    "about": null,
    "expertise": [],
    "rating": 3.1,
    "rating_count": 0,
    "created_at": "2026-02-28T23:19:46.850425",
    "jwt_token": null,
    "user_id": "6e56e36a-10ec-43c5-8bcb-db5a752251ec",
    "device_token": "eUUu8zqzTpCRGP9nUPqBzf:APA91bF6mn_6VkTkUF4uWewhY3ULBzFVFUg33HUdNtLDgROo1y63oUp_bQP-oJTaKzXh9a7KXox8ml80ca3syF3W-BVX42ZZuRTLhsnjXYdjAMkcjbc1MXI"
  }
]
```

## Call Flow

### Video/Voice Call Flow
1. User initiates call to mentor
2. `CallNotificationService.sendNotificationWithAutoToken()` is called
3. Service fetches mentor list from API (or uses cache)
4. Service finds mentor by ID and extracts device token
5. Service sends call notification with device token to backend
6. Backend sends push notification to mentor's device

### Error Handling
- **No device token found**: Returns error, call continues but notification not sent
- **Mentor not found**: Logs warning with available mentor IDs for debugging
- **API failure**: Uses cached data if available
- **Network error**: Returns error but doesn't crash the app

## Benefits

### 1. Dynamic Token Retrieval
- Always uses the latest device token from backend
- No need to store tokens locally
- Automatically handles token updates

### 2. Performance Optimization
- 5-minute cache reduces API calls
- Fallback to cache on network errors
- Non-blocking: call continues even if notification fails

### 3. Better Error Handling
- Clear error messages for debugging
- Detailed logging at each step
- Graceful degradation on failures

### 4. Flexibility
- Searches by both `id` and `user_id` fields
- Works with existing call flow
- No changes needed in calling components

## Usage in App

The service is already integrated in:
- `app/video-call-screen.tsx` - Video calls
- `app/chatbox.tsx` - Voice calls and chat notifications

No changes needed in these files - they continue to use `sendNotificationWithAutoToken()` as before.

## Testing

### Test Scenarios

1. **Normal Call Flow**
   - Initiate call to mentor
   - Check logs for "✅ Found device token for mentor"
   - Verify notification is sent

2. **Mentor Without Device Token**
   - Call mentor who hasn't registered device
   - Check logs for "⚠️ Mentor has no device token registered"
   - Verify call continues without notification

3. **Invalid Mentor ID**
   - Call with non-existent mentor ID
   - Check logs for "⚠️ Mentor not found with ID"
   - Verify available mentor IDs are logged

4. **Cache Testing**
   - Make first call (fetches from API)
   - Make second call within 5 minutes (uses cache)
   - Check logs for "📋 Using cached mentor list"

5. **Network Error**
   - Disconnect network
   - Make call
   - Verify cached data is used if available

## Debugging

### Console Logs
The service provides detailed logging:
- `📋 Fetching mentor list from backend...` - API call started
- `✅ Fetched X mentors from backend` - API call successful
- `📋 Using cached mentor list` - Cache hit
- `🔍 Looking up device token for mentor: X` - Token lookup started
- `✅ Found device token for mentor X` - Token found
- `⚠️ Mentor not found with ID: X` - Mentor not in list
- `⚠️ Mentor has no device token registered` - Token is null
- `❌ Cannot send notification: No device token found` - Notification failed

### Manual Cache Clear
If you need to force a fresh fetch:
```typescript
CallNotificationService.clearMentorCache();
```

## Future Enhancements

1. **Configurable Cache Duration**
   - Make cache duration configurable per environment

2. **Mentor-Specific Cache**
   - Cache individual mentor tokens separately
   - Reduce data transfer for single lookups

3. **Webhook for Token Updates**
   - Backend notifies app when mentor token changes
   - Invalidate cache automatically

4. **Retry Logic**
   - Retry failed API calls with exponential backoff
   - Queue notifications for retry

5. **Analytics**
   - Track notification success/failure rates
   - Monitor cache hit rates
