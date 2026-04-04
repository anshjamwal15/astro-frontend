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

const TIMELINE_STEPS = [
  {
    title: 'Application Submitted',
    description: 'Your mentor application has been received',
    icon: 'checkmark-circle' as const,
    completed: true,
  },
  {
    title: 'Profile Review',
    description: 'Our team is reviewing your credentials and expertise',
    icon: 'document-text' as const,
    completed: false,
  },
  {
    title: 'Verification',
    description: 'We are verifying your qualifications and background',
    icon: 'shield-checkmark' as const,
    completed: false,
  },
  {
    title: 'Approval',
    description: 'Final approval and account activation',
    icon: 'star' as const,
    completed: false,
  },
];

const WHAT_HAPPENS_NEXT = [
  {
    icon: 'mail-outline' as const,
    title: 'Email Updates',
    description: 'We\'ll send you updates at each stage of the review process',
    color: '#0052CC',
  },
  {
    icon: 'time-outline' as const,
    title: 'Review Timeline',
    description: 'Typically takes 2-5 business days for full verification',
    color: '#FF8C42',
  },
  {
    icon: 'call-outline' as const,
    title: 'Support Available',
    description: 'Contact our support team if you have any questions',
    color: '#4CAF50',
  },
];

export default function PendingStatusScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();

    // Pulse animation for the status badge
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
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
            {/* Pulsing status badge */}
            <Animated.View style={[styles.statusBadge, { transform: [{ scale: pulseAnim }] }]}>
              <LinearGradient colors={['#FF8C42', '#FFA05C']} style={styles.statusBadgeGradient}>
                <Ionicons name="hourglass" size={40} color="#FFFFFF" />
              </LinearGradient>
            </Animated.View>

            <Text style={styles.heroTitle}>Application Pending</Text>
            <Text style={styles.heroSubtitle}>
              Your mentor application is under review.{'\n'}We'll notify you soon!
            </Text>

            {/* Status info card */}
            <View style={styles.statusInfoCard}>
              <View style={styles.statusInfoRow}>
                <Text style={styles.statusInfoLabel}>Status</Text>
                <View style={styles.statusBadgeSmall}>
                  <Text style={styles.statusBadgeText}>Under Review</Text>
                </View>
              </View>
              <View style={styles.statusInfoDivider} />
              <View style={styles.statusInfoRow}>
                <Text style={styles.statusInfoLabel}>Expected Time</Text>
                <Text style={styles.statusInfoValue}>2-5 Business Days</Text>
              </View>
            </View>
          </Animated.View>

          {/* Wave bottom */}
          <View style={styles.heroWave} />
        </LinearGradient>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {/* Timeline Section */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>REVIEW PROCESS</Text>
            <Text style={styles.sectionTitle}>Your journey to becoming a mentor</Text>

            <View style={styles.timeline}>
              {TIMELINE_STEPS.map((step, index) => (
                <View key={index} style={styles.timelineItem}>
                  <View style={styles.timelineLeft}>
                    <View
                      style={[
                        styles.timelineCircle,
                        step.completed && styles.timelineCircleCompleted,
                      ]}
                    >
                      <Ionicons
                        name={step.completed ? 'checkmark' : step.icon}
                        size={20}
                        color={step.completed ? '#FFFFFF' : '#0052CC'}
                      />
                    </View>
                    {index < TIMELINE_STEPS.length - 1 && (
                      <View
                        style={[
                          styles.timelineConnector,
                          step.completed && styles.timelineConnectorCompleted,
                        ]}
                      />
                    )}
                  </View>

                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineTitle}>{step.title}</Text>
                    <Text style={styles.timelineDesc}>{step.description}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* What Happens Next */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>WHAT HAPPENS NEXT</Text>
            <Text style={styles.sectionTitle}>Stay informed every step</Text>

            <View style={styles.nextStepsGrid}>
              {WHAT_HAPPENS_NEXT.map((item, index) => (
                <View key={index} style={styles.nextStepCard}>
                  <View style={[styles.nextStepIconWrap, { backgroundColor: item.color + '18' }]}>
                    <Ionicons name={item.icon} size={28} color={item.color} />
                  </View>
                  <Text style={styles.nextStepTitle}>{item.title}</Text>
                  <Text style={styles.nextStepDesc}>{item.description}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* FAQ Section */}
          <View style={styles.section}>
            <LinearGradient colors={['#F0F5FF', '#EBF2FF']} style={styles.faqSection}>
              <Text style={styles.sectionLabel}>FREQUENTLY ASKED</Text>
              <Text style={styles.sectionTitle}>Common questions</Text>

              <View style={styles.faqItem}>
                <View style={styles.faqHeader}>
                  <Ionicons name="help-circle" size={20} color="#0052CC" />
                  <Text style={styles.faqQuestion}>How long does verification take?</Text>
                </View>
                <Text style={styles.faqAnswer}>
                  Most applications are reviewed within 2-5 business days. Complex cases may take longer.
                </Text>
              </View>

              <View style={styles.faqItem}>
                <View style={styles.faqHeader}>
                  <Ionicons name="help-circle" size={20} color="#0052CC" />
                  <Text style={styles.faqQuestion}>Can I edit my application?</Text>
                </View>
                <Text style={styles.faqAnswer}>
                  You can update your profile information anytime. Major changes may require re-verification.
                </Text>
              </View>

              <View style={styles.faqItem}>
                <View style={styles.faqHeader}>
                  <Ionicons name="help-circle" size={20} color="#0052CC" />
                  <Text style={styles.faqQuestion}>What if my application is rejected?</Text>
                </View>
                <Text style={styles.faqAnswer}>
                  We'll provide detailed feedback and guidance on how to improve your application for resubmission.
                </Text>
              </View>
            </LinearGradient>
          </View>

          {/* CTA Section */}
          <View style={styles.ctaSection}>
            <TouchableOpacity
              style={styles.primaryCta}
              onPress={() => router.push('/(tabs)' as any)}
              activeOpacity={0.85}
            >
              <LinearGradient colors={['#0052CC', '#0066FF']} style={styles.primaryCtaGradient}>
                <Text style={styles.primaryCtaText}>Go to Dashboard</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryCta}
              onPress={() => {
                // Handle support contact
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="mail-outline" size={18} color="#0052CC" />
              <Text style={styles.secondaryCtaText}>Contact Support</Text>
            </TouchableOpacity>

            <Text style={styles.termsNote}>
              We appreciate your patience. Check your email for updates.
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
  statusBadge: {
    marginBottom: 20,
    shadowColor: '#FF8C42',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  statusBadgeGradient: {
    width: 90,
    height: 90,
    borderRadius: 45,
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
  statusInfoCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginTop: 28,
    width: '100%',
  },
  statusInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusInfoLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '500',
  },
  statusBadgeSmall: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statusInfoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statusInfoDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 12,
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

  // Timeline
  timeline: {
    marginLeft: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: 16,
    width: 44,
  },
  timelineCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0F5FF',
    borderWidth: 2,
    borderColor: '#0052CC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineCircleCompleted: {
    backgroundColor: '#0052CC',
    borderColor: '#0052CC',
  },
  timelineConnector: {
    width: 2,
    height: 60,
    backgroundColor: '#E0E8FF',
    marginTop: 4,
  },
  timelineConnectorCompleted: {
    backgroundColor: '#0052CC',
  },
  timelineContent: {
    flex: 1,
    paddingTop: 8,
  },
  timelineTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 4,
  },
  timelineDesc: {
    fontSize: 13,
    color: '#666',
    lineHeight: 19,
  },

  // Next Steps
  nextStepsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  nextStepCard: {
    width: (width - 52) / 2,
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    alignItems: 'center',
  },
  nextStepIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  nextStepTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 6,
    textAlign: 'center',
  },
  nextStepDesc: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
    textAlign: 'center',
  },

  // FAQ
  faqSection: {
    borderRadius: 20,
    padding: 24,
  },
  faqItem: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,82,204,0.1)',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A2E',
    flex: 1,
  },
  faqAnswer: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
    marginLeft: 30,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
});
