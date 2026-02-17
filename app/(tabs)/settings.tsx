import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useUser } from '../../contexts/UserContext';
import { ApiService } from '../../services/apiService';

// Fallback BlurView component for compatibility
const BlurView = ({ children, style, intensity, tint }: any) => {
  return (
    <View style={[style, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]}>
      {children}
    </View>
  );
};

const { width, height } = Dimensions.get('window');

export default function SettingsScreen() {
  const { user, logout } = useUser();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/auth/signin');
          },
        },
      ]
    );
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              // Here you would call your delete account API
              // const response = await ApiService.deleteUser(user?.email);
              
              // For now, just logout after confirmation
              await logout();
              Alert.alert('Account Deleted', 'Your account has been successfully deleted.');
              router.replace('/auth/signin');
            } catch (error: any) {
              Alert.alert('❌ Error', error.message || 'Failed to delete account');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleTestConnection = async () => {
    setLoading(true);
    try {
      const response = await ApiService.testConnection();
      if (response.success) {
        Alert.alert('✅ Connection Test', 'Backend connection successful!');
      } else {
        Alert.alert('❌ Connection Test', response.error || 'Connection failed');
      }
    } catch (error: any) {
      Alert.alert('❌ Connection Test', error.message || 'Connection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <View style={styles.cosmicBackground}>
        <LinearGradient
          colors={['#0B1426', '#1A0B3D', '#2D1B69', '#0B1426']}
          locations={[0, 0.3, 0.7, 1]}
          style={styles.cosmicGradient}
        />

        <LinearGradient
          colors={['rgba(11,20,38,0.3)', 'rgba(26,11,61,0.6)', 'rgba(45,27,105,0.8)', 'rgba(11,20,38,0.9)']}
          locations={[0, 0.3, 0.7, 1]}
          style={styles.overlay}
        >
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Text style={styles.backButtonText}>←</Text>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Settings</Text>
              <View style={styles.placeholder} />
            </View>

            {/* User Info Display */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Account Information</Text>
              
              <BlurView style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Name</Text>
                  <Text style={styles.infoValue}>{user?.name || 'Not set'}</Text>
                </View>
                <View style={styles.infoDivider} />
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>{user?.email || 'Not set'}</Text>
                </View>
                <View style={styles.infoDivider} />
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Mobile</Text>
                  <Text style={styles.infoValue}>{user?.mobile || 'Not set'}</Text>
                </View>
                <View style={styles.infoDivider} />
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Country</Text>
                  <Text style={styles.infoValue}>{user?.country || 'Not set'}</Text>
                </View>
                
                <TouchableOpacity 
                  style={styles.editProfileButton}
                  onPress={() => router.push('/(tabs)/profile')}
                >
                  <Text style={styles.editProfileButtonText}>Edit Profile →</Text>
                </TouchableOpacity>
              </BlurView>
            </View>

            {/* App Settings */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>App Settings</Text>
              
              <BlurView style={styles.settingsCard}>
                <TouchableOpacity style={styles.settingItem} onPress={handleTestConnection}>
                  <Text style={styles.settingIcon}>🔧</Text>
                  <View style={styles.settingContent}>
                    <Text style={styles.settingTitle}>Test Connection</Text>
                    <Text style={styles.settingDescription}>Test backend API connection</Text>
                  </View>
                  <Text style={styles.settingArrow}>→</Text>
                </TouchableOpacity>

                <View style={styles.settingDivider} />

                <TouchableOpacity 
                  style={styles.settingItem}
                  onPress={() => router.push('/(tabs)/notifications')}
                >
                  <Text style={styles.settingIcon}>🔔</Text>
                  <View style={styles.settingContent}>
                    <Text style={styles.settingTitle}>Notifications</Text>
                    <Text style={styles.settingDescription}>View your notifications</Text>
                  </View>
                  <Text style={styles.settingArrow}>→</Text>
                </TouchableOpacity>
              </BlurView>
            </View>

            {/* Account Actions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Account Actions</Text>
              
              <BlurView style={styles.settingsCard}>
                <TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
                  <Text style={styles.settingIcon}>🚪</Text>
                  <View style={styles.settingContent}>
                    <Text style={[styles.settingTitle, styles.logoutText]}>Logout</Text>
                    <Text style={styles.settingDescription}>Sign out of your account</Text>
                  </View>
                  <Text style={styles.settingArrow}>→</Text>
                </TouchableOpacity>

                <View style={styles.settingDivider} />

                <TouchableOpacity style={styles.settingItem} onPress={handleDeleteAccount}>
                  <Text style={styles.settingIcon}>🗑️</Text>
                  <View style={styles.settingContent}>
                    <Text style={[styles.settingTitle, styles.deleteText]}>Delete Account</Text>
                    <Text style={styles.settingDescription}>Permanently delete your account</Text>
                  </View>
                  <Text style={styles.settingArrow}>→</Text>
                </TouchableOpacity>
              </BlurView>
            </View>

            <View style={{ height: 100 }} />
          </ScrollView>
        </LinearGradient>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1426',
  },
  cosmicBackground: {
    flex: 1,
    width: width,
    height: height,
  },
  cosmicGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlay: {
    flex: 1,
    paddingTop: StatusBar.currentHeight || 0,
  },
  scrollView: {
    flex: 1,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: 'white',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
  },
  placeholder: {
    width: 44,
  },

  // Sections
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    marginBottom: 16,
  },

  // Form
  infoCard: {
    borderRadius: 20,
    padding: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
    flex: 1,
    textAlign: 'right',
  },
  editProfileButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    alignItems: 'center',
  },
  editProfileButtonText: {
    color: '#0052CC',
    fontSize: 16,
    fontWeight: '600',
  },

  // Settings
  settingsCard: {
    borderRadius: 20,
    padding: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  settingIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  settingArrow: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  settingDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 20,
  },
  logoutText: {
    color: '#FF6B6B',
  },
  deleteText: {
    color: '#FF4444',
  },
});