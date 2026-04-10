import React, { useState, useEffect, useRef } from 'react';
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
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  BackHandler,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { useUser } from '../../contexts/UserContext';
import { AuthService } from '../../services/authService';
import { DeviceTokenService } from '../../services/deviceTokenService';

type SignInOTPStep = 'phone' | 'otp';

export default function SignInOTPScreen() {
  const [step, setStep] = useState<SignInOTPStep>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [timer, setTimer] = useState(0);
  const otpInputRefs = useRef<(TextInput | null)[]>([]);
  const { setUser, setJwtToken } = useUser();

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => { show.remove(); hide.remove(); };
  }, []);

  // Timer for resend OTP
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer, step]);

  // Prevent back button navigation on signin screen
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (step === 'otp') {
          setStep('phone');
          setOtp(['', '', '', '', '', '']);
          return true;
        }
        return false;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [step])
  );

  const formatPhoneNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length <= 10) {
      return cleaned;
    }
    return cleaned.slice(0, 10);
  };

  const handlePhoneSubmit = async () => {
    if (!phoneNumber.trim() || phoneNumber.length < 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    try {
      // Call API to send OTP
      await AuthService.sendOTP(phoneNumber);
      setStep('otp');
      setTimer(60);
      Alert.alert('Success', 'OTP sent to your phone number');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const numericValue = value.replace(/\D/g, '');
    
    if (numericValue.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = numericValue;
      setOtp(newOtp);

      // Auto-focus next input
      if (numericValue && index < 5) {
        otpInputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleOtpKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpSubmit = async () => {
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      Alert.alert('Error', 'Please enter all 6 digits');
      return;
    }

    setLoading(true);
    try {
      // Call API to verify OTP
      const userData = await AuthService.verifyOTP(phoneNumber, otpCode, '91', 'mobile');
      
      // Convert dateOfBirth from array [year, month, day] to ISO string (YYYY-MM-DD)
      let dateOfBirthString: string | undefined;
      if (userData.dateOfBirth && Array.isArray(userData.dateOfBirth)) {
        const [year, month, day] = userData.dateOfBirth;
        dateOfBirthString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      }

      // Set user data in context
      setUser({
        id: userData.id,
        name: userData.name,
        email: userData.email,
        mobile: userData.mobile,
        country: userData.country,
        dateOfBirth: dateOfBirthString,
        userType: userData.userType || 'CUSTOMER',
        profileCompleted: userData.profileCompleted || false,
        isMentor: userData.isMentor ?? false,
      });

      // Save JWT token if available
      if (userData.jwtToken) {
        setJwtToken(userData.jwtToken);
        console.log('✅ JWT token saved');
      }

      // Register device token with backend for push notifications
      try {
        const deviceTokenResult = await DeviceTokenService.registerDeviceToken(userData.id);
        if (deviceTokenResult.success) {
          console.log('✅ Device token registered with backend');
        }
      } catch (deviceTokenError) {
        console.error('❌ Error registering device token:', deviceTokenError);
      }

      // Navigate to home
      router.replace('/(tabs)/home');
      Alert.alert('Success', 'Welcome!');
      
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      await AuthService.sendOTP(phoneNumber);
      setOtp(['', '', '', '', '', '']);
      setTimer(60);
      Alert.alert('Success', 'OTP resent to your phone number');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : keyboardVisible ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0052CC" />
      
      {/* Gradient Header */}
      <LinearGradient
        colors={['#0052CC', '#0066FF']}
        style={styles.header}
      >
        {step === 'otp' && (
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => {
              setStep('phone');
              setOtp(['', '', '', '', '', '']);
            }}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        )}
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        showsVerticalScrollIndicator={false}
      >
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
          {step === 'phone' ? (
            <>
              <Text style={styles.formTitle}>Sign In with OTP</Text>
              <Text style={styles.formSubtitle}>Enter your phone number to get started</Text>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Phone Number *</Text>
                <View style={styles.phoneInputWrapper}>
                  <Text style={styles.countryCode}>+91</Text>
                  <TextInput
                    style={styles.phoneInput}
                    value={phoneNumber}
                    onChangeText={(text) => setPhoneNumber(formatPhoneNumber(text))}
                    placeholder="Enter 10-digit number"
                    placeholderTextColor="#999"
                    keyboardType="phone-pad"
                    maxLength={10}
                  />
                </View>
                <Text style={styles.helperText}>We'll send you a 6-digit OTP code</Text>
              </View>

              <TouchableOpacity 
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={handlePhoneSubmit}
                disabled={loading || phoneNumber.length < 10}
                activeOpacity={0.7}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>SEND OTP</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.formTitle}>Verify OTP</Text>
              <Text style={styles.formSubtitle}>
                Enter the 6-digit code sent to +91 {phoneNumber}
              </Text>

              <View style={styles.otpContainer}>
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => {
                      if (ref) otpInputRefs.current[index] = ref;
                    }}
                    style={styles.otpInput}
                    value={digit}
                    onChangeText={(value) => handleOtpChange(index, value)}
                    onKeyPress={({ nativeEvent }) => handleOtpKeyPress(index, nativeEvent.key)}
                    keyboardType="number-pad"
                    maxLength={1}
                    placeholder="0"
                    placeholderTextColor="#DDD"
                  />
                ))}
              </View>

              <TouchableOpacity 
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={handleOtpSubmit}
                disabled={loading || otp.join('').length !== 6}
                activeOpacity={0.7}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>VERIFY & SIGN IN</Text>
                )}
              </TouchableOpacity>

              <View style={styles.resendContainer}>
                {timer > 0 ? (
                  <Text style={styles.timerText}>
                    Resend OTP in <Text style={styles.timerNumber}>{timer}s</Text>
                  </Text>
                ) : (
                  <TouchableOpacity 
                    onPress={handleResendOTP}
                    disabled={loading}
                  >
                    <Text style={styles.resendLink}>Resend OTP</Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}

          {/* Terms */}
          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              By signing in, you agree to our{' '}
              <Text style={styles.termsLink}>Terms of Use</Text>
              {' & '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </View>

          {/* Sign Up Link */}
          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/auth/signup' as any)}>
              <Text style={styles.signUpLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          {/* Alternative Sign In */}
          <View style={styles.alternativeContainer}>
            <View style={styles.divider} />
            <Text style={styles.alternativeText}>or</Text>
            <View style={styles.divider} />
          </View>

          <TouchableOpacity 
            style={styles.emailSignInButton}
            onPress={() => router.push('/auth/signin' as any)}
            activeOpacity={0.7}
          >
            <Text style={styles.emailSignInButtonText}>Sign In with Email</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
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
    fontSize: 24,
    fontWeight: '700',
    color: '#0052CC',
    textAlign: 'center',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 25,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  phoneInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 20,
    overflow: 'hidden',
  },
  countryCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  phoneInput: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
    color: '#333',
  },
  helperText: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    fontStyle: 'italic',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    gap: 8,
  },
  otpInput: {
    flex: 1,
    height: 60,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#F5F5F5',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: '#0052CC',
  },
  submitButton: {
    backgroundColor: '#0052CC',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#0052CC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  timerText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  timerNumber: {
    color: '#0052CC',
    fontWeight: '700',
  },
  resendLink: {
    fontSize: 14,
    color: '#0052CC',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  termsContainer: {
    paddingHorizontal: 10,
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
    fontWeight: '600',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
  },
  signUpText: {
    color: '#666',
    fontSize: 14,
  },
  signUpLink: {
    color: '#0052CC',
    fontSize: 14,
    fontWeight: '700',
  },
  alternativeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  alternativeText: {
    fontSize: 12,
    color: '#999',
    marginHorizontal: 12,
    fontWeight: '500',
  },
  emailSignInButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0052CC',
  },
  emailSignInButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0052CC',
  },
});
