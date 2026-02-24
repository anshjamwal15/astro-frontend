import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';

/**
 * Background message handler for Firebase Cloud Messaging
 * This must be registered outside of any component or class
 */
messaging().setBackgroundMessageHandler(async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
  console.log('Background message received:', remoteMessage);
  
  // The notification will be automatically displayed by FCM
  // This handler is for processing data or performing background tasks
  
  const { data, notification } = remoteMessage;
  
  if (data) {
    console.log('Background notification data:', data);
    
    // You can perform background tasks here like:
    // - Updating local database
    // - Fetching additional data
    // - Scheduling local notifications
    
    // Note: Keep this handler lightweight and fast
    // It should complete within 30 seconds
  }
  
  return Promise.resolve();
});

export default messaging;
