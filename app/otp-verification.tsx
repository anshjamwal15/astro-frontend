import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TextInput,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { ApiService } from '../services/apiService';

// Fallback BlurView component for compatibility
const BlurView = ({ children, style }: any) => {
  return (
    <View style={[style, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]}>
      {children}
    </View>
  );
};

const { width, height } = Dimensions.get('window');

export default function OTPVerificationScreen() {
  const params = useLocalSearchParams();
  const phoneNumber = params.phoneNumber as string || '';
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleOtpChange = (value: string, index: number) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = `otp-${index + 1}`;
        // Focus next input (you'd need refs for this in a real implementation)
      }
    }
  };

  const handleVerifyOTP = async () => {
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      Alert.alert('❌ Invalid OTP', 'Please enter a 6-digit OTP');
      return;
    }

    if (!phoneNumber) {
      Alert.alert('❌ Error', 'Phone number is required');
      return;
    }

    setLoading(true);
    try {
      const response = await ApiService.verifyOTP(phoneNumber, otpString);
      
      if (response.success) {
        Alert.alert('✅ Success', 'OTP verified successfully!', [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]);
      } else {
        Alert.alert('❌ Verification Failed', response.error || 'Invalid OTP. Please try again.');
      }
    } catch (error: any) {
      Alert.alert('❌ Error', error.message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend || !phoneNumber) return;

    setResendLoading(true);
    try {
      const response = await ApiService.sendOTP(phoneNumber);
      
      if (response.success) {
        Alert.alert('✅ OTP Sent', 'A new OTP has been sent to your phone');
        setTimer(60);
        setCanResend(false);
        setOtp(['', '', '', '', '', '']);
      } else {
        Alert.alert('❌ Error', response.error || 'Failed to resend OTP');
      }
    } catch (error: any) {
      Alert.alert('❌ Error', error.message || 'Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  const formatPhoneNumber = (phone: string) => {
    if (phone.length >= 10) {
      return `+91 ${phone.slice(-10).replace(/(\d{5})(\d{5})/, '$1 $2')}`;
    }
    return phone;
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
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Text style={styles.backButtonText}>←</Text>
              </TouchableOpacity>
            </View>

            {/* Main Content */}
            <View style={styles.mainContent}>
              {/* Icon */}
              <View style={styles.iconContainer}>
                <LinearGradient
                  colors={['#0052CC', '#0066FF']}
                  style={styles.iconGradient}
                >
                  <Text style={styles.iconText}>📱</Text>
                </LinearGradient>
              </View>

              {/* Title and Description */}
              <Text style={styles.title}>Verify Your Phone</Text>
              <Text style={styles.description}>
                We've sent a 6-digit verification code to
              </Text>
              <Text style={styles.phoneNumber}>
                {formatPhoneNumber(phoneNumber)}
              </Text>

              {/* OTP Input */}
              <BlurView style={styles.otpContainer}>
                <Text style={styles.otpLabel}>Enter OTP</Text>
                <View style={styles.otpInputs}>
                  {otp.map((digit, index) => (
                    <TextInput
                      key={`otp-input-${index}`}
                      style={[
                        styles.otpInput,
                        digit && styles.otpInputFilled
                      ]}
                      value={digit}
                      onChangeText={(value) => handleOtpChange(value, index)}
                      keyboardType="numeric"
                      maxLength={1}
                      textAlign="center"
                      selectTextOnFocus
                    />
                  ))}
                </View>
              </BlurView>

              {/* Timer and Resend */}
              <View style={styles.timerContainer}>
                {!canResend ? (
                  <Text style={styles.timerText}>
                    Resend OTP in {timer}s
                  </Text>
                ) : (
                  <TouchableOpacity 
                    onPress={handleResendOTP}
                    disabled={resendLoading}
                    style={styles.resendButton}
                  >
                    {resendLoading ? (
                      <ActivityIndicator size="small" color="#0052CC" />
                    ) : (
                      <Text style={styles.resendText}>Resend OTP</Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>

              {/* Verify Button */}
              <TouchableOpacity 
                onPress={handleVerifyOTP}
                disabled={loading || otp.join('').length !== 6}
                style={[
                  styles.verifyButton,
                  (loading || otp.join('').length !== 6) && styles.verifyButtonDisabled
                ]}
              >
                <LinearGradient
                  colors={
                    loading || otp.join('').length !== 6
                      ? ['rgba(0, 82, 204, 0.5)', 'rgba(0, 102, 255, 0.5)']
                      : ['#0052CC', '#0066FF']
                  }
                  style={styles.verifyButtonGradient}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={styles.verifyButtonText}>Verify OTP</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Help Text */}
              <Text style={styles.helpText}>
                Didn't receive the code? Check your SMS or try resending.
              </Text>
            </View>
          </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },

  // Header
  header: {
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

  // Main Content
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100,
  },
  iconContainer: {
    marginBottom: 32,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 8,
  },
  phoneNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0052CC',
    textAlign: 'center',
    marginBottom: 40,
  },

  // OTP Input
  otpContainer: {
    width: '100%',
    borderRadius: 20,
    padding: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 24,
  },
  otpLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
    marginBottom: 16,
  },
  otpInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  otpInput: {
    flex: 1,
    height: 56,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: 'white',
    fontSize: 24,
    fontWeight: '700',
  },
  otpInputFilled: {
    borderColor: '#0052CC',
    backgroundColor: 'rgba(0, 82, 204, 0.1)',
  },

  // Timer and Resend
  timerContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  timerText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  resendButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  resendText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0052CC',
  },

  // Verify Button
  verifyButton: {
    width: '100%',
    marginBottom: 24,
  },
  verifyButtonDisabled: {
    opacity: 0.6,
  },
  verifyButtonGradient: {
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  verifyButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },

  // Help Text
  helpText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: 20,
  },
});