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
import { MentorAuthService } from '../../services/mentorAuthService';

export default function MentorSignInScreen() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const { setMentor } = useMentor();

  const handleSignIn = async () => {
    console.log('🚀 Starting mentor signin process...');
    
    // Validation
    if (!formData.email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    if (!formData.password) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    if (!MentorAuthService.isValidEmail(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    
    try {
      console.log('🔐 Attempting mentor login with API...');
      const mentorData = await MentorAuthService.loginWithEmail(formData.email, formData.password);
      console.log('✅ Mentor login successful:', mentorData);
      
      // Set mentor data in context
      setMentor(mentorData);

      // Navigate to mentor dashboard
      router.replace('/mentor/(tabs)/dashboard');
      Alert.alert('Success', `Welcome back, ${mentorData.name}!`);
      
    } catch (error: any) {
      console.error('💥 Mentor signin error:', error);
      Alert.alert('Login Failed', error.message || 'Please check your credentials and try again.');
    } finally {
      setLoading(false);
      console.log('🏁 Mentor signin process completed');
    }
  };

  const handleBackToUserSignIn = () => {
    console.log('🔙 Going back to user signin...');
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
        <TouchableOpacity style={styles.backButton} onPress={handleBackToUserSignIn}>
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
          <Text style={styles.appName}>Mentor Portal</Text>
          <Text style={styles.subtitle}>ADVIJR for Mentors</Text>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          <Text style={styles.formTitle}>Welcome Back, Mentor</Text>
          
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
              placeholder="Enter your mentor email"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {formData.email && !MentorAuthService.isValidEmail(formData.email) && (
              <Text style={styles.errorText}>Please enter a valid email address</Text>
            )}
          </View>

          {/* Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.password}
              onChangeText={(text) => updateFormData('password', text)}
              placeholder="Enter your password"
              placeholderTextColor="#999"
              secureTextEntry
            />
          </View>

          {/* Forgot Password */}
          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Sign In Button */}
          <TouchableOpacity 
            style={styles.signInButton}
            onPress={handleSignIn}
            disabled={loading}
            activeOpacity={0.7}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.signInButtonText}>SIGN IN AS MENTOR</Text>
            )}
          </TouchableOpacity>

          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>Don't have a mentor account? </Text>
            <TouchableOpacity onPress={() => router.push('/auth/mentor-signup' as any)}>
              <Text style={styles.signUpLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          {/* Test Credentials Info */}
          <View style={styles.testInfoContainer}>
            <Text style={styles.testInfoTitle}>Test Mentor Credentials:</Text>
            <Text style={styles.testInfoText}>rajesh.sharma@mindaro.com / password123</Text>
            <Text style={styles.testInfoText}>priya.gupta@mindaro.com / password123</Text>
            <Text style={styles.testInfoText}>mentor@test.com / password123</Text>
            <Text style={styles.testInfoNote}>Use any email/password combination for demo</Text>
          </View>

          {/* Info Section */}
          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>Mentor Benefits:</Text>
            <Text style={styles.infoText}>• Manage your consultation schedule</Text>
            <Text style={styles.infoText}>• Connect with clients via video/audio calls</Text>
            <Text style={styles.infoText}>• Track your earnings and ratings</Text>
            <Text style={styles.infoText}>• Access mentor-only features</Text>
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '500',
  },
  signInButton: {
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
  signInButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  signUpText: {
    color: '#666',
    fontSize: 16,
  },
  signUpLink: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
  },
  testInfoContainer: {
    backgroundColor: '#E8F5E8',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  testInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 8,
  },
  testInfoText: {
    fontSize: 13,
    color: '#388E3C',
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  testInfoNote: {
    fontSize: 12,
    color: '#4CAF50',
    fontStyle: 'italic',
    marginTop: 5,
  },
  infoContainer: {
    backgroundColor: '#F0F8FF',
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E0E8F0',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
    lineHeight: 18,
  },
});