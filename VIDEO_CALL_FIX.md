# Video Call Stream Fix

## Problem
Users could join video calls via notification, but both caller and callee couldn't see each other's streams. The logs showed:
- `connectionState: undefined`
- `iceConnectionState: undefined`
- Peer connection closing prematurely (`close +15s`)
- No remote streams being received

## Root Causes

1. **Event Handler Syntax**: Using standard DOM event handler syntax (`onicecandidate`, `ontrack`, etc.) instead of react-native-webrtc's `addEventListener` pattern
2. **Missing Error Handling**: Firestore listeners and ICE candidate operations lacked proper error handling
3. **Poor Logging**: Insufficient logging made it difficult to debug the WebRTC signaling flow
4. **Race Conditions**: No proper queuing and processing of ICE candidates when remote description wasn't set yet

## Fixes Applied

### 1. Fixed Event Handlers
Changed from:
```typescript
this.peerConnection.onicecandidate = (event) => { ... }
this.peerConnection.ontrack = (event) => { ... }
```

To:
```typescript
(this.peerConnection as any).addEventListener('icecandidate', (event: any) => { ... });
(this.peerConnection as any).addEventListener('track', (event: any) => { ... });
```

### 2. Enhanced Logging
Added comprehensive logging throughout the WebRTC flow:
- Step-by-step initialization logging
- ICE candidate exchange logging
- Track addition/reception logging
- Connection state change logging with emojis for easy scanning

### 3. Improved Error Handling
- Added error callbacks to all Firestore listeners
- Better error messages with context
- Proper error propagation

### 4. Fixed ICE Candidate Processing
- Improved candidate queuing when remote description isn't set
- Async processing of queued candidates
- Better logging of candidate flow

### 5. Better Media Constraints
Simplified audio constraints to use boolean instead of detailed config (react-native-webrtc limitation):
```typescript
audio: true,  // Instead of { echoCancellation: true, ... }
video: {
  width: { ideal: 1280 },
  height: { ideal: 720 },
  frameRate: { ideal: 30 },
  facingMode: 'user',
}
```

## Testing Instructions

1. **Caller Side**:
   - Start a video call
   - Check logs for "HOST" initialization
   - Verify local stream appears
   - Wait for callee to join

2. **Callee Side**:
   - Receive notification
   - Tap to join
   - Check logs for "GUEST" initialization
   - Verify local stream appears
   - Should see remote stream within 5-10 seconds

3. **Expected Log Flow**:
   ```
   🚀 Starting call...
   Step 1: Getting user media...
   ✅ User media obtained
   Step 2: Creating peer connection...
   ✅ Peer connection created
   Step 3: Adding local tracks...
   ✅ Local tracks added
   Step 4: Setting up Firestore listeners...
   ✅ Firestore listeners set up
   Step 5: Creating offer/Waiting for offer...
   📨 Offer/Answer received
   New ICE candidate: ...
   🎥 Remote track received: video
   🎥 Remote track received: audio
   ✅ Call connected successfully
   ```

## Key Improvements

1. **Proper Event Handling**: All WebRTC events now use the correct addEventListener pattern
2. **Better Debugging**: Comprehensive logging makes it easy to identify where the connection fails
3. **Robust ICE Handling**: Candidates are properly queued and processed
4. **Error Recovery**: Better error messages help identify configuration issues

## Next Steps

If issues persist:
1. Check Firestore rules allow read/write to `rooms` collection
2. Verify TURN servers are accessible (test with `openrelay.metered.ca`)
3. Check device permissions for camera/microphone
4. Test on different network conditions (WiFi vs cellular)
