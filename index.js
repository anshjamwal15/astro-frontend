// Background message handler must be set before importing expo-router/entry
import messaging from '@react-native-firebase/messaging';

// Background message handler must be set outside of any component
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log('Background message received:', remoteMessage);
  
  // The PushNotificationService will handle the notification display
  // This is just for logging and any additional background processing
  const { data } = remoteMessage;
  
  if (data && (data.type === 'video_call' || data.type === 'voice_call')) {
    console.log('Incoming call in background:', data.callerName);
  } else if (data && (data.type === 'chat' || data.type === 'message')) {
    console.log('New message in background:', data.senderName);
  }
});

// Import expo-router entry after setting up background handler
import 'expo-router/entry';
