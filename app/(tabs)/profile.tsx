import React, { useState, useEffect } from 'react';
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
import { useUser } from '../../contexts/UserContext';
import { ApiService } from '../../services/apiService';

export default function ProfileTab() {
  const { user, updateUser, logout } = useUser();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    gender: 'Female',
    dateOfBirth: user?.dateOfBirth || '',
    timeOfBirth: '12:00 PM',
    placeOfBirth: 'New Delhi, Delhi, India',
    currentAddress: '',
    cityStateCountry: '',
    pincode: '',
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [buttonStates, setButtonStates] = useState({
    update: false,
    signOut: false,
    delete: false,
  });

  // Update form data when user data changes
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        dateOfBirth: user.dateOfBirth || '',
        // Parse bio if it exists to populate address fields
        ...(user.bio && user.bio.includes(',') ? (() => {
          const bioParts = user.bio.split(',').map(part => part.trim());
          return {
            currentAddress: bioParts[0] || '',
            cityStateCountry: bioParts[1] || '',
            pincode: bioParts[2] || '',
          };
        })() : {}),
      }));
    }
  }, [user]);

  const handleSubmit = async () => {
    if (!user?.email) {
      Alert.alert('Error', 'User email not found. Please log in again.');
      return;
    }

    if (!formData.name.trim()) {
      Alert.alert('Error', 'Name is required.');
      return;
    }

    setIsUpdating(true);
    try {
      console.log('Updating user profile with data:', formData);
      
      // Prepare the update data
      const updateData = {
        email: user.email,
        name: formData.name.trim(),
        mobile: user.mobile,
        country: user.country,
        dateOfBirth: formData.dateOfBirth,
        bio: `${formData.currentAddress}, ${formData.cityStateCountry}, ${formData.pincode}`.trim().replace(/^,\s*|,\s*$/g, ''), // Remove leading/trailing commas
      };

      // Update user profile via API
      const response = await ApiService.updateUserProfile(updateData);

      if (response.success) {
        // Map the API response to match frontend User interface
        const updatedUserData = {
          name: response.data.name,
          dateOfBirth: response.data.dateOfBirth,
          bio: response.data.bio,
          zodiacSign: response.data.zodiacSign,
          profilePicture: response.data.profilePicture,
          profileCompleted: response.data.isProfileCompleted, // Map backend field name
        };
        
        // Update user context with new data
        await updateUser(updatedUserData);
        
        Alert.alert('Success', 'Profile updated successfully!');
        console.log('Profile updated successfully');
      } else {
        console.error('Profile update failed:', response.error);
        Alert.alert('Error', response.error || 'Failed to update profile. Please try again.');
      }
    } catch (error: any) {
      console.error('Profile update error:', error);
      Alert.alert('Error', error.message || 'Failed to update profile. Please check your connection and try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSignOut = async () => {
    console.log('=== SIGN OUT STARTED ===');
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => console.log('Sign out cancelled'),
        },
        {
          text: 'Sign Out',
          onPress: async () => {
            try {
              console.log('User confirmed sign out, calling logout...');
              await logout();
              console.log('Logout completed, navigating to signin...');
              router.replace('/auth/signin');
              console.log('Navigation completed');
            } catch (error) {
              console.error('Sign out error:', error);
              Alert.alert('Error', 'Failed to sign out');
            }
          },
        },
      ]
    );
  };

  const handleDeleteUser = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'User ID not found. Please log in again.');
      return;
    }

    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              const response = await ApiService.deleteUser(user.id);
              
              if (response.success) {
                Alert.alert(
                  'Account Deleted',
                  'Your account has been successfully deleted.',
                  [
                    {
                      text: 'OK',
                      onPress: async () => {
                        await logout();
                        router.replace('/auth/signin');
                      },
                    },
                  ]
                );
              } else {
                Alert.alert('Error', response.error || 'Failed to delete account');
              }
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete account');
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  const handleButtonPress = (buttonName: keyof typeof buttonStates, pressed: boolean) => {
    setButtonStates(prev => ({ ...prev, [buttonName]: pressed }));
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0052CC" />
      
      {/* Blue Header */}
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
        <Text style={styles.headerTitle}>Profile</Text>
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
          <Text style={styles.userName}>{user?.name || 'User Name'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'email@example.com'}</Text>
          <Text style={styles.phoneNumber}>{user?.mobile || '+91-XXXXXXXXXX'}</Text>
        </View>

        {/* Form Fields */}
        <View style={styles.formSection}>
          {/* Name */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Name*</Text>
            <TextInput
              style={styles.textInput}
              value={formData.name}
              onChangeText={(text) => updateFormData('name', text)}
              placeholder="Enter your name"
              placeholderTextColor="#999"
            />
          </View>

          {/* Gender */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Gender</Text>
            <View style={styles.genderContainer}>
              <TouchableOpacity 
                style={[
                  styles.genderOption,
                  formData.gender === 'Male' && styles.genderSelected
                ]}
                onPress={() => updateFormData('gender', 'Male')}
              >
                <View style={[
                  styles.radioButton,
                  formData.gender === 'Male' && styles.radioSelected
                ]} />
                <Text style={styles.genderText}>Male</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.genderOption,
                  formData.gender === 'Female' && styles.genderSelected
                ]}
                onPress={() => updateFormData('gender', 'Female')}
              >
                <View style={[
                  styles.radioButton,
                  formData.gender === 'Female' && styles.radioSelected
                ]} />
                <Text style={styles.genderText}>Female</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Date of Birth */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Date of Birth</Text>
            <Text style={styles.fieldValue}>{formData.dateOfBirth}</Text>
          </View>

          {/* Time of Birth */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Time of Birth</Text>
            <Text style={styles.fieldValue}>{formData.timeOfBirth}</Text>
          </View>

          {/* Place of Birth */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Place of Birth</Text>
            <Text style={styles.fieldValue}>{formData.placeOfBirth}</Text>
          </View>

          {/* Current Address */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Current Address</Text>
            <TextInput
              style={styles.textInput}
              value={formData.currentAddress}
              onChangeText={(text) => updateFormData('currentAddress', text)}
              placeholder="Enter Flat, House no, Building, Apartment"
              placeholderTextColor="#999"
              multiline
            />
          </View>

          {/* City, State, Country */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>City, State, Country</Text>
            <TextInput
              style={styles.textInput}
              value={formData.cityStateCountry}
              onChangeText={(text) => updateFormData('cityStateCountry', text)}
              placeholder="Enter Town/City, State, Country"
              placeholderTextColor="#999"
            />
          </View>

          {/* Pincode */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Pincode</Text>
            <TextInput
              style={styles.textInput}
              value={formData.pincode}
              onChangeText={(text) => updateFormData('pincode', text)}
              placeholder="Enter Pincode"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>

          {/* Update Profile Button */}
          <TouchableOpacity 
            style={[
              styles.glassButton, 
              styles.updateButton, 
              isUpdating && styles.buttonDisabled,
              buttonStates.update && styles.buttonPressed
            ]} 
            onPress={handleSubmit}
            onPressIn={() => handleButtonPress('update', true)}
            onPressOut={() => handleButtonPress('update', false)}
            disabled={isUpdating}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={isUpdating ? ['#CCCCCC', '#AAAAAA'] : ['#FF9800', '#F57C00']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {isUpdating ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" style={styles.buttonIcon} />
                  <Text style={styles.buttonText}>Update Profile</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Sign Out Button */}
          <TouchableOpacity 
            style={[
              styles.glassButton, 
              styles.signOutButton,
              buttonStates.signOut && styles.buttonPressed
            ]} 
            onPress={handleSignOut}
            onPressIn={() => handleButtonPress('signOut', true)}
            onPressOut={() => handleButtonPress('signOut', false)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#FF9800', '#F57C00']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="log-out" size={18} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Sign Out</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Delete Account Button */}
          <TouchableOpacity 
            style={[
              styles.glassButton, 
              styles.deleteButton, 
              isDeleting && styles.buttonDisabled,
              buttonStates.delete && styles.buttonPressed
            ]} 
            onPress={handleDeleteUser}
            onPressIn={() => handleButtonPress('delete', true)}
            onPressOut={() => handleButtonPress('delete', false)}
            disabled={isDeleting}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={isDeleting ? ['#CCCCCC', '#AAAAAA'] : ['#FF4444', '#D32F2F']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="trash" size={18} color="#FFFFFF" style={styles.buttonIcon} />
                  <Text style={styles.buttonText}>Delete Account</Text>
                </>
              )}
            </LinearGradient>
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
  userName: {
    fontSize: 18,
    color: '#333',
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    fontWeight: '400',
    marginBottom: 2,
  },
  phoneNumber: {
    fontSize: 14,
    color: '#666',
    fontWeight: '400',
  },
  formSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  fieldContainer: {
    marginBottom: 25,
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
  fieldValue: {
    fontSize: 16,
    color: '#666',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 30,
  },
  genderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  radioSelected: {
    borderColor: '#0052CC',
    backgroundColor: '#0052CC',
  },
  genderText: {
    fontSize: 16,
    color: '#333',
  },
  genderSelected: {
    backgroundColor: '#FFF8DC',
  },
  testButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  
  // Glassmorphism Button Styles
  glassButton: {
    borderRadius: 25,
    marginTop: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    // Glass effect
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  
  buttonPressed: {
    transform: [{ scale: 0.98 }],
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  
  buttonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  
  buttonIcon: {
    marginRight: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  
  updateButton: {
    marginTop: 25,
  },
  
  signOutButton: {
    // Orange gradient colors defined in component
  },
  
  deleteButton: {
    marginBottom: 30,
    // Red gradient colors defined in component
  },
  
  buttonDisabled: {
    opacity: 0.6,
    transform: [{ scale: 1 }],
  },
});