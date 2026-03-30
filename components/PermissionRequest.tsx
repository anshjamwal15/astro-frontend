import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PermissionRequestProps {
  onComplete?: () => void;
}

const PERMISSION_KEY = 'permissions_requested';

export default function PermissionRequest({ onComplete }: PermissionRequestProps) {
  useEffect(() => {
    if (Platform.OS === 'android') {
      requestPermissions();
    }
  }, []);

  const requestPermissions = async () => {
    try {
      const hasRequested = await AsyncStorage.getItem(PERMISSION_KEY);
      if (hasRequested) return;

      await ImagePicker.requestCameraPermissionsAsync();
      await Notifications.requestPermissionsAsync();

      await AsyncStorage.setItem(PERMISSION_KEY, 'true');
      onComplete?.();
    } catch (error) {
      console.error('Error requesting permissions:', error);
    }
  };

  return null;
}
