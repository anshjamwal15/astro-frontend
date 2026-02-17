import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useMentor } from '../../contexts/MentorContext';
import { MentorAuthService, MentorRegistrationData } from '../../services/mentorAuthService';

export default function MentorSignUpScreen() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    country: 'IN',
    password: '',
    confirmPassword: '',
    category: 'Vedic Astrology',
    experience: '',
  });
  const [loading, setLoading] = useState(false);
  const { setMentor } = useMentor();

  const handleSignUp = async () => {
    console.log('🚀 Starting mentor signup process...');
    
    // Validation
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return;
    }

    if (!formData.email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    if (!MentorAuthService.isValidEmail(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (!formData.mobile.trim()) {
      Alert.alert('Error', 'Please enter your mobile number');
      return;
    }

    if (!MentorAuthService.isValidMobile(formData.mobile)) {
      Alert.alert('Error', 'Please enter a valid 10-digit mobile number');
      return;
    }

    const passwordValidation = MentorAuthService.isValidPassword(formData.password);
    if (!passwordValidation.valid) {
      Alert.alert('Error', passwordValidation.message);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (!formData.experience.trim()) {
      Alert.alert('Error', 'Please enter your years of experience');
      return;
    }

    const experienceNum = parseInt(formData.experience);
    if (isNaN(experienceNum) || experienceNum < 0) {
      Alert.alert('Error', 'Please enter a valid number of years of experience');
      return;
    }

    setLoading(true);
    
    try {
      console.log('📝 Attempting mentor registration with API...');
      
      const registrationData: MentorRegistrationData = {
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        mobile: parseInt(formData.mobile.replace(/\D/g, '')),
        country: formData.country,
        password: formData.password,
        category: formData.category,
        experience: experienceNum,
      };

      const mentorData = await MentorAuthService.registerMentor(registrationData);
      console.log('✅ Mentor registration successful:', mentorData);
      
      // Set mentor data in context
      setMentor(mentorData);

      // Navigate to mentor dashboard
      router.replace('/mentor/(tabs)/dashboard');
      Alert.alert('Success', `Welcome to ADVIJR, ${mentorData.name}! Your account is pending approval.`);
      
    } catch (error: any) {
      console.error('💥 Mentor signup error:', error);
      Alert.alert('Registration Failed', error.message || 'Please try again later.');
    } finally {
      setLoading(false);
      console.log('🏁 Mentor signup process completed');
    }
  };

  const handleBackToSignIn = () => {
    console.log('🔙 Going back to mentor signin...');
    router.back();
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#4CAF50" />
      
      {/* Green Header for Mentor */}
      <LinearGradient
        colors={['#4CAF50', '#45a049']}
        style={styles.header}
      >
        <TouchableOpacity style={styles.backButton} onPress={handleBackToSignIn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoIcon}>👨‍🏫</Text>
            </View>
          </View>
          <Text style={styles.appName}>Join as Mentor</Text>
          <Text style={styles.subtitle}>Share your expertise with ADVIJR</Text>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          <Text style={styles.formTitle}>Create Mentor Account</Text>
          
          {/* Name */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Full Name *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.name}
              onChangeText={(text) => updateFormData('name', text)}
              placeholder="Enter your full name"
              placeholderTextColor="#999"
              autoCapitalize="words"
            />
          </View>

          {/* Email */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email Address *</Text>
            <TextInput
              style={[
                styles.textInput,
                formData.email && !MentorAuthService.isValidEmail(formData.email) ? styles.textInputError : null
              ]}
              value={formData.email}
              onChangeText={(text) => updateFormData('email', text.toLowerCase().trim())}
              placeholder="Enter your email"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {formData.email && !MentorAuthService.isValidEmail(formData.email) && (
              <Text style={styles.errorText}>Please enter a valid email address</Text>
            )}
          </View>

          {/* Mobile */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Mobile Number *</Text>
            <TextInput
              style={[
                styles.textInput,
                formData.mobile && !MentorAuthService.isValidMobile(formData.mobile) ? styles.textInputError : null
              ]}
              value={formData.mobile}
              onChangeText={(text) => updateFormData('mobile', text.replace(/\D/g, ''))}
              placeholder="Enter 10-digit mobile number"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              maxLength={10}
            />
            {formData.mobile && !MentorAuthService.isValidMobile(formData.mobile) && (
              <Text style={styles.errorText}>Please enter a valid 10-digit mobile number</Text>
            )}
          </View>

          {/* Experience */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Years of Experience *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.experience}
              onChangeText={(text) => updateFormData('experience', text.replace(/\D/g, ''))}
              placeholder="Enter years of experience"
              placeholderTextColor="#999"
              keyboardType="numeric"
              maxLength={2}
            />
          </View>

          {/* Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.password}
              onChangeText={(text) => updateFormData('password', text)}
              placeholder="Enter password (min 6 characters)"
              placeholderTextColor="#999"
              secureTextEntry
            />
          </View>

          {/* Confirm Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Confirm Password *</Text>
            <TextInput
              style={[
                styles.textInput,
                formData.confirmPassword && formData.password !== formData.confirmPassword ? styles.textInputError : null
              ]}
              value={formData.confirmPassword}
              onChangeText={(text) => updateFormData('confirmPassword', text)}
              placeholder="Confirm your password"
              placeholderTextColor="#999"
              secureTextEntry
            />
            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <Text style={styles.errorText}>Passwords do not match</Text>
            )}
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity 
            style={styles.signUpButton}
            onPress={handleSignUp}
            disabled={loading}
            activeOpacity={0.7}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.signUpButtonText}>CREATE MENTOR ACCOUNT</Text>
            )}
          </TouchableOpacity>

          <View style={styles.signInContainer}>
            <Text style={styles.signInText}>Already have a mentor account? </Text>
            <TouchableOpacity onPress={() => router.push('/auth/mentor-signin' as any)}>
              <Text style={styles.signInLink}>Sign In</Text>
            </TouchableOpacity>
          </View>

          {/* Info Section */}
          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>What happens next?</Text>
            <Text style={styles.infoText}>1. Your account will be created with INACTIVE status</Text>
            <Text style={styles.infoText}>2. Our team will review your application</Text>
            <Text style={styles.infoText}>3. Once approved, you can start accepting consultations</Text>
            <Text style={styles.infoText}>4. You'll have access to the mentor dashboard</Text>
          </View>

          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              By creating an account, you agree to our{' '}
              <Text style={styles.termsLink}>Terms of Service</Text>
              {' & '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    height: 100,
    justifyContent: 'flex-end',
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  backText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  logoSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  logoContainer: {
    marginBottom: 15,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  logoIcon: {
    fontSize: 40,
  },
  appName: {
    fontSize: 28,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  formSection: {
    flex: 1,
    paddingTop: 10,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 15,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  textInputError: {
    borderColor: '#FF6B6B',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    marginTop: 5,
    fontWeight: '500',
  },
  signUpButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  signUpButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  signInText: {
    color: '#666',
    fontSize: 16,
  },
  signInLink: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
  },
  infoContainer: {
    backgroundColor: '#E8F5E8',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#388E3C',
    marginBottom: 4,
    lineHeight: 18,
  },
  termsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  termsText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: '#4CAF50',
    textDecorationLine: 'underline',
  },
});