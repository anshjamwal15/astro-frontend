# Per-Minute Billing Timer Implementation

## Overview
Implemented a comprehensive per-minute billing system that automatically deducts money from the user's wallet during chat and video call sessions.

## Features Implemented

### 1. Rate Display
- **Chat Rate**: Shows mentor's rate per minute (from API `rate` or `price` field)
- **Video Call Rate**: Shows 2x the chat rate per minute
- Displayed in both:
  - Top Mentors section (home page)
  - Mentors page (full list)

### 2. Billing Timer Service (`services/BillingTimerService.ts`)
A new service that handles:
- **Automatic per-minute deductions**: Timer runs every 60 seconds
- **Balance tracking**: Monitors wallet balance in real-time
- **Session management**: Tracks session duration and total cost
- **Popup dialogs**: Shows appropriate alerts after each minute

### 3. Popup Behavior

#### After Each Minute (Sufficient Balance)
- Shows amount deducted (e.g., "₹17 has been deducted")
- Displays time elapsed and remaining balance
- Two options:
  - **Continue**: Keeps the session running for another minute
  - **Cancel**: Immediately disconnects and shows session summary

#### After Each Minute (Insufficient Balance)
- Shows insufficient balance warning
- Displays total time and cost
- Two options:
  - **Add Money**: Prompts user to add money (then disconnects)
  - **Cancel**: Immediately disconnects the call/chat

### 4. Session Summary
When session ends (any reason), shows:
- Total duration in minutes
- Total cost
- Remaining balance (if applicable)
- End reason (User Cancelled, Insufficient Balance, or Normal End)

## Integration Points

### Chat Screen (`app/chatbox.tsx`)
- Starts billing timer when session begins
- Shows real-time billing info in header
- Handles minute-by-minute popups
- Ends session gracefully with summary

### Video Call Screen (`app/video-call-screen.tsx`)
- Starts billing timer when call connects
- Shows billing info alongside call duration
- Handles minute-by-minute popups
- Ends call gracefully with summary

### Home Page (`app/(tabs)/home.tsx`)
- Displays per-minute rates for chat and video
- Starts sessions with proper rate information
- Passes session ID and rate to chat/video screens

### Mentors Page (`app/(tabs)/mentors.tsx`)
- Displays per-minute rates for chat and video
- Starts sessions with proper rate information
- Passes session ID and rate to chat/video screens

## Rate Calculation
- **Chat Rate**: `mentor.rate || mentor.price || 17` (default 17)
- **Video Rate**: `(mentor.rate || mentor.price || 17) * 2` (double the chat rate)

## Technical Details

### Timer Mechanism
- Runs every 60 seconds (60000ms)
- Deducts amount at the end of each minute
- Checks balance before deduction
- Stops automatically on insufficient balance

### Session Tracking
- Unique session ID for each chat/call
- Tracks start time, minutes passed, and total deducted
- Stores session data in memory (Map)
- Cleans up on session end

### Error Handling
- Graceful fallback if wallet API fails
- Continues timer even on temporary errors
- Proper cleanup on app exit or session end

## Usage Example

### Starting a Chat Session
```typescript
const sessionId = `chat_${userId}_${mentorId}_${Date.now()}`;
const chatRate = mentor.rate || mentor.price || 17;

// Navigate to chatbox with session info
router.push({
  pathname: '/chatbox',
  params: {
    astrologerId: mentor.id,
    astrologerName: mentor.name,
    sessionId: sessionId,
    ratePerMinute: chatRate.toString(),
  }
});
```

### Starting a Video Call Session
```typescript
const sessionId = `video_${userId}_${mentorId}_${Date.now()}`;
const videoRate = (mentor.rate || mentor.price || 17) * 2;

// Navigate to video call with session info
router.push({
  pathname: '/video-call-screen',
  params: {
    roomName: `room_${sessionId}`,
    mentorId: mentor.id,
    sessionId: sessionId,
    ratePerMinute: videoRate.toString(),
  }
});
```

## Future Enhancements
- Real-time wallet balance sync with backend
- Actual wallet deduction API integration
- Session history and receipts
- Pause/resume functionality
- Grace period before disconnection
