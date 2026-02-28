# Device Token Integration

## Overview
Integrated automatic device token registration with the backend API whenever users sign in to the app.

## API Endpoint
```
PUT http://localhost:3000/api/user/{userId}/device-token?deviceToken={token}
Headers: Accept: application/hal+json
```

## Implementation

### 1. New Service: `services/deviceTokenService.ts`
Created a dedicated service to handle device token registration:
- `registerDeviceToken(userId, deviceToken?)` - Register/update device token with backend
- `updateDeviceToken(userId, newToken)` - Update token when it changes
- Automatically fetches FCM token from PushNotificationService if not provided
- Includes error handling and logging

### 2. User Sign-In: `app/auth/signin.tsx`
- Added device token registration after successful email/password login
- Runs after JWT token is saved
- Non-blocking: login succeeds even if token registration fails

### 3. Mentor Sign-In: `app/auth/mentor-signin.tsx`
- Added device token registration for mentor accounts
- Same non-blocking behavior as user sign-in

### 4. Auto-Login: `components/SplashScreen.tsx`
- Added device token registration during token-based auto-login
- Ensures device token is updated when app restarts with valid session

### 5. Token Refresh: `services/PushNotificationService.ts`
- Updated `setupTokenRefreshHandler()` to automatically register new tokens
- When FCM token refreshes, it's automatically sent to backend
- Uses dynamic import to avoid circular dependencies

## Flow

### Sign-In Flow
1. User enters credentials and signs in
2. Backend authenticates and returns user data + JWT token
3. App saves user data and JWT token to AsyncStorage
4. **App registers FCM device token with backend**
5. User navigates to home screen

### Auto-Login Flow
1. App starts and checks for existing JWT token
2. Token is validated with backend
3. User data is updated
4. **App registers FCM device token with backend**
5. User navigates to home screen

### Token Refresh Flow
1. FCM token refreshes (periodic or after reinstall)
2. PushNotificationService detects the refresh
3. **App automatically updates device token on backend**

## Error Handling
- All device token operations are wrapped in try-catch blocks
- Failures are logged but don't block the sign-in process
- User experience is not affected if token registration fails

## Testing
To test the integration:
1. Sign in with a user account
2. Check console logs for "✅ Device token registered with backend"
3. Verify the API call in your backend logs
4. Check that the device token is stored in your database

## Notes
- Device token registration is non-blocking to ensure smooth user experience
- The service automatically retrieves the FCM token from PushNotificationService
- Token updates are handled automatically on refresh
- Works for both regular users and mentors
