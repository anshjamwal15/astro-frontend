# Backend Notification Fix

## Problem Identified

From the logs:
- ✅ Caller sends notification: `Call notification response: 200 Call notification sent successfully`
- ✅ Callee has device token registered: `eUUu8zqzTpCRGP9nUPqBzf:APA91bF6mn_6VkTkUF4uWewhY3U...`
- ❌ Callee never receives notification (no logs on callee side)

**Root Cause:** Backend endpoint `/api/notifications/call` returns 200 OK but doesn't actually send the FCM notification to the device.

## Backend Implementation Required

Your backend needs to implement the `/api/notifications/call` endpoint to actually send FCM notifications.

### Step 1: Install Firebase Admin SDK

```bash
npm install firebase-admin
```

### Step 2: Get Firebase Service Account Key

1. Go to Firebase Console: https://console.firebase.google.com/
2. Select your project
3. Go to Project Settings → Service Accounts
4. Click "Generate New Private Key"
5. Save the JSON file as `firebase-service-account.json`
6. Place it in your backend project root (add to `.gitignore`!)

### Step 3: Initialize Firebase Admin

Create `config/firebase-admin.js`:

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('../firebase-service-account.json');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

module.exports = admin;
```

### Step 4: Implement Notification Endpoint

Create or update `routes/notifications.js`:

```javascript
const express = require('express');
const router = express.Router();
const admin = require('../config/firebase-admin');

/**
 * POST /api/notifications/call
 * Send call notification via FCM
 */
router.post('/call', async (req, res) => {
  try {
    const { type, device_token, callerName, callerId, roomName, callId } = req.body;

    // Validate required fields
    if (!device_token || !type || !callerName || !callerId || !roomName || !callId) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['type', 'device_token', 'callerName', 'callerId', 'roomName', 'callId']
      });
    }

    console.log('📞 Sending FCM notification:', {
      type,
      callerName,
      callerId,
      roomName,
      callId,
      deviceToken: device_token.substring(0, 50) + '...'
    });

    // Prepare notification payload
    const message = {
      token: device_token,
      notification: {
        title: type === 'VIDEO_CALL' ? 'Incoming Video Call' : 
               type === 'VOICE_CALL' ? 'Incoming Voice Call' : 'New Message',
        body: `${callerName} is calling...`,
      },
      data: {
        type: type,
        callerName: callerName,
        callerId: callerId,
        roomName: roomName,
        callId: callId,
      },
      android: {
        priority: 'high',
        notification: {
          channelId: 'calls',
          priority: 'max',
          sound: 'default',
          visibility: 'public',
        },
      },
      apns: {
        payload: {
          aps: {
            alert: {
              title: type === 'VIDEO_CALL' ? 'Incoming Video Call' : 
                     type === 'VOICE_CALL' ? 'Incoming Voice Call' : 'New Message',
              body: `${callerName} is calling...`,
            },
            sound: 'default',
            badge: 1,
            'content-available': 1,
          },
        },
      },
    };

    // Send notification via FCM
    const response = await admin.messaging().send(message);
    
    console.log('✅ FCM notification sent successfully:', response);

    res.status(200).send('Call notification sent successfully');
  } catch (error) {
    console.error('❌ Error sending FCM notification:', error);
    
    // Handle specific FCM errors
    if (error.code === 'messaging/invalid-registration-token' ||
        error.code === 'messaging/registration-token-not-registered') {
      return res.status(400).json({
        error: 'Invalid or expired device token',
        code: error.code
      });
    }

    res.status(500).json({
      error: 'Failed to send notification',
      message: error.message
    });
  }
});

module.exports = router;
```

### Step 5: Register Route in Main App

In your `app.js` or `server.js`:

```javascript
const notificationsRouter = require('./routes/notifications');

// ... other middleware ...

app.use('/api/notifications', notificationsRouter);
```

### Step 6: Test the Endpoint

```bash
curl -X POST 'http://192.168.1.15:3000/api/notifications/call' \
  -H 'Content-Type: application/json' \
  -d '{
  "type": "VIDEO_CALL",
  "device_token": "eUUu8zqzTpCRGP9nUPqBzf:APA91bF6mn_6VkTkUF4uWewhY3ULBzFVFUg33HUdNtLDgROo1y63oUp_bQP-oJTaKzXh9a7KXox8ml80ca3syF3W-BVX42ZZuRTLhsnjXYdjAMkcjbc1MXI",
  "callerName": "Test Caller",
  "callerId": "test_123",
  "roomName": "test_room",
  "callId": "test_call_123"
}'
```

**Expected response:**
```
Call notification sent successfully
```

**Expected on callee's device:**
```
📱 FOREGROUND NOTIFICATION RECEIVED
Full message: { notification: {...}, data: {...} }
```

## Alternative: Using FCM HTTP v1 API

If you don't want to use Firebase Admin SDK, you can use the FCM HTTP v1 API:

```javascript
const fetch = require('node-fetch');
const { GoogleAuth } = require('google-auth-library');

async function sendFCMNotification(deviceToken, type, callerName, callerId, roomName, callId) {
  // Get access token
  const auth = new GoogleAuth({
    keyFile: './firebase-service-account.json',
    scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
  });
  
  const accessToken = await auth.getAccessToken();
  
  // Your Firebase project ID
  const projectId = 'your-project-id';
  
  const message = {
    message: {
      token: deviceToken,
      notification: {
        title: type === 'VIDEO_CALL' ? 'Incoming Video Call' : 'Incoming Voice Call',
        body: `${callerName} is calling...`,
      },
      data: {
        type,
        callerName,
        callerId,
        roomName,
        callId,
      },
      android: {
        priority: 'high',
      },
    },
  };
  
  const response = await fetch(
    `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    }
  );
  
  return response.json();
}
```

## Troubleshooting

### Error: "Invalid registration token"
- Device token is expired or invalid
- User needs to log in again to get new token

### Error: "Requested entity was not found"
- Wrong Firebase project
- Check `google-services.json` matches backend project

### Error: "Permission denied"
- Service account doesn't have FCM permissions
- Regenerate service account key with correct permissions

### Notification sent but not received
- Check device has internet connection
- Check notification permissions are enabled
- Check app is not in battery optimization mode (Android)

## Testing Checklist

- [ ] Firebase Admin SDK installed
- [ ] Service account key downloaded and configured
- [ ] `/api/notifications/call` endpoint implemented
- [ ] Endpoint returns 200 and sends FCM notification
- [ ] Test with curl shows notification received on device
- [ ] Caller can send notification
- [ ] Callee receives notification

## Quick Test

1. Get callee's device token from logs:
   ```
   FCM Token: eUUu8zqzTpCRGP9nUPqBzf:APA91bF6mn_6VkTkUF4uWewhY3U...
   ```

2. Send test notification with curl (see Step 6 above)

3. Check callee's device for notification

4. If received, backend is working correctly!

## Summary

Your backend currently returns 200 OK but doesn't actually send the FCM notification. You need to:

1. Install Firebase Admin SDK
2. Get service account key from Firebase Console
3. Implement FCM notification sending in `/api/notifications/call`
4. Test with curl to verify it works

Once this is done, notifications will be delivered to the callee's device!
