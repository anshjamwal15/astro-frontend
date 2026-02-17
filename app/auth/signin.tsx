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
import { useUser } from '../../contexts/UserContext';
import { AuthService } from '../../services/authService';

export default function SignInScreen() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const { setUser } = useUser();

  const handleSignIn = async () => {
    console.log('🚀 Starting signin process...');
    
    // Validation
    if (!formData.email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    if (!formData.password) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    
    try {
      console.log('🔐 Attempting login with real API...');
      const userData = await AuthService.loginWithEmail(formData.email, formData.password);
      console.log('✅ Login successful:', userData);
      
      // Set user data in context
      setUser({
        id: userData.id,
        name: userData.name,
        email: userData.email,
        mobile: userData.mobile,
        country: userData.country,
        userType: userData.userType || 'CUSTOMER',
        profileCompleted: userData.profileCompleted || false,
      });

      // Navigate to home
      router.replace('/(tabs)/home');
      Alert.alert('Success', 'Welcome back!');
      
    } catch (error: any) {
      console.error('💥 Signin error:', error);
      Alert.alert('Login Failed', error.message || 'Please check your credentials and try again.');
    } finally {
      setLoading(false);
      console.log('🏁 Signin process completed');
    }
  };

  const handleMentorSignIn = () => {
    console.log('🚀 Navigating to mentor signin...');
    router.push('/auth/mentor-signin' as any);
  };

  const handleSkip = () => {
    console.log('Skip button clicked');
    router.replace('/(tabs)/home');
  };

  const handleTruecallerSignIn = async () => {
    setLoading(true);
    try {
      Alert.alert('Coming Soon', 'Truecaller authentication will be available soon!');
    } catch (error: any) {
      console.error('Truecaller signin error:', error);
      Alert.alert('Error', error.message || 'Failed to sign in with Truecaller');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Validate email format
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0052CC" />
      
      {/* Yellow Header */}
      <LinearGradient
        colors={['#0052CC', '#0066FF']}
        style={styles.header}
      >
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoIcon}>🔍</Text>
            </View>
          </View>
          <Text style={styles.appName}>ADVIJR</Text>
          <Text style={styles.tagline}>Get-Seek-Help</Text>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          <Text style={styles.formTitle}>Welcome Back</Text>
          
          {/* Email */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email Address *</Text>
            <TextInput
              style={[
                styles.textInput,
                formData.email && !isValidEmail(formData.email) ? styles.textInputError : null
              ]}
              value={formData.email}
              onChangeText={(text) => updateFormData('email', text.toLowerCase().trim())}
              placeholder="Enter your email"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {formData.email && !isValidEmail(formData.email) && (
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
              <ActivityIndicator size="small" color="#333" />
            ) : (
              <Text style={styles.signInButtonText}>SIGN IN</Text>
            )}
          </TouchableOpacity>

          {/* Sign In as Mentor Button */}
          <TouchableOpacity 
            style={styles.mentorSignInButton}
            onPress={handleMentorSignIn}
            activeOpacity={0.7}
          >
            <View style={styles.mentorButtonContent}>
              <View style={styles.mentorIcon}>
                <Text style={styles.mentorIconText}>👨‍🏫</Text>
              </View>
              <Text style={styles.mentorSignInButtonText}>SIGN IN AS MENTOR</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity 
            style={styles.truecallerButton}
            onPress={handleTruecallerSignIn}
            disabled={loading}
          >
            <View style={styles.truecallerIcon}>
              <Text style={styles.truecallerIconText}>📞</Text>
            </View>
            <Text style={styles.truecallerText}>Continue with Truecaller</Text>
          </TouchableOpacity>

          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              By signing in, you agree to our{' '}
              <Text style={styles.termsLink}>Terms of Use</Text>
              {' & '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </View>

          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/auth/signup' as any)}>
              <Text style={styles.signUpLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          {/* Test Credentials Info */}
          <View style={styles.testInfoContainer}>
            <Text style={styles.testInfoTitle}>Test Credentials:</Text>
            <Text style={styles.testInfoText}>john@example.com / password123</Text>
            <Text style={styles.testInfoText}>jane@example.com / password123</Text>
            <Text style={styles.testInfoText}>admin@example.com / admin123</Text>
            <Text style={styles.testInfoNote}>Any email/password combination works for demo</Text>
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
  skipButton: {
    alignSelf: 'flex-end',
  },
  skipText: {
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
    backgroundColor: '#FF8C42',
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
    fontSize: 32,
    fontWeight: '700',
    color: '#0052CC',
    textAlign: 'center',
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 16,
    color: '#FF8C42',
    textAlign: 'center',
    marginTop: 5,
    fontWeight: '500',
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
    color: '#0052CC',
    fontSize: 14,
    fontWeight: '500',
  },
  signInButton: {
    backgroundColor: '#0052CC',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 30,
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  mentorSignInButton: {
    backgroundColor: '#E8F5E8',
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  mentorButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  mentorIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mentorIconText: {
    fontSize: 12,
  },
  mentorSignInButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    fontSize: 14,
    color: '#666',
    marginHorizontal: 20,
  },
  truecallerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 30,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  truecallerIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0052CC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  truecallerIconText: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  truecallerText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
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
    color: '#0052CC',
    textDecorationLine: 'underline',
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
    color: '#0052CC',
    fontSize: 16,
    fontWeight: '600',
  },
  testInfoContainer: {
    backgroundColor: '#F0F8FF',
    borderRadius: 15,
    padding: 15,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#E0E8F0',
  },
  testInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  testInfoText: {
    fontSize: 13,
    color: '#666',
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  testInfoNote: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 5,
  },
});