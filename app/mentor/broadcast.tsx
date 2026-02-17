import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function BroadcastMessage() {
  const [message, setMessage] = useState('');
  const [selectedAudience, setSelectedAudience] = useState<string[]>(['all']);
  const [isSending, setIsSending] = useState(false);
  const [messageType, setMessageType] = useState<'general' | 'promotional' | 'reminder'>('general');

  const audienceOptions = [
    { id: 'all', label: 'All Clients', count: 156 },
    { id: 'active', label: 'Active Clients', count: 89 },
    { id: 'recent', label: 'Recent Clients', count: 34 },
    { id: 'premium', label: 'Premium Clients', count: 23 },
    { id: 'inactive', label: 'Inactive Clients', count: 67 },
  ];

  const messageTemplates = {
    general: [
      "Hello! I'm available for consultations today. Book your session now!",
      "Thank you for being a valued client. I'm here to help with your astrological questions.",
      "New insights available! Connect with me for personalized guidance.",
    ],
    promotional: [
      "Special offer: 20% off on all consultations this week! Limited time only.",
      "New service alert: Now offering Vedic chart analysis. Book your session today!",
      "Weekend special: Extended consultation sessions at discounted rates.",
    ],
    reminder: [
      "Don't forget your scheduled consultation tomorrow. Looking forward to our session!",
      "Reminder: Your follow-up consultation is due. Let's continue your astrological journey.",
      "It's been a while! I'm here whenever you need astrological guidance.",
    ],
  };

  const handleAudienceToggle = (audienceId: string) => {
    if (audienceId === 'all') {
      setSelectedAudience(['all']);
    } else {
      setSelectedAudience(prev => {
        const newSelection = prev.filter(id => id !== 'all');
        if (newSelection.includes(audienceId)) {
          return newSelection.filter(id => id !== audienceId);
        } else {
          return [...newSelection, audienceId];
        }
      });
    }
  };

  const handleTemplateSelect = (template: string) => {
    setMessage(template);
  };

  const handleSendBroadcast = async () => {
    if (!message.trim()) {
      Alert.alert('Error', 'Please enter a message to broadcast.');
      return;
    }

    if (selectedAudience.length === 0) {
      Alert.alert('Error', 'Please select at least one audience group.');
      return;
    }

    const totalRecipients = selectedAudience.includes('all') 
      ? audienceOptions.find(opt => opt.id === 'all')?.count || 0
      : selectedAudience.reduce((total, id) => {
          const option = audienceOptions.find(opt => opt.id === id);
          return total + (option?.count || 0);
        }, 0);

    Alert.alert(
      'Send Broadcast',
      `Send this message to ${totalRecipients} clients?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: async () => {
            setIsSending(true);
            try {
              // Simulate API call
              await new Promise(resolve => setTimeout(resolve, 2000));
              Alert.alert(
                'Broadcast Sent!',
                `Your message has been sent to ${totalRecipients} clients successfully.`,
                [{ text: 'OK', onPress: () => router.back() }]
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to send broadcast. Please try again.');
            } finally {
              setIsSending(false);
            }
          },
        },
      ]
    );
  };

  const getTotalRecipients = () => {
    if (selectedAudience.includes('all')) {
      return audienceOptions.find(opt => opt.id === 'all')?.count || 0;
    }
    return selectedAudience.reduce((total, id) => {
      const option = audienceOptions.find(opt => opt.id === id);
      return total + (option?.count || 0);
    }, 0);
  };

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
        <Text style={styles.headerTitle}>Broadcast Message</Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Message Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Message Type</Text>
          <View style={styles.messageTypeContainer}>
            {(['general', 'promotional', 'reminder'] as const).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.messageTypeButton,
                  messageType === type && styles.messageTypeButtonActive
                ]}
                onPress={() => setMessageType(type)}
              >
                <Text style={[
                  styles.messageTypeText,
                  messageType === type && styles.messageTypeTextActive
                ]}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Message Templates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Templates</Text>
          <View style={styles.templatesContainer}>
            {messageTemplates[messageType].map((template, index) => (
              <TouchableOpacity
                key={`template-${messageType}-${index}`}
                style={styles.templateButton}
                onPress={() => handleTemplateSelect(template)}
              >
                <Text style={styles.templateText} numberOfLines={2}>
                  {template}
                </Text>
                <Ionicons name="add-circle" size={16} color="#0052CC" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Message Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Message</Text>
          <View style={styles.messageInputContainer}>
            <TextInput
              style={styles.messageInput}
              value={message}
              onChangeText={setMessage}
              placeholder="Type your broadcast message here..."
              placeholderTextColor="#999"
              multiline
              maxLength={500}
            />
            <View style={styles.messageFooter}>
              <Text style={styles.characterCount}>
                {message.length}/500 characters
              </Text>
            </View>
          </View>
        </View>

        {/* Audience Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Audience</Text>
          <View style={styles.audienceContainer}>
            {audienceOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.audienceOption,
                  selectedAudience.includes(option.id) && styles.audienceOptionSelected
                ]}
                onPress={() => handleAudienceToggle(option.id)}
              >
                <View style={styles.audienceLeft}>
                  <View style={[
                    styles.checkbox,
                    selectedAudience.includes(option.id) && styles.checkboxSelected
                  ]}>
                    {selectedAudience.includes(option.id) && (
                      <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                    )}
                  </View>
                  <Text style={styles.audienceLabel}>{option.label}</Text>
                </View>
                <Text style={styles.audienceCount}>{option.count} clients</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Summary */}
        <View style={styles.section}>
          <View style={styles.summaryContainer}>
            <View style={styles.summaryItem}>
              <Ionicons name="people" size={20} color="#0052CC" />
              <Text style={styles.summaryText}>
                {getTotalRecipients()} recipients selected
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="time" size={20} color="#0052CC" />
              <Text style={styles.summaryText}>
                Estimated delivery: 2-5 minutes
              </Text>
            </View>
          </View>
        </View>

        {/* Send Button */}
        <View style={styles.sendSection}>
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!message.trim() || selectedAudience.length === 0 || isSending) && styles.sendButtonDisabled
            ]}
            onPress={handleSendBroadcast}
            disabled={!message.trim() || selectedAudience.length === 0 || isSending}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="send" size={16} color="#FFFFFF" style={styles.sendIcon} />
                <Text style={styles.sendButtonText}>
                  Send Broadcast to {getTotalRecipients()} Clients
                </Text>
              </>
            )}
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
  placeholder: {
    width: 40,
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
  messageTypeContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    gap: 10,
  },
  messageTypeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
  },
  messageTypeButtonActive: {
    backgroundColor: '#0052CC',
  },
  messageTypeText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  messageTypeTextActive: {
    color: '#333',
  },
  templatesContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  templateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    marginBottom: 10,
  },
  templateText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginRight: 10,
  },
  messageInputContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  messageInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: '#333',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
  },
  audienceContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  audienceOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#F8F8F8',
  },
  audienceOptionSelected: {
    backgroundColor: 'rgba(0, 82, 204, 0.1)',
    borderWidth: 1,
    borderColor: '#0052CC',
  },
  audienceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#0052CC',
    borderColor: '#0052CC',
  },
  audienceLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  audienceCount: {
    fontSize: 14,
    color: '#666',
  },
  summaryContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  sendSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sendButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  sendIcon: {
    marginRight: 8,
  },
  sendButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});