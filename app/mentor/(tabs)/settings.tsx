import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function MentorSettings() {
  const [settings, setSettings] = useState({
    notifications: {
      newMessages: true,
      consultationReminders: true,
      paymentAlerts: true,
      systemUpdates: false,
      marketingEmails: false,
    },
    privacy: {
      showOnlineStatus: true,
      allowDirectMessages: true,
      showRatings: true,
      profileVisibility: true,
    },
    consultation: {
      autoAcceptBookings: false,
      requireAdvancePayment: true,
      allowCancellations: true,
      sendFollowUpMessages: true,
    },
    chat: {
      readReceipts: true,
      typingIndicators: true,
      autoResponses: false,
      messageSound: true,
    },
  });

  const updateSetting = (category: keyof typeof settings, key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  };

  const handleSaveSettings = () => {
    Alert.alert('Settings Saved', 'Your preferences have been updated successfully!');
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setSettings({
              notifications: {
                newMessages: true,
                consultationReminders: true,
                paymentAlerts: true,
                systemUpdates: false,
                marketingEmails: false,
              },
              privacy: {
                showOnlineStatus: true,
                allowDirectMessages: true,
                showRatings: true,
                profileVisibility: true,
              },
              consultation: {
                autoAcceptBookings: false,
                requireAdvancePayment: true,
                allowCancellations: true,
                sendFollowUpMessages: true,
              },
              chat: {
                readReceipts: true,
                typingIndicators: true,
                autoResponses: false,
                messageSound: true,
              },
            });
            Alert.alert('Reset Complete', 'All settings have been reset to default values.');
          },
        },
      ]
    );
  };

  const SettingItem = ({ 
    title, 
    subtitle, 
    value, 
    onValueChange, 
    icon 
  }: {
    title: string;
    subtitle?: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
    icon: string;
  }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <Ionicons name={icon as any} size={20} color="#0052CC" style={styles.settingIcon} />
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#E0E0E0', true: '#0052CC' }}
        thumbColor="#FFFFFF"
      />
    </View>
  );

  const ActionButton = ({ 
    title, 
    subtitle, 
    icon, 
    onPress, 
    color = '#0052CC' 
  }: {
    title: string;
    subtitle?: string;
    icon: string;
    onPress: () => void;
    color?: string;
  }) => (
    <TouchableOpacity style={styles.actionButton} onPress={onPress}>
      <View style={styles.actionLeft}>
        <Ionicons name={icon as any} size={20} color={color} style={styles.actionIcon} />
        <View style={styles.actionText}>
          <Text style={styles.actionTitle}>{title}</Text>
          {subtitle && <Text style={styles.actionSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#999" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0052CC" />
      
      {/* Header */}
      <LinearGradient
        colors={['#0052CC', '#0066FF']}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSaveSettings}
        >
          <Ionicons name="checkmark" size={24} color="#333" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              title="New Messages"
              subtitle="Get notified when clients send messages"
              value={settings.notifications.newMessages}
              onValueChange={(value) => updateSetting('notifications', 'newMessages', value)}
              icon="chatbubble"
            />
            <SettingItem
              title="Consultation Reminders"
              subtitle="Reminders for upcoming consultations"
              value={settings.notifications.consultationReminders}
              onValueChange={(value) => updateSetting('notifications', 'consultationReminders', value)}
              icon="time"
            />
            <SettingItem
              title="Payment Alerts"
              subtitle="Notifications for payments and earnings"
              value={settings.notifications.paymentAlerts}
              onValueChange={(value) => updateSetting('notifications', 'paymentAlerts', value)}
              icon="wallet"
            />
            <SettingItem
              title="System Updates"
              subtitle="App updates and maintenance notifications"
              value={settings.notifications.systemUpdates}
              onValueChange={(value) => updateSetting('notifications', 'systemUpdates', value)}
              icon="information-circle"
            />
            <SettingItem
              title="Marketing Emails"
              subtitle="Promotional offers and tips"
              value={settings.notifications.marketingEmails}
              onValueChange={(value) => updateSetting('notifications', 'marketingEmails', value)}
              icon="mail"
            />
          </View>
        </View>

        {/* Privacy Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy & Visibility</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              title="Show Online Status"
              subtitle="Let clients see when you're online"
              value={settings.privacy.showOnlineStatus}
              onValueChange={(value) => updateSetting('privacy', 'showOnlineStatus', value)}
              icon="radio-button-on"
            />
            <SettingItem
              title="Allow Direct Messages"
              subtitle="Clients can message you directly"
              value={settings.privacy.allowDirectMessages}
              onValueChange={(value) => updateSetting('privacy', 'allowDirectMessages', value)}
              icon="chatbubbles"
            />
            <SettingItem
              title="Show Ratings"
              subtitle="Display your ratings publicly"
              value={settings.privacy.showRatings}
              onValueChange={(value) => updateSetting('privacy', 'showRatings', value)}
              icon="star"
            />
            <SettingItem
              title="Profile Visibility"
              subtitle="Make your profile searchable"
              value={settings.privacy.profileVisibility}
              onValueChange={(value) => updateSetting('privacy', 'profileVisibility', value)}
              icon="eye"
            />
          </View>
        </View>

        {/* Consultation Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Consultation Settings</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              title="Auto-Accept Bookings"
              subtitle="Automatically accept consultation requests"
              value={settings.consultation.autoAcceptBookings}
              onValueChange={(value) => updateSetting('consultation', 'autoAcceptBookings', value)}
              icon="checkmark-circle"
            />
            <SettingItem
              title="Require Advance Payment"
              subtitle="Clients must pay before consultation"
              value={settings.consultation.requireAdvancePayment}
              onValueChange={(value) => updateSetting('consultation', 'requireAdvancePayment', value)}
              icon="card"
            />
            <SettingItem
              title="Allow Cancellations"
              subtitle="Clients can cancel consultations"
              value={settings.consultation.allowCancellations}
              onValueChange={(value) => updateSetting('consultation', 'allowCancellations', value)}
              icon="close-circle"
            />
            <SettingItem
              title="Send Follow-up Messages"
              subtitle="Automatic follow-up after consultations"
              value={settings.consultation.sendFollowUpMessages}
              onValueChange={(value) => updateSetting('consultation', 'sendFollowUpMessages', value)}
              icon="send"
            />
          </View>
        </View>

        {/* Chat Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chat Settings</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              title="Read Receipts"
              subtitle="Show when you've read messages"
              value={settings.chat.readReceipts}
              onValueChange={(value) => updateSetting('chat', 'readReceipts', value)}
              icon="checkmark-done"
            />
            <SettingItem
              title="Typing Indicators"
              subtitle="Show when you're typing"
              value={settings.chat.typingIndicators}
              onValueChange={(value) => updateSetting('chat', 'typingIndicators', value)}
              icon="ellipsis-horizontal"
            />
            <SettingItem
              title="Auto Responses"
              subtitle="Send automatic replies when offline"
              value={settings.chat.autoResponses}
              onValueChange={(value) => updateSetting('chat', 'autoResponses', value)}
              icon="chatbox"
            />
            <SettingItem
              title="Message Sound"
              subtitle="Play sound for new messages"
              value={settings.chat.messageSound}
              onValueChange={(value) => updateSetting('chat', 'messageSound', value)}
              icon="volume-high"
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account & Support</Text>
          <View style={styles.sectionContent}>
            <ActionButton
              title="Change Password"
              subtitle="Update your account password"
              icon="lock-closed"
              onPress={() => Alert.alert('Change Password', 'Password change feature will be available soon!')}
            />
            <ActionButton
              title="Payment Settings"
              subtitle="Manage payment methods and rates"
              icon="card"
              onPress={() => Alert.alert('Payment Settings', 'Payment settings will be available soon!')}
            />
            <ActionButton
              title="Help & Support"
              subtitle="Get help or contact support"
              icon="help-circle"
              onPress={() => Alert.alert('Support', 'Contact support: support@advijr.com\nPhone: +91-9876543210')}
            />
            <ActionButton
              title="About App"
              subtitle="App version and information"
              icon="information-circle"
              onPress={() => Alert.alert('About', 'ADVIJR v1.0.0\nFor professional advisors and consultants')}
            />
          </View>
        </View>

        {/* Reset Button */}
        <View style={styles.resetSection}>
          <TouchableOpacity style={styles.resetButton} onPress={handleResetSettings}>
            <Ionicons name="refresh" size={16} color="#FF4444" style={styles.resetIcon} />
            <Text style={styles.resetText}>Reset All Settings</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    height: 100,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingBottom: 20,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  saveButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#F0F0F0',
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: 15,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionIcon: {
    marginRight: 15,
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  resetSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  resetButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: '#FF4444',
  },
  resetIcon: {
    marginRight: 8,
  },
  resetText: {
    fontSize: 16,
    color: '#FF4444',
    fontWeight: '500',
  },
});