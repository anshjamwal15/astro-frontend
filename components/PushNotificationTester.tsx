import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Clipboard,
} from 'react-native';
import PushNotificationService from '../services/PushNotificationService';

/**
 * Push Notification Tester Component
 * 
 * This component helps test push notifications during development.
 * Add it to any screen to test notification functionality.
 * 
 * Usage:
 * import PushNotificationTester from '../components/PushNotificationTester';
 * 
 * <PushNotificationTester />
 */
export default function PushNotificationTester() {
  const [fcmToken, setFcmToken] = useState<string>('');
  const [callerName, setCallerName] = useState('Dr. Rajesh Sharma');
  const [message, setMessage] = useState('Hello! How can I help you today?');

  useEffect(() => {
    const token = PushNotificationService.getToken();
    if (token) {
      setFcmToken(token);
    }
  }, []);

  const copyTokenToClipboard = () => {
    if (fcmToken) {
      Clipboard.setString(fcmToken);
      Alert.alert('Success', 'FCM Token copied to clipboard!');
    }
  };

  const simulateVideoCall = () => {
    Alert.alert(
      'Simulate Video Call',
      'To test video call notifications:\n\n' +
      '1. Copy your FCM token\n' +
      '2. Use Firebase Console or cURL to send a notification\n' +
      '3. Use payload type: "video_call"\n\n' +
      'Example payload:\n' +
      JSON.stringify({
        type: 'video_call',
        callerName: callerName,
        callerId: 'test_123',
        roomName: 'test_room',
        callId: 'call_' + Date.now(),
      }, null, 2),
      [
        { text: 'Copy Token', onPress: copyTokenToClipboard },
        { text: 'OK' },
      ]
    );
  };

  const simulateVoiceCall = () => {
    Alert.alert(
      'Simulate Voice Call',
      'To test voice call notifications:\n\n' +
      '1. Copy your FCM token\n' +
      '2. Use Firebase Console or cURL to send a notification\n' +
      '3. Use payload type: "voice_call"\n\n' +
      'Example payload:\n' +
      JSON.stringify({
        type: 'voice_call',
        callerName: callerName,
        callerId: 'test_123',
        roomName: 'test_room',
        callId: 'call_' + Date.now(),
      }, null, 2),
      [
        { text: 'Copy Token', onPress: copyTokenToClipboard },
        { text: 'OK' },
      ]
    );
  };

  const simulateMessage = () => {
    Alert.alert(
      'Simulate Message',
      'To test message notifications:\n\n' +
      '1. Copy your FCM token\n' +
      '2. Use Firebase Console or cURL to send a notification\n' +
      '3. Use payload type: "message"\n\n' +
      'Example payload:\n' +
      JSON.stringify({
        type: 'message',
        senderName: callerName,
        senderId: 'test_123',
        message: message,
        chatRoomId: 'chat_room_456',
      }, null, 2),
      [
        { text: 'Copy Token', onPress: copyTokenToClipboard },
        { text: 'OK' },
      ]
    );
  };

  const showCurlCommand = (type: string) => {
    const payload = type === 'message' 
      ? {
          type: 'message',
          senderName: callerName,
          senderId: 'test_123',
          message: message,
          chatRoomId: 'chat_room_456',
        }
      : {
          type: type,
          callerName: callerName,
          callerId: 'test_123',
          roomName: 'test_room',
          callId: 'call_' + Date.now(),
        };

    const curlCommand = `curl -X POST https://fcm.googleapis.com/fcm/send \\
  -H "Authorization: key=YOUR_SERVER_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "${fcmToken}",
    "priority": "high",
    "data": ${JSON.stringify(payload, null, 6)}
  }'`;

    Alert.alert(
      'cURL Command',
      curlCommand,
      [
        { 
          text: 'Copy Command', 
          onPress: () => {
            Clipboard.setString(curlCommand);
            Alert.alert('Success', 'cURL command copied to clipboard!');
          }
        },
        { text: 'OK' },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>Push Notification Tester</Text>
        <Text style={styles.subtitle}>Test push notifications during development</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>FCM Token:</Text>
        <View style={styles.tokenContainer}>
          <Text style={styles.token} numberOfLines={3}>
            {fcmToken || 'Loading...'}
          </Text>
          <TouchableOpacity 
            style={styles.copyButton}
            onPress={copyTokenToClipboard}
          >
            <Text style={styles.copyButtonText}>Copy</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Caller/Sender Name:</Text>
        <TextInput
          style={styles.input}
          value={callerName}
          onChangeText={setCallerName}
          placeholder="Enter caller name"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Message Content:</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={message}
          onChangeText={setMessage}
          placeholder="Enter message"
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test Notifications</Text>
        
        <TouchableOpacity 
          style={[styles.button, styles.videoButton]}
          onPress={simulateVideoCall}
        >
          <Text style={styles.buttonText}>📹 Test Video Call</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.voiceButton]}
          onPress={simulateVoiceCall}
        >
          <Text style={styles.buttonText}>📞 Test Voice Call</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.messageButton]}
          onPress={simulateMessage}
        >
          <Text style={styles.buttonText}>💬 Test Message</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Get cURL Commands</Text>
        
        <TouchableOpacity 
          style={[styles.button, styles.curlButton]}
          onPress={() => showCurlCommand('video_call')}
        >
          <Text style={styles.buttonText}>Video Call cURL</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.curlButton]}
          onPress={() => showCurlCommand('voice_call')}
        >
          <Text style={styles.buttonText}>Voice Call cURL</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.curlButton]}
          onPress={() => showCurlCommand('message')}
        >
          <Text style={styles.buttonText}>Message cURL</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.infoText}>
          ℹ️ To test notifications:
          {'\n\n'}
          1. Copy your FCM token
          {'\n'}
          2. Use Firebase Console or cURL to send test notifications
          {'\n'}
          3. Make sure to use data-only payloads (no "notification" field)
          {'\n'}
          4. Set priority to "high"
          {'\n\n'}
          See PUSH_NOTIFICATION_SETUP.md for detailed instructions.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  tokenContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  token: {
    flex: 1,
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
  copyButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 8,
  },
  copyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontSize: 14,
    color: '#333',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  button: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  videoButton: {
    backgroundColor: '#2196F3',
  },
  voiceButton: {
    backgroundColor: '#4CAF50',
  },
  messageButton: {
    backgroundColor: '#FF9800',
  },
  curlButton: {
    backgroundColor: '#9C27B0',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
