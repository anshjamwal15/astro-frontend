import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const BENEFITS = [
  {
    icon: 'cash-outline' as const,
    title: 'Earn on Your Terms',
    description: 'Set your own rates and schedule. Get paid for every consultation you complete.',
    color: '#FF8C42',
  },
  {
    icon: 'people-outline' as const,
    title: 'Grow Your Reach',
    description: 'Connect with thousands of seekers looking for guidance in your area of expertise.',
    color: '#0052CC',
  },
  {
    icon: 'star-outline' as const,
    title: 'Build Your Reputation',
    description: 'Collect reviews, build your profile, and become a top-rated mentor on ADVIJR.',
    color: '#4CAF50',
  },
  {
    icon: 'shield-checkmark-outline' as const,
    title: 'Secure Payments',
    description: 'Guaranteed payouts with transparent earnings tracking and instant withdrawals.',
    color: '#9C27B0',
  },
];

const STEPS = [
  { number: '01', title: 'Create Account', description: 'Sign up with your details and expertise' },
  { number: '02', title: 'Get Verified', description: 'Our team reviews and approves your profile' },
  { number: '03', title: 'Go Live', description: 'Start accepting consultations and earning' },
];

export default function BecomeMentorScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0052CC" />

      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* Hero Section */}
        <LinearGradient colors={['#0052CC', '#0066FF', '#1a7fff']} style={styles.hero}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>

          <Animated.View
            style={[styles.heroContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
          >
            {/* Floating icon badge */}
            <View style={styles.heroBadge}>
              <LinearGradient colors={['#FF8C42', '#FFA05C']} style={styles.heroBadgeGradient}>
                <Ionicons name="school" size={36} color="#FFFFFF" />
              </LinearGradient>
            </View>

            <Text style={styles.heroTitle}>Become a Mentor</Text>
            <Text style={styles.heroSubtitle}>
              Share your wisdom. Inspire thousands.{'\n'}Earn doing what you love.
            </Text>

            {/* Stats row */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>10K+</Text>
                <Text style={styles.statLabel}>Active Users</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>₹500+</Text>
                <Text style={styles.statLabel}>Avg. per Hour</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>4.8★</Text>
                <Text style={styles.statLabel}>Mentor Rating</Text>
              </View>
            </View>
          </Animated.View>

          {/* Wave bottom */}
          <View style={styles.heroWave} />
        </LinearGradient>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
          {/* Benefits Section */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>WHY JOIN US</Text>
            <Text style={styles.sectionTitle}>Everything you need to succeed</Text>

            <View style={styles.benefitsGrid}>
              {BENEFITS.map((benefit, index) => (
                <View key={index} style={styles.benefitCard}>
                  <View style={[styles.benefitIconWrap, { backgroundColor: benefit.color + '18' }]}>
                    <Ionicons name={benefit.icon} size={26} color={benefit.color} />
                  </View>
                  <Text style={styles.benefitTitle}>{benefit.title}</Text>
                  <Text style={styles.benefitDesc}>{benefit.description}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* How it works */}
          <View style={styles.stepsSection}>
            <LinearGradient colors={['#F0F5FF', '#EBF2FF']} style={styles.stepsSectionBg}>
              <Text style={styles.sectionLabel}>HOW IT WORKS</Text>
              <Text style={styles.sectionTitle}>Start in 3 simple steps</Text>

              {STEPS.map((step, index) => (
                <View key={index} style={styles.stepRow}>
                  <View style={styles.stepNumberWrap}>
                    <LinearGradient colors={['#0052CC', '#0066FF']} style={styles.stepNumberGradient}>
                      <Text style={styles.stepNumber}>{step.number}</Text>
                    </LinearGradient>
                    {index < STEPS.length - 1 && <View style={styles.stepConnector} />}
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepTitle}>{step.title}</Text>
                    <Text style={styles.stepDesc}>{step.description}</Text>
                  </View>
                </View>
              ))}
            </LinearGradient>
          </View>

          {/* Earnings highlight */}
          <View style={styles.section}>
            <LinearGradient colors={['#FF8C42', '#FFA05C']} style={styles.earningsCard}>
              <View style={styles.earningsLeft}>
                <Text style={styles.earningsLabel}>Top mentors earn</Text>
                <Text style={styles.earningsAmount}>₹1,00,000+</Text>
                <Text style={styles.earningsSubLabel}>per month on ADVIJR</Text>
              </View>
              <View style={styles.earningsIconWrap}>
                <Ionicons name="trending-up" size={48} color="rgba(255,255,255,0.4)" />
              </View>
            </LinearGradient>
          </View>

          {/* CTA Section */}
          <View style={styles.ctaSection}>
            <TouchableOpacity
              style={styles.primaryCta}
              onPress={() => router.push('/mentor-registration' as any)}
              activeOpacity={0.85}
            >
              <LinearGradient colors={['#0052CC', '#0066FF']} style={styles.primaryCtaGradient}>
                <Text style={styles.primaryCtaText}>Get Started — It's Free</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>

            {/* <TouchableOpacity
              style={styles.secondaryCta}
              onPress={() => router.push('/auth/mentor-signin' as any)}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryCtaText}>Already a mentor? Sign in</Text>
            </TouchableOpacity> */}

            <Text style={styles.termsNote}>
              By continuing, you agree to our{' '}
              <Text style={styles.termsLink}>Terms of Service</Text> &{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // Hero
  hero: {
    paddingTop: 55,
    paddingBottom: 50,
    paddingHorizontal: 24,
    position: 'relative',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroBadge: {
    marginBottom: 20,
    shadowColor: '#FF8C42',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  heroBadgeGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 24,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginTop: 28,
    width: '100%',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  heroWave: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 24,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },

  // Sections
  section: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 8,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF8C42',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 20,
    letterSpacing: -0.3,
  },

  // Benefits
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  benefitCard: {
    width: (width - 52) / 2,
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  benefitIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  benefitTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 6,
  },
  benefitDesc: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },

  // Steps
  stepsSection: {
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  stepsSectionBg: {
    padding: 24,
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  stepNumberWrap: {
    alignItems: 'center',
    marginRight: 16,
    width: 44,
  },
  stepNumberGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumber: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  stepConnector: {
    width: 2,
    flex: 1,
    backgroundColor: '#C5D8FF',
    marginVertical: 4,
    minHeight: 24,
  },
  stepContent: {
    flex: 1,
    paddingTop: 10,
    paddingBottom: 20,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: 13,
    color: '#666',
    lineHeight: 19,
  },

  // Earnings card
  earningsCard: {
    borderRadius: 20,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  earningsLeft: {
    flex: 1,
  },
  earningsLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
  },
  earningsAmount: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginVertical: 4,
    letterSpacing: -1,
  },
  earningsSubLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
  },
  earningsIconWrap: {
    marginLeft: 12,
  },

  // CTA
  ctaSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 48,
    alignItems: 'center',
  },
  primaryCta: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#0052CC',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryCtaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  primaryCtaText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  secondaryCta: {
    marginTop: 16,
    paddingVertical: 12,
  },
  secondaryCtaText: {
    fontSize: 15,
    color: '#0052CC',
    fontWeight: '600',
  },
  termsNote: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
  },
  termsLink: {
    color: '#0052CC',
    fontWeight: '500',
  },
});
