import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { Platform, Alert } from 'react-native';
import { router } from 'expo-router';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import firebase from '@react-native-firebase/app';

// Conditional import for CallKeep to avoid compatibility issues
let RNCallKeep: any = null;
try {
  RNCallKeep = require('react-native-callkeep').default;
} catch (error) {
  console.warn('CallKeep not available:', error);
}

// Ensure Firebase is initialized
if (!firebase.apps.length) {
  console.log('Firebase not initialized, will auto-initialize from google-services.json');
}

// Configure notification handler globally
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: false,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// CallKeep configuration
const callKeepOptions = {
  ios: {
    appName: 'ADVIJR',
    supportsVideo: true,
  },
  android: {
    alertTitle: 'Permissions Required',
    alertDescription: 'This app needs to access your phone accounts',
    cancelButton: 'Cancel',
    okButton: 'OK',
    imageName: 'ic_launcher',
    additionalPermissions: [],
    selfManaged: true,
  },
};

class PushNotificationService {
  private fcmToken: string | null = null;
  private activeCallUUID: string | null = null;
  private isInitialized: boolean = false;

  /**
   * Initialize push notification service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('Push notification service already initialized');
      return;
    }

    try {
      // Setup notification channel for Android
      await this.setupNotificationChannel();

      // Request permissions for both FCM and Expo Notifications
      await this.requestAllPermissions();

      // Request FCM permission
      const authStatus = await this.requestPermission();
      
      if (authStatus === messaging.AuthorizationStatus.AUTHORIZED || 
          authStatus === messaging.AuthorizationStatus.PROVISIONAL) {
        
        // Get FCM token
        await this.getFCMToken();
        
        // Setup CallKeep
        await this.setupCallKeep();
        
        // Setup message handlers
        this.setupForegroundHandler();
        
        // Handle token refresh
        this.setupTokenRefreshHandler();
        
        this.isInitialized = true;
        console.log('Push notification service initialized successfully');
      } else {
        console.log('Push notification permission denied');
      }
    } catch (error) {
      console.error('Error initializing push notification service:', error);
    }
  }

  /**
   * Setup Android notification channel
   */
  async setupNotificationChannel(): Promise<void> {
    if (Platform.OS === 'android') {
      // Set up notification categories with actions FIRST
      await Notifications.setNotificationCategoryAsync('call', [
        {
          identifier: 'accept',
          buttonTitle: 'Accept',
          options: {
            opensAppToForeground: true,
          },
        },
        {
          identifier: 'decline',
          buttonTitle: 'Decline',
          options: {
            opensAppToForeground: false,
          },
        },
      ]);

      console.log('✅ Notification category "call" created with Accept/Decline actions');

      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'default',
        enableVibrate: true,
        showBadge: true,
      });

