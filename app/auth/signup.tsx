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

export default function SignUpScreen() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    country: 'India',
    dateOfBirth: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const { setUser } = useUser();

  const handleSignUp = async () => {
    console.log('=== SIGNUP STARTED ===');
    
    // Validation
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return;
    }

    if (!formData.email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    if (!isValidEmail(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (!formData.mobile.trim()) {
      Alert.alert('Error', 'Please enter your mobile number');
      return;
    }

    if (!formData.password) {
      Alert.alert('Error', 'Please create a password');
      return;
    }

    if (!formData.confirmPassword) {
      Alert.alert('Error', 'Please confirm your password');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    
    try {
      console.log('📝 Attempting registration with real API...');
      
      const userData = await AuthService.registerWithEmail({
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        country: formData.country,
        dateOfBirth: formData.dateOfBirth,
        password: formData.password,
      });
      
      console.log('✅ Registration successful:', userData);
      
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
      Alert.alert('Success', 'Account created successfully! Welcome to the app.');
      
    } catch (error: any) {
      console.error('Signup error:', error);
      Alert.alert('Registration Failed', error.message || 'Please try again.');
    } finally {
      setLoading(false);
      console.log('=== SIGNUP COMPLETED ===');
    }
  };

  const handleSkip = () => {
    console.log('Skip button clicked');
    router.replace('/(tabs)/home');
  };

  const handleTruecallerSignUp = async () => {
    setLoading(true);
    try {
      Alert.alert('Coming Soon', 'Truecaller authentication will be available soon!');
    } catch (error: any) {
      console.error('Truecaller signup error:', error);
      Alert.alert('Error', error.message || 'Failed to sign up with Truecaller');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Auto-format date of birth as user types
  const handleDOBChange = (text: string) => {
    const numericOnly = text.replace(/\D/g, '');
    
    let formatted = numericOnly;
    if (numericOnly.length >= 5) {
      formatted = `${numericOnly.slice(0, 4)}-${numericOnly.slice(4, 6)}`;
    }
    if (numericOnly.length >= 7) {
      formatted = `${numericOnly.slice(0, 4)}-${numericOnly.slice(4, 6)}-${numericOnly.slice(6, 8)}`;
    }
    
    if (formatted.length <= 10) {
      updateFormData('dateOfBirth', formatted);
    }
  };

  // Validate email format
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate date format and range
  const isValidDate = (dateString: string) => {
    if (!dateString) return true;
    
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    
    const date = new Date(dateString);
    const now = new Date();
    const minDate = new Date('1900-01-01');
    
    return date >= minDate && date <= now && !isNaN(date.getTime());
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0052CC" />
      
      {/* Blue Header */}
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
          <Text style={styles.formTitle}>Create Your Account</Text>
          
          {/* Full Name */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Full Name *</Text>
            <TextInput
              style={[
                styles.textInput,
                !formData.name.trim() && formData.name.length > 0 ? styles.textInputError : null
              ]}
              value={formData.name}
              onChangeText={(text) => updateFormData('name', text)}
              placeholder="Enter your full name"
              placeholderTextColor="#999"
            />
          </View>

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

          {/* Mobile Number */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Mobile Number *</Text>
            <View style={styles.inputRow}>
              <View style={styles.countryCodeContainer}>
                <Text style={styles.flagIcon}>🇮🇳</Text>
                <Text style={styles.countryCode}>+91</Text>
              </View>
              <TextInput
                style={[
                  styles.mobileInput,
                  formData.mobile && formData.mobile.length > 0 && formData.mobile.length < 10 ? styles.textInputError : null
                ]}
                value={formData.mobile}
                onChangeText={(text) => updateFormData('mobile', text.replace(/\D/g, ''))}
                placeholder="Enter mobile number"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>
            {formData.mobile && formData.mobile.length > 0 && formData.mobile.length < 10 && (
              <Text style={styles.errorText}>Mobile number must be at least 10 digits</Text>
            )}
          </View>

          {/* Country */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Country</Text>
            <TextInput
              style={styles.textInput}
              value={formData.country}
              onChangeText={(text) => updateFormData('country', text)}
              placeholder="Enter your country"
              placeholderTextColor="#999"
            />
          </View>

          {/* Date of Birth */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Date of Birth (Optional)</Text>
            <TextInput
              style={[
                styles.textInput,
                formData.dateOfBirth && !isValidDate(formData.dateOfBirth) ? styles.textInputError : null
              ]}
              value={formData.dateOfBirth}
              onChangeText={handleDOBChange}
              placeholder="YYYY-MM-DD (e.g., 1995-02-10)"
              placeholderTextColor="#999"
              keyboardType="numeric"
              maxLength={10}
            />
            <Text style={styles.helperText}>We'll calculate your zodiac sign automatically ✨</Text>
            {formData.dateOfBirth && !isValidDate(formData.dateOfBirth) && (
              <Text style={styles.errorText}>Please enter a valid date (YYYY-MM-DD)</Text>
            )}
          </View>

          {/* Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password *</Text>
            <TextInput
              style={[
                styles.textInput,
                formData.password && formData.password.length > 0 && formData.password.length < 6 ? styles.textInputError : null
              ]}
              value={formData.password}
              onChangeText={(text) => updateFormData('password', text)}
              placeholder="Create a password"
              placeholderTextColor="#999"
              secureTextEntry
            />
            {formData.password && formData.password.length > 0 && formData.password.length < 6 && (
              <Text style={styles.errorText}>Password must be at least 6 characters</Text>
            )}
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

          {/* Create Account Button */}
          <TouchableOpacity 
            style={styles.createAccountButton}
            onPress={handleSignUp}
            disabled={loading}
            activeOpacity={0.7}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#333" />
            ) : (
              <Text style={styles.createAccountButtonText}>CREATE ACCOUNT</Text>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity 
            style={styles.truecallerButton}
            onPress={handleTruecallerSignUp}
            disabled={loading}
          >
            <View style={styles.truecallerIcon}>
              <Text style={styles.truecallerIconText}>📞</Text>
            </View>
            <Text style={styles.truecallerText}>Continue with Truecaller</Text>
          </TouchableOpacity>

          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              By signing up, you agree to our{' '}
              <Text style={styles.termsLink}>Terms of Use</Text>
              {' & '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </View>

          <View style={styles.signInContainer}>
            <Text style={styles.signInText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/auth/signin' as any)}>
              <Text style={styles.signInLink}>Sign In</Text>
            </TouchableOpacity>
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
  helperText: {
    fontSize: 12,
    color: '#FF8C42',
    marginTop: 5,
    fontStyle: 'italic',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  countryCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 15,
    gap: 8,
    minWidth: 100,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  flagIcon: {
    fontSize: 18,
  },
  countryCode: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  mobileInput: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 15,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  userTypeContainer: {
    gap: 15,
  },
  userTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: 12,
  },
  userTypeSelected: {
    backgroundColor: '#E6F2FF',
    borderColor: '#0052CC',
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
  userTypeContent: {
    flex: 1,
  },
  userTypeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  userTypeDescription: {
    fontSize: 14,
    color: '#666',
  },
  createAccountButton: {
    backgroundColor: '#0052CC',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  createAccountButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
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
    color: '#0052CC',
    fontSize: 16,
    fontWeight: '600',
  },
});