import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useUser } from '../contexts/UserContext';
import { AuthService } from '../services/authService';
import PushNotificationService from '../services/PushNotificationService';

export default function SplashScreen() {
  const { jwtToken, setUser, setJwtToken, isLoading } = useUser();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.3));
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 10,
        friction: 2,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Wait for UserContext to finish loading, then check authentication
  useEffect(() => {
    if (!isLoading && !hasCheckedAuth) {
      console.log('📱 UserContext loaded, checking authentication...');
      const timer = setTimeout(() => {
        checkAuthentication();
        setHasCheckedAuth(true);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [isLoading, hasCheckedAuth]);

  const checkAuthentication = async () => {
    try {
      console.log('🔍 Checking authentication status...');
      console.log('📦 JWT Token exists:', !!jwtToken);
      
      if (jwtToken) {
        console.log('✅ JWT token found, validating...');
        console.log('🔑 Token preview:', jwtToken.substring(0, 50) + '...');
        
        try {
          // Get device token to send along with token-signin
          const deviceToken = PushNotificationService.getToken() || undefined;

          // Validate token with backend (also updates device token if available)
          const userData = await AuthService.tokenSignIn(jwtToken, deviceToken);
          console.log('✅ Token valid, user authenticated:', userData);
          
          // Update user data and token
          await setUser({
            id: userData.id,
            name: userData.name,
            email: userData.email,
            mobile: userData.mobile,
            country: userData.country,
            userType: userData.userType,
            profileCompleted: userData.profileCompleted,
          });
          
          // Update with refreshed token
          await setJwtToken(userData.jwtToken);
          
          // Mark app as ready for notification navigation
          PushNotificationService.setAppReady();
          
          // Navigate to home
          console.log('🏠 Navigating to home screen...');
          router.replace('/(tabs)/home');
        } catch (error: any) {
          console.log('❌ Token validation failed:', error.message);
          console.log('🔓 Token expired or invalid, redirecting to signin...');
          
          // Clear invalid token
          await setJwtToken(null);
          await setUser(null);
          
          // Mark app as ready (even for signin flow)
          PushNotificationService.setAppReady();
          
          // Navigate to signin
          router.replace('/auth/signin');
        }
      } else {
        console.log('❌ No JWT token found');
        console.log('🔓 Redirecting to signin...');
        
        // Mark app as ready (even for signin flow)
        PushNotificationService.setAppReady();
        
        // No token, navigate to signin
        router.replace('/auth/signin');
      }
    } catch (error) {
      console.error('💥 Error during authentication check:', error);
      
      // Mark app as ready (even on error)
      PushNotificationService.setAppReady();
      
      // On error, navigate to signin
      router.replace('/auth/signin');
    }
  };

  return (
    <LinearGradient
      colors={['#0052CC', '#0066FF', '#4A90E2']}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoIcon}>🔍</Text>
          </View>
        </View>

        {/* App Name */}
        <Text style={styles.appName}>ADVIJR</Text>
        <Text style={styles.tagline}>Get-Seek-Help</Text>

        {/* Loading Indicator */}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </Animated.View>

      {/* Version */}
      <Text style={styles.version}>Version 1.0.0</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: 30,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FF8C42',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  logoIcon: {
    fontSize: 50,
  },
  appName: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 4,
    marginBottom: 10,
  },
  tagline: {
    fontSize: 18,
    color: '#FFD700',
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 60,
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 15,
    fontWeight: '500',
  },
  version: {
    position: 'absolute',
    bottom: 30,
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.7,
  },
});