      await Notifications.setNotificationChannelAsync('calls', {
        name: 'Incoming Calls',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 500, 500, 500],
        lightColor: '#FF231F7C',
        sound: 'default',
        enableVibrate: true,
        showBadge: true,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      });

      await Notifications.setNotificationChannelAsync('messages', {
        name: 'Messages',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'default',
        enableVibrate: true,
        showBadge: true,
      });

      console.log('Android notification channels created');
    } else if (Platform.OS === 'ios') {
      // iOS notification categories
      await Notifications.setNotificationCategoryAsync('call', [
        {
          identifier: 'accept',
          buttonTitle: 'Accept',
          options: {
            opensAppToForeground: true,
          },
        },
        {
          identifier: 'decline',
          buttonTitle: 'Decline',
          options: {
            opensAppToForeground: false,
          },
        },
      ]);
      
      console.log('iOS notification category "call" created');
    }
  }

  /**
   * Request all notification permissions
   */
  async requestAllPermissions(): Promise<void> {
    // Only request on physical devices, not simulators
    if (!Constants.isDevice) {
      console.log('Notifications only work on physical devices');
      return;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    console.log('Current notification permission status:', existingStatus);
    
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
      console.log('Requested notification permission, new status:', status);
    }
    
    if (finalStatus !== 'granted') {
      console.error('❌ Expo notification permission NOT granted');
      Alert.alert(
        'Notifications Disabled',
        'Please enable notifications in Settings → Apps → ADVIJR → Notifications',
        [{ text: 'OK' }]
      );
    } else {
      console.log('✅ Expo notification permission granted');
    }
  }

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<number> {
    try {
      // Check if Firebase is initialized
      if (!firebase.apps.length) {
        console.error('Firebase not initialized. Ensure google-services.json is in android/app/');
        return messaging.AuthorizationStatus.DENIED;
      }
      
      const authStatus = await messaging().requestPermission();
      return authStatus;
    } catch (error) {
      console.error('Error requesting permission:', error);
      return messaging.AuthorizationStatus.DENIED;
    }
  }

  /**
   * Get FCM token
   */
  async getFCMToken(): Promise<string | null> {
    try {
      const token = await messaging().getToken();
      this.fcmToken = token;
      console.log('FCM Token:', token);
      return token;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  /**
   * Get current FCM token
   */
  getToken(): string | null {
    return this.fcmToken;
  }

  /**
   * Setup CallKeep for incoming call notifications
   */
  async setupCallKeep(): Promise<void> {
    if (!RNCallKeep) {
      console.warn('CallKeep not available, call notifications will use standard notifications');
      return;
    }

    try {
      await RNCallKeep.setup(callKeepOptions);
      RNCallKeep.setAvailable(true);

      // Handle answer call event
      RNCallKeep.addEventListener('answerCall', this.handleAnswerCall);
      
      // Handle end call event
      RNCallKeep.addEventListener('endCall', this.handleEndCall);
      
      // Handle reject call event
      RNCallKeep.addEventListener('didPerformDTMFAction', () => {
        console.log('DTMF action performed');
      });

      console.log('CallKeep setup completed');
    } catch (error) {
      console.error('Error setting up CallKeep:', error);
    }
  }

  /**
   * Handle answer call event
   */
  handleAnswerCall = ({ callUUID }: { callUUID: string }) => {
    console.log('Call answered:', callUUID);
    this.activeCallUUID = callUUID;
    
    // Navigate to call screen
    // The call data should be stored when displaying incoming call
    const callData = this.getStoredCallData(callUUID);
    if (callData) {
      if (callData.callType === 'video') {
        router.push({
          pathname: '/video-call-screen',
          params: {
            roomName: callData.roomName,
            isHost: 'false',
            callerName: callData.callerName,
          },
        });
      } else {
        router.push({
          pathname: '/(tabs)/call',
          params: {
            roomName: callData.roomName,
            isHost: 'false',
            callerName: callData.callerName,
          },
        });
      }
    }
  };

  /**
   * Handle end call event
   */
  handleEndCall = ({ callUUID }: { callUUID: string }) => {
    console.log('Call ended:', callUUID);
    this.activeCallUUID = null;
    if (RNCallKeep) {
      RNCallKeep.endCall(callUUID);
    }
    this.removeStoredCallData(callUUID);
  };

  /**
   * Setup foreground message handler
   */
  setupForegroundHandler(): void {
    messaging().onMessage(async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
      console.log('========================================');
      console.log('📱 FOREGROUND NOTIFICATION RECEIVED');
      console.log('========================================');
      console.log('Full message:', JSON.stringify(remoteMessage, null, 2));
      console.log('Notification title:', remoteMessage.notification?.title);
      console.log('Notification body:', remoteMessage.notification?.body);
      console.log('Data payload:', remoteMessage.data);
      console.log('Message ID:', remoteMessage.messageId);
      console.log('From:', remoteMessage.from);
      console.log('========================================');
      
      // Display local notification when app is in foreground
      const { notification, data } = remoteMessage;
      
      if (notification) {
        await this.displayLocalNotification(
          notification.title || 'Notification',
          notification.body || '',
          data || {}
        );
      } else if (data) {
        // Handle data-only messages
        await this.handleNotification(remoteMessage, 'foreground');
      }
    });
  }

  /**
   * Setup token refresh handler
   */
  setupTokenRefreshHandler(): void {
    messaging().onTokenRefresh(async (token: string) => {
      console.log('FCM token refreshed:', token);
      this.fcmToken = token;
      // TODO: Send updated token to backend
    });
  }

  /**
   * Handle notification based on type
   */
  async handleNotification(
    remoteMessage: FirebaseMessagingTypes.RemoteMessage,
    state: 'foreground' | 'background'
  ): Promise<void> {
    const { data } = remoteMessage;
    
    if (!data) {
      console.log('No data in notification');
      return;
    }

    // Convert data to string record for type safety
    const stringData: { [key: string]: string } = {};
    Object.keys(data).forEach(key => {
      stringData[key] = String(data[key]);
    });

    const notificationType = stringData.type;

    switch (notificationType) {
      case 'video_call':
      case 'voice_call':
        await this.handleCallNotification(stringData, notificationType);
        break;
      
      case 'chat':
      case 'message':
        await this.handleMessageNotification(stringData, state);
        break;
      
      default:
        console.log('Unknown notification type:', notificationType);
        await this.displayDefaultNotification(stringData);
    }
  }

  /**
   * Handle incoming call notification
   */
  async handleCallNotification(data: { [key: string]: string }, callType: string): Promise<void> {
    try {
      const callUUID = data.callId || this.generateUUID();
      const callerName = data.callerName || 'Unknown Caller';
      const roomName = data.roomName || '';
      const callerId = data.callerId || '';

      // Store call data for later use
      this.storeCallData(callUUID, {
        callType: callType === 'video_call' ? 'video' : 'voice',
        callerName,
        roomName,
        callerId,
      });

      if (RNCallKeep) {
        // Display incoming call using CallKeep
        RNCallKeep.displayIncomingCall(
          callUUID,
          callerName,
          callerName,
          'generic',
          callType === 'video_call'
        );

        this.activeCallUUID = callUUID;
        console.log(`${callType} notification displayed for ${callerName}`);
      } else {
        // Fallback to regular notification if CallKeep is not available
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `Incoming ${callType === 'video_call' ? 'Video' : 'Voice'} Call`,
            body: `${callerName} is calling...`,
            data: {
              type: callType,
              callerName,
              callerId,
              roomName,
              callId: callUUID,
            },
            sound: 'default',
            priority: Notifications.AndroidNotificationPriority.MAX,
            categoryIdentifier: 'calls',
          },
          trigger: null,
        });
        console.log(`${callType} notification displayed as regular notification for ${callerName}`);
      }
    } catch (error) {
      console.error('Error handling call notification:', error);
    }
  }

  /**
   * Display local notification for foreground messages
   */
  async displayLocalNotification(
    title: string,
    body: string,
    data: Record<string, any>
  ): Promise<void> {
    try {
      const notificationType = data.type || 'default';
      let channelId = 'default';
      let categoryIdentifier: string | undefined = undefined;
      
      if (notificationType === 'video_call' || notificationType === 'voice_call') {
        channelId = 'calls';
        categoryIdentifier = 'call';
        
        // Re-register category to ensure it exists
        await Notifications.setNotificationCategoryAsync('call', [
          {
            identifier: 'accept',
            buttonTitle: '✅ Accept',
            options: {
              opensAppToForeground: true,
            },
          },
          {
            identifier: 'decline',
            buttonTitle: '❌ Decline',
            options: {
              opensAppToForeground: false,
            },
          },
        ]);
        console.log('🔄 Re-registered call notification category');
      } else if (notificationType === 'chat' || notificationType === 'message') {
        channelId = 'messages';
      }

      console.log('========================================');
      console.log('🔔 DISPLAYING LOCAL NOTIFICATION');
      console.log('========================================');
      console.log('Title:', title);
      console.log('Body:', body);
      console.log('Channel ID:', channelId);
      console.log('Category:', categoryIdentifier);
      console.log('Data:', JSON.stringify(data, null, 2));
      console.log('========================================');

      const content: any = {
        title,
        body,
        data,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.MAX,
        sticky: true, // Keep notification visible
        autoDismiss: false, // Don't auto-dismiss
      };

      // Add category for action buttons
      if (categoryIdentifier) {
        content.categoryIdentifier = categoryIdentifier;
      }

      // Add Android-specific properties
      if (Platform.OS === 'android') {
        content.channelId = channelId;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content,
        trigger: null,
      });
      
      console.log('✅ Notification displayed successfully!');
      console.log('Notification ID:', notificationId);
      console.log('Category set:', categoryIdentifier);
      console.log('========================================');
    } catch (error) {
      console.error('❌ Error displaying local notification:', error);
    }
  }

  /**
   * Handle message notification
   */
  async handleMessageNotification(
    data: { [key: string]: string },
    state: 'foreground' | 'background'
  ): Promise<void> {
    try {
      const senderName = data.senderName || 'Unknown';
      const message = data.message || '';
      const chatRoomId = data.chatRoomId || '';
      const senderId = data.senderId || '';

      if (state === 'foreground') {
        // Show in-app notification for foreground
        await this.displayMessageNotification(senderName, message, chatRoomId, senderId);
      } else {
        // For background, notification is already shown by FCM
        // Just handle the tap action
        await this.displayMessageNotification(senderName, message, chatRoomId, senderId);
      }
    } catch (error) {
      console.error('Error handling message notification:', error);
    }
  }

  /**
   * Display message notification using Expo Notifications
   */
  async displayMessageNotification(
    senderName: string,
    message: string,
    chatRoomId: string,
    senderId: string
  ): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: senderName,
          body: message,
          data: {
            type: 'message',
            chatRoomId,
            senderId,
            senderName,
          },
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
          ...(Platform.OS === 'android' && { channelId: 'messages' }),
        },
        trigger: null, // Show immediately
      });
    } catch (error) {
      console.error('Error displaying message notification:', error);
    }
  }

  /**
   * Display default notification
   */
  async displayDefaultNotification(data: { [key: string]: string }): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: data.title || 'Notification',
          body: data.body || data.message || '',
          data: data,
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
          ...(Platform.OS === 'android' && { channelId: 'default' }),
        },
        trigger: null, // Show immediately
      });
    } catch (error) {
      console.error('Error displaying default notification:', error);
    }
  }

  /**
   * Handle notification tap when app is in background/killed state
   */
  async handleInitialNotification(): Promise<void> {
    try {
      // Check if Firebase is initialized
      if (!firebase.apps.length) {
        console.warn('Firebase not initialized, skipping FCM initial notification check');
      } else {
        const initialNotification = await messaging().getInitialNotification();
        
        if (initialNotification && initialNotification.data) {
          console.log('App opened from notification:', initialNotification);
          await this.handleNotificationTap(initialNotification.data as Record<string, any>);
        }
      }

      // Also check for expo-notifications
      const response = await Notifications.getLastNotificationResponseAsync();
      if (response && response.notification.request.content.data) {
        console.log('App opened from expo notification:', response);
        await this.handleNotificationTap(response.notification.request.content.data as Record<string, any>);
      }
    } catch (error) {
      console.error('Error handling initial notification:', error);
    }
  }

  /**
   * Handle notification tap action
   */
  async handleNotificationTap(data: Record<string, any>): Promise<void> {
    console.log('========================================');
    console.log('🎯 HANDLING NOTIFICATION TAP');
    console.log('========================================');
    console.log('Data:', JSON.stringify(data, null, 2));
    
    const notificationType = data.type;
    console.log('Notification type:', notificationType);

    switch (notificationType) {
      case 'video_call':
        console.log('📹 Navigating to video call screen...');
        console.log('Room:', data.roomName);
        console.log('Caller:', data.callerName);
        router.push({
          pathname: '/video-call-screen',
          params: {
            roomName: data.roomName || '',
            isHost: 'false',
            callerName: data.callerName || '',
          },
        });
        break;

      case 'voice_call':
        console.log('📞 Navigating to voice call screen...');
        console.log('Room:', data.roomName);
        console.log('Caller:', data.callerName);
        router.push({
          pathname: '/(tabs)/call',
          params: {
            roomName: data.roomName || '',
            isHost: 'false',
            callerName: data.callerName || '',
          },
        });
        break;

      case 'chat':
      case 'message':
        console.log('💬 Navigating to chat screen...');
        console.log('Sender:', data.senderName);
        console.log('Chat room:', data.chatRoomId);
        router.push({
          pathname: '/chatbox',
          params: {
            astrologerId: data.senderId || '',
            astrologerName: data.senderName || '',
            chatRoomId: data.chatRoomId || '',
          },
        });
        break;

      default:
        console.log('⚠️ Unknown notification type:', notificationType);
    }
    
    console.log('========================================');
  }

  /**
   * Setup notification tap handler
   */
  setupNotificationTapHandler(): void {
    // Handle notification tap when app is in foreground/background
    Notifications.addNotificationResponseReceivedListener(async (response) => {
      console.log('========================================');
      console.log('👆 NOTIFICATION TAPPED');
      console.log('========================================');
      console.log('Response:', JSON.stringify(response, null, 2));
      console.log('Action identifier:', response.actionIdentifier);
      console.log('Notification data:', response.notification.request.content.data);
      console.log('========================================');
      
      const data = response.notification.request.content.data as Record<string, any>;
      const actionIdentifier = response.actionIdentifier;
      
      // Handle action buttons
      if (actionIdentifier === 'accept') {
        console.log('✅ User accepted the call');
        if (data) {
          await this.handleNotificationTap(data);
        }
      } else if (actionIdentifier === 'decline') {
        console.log('❌ User declined the call');
        // Dismiss notification and don't navigate
        await Notifications.dismissNotificationAsync(response.notification.request.identifier);
      } else {
        // Default tap (not on action button)
        if (data) {
          await this.handleNotificationTap(data);
        }
      }
    });
    
    console.log('✅ Notification tap handler registered');
  }

  /**
   * End active call
   */
  endActiveCall(): void {
    if (this.activeCallUUID && RNCallKeep) {
      RNCallKeep.endCall(this.activeCallUUID);
      this.removeStoredCallData(this.activeCallUUID);
      this.activeCallUUID = null;
    }
  }

  /**
   * Generate UUID for call
   */
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * Store call data temporarily
   */
  private callDataStore: Map<string, any> = new Map();

  private storeCallData(callUUID: string, data: any): void {
    this.callDataStore.set(callUUID, data);
  }

  private getStoredCallData(callUUID: string): any {
    return this.callDataStore.get(callUUID);
  }

  private removeStoredCallData(callUUID: string): void {
    this.callDataStore.delete(callUUID);
  }

  /**
   * Cleanup
   */
  cleanup(): void {
    if (RNCallKeep) {
      RNCallKeep.removeEventListener('answerCall');
      RNCallKeep.removeEventListener('endCall');
    }
    this.callDataStore.clear();
    this.isInitialized = false;
  }
}

export default new PushNotificationService();
