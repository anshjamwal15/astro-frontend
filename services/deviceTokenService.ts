import { AUTH_CONFIG } from '../config/auth';
import PushNotificationService from './PushNotificationService';

export interface DeviceTokenResponse {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Service for managing device tokens with backend
 */
export class DeviceTokenService {
  /**
   * Register device token with backend for push notifications
   * @param userId - User ID
   * @param deviceToken - FCM device token (optional, will fetch if not provided)
   * @returns Promise with response
   */
  static async registerDeviceToken(
    userId: string,
    deviceToken?: string
  ): Promise<DeviceTokenResponse> {
    try {
      // Get device token from PushNotificationService if not provided
      const token = deviceToken || PushNotificationService.getToken();
      
      if (!token) {
        console.warn('⚠️ No device token available to register');
        return {
          success: false,
          error: 'No device token available',
        };
      }

      console.log('📱 Registering device token for user:', userId);
      console.log('🔑 Device token:', token.substring(0, 50) + '...');

      const url = `${AUTH_CONFIG.API.BASE_URL}/api/user/${userId}/device-token?deviceToken=${encodeURIComponent(token)}`;
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Accept': 'application/hal+json',
        },
      });

      const responseText = await response.text();
      console.log('Device token registration response:', response.status, responseText);

      if (!response.ok) {
        console.error('❌ Device token registration failed:', response.status, responseText);
        return {
          success: false,
          error: `HTTP ${response.status}`,
          message: responseText || 'Failed to register device token',
        };
      }

      console.log('✅ Device token registered successfully');
      return {
        success: true,
        message: 'Device token registered successfully',
      };
    } catch (error: any) {
      console.error('❌ Error registering device token:', error);
      return {
        success: false,
        error: error.message || 'Network error',
        message: 'Failed to register device token',
      };
    }
  }

  /**
   * Update device token when it changes (e.g., token refresh)
   * @param userId - User ID
   * @param newToken - New FCM device token
   * @returns Promise with response
   */
  static async updateDeviceToken(
    userId: string,
    newToken: string
  ): Promise<DeviceTokenResponse> {
    console.log('🔄 Updating device token for user:', userId);
    return this.registerDeviceToken(userId, newToken);
  }
}
