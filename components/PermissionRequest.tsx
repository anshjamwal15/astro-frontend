import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Notifications from 'expo-notifications';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PermissionStatus {
  camera: boolean;
  microphone: boolean;
  notifications: boolean;
}

interface PermissionRequestProps {
  onComplete?: () => void;
}

const PERMISSION_KEY = 'permissions_requested';

export default function PermissionRequest({ onComplete }: PermissionRequestProps) {
  const [visible, setVisible] = useState(false);
  const [permissions, setPermissions] = useState<PermissionStatus>({
    camera: false,
    microphone: false,
    notifications: false,
  });
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Only show permission request on Android
    if (Platform.OS === 'android') {
      checkIfShouldShow();
    }
  }, []);

  const checkIfShouldShow = async () => {
    try {
      const hasRequested = await AsyncStorage.getItem(PERMISSION_KEY);
      if (!hasRequested) {
        // Check current permissions
        await checkPermissions();
        setVisible(true);
      }
    } catch (error) {
      console.error('Error checking permission status:', error);
    }
  };

  const checkPermissions = async () => {
    try {
      const cameraStatus = await ImagePicker.getCameraPermissionsAsync();
      const microphoneStatus = await ImagePicker.getCameraPermissionsAsync(); // Using camera as proxy
      const notificationStatus = await Notifications.getPermissionsAsync();

      setPermissions({
        camera: cameraStatus.granted,
        microphone: microphoneStatus.granted,
        notifications: notificationStatus.granted,
      });
    } catch (error) {
      console.error('Error checking permissions:', error);
    }
  };

  const requestCameraPermission = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      setPermissions(prev => ({ ...prev, camera: status === 'granted' }));
      
      if (status === 'granted') {
        setCurrentStep(1);
      } else {
        Alert.alert(
          'Permission Required',
          'Camera permission is required for video calls. Please enable it in settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Skip', onPress: () => setCurrentStep(1) }
          ]
        );
      }
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      setCurrentStep(1);
    }
  };

  const requestMicrophonePermission = async () => {
    try {
      // Note: Microphone permission is typically requested together with camera
      // For standalone microphone, you'd need react-native-permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      setPermissions(prev => ({ ...prev, microphone: status === 'granted' }));
      
      if (status === 'granted') {
        setCurrentStep(2);
      } else {
        Alert.alert(
          'Permission Required',
          'Microphone permission is required for voice/video calls. Please enable it in settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Skip', onPress: () => setCurrentStep(2) }
          ]
        );
      }
    } catch (error) {
      console.error('Error requesting microphone permission:', error);
      setCurrentStep(2);
    }
  };

  const requestNotificationPermission = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      setPermissions(prev => ({ ...prev, notifications: status === 'granted' }));
      
      if (status === 'granted') {
        await completePermissionRequest();
      } else {
        Alert.alert(
          'Permission Required',
          'Notification permission helps you stay updated with calls and messages.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Skip', onPress: completePermissionRequest }
          ]
        );
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      await completePermissionRequest();
    }
  };

  const completePermissionRequest = async () => {
    try {
      await AsyncStorage.setItem(PERMISSION_KEY, 'true');
      setVisible(false);
      onComplete?.();
    } catch (error) {
      console.error('Error saving permission status:', error);
    }
  };

  const handleSkipAll = async () => {
    Alert.alert(
      'Skip Permissions',
      'You can enable these permissions later in Settings. Some features may not work without them.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Skip All',
          style: 'destructive',
          onPress: completePermissionRequest
        }
      ]
    );
  };

  const permissionSteps = [
    {
      icon: 'camera',
      title: 'Camera Access',
      description: 'Allow camera access for video calls with mentors',
      action: requestCameraPermission,
      granted: permissions.camera,
    },
    {
      icon: 'mic',
      title: 'Microphone Access',
      description: 'Allow microphone access for voice and video calls',
      action: requestMicrophonePermission,
      granted: permissions.microphone,
    },
    {
      icon: 'notifications',
      title: 'Notifications',
      description: 'Stay updated with call alerts and messages',
      action: requestNotificationPermission,
      granted: permissions.notifications,
    },
  ];

  const currentPermission = permissionSteps[currentStep];

  // Don't show on iOS
  if (Platform.OS !== 'android' || !visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleSkipAll}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <LinearGradient
            colors={['#0052CC', '#0066FF']}
            style={styles.header}
          >
            <View style={styles.iconContainer}>
              <Ionicons 
                name={currentPermission.icon as any} 
                size={60} 
                color="#FFFFFF" 
              />
            </View>
          </LinearGradient>

          <View style={styles.content}>
            <Text style={styles.title}>{currentPermission.title}</Text>
            <Text style={styles.description}>{currentPermission.description}</Text>

            <View style={styles.stepsContainer}>
              {permissionSteps.map((step, index) => (
                <View key={index} style={styles.stepIndicator}>
                  <View
                    style={[
                      styles.stepDot,
                      index === currentStep && styles.stepDotActive,
                      step.granted && styles.stepDotGranted,
                    ]}
                  >
                    {step.granted && (
                      <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                    )}
                  </View>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={styles.allowButton}
              onPress={currentPermission.action}
            >
              <LinearGradient
                colors={['#0052CC', '#0066FF']}
                style={styles.buttonGradient}
              >
                <Text style={styles.allowButtonText}>Allow Access</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.skipButton}
              onPress={() => {
                if (currentStep < permissionSteps.length - 1) {
                  setCurrentStep(currentStep + 1);
                } else {
                  completePermissionRequest();
                }
              }}
            >
              <Text style={styles.skipButtonText}>
                {currentStep < permissionSteps.length - 1 ? 'Skip' : 'Maybe Later'}
              </Text>
            </TouchableOpacity>

            {currentStep === 0 && (
              <TouchableOpacity
                style={styles.skipAllButton}
                onPress={handleSkipAll}
              >
                <Text style={styles.skipAllButtonText}>Skip All</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    gap: 10,
  },
  stepIndicator: {
    alignItems: 'center',
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#0052CC',
  },
  stepDotGranted: {
    backgroundColor: '#4CAF50',
  },
  allowButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 15,
    shadowColor: '#0052CC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  allowButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  skipButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  skipAllButton: {
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  skipAllButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#999',
  },
});
