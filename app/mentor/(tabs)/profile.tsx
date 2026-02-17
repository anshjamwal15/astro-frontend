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
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function MentorProfile() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    name: 'Dr. Rajesh Sharma',
    email: 'rajesh.sharma@advijr.com',
    mobile: '+91-9876543210',
    specializations: ['Vedic Astrology', 'Numerology', 'Palmistry'],
    experience: '15',
    languages: ['English', 'Hindi', 'Sanskrit'],
    consultationRate: '250',
    bio: 'Experienced advisor with over 15 years of practice. Specialized in career guidance, relationship counseling, and personal development.',
    education: 'Professional Certification, Certified Consultant',
    achievements: 'Featured in Times of India, 1000+ satisfied clients',
    availability: {
      monday: { enabled: true, start: '09:00', end: '18:00' },
      tuesday: { enabled: true, start: '09:00', end: '18:00' },
      wednesday: { enabled: true, start: '09:00', end: '18:00' },
      thursday: { enabled: true, start: '09:00', end: '18:00' },
      friday: { enabled: true, start: '09:00', end: '18:00' },
      saturday: { enabled: true, start: '10:00', end: '16:00' },
      sunday: { enabled: false, start: '10:00', end: '16:00' },
    },
  });

  const handleSubmit = async () => {
    setIsUpdating(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          onPress: () => router.replace('/auth/signin')
        },
      ]
    );
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateAvailability = (day: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: {
          ...prev.availability[day as keyof typeof prev.availability],
          [field]: value,
        },
      },
    }));
  };

  const addSpecialization = () => {
    Alert.prompt(
      'Add Specialization',
      'Enter a new specialization:',
      (text) => {
        if (text && text.trim()) {
          updateFormData('specializations', [...formData.specializations, text.trim()]);
        }
      }
    );
  };

  const removeSpecialization = (index: number) => {
    const newSpecializations = formData.specializations.filter((_, i) => i !== index);
    updateFormData('specializations', newSpecializations);
  };

  const addLanguage = () => {
    Alert.prompt(
      'Add Language',
      'Enter a new language:',
      (text) => {
        if (text && text.trim()) {
          updateFormData('languages', [...formData.languages, text.trim()]);
        }
      }
    );
  };

  const removeLanguage = (index: number) => {
    const newLanguages = formData.languages.filter((_, i) => i !== index);
    updateFormData('languages', newLanguages);
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
        <Text style={styles.headerTitle}>Mentor Profile</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Picture Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <View style={styles.profileImage}>
              <Ionicons name="person" size={50} color="#333" />
            </View>
            <TouchableOpacity style={styles.editIcon}>
              <Ionicons name="camera" size={16} color="#666" />
            </TouchableOpacity>
          </View>
          <Text style={styles.profileName}>{formData.name}</Text>
          <Text style={styles.profileEmail}>{formData.email}</Text>
        </View>

        {/* Basic Information */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Full Name*</Text>
            <TextInput
              style={styles.textInput}
              value={formData.name}
              onChangeText={(text) => updateFormData('name', text)}
              placeholder="Enter your full name"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Email*</Text>
            <TextInput
              style={styles.textInput}
              value={formData.email}
              onChangeText={(text) => updateFormData('email', text)}
              placeholder="Enter your email"
              placeholderTextColor="#999"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Mobile Number*</Text>
            <TextInput
              style={styles.textInput}
              value={formData.mobile}
              onChangeText={(text) => updateFormData('mobile', text)}
              placeholder="Enter your mobile number"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Experience (Years)*</Text>
            <TextInput
              style={styles.textInput}
              value={formData.experience}
              onChangeText={(text) => updateFormData('experience', text)}
              placeholder="Enter years of experience"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Consultation Rate (₹/min)*</Text>
            <TextInput
              style={styles.textInput}
              value={formData.consultationRate}
              onChangeText={(text) => updateFormData('consultationRate', text)}
              placeholder="Enter rate per minute"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Specializations */}
        <View style={styles.formSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Specializations</Text>
            <TouchableOpacity onPress={addSpecialization} style={styles.addButton}>
              <Ionicons name="add" size={20} color="#0052CC" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.tagsContainer}>
            {formData.specializations.map((spec, index) => (
              <View key={`spec-${spec}-${index}`} style={styles.tag}>
                <Text style={styles.tagText}>{spec}</Text>
                <TouchableOpacity onPress={() => removeSpecialization(index)}>
                  <Ionicons name="close" size={16} color="#666" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Languages */}
        <View style={styles.formSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Languages</Text>
            <TouchableOpacity onPress={addLanguage} style={styles.addButton}>
              <Ionicons name="add" size={20} color="#0052CC" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.tagsContainer}>
            {formData.languages.map((lang, index) => (
              <View key={`lang-${lang}-${index}`} style={styles.tag}>
                <Text style={styles.tagText}>{lang}</Text>
                <TouchableOpacity onPress={() => removeLanguage(index)}>
                  <Ionicons name="close" size={16} color="#666" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Professional Details */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Professional Details</Text>
          
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Bio</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.bio}
              onChangeText={(text) => updateFormData('bio', text)}
              placeholder="Tell clients about yourself..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Education & Certifications</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.education}
              onChangeText={(text) => updateFormData('education', text)}
              placeholder="Enter your educational background..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Achievements</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.achievements}
              onChangeText={(text) => updateFormData('achievements', text)}
              placeholder="Enter your achievements..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* Availability */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Availability</Text>
          
          {Object.entries(formData.availability).map(([day, schedule]) => (
            <View key={day} style={styles.availabilityRow}>
              <View style={styles.dayInfo}>
                <Text style={styles.dayName}>{day.charAt(0).toUpperCase() + day.slice(1)}</Text>
                <Switch
                  value={schedule.enabled}
                  onValueChange={(value) => updateAvailability(day, 'enabled', value)}
                  trackColor={{ false: '#E0E0E0', true: '#0052CC' }}
                  thumbColor="#FFFFFF"
                />
              </View>
              
              {schedule.enabled && (
                <View style={styles.timeInputs}>
                  <TextInput
                    style={styles.timeInput}
                    value={schedule.start}
                    onChangeText={(text) => updateAvailability(day, 'start', text)}
                    placeholder="09:00"
                    placeholderTextColor="#999"
                  />
                  <Text style={styles.timeSeparator}>to</Text>
                  <TextInput
                    style={styles.timeInput}
                    value={schedule.end}
                    onChangeText={(text) => updateAvailability(day, 'end', text)}
                    placeholder="18:00"
                    placeholderTextColor="#999"
                  />
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.updateButton, isUpdating && styles.buttonDisabled]} 
            onPress={handleSubmit}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" style={styles.buttonIcon} />
                <Text style={styles.updateButtonText}>Update Profile</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Ionicons name="log-out" size={16} color="#FFFFFF" style={styles.buttonIcon} />
            <Text style={styles.signOutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    height: 100,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  content: {
    flex: 1,
  },
  profileSection: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingVertical: 30,
    marginBottom: 20,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FF8C42',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
  },
  formSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  addButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFF8DC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginBottom: 8,
  },
  textInput: {
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingVertical: 10,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8DC',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  tagText: {
    fontSize: 14,
    color: '#333',
  },
  availabilityRow: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
  },
  dayInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dayName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  timeInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  timeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 6,
    padding: 8,
    textAlign: 'center',
    fontSize: 14,
    color: '#333',
  },
  timeSeparator: {
    fontSize: 14,
    color: '#666',
  },
  actionButtons: {
    padding: 20,
    gap: 15,
  },
  updateButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  updateButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  signOutButton: {
    backgroundColor: '#FF9800',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  signOutButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  buttonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  buttonIcon: {
    marginRight: 8,
  },
});