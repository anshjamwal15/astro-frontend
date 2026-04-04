import React, { useState, useRef } from 'react';
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
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { ApiService } from '../services/apiService';
import { useUser } from '../contexts/UserContext';

// ─── Types ────────────────────────────────────────────────────────────────────

type FormData = {
  nationality: string;
  photo: string;
  city: string;
  state: string;
  pincode: string;
  experience: string;
  mainLanguage: string;
  qualification: string;
  about: string;
  mainIncome: string;
  weeklyHours: string;
  rate: string;
  twitter: string;
  linkedin: string;
  youtube: string;
  facebook: string;
  categories: string[];
};

const INITIAL_FORM: FormData = {
  nationality: '', photo: '', city: '', state: '', pincode: '',
  experience: '', mainLanguage: '', qualification: '', about: '',
  mainIncome: '', weeklyHours: '', rate: '', twitter: '', linkedin: '',
  youtube: '', facebook: '', categories: [],
};

const GENDER_OPTIONS = ['Male', 'Female', 'Other', 'Prefer not to say'];
const INCOME_OPTIONS = ['Full-time', 'Part-time', 'Side income'];
const CATEGORY_OPTIONS = [
  'Vedic Astrology', 'Numerology', 'Tarot', 'Vastu', 'Palmistry',
  'KP Astrology', 'Prashna', 'Nadi', 'Western Astrology', 'Feng Shui',
];
const LANGUAGE_OPTIONS = ['Hindi', 'English', 'Tamil', 'Telugu', 'Kannada', 'Bengali', 'Marathi', 'Gujarati'];

const STEPS = [
  { label: 'Profile', icon: 'camera-outline' as const },
  { label: 'Location', icon: 'location-outline' as const },
  { label: 'Expertise', icon: 'school-outline' as const },
  { label: 'Earnings', icon: 'cash-outline' as const },
  { label: 'Social', icon: 'share-social-outline' as const },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const isValidMobile = (m: string) => /^\d{10}$/.test(m);

function Field({
  label, value, onChangeText, placeholder, keyboardType, secureTextEntry, multiline, required,
}: {
  label: string; value: string; onChangeText: (t: string) => void;
  placeholder?: string; keyboardType?: any; secureTextEntry?: boolean;
  multiline?: boolean; required?: boolean;
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}{required && <Text style={styles.required}> *</Text>}</Text>
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder ?? `Enter ${label.toLowerCase()}`}
        placeholderTextColor="#AAAAAA"
        keyboardType={keyboardType ?? 'default'}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        textAlignVertical={multiline ? 'top' : 'center'}
        autoCapitalize="none"
      />
    </View>
  );
}

function ChipSelect({
  label, options, selected, onToggle, required,
}: {
  label: string; options: string[]; selected: string | string[];
  onToggle: (val: string) => void; required?: boolean;
}) {
  const isMulti = Array.isArray(selected);
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}{required && <Text style={styles.required}> *</Text>}</Text>
      <View style={styles.chipRow}>
        {options.map((opt) => {
          const active = isMulti ? (selected as string[]).includes(opt) : selected === opt;
          return (
            <TouchableOpacity
              key={opt}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => onToggle(opt)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{opt}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function MentorRegistrationScreen() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const { jwtToken, user } = useUser();

  const set = (key: keyof FormData) => (val: string) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const toggleCategory = (cat: string) => {
    setForm((prev) => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter((c) => c !== cat)
        : [...prev.categories, cat],
    }));
  };

  const pickPhoto = async () => {
    Alert.alert(
      'Add Photo',
      'Choose a source',
      [
        {
          text: 'Camera',
          onPress: takePhoto,
        },
        {
          text: 'Photo Library',
          onPress: selectFromLibrary,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow camera access.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setForm((prev) => ({ ...prev, photo: asset.uri }));
    }
  };

  const selectFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow photo library access.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setForm((prev) => ({ ...prev, photo: asset.uri }));
    }
  };

  const validateStep = (): string | null => {
    if (step === 0) {
      if (!form.photo.trim()) return 'Please add a photo';
      if (!form.qualification.trim()) return 'Qualification is required';
      if (!form.experience.trim()) return 'Experience is required';
    }
    if (step === 1) {
      if (!form.city.trim()) return 'City is required';
      if (!form.state.trim()) return 'State is required';
    }
    if (step === 2) {
      if (!form.mainLanguage) return 'Please select your main language';
      if (form.categories.length === 0) return 'Select at least one category';
      if (!form.about.trim()) return 'Please write a short bio';
    }
    if (step === 3) {
      if (!form.mainIncome) return 'Please select income type';
      if (!form.weeklyHours.trim()) return 'Weekly hours is required';
      if (!form.rate.trim()) return 'Consultation rate is required';
    }
    return null;
  };

  const goNext = () => {
    const err = validateStep();
    if (err) { Alert.alert('Missing info', err); return; }
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    } else {
      handleSubmit();
    }
  };

  const goBack = () => {
    if (step > 0) {
      setStep((s) => s - 1);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    } else {
      router.back();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Check if user is authenticated
      if (!user || !jwtToken) {
        Alert.alert('Authentication Required', 'Please log in to submit your mentor application.');
        setLoading(false);
        return;
      }

      const payload = {
        nationality: form.nationality.trim(),
        photo: form.photo,
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: parseInt(form.pincode, 10) || 0,
        experience: parseInt(form.experience, 10) || 0,
        mainLanguage: form.mainLanguage,
        qualification: form.qualification.trim(),
        about: form.about.trim(),
        mainIncome: form.mainIncome,
        weeklyHours: parseInt(form.weeklyHours, 10) || 0,
        rate: parseInt(form.rate, 10) || 0,
        twitter: form.twitter.trim(),
        linkedin: form.linkedin.trim(),
        youtube: form.youtube.trim(),
        facebook: form.facebook.trim(),
        categories: form.categories,
      };

      console.log('📤 Submitting mentor application with token:', jwtToken.substring(0, 50) + '...');
      const res = await ApiService.applyAsMentor(payload as any, jwtToken);
      
      if (res.success) {
        Alert.alert(
          'Application Submitted!',
          'Your mentor application is under review. We\'ll notify you once approved.',
          [{ text: 'OK', onPress: () => router.replace('/become-mentor' as any) }]
        );
      } else {
        Alert.alert('Submission Failed', res.message || 'Please try again.');
      }
    } catch (e: any) {
      console.error('❌ Submission error:', e);
      Alert.alert('Error', e.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Step renders ────────────────────────────────────────────────────────────

  const renderStep0 = () => (
    <>
      {/* Photo picker */}
      <TouchableOpacity style={styles.photoPicker} onPress={pickPhoto} activeOpacity={0.8}>
        {form.photo ? (
          <Image source={{ uri: form.photo }} style={styles.photoPreview} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Ionicons name="camera" size={28} color="#0052CC" />
            <Text style={styles.photoPlaceholderText}>Add Photo</Text>
          </View>
        )}
        <View style={styles.photoEditBadge}>
          <Ionicons name="pencil" size={12} color="#FFFFFF" />
        </View>
      </TouchableOpacity>

      <Field label="Qualification" value={form.qualification} onChangeText={set('qualification')} placeholder="e.g. B.Sc Astrology, MBA" required />
      <Field label="Years of Experience" value={form.experience} onChangeText={(t) => set('experience')(t.replace(/\D/g, ''))} keyboardType="numeric" required />
    </>
  );

  const renderStep1 = () => (
    <>
      <Field label="Nationality" value={form.nationality} onChangeText={set('nationality')} />
      <Field label="City" value={form.city} onChangeText={set('city')} required />
      <Field label="State" value={form.state} onChangeText={set('state')} required />
      <Field label="Pincode" value={form.pincode} onChangeText={(t) => set('pincode')(t.replace(/\D/g, ''))} keyboardType="numeric" />
    </>
  );

  const renderStep2 = () => (
    <>
      <ChipSelect label="Main Language" options={LANGUAGE_OPTIONS} selected={form.mainLanguage} onToggle={(v) => setForm((p) => ({ ...p, mainLanguage: v }))} required />
      <ChipSelect label="Categories" options={CATEGORY_OPTIONS} selected={form.categories} onToggle={toggleCategory} required />
      <Field label="About You" value={form.about} onChangeText={set('about')} placeholder="Tell seekers about your expertise and approach..." multiline required />
    </>
  );

  const renderStep3 = () => (
    <>
      <ChipSelect label="Mentoring as" options={INCOME_OPTIONS} selected={form.mainIncome} onToggle={(v) => setForm((p) => ({ ...p, mainIncome: v }))} required />
      <Field label="Available Hours / Week" value={form.weeklyHours} onChangeText={(t) => set('weeklyHours')(t.replace(/\D/g, ''))} keyboardType="numeric" placeholder="e.g. 20" required />
      <View style={styles.rateCard}>
        <Ionicons name="cash-outline" size={20} color="#FF8C42" />
        <Text style={styles.rateCardLabel}>Consultation Rate (₹ / min)</Text>
      </View>
      <Field label="Rate per Minute" value={form.rate} onChangeText={(t) => set('rate')(t.replace(/\D/g, ''))} keyboardType="numeric" placeholder="e.g. 20" required />
    </>
  );

  const renderStep4 = () => (
    <>
      <Text style={styles.socialNote}>Optional — helps seekers find and trust you</Text>
      <View style={styles.socialField}>
        <View style={[styles.socialIcon, { backgroundColor: '#1DA1F218' }]}>
          <Ionicons name="logo-twitter" size={18} color="#1DA1F2" />
        </View>
        <TextInput style={styles.socialInput} value={form.twitter} onChangeText={set('twitter')} placeholder="Twitter profile URL" placeholderTextColor="#AAAAAA" autoCapitalize="none" />
      </View>
      <View style={styles.socialField}>
        <View style={[styles.socialIcon, { backgroundColor: '#0077B518' }]}>
          <Ionicons name="logo-linkedin" size={18} color="#0077B5" />
        </View>
        <TextInput style={styles.socialInput} value={form.linkedin} onChangeText={set('linkedin')} placeholder="LinkedIn profile URL" placeholderTextColor="#AAAAAA" autoCapitalize="none" />
      </View>
      <View style={styles.socialField}>
        <View style={[styles.socialIcon, { backgroundColor: '#FF000018' }]}>
          <Ionicons name="logo-youtube" size={18} color="#FF0000" />
        </View>
        <TextInput style={styles.socialInput} value={form.youtube} onChangeText={set('youtube')} placeholder="YouTube channel URL" placeholderTextColor="#AAAAAA" autoCapitalize="none" />
      </View>
      <View style={styles.socialField}>
        <View style={[styles.socialIcon, { backgroundColor: '#1877F218' }]}>
          <Ionicons name="logo-facebook" size={18} color="#1877F2" />
        </View>
        <TextInput style={styles.socialInput} value={form.facebook} onChangeText={set('facebook')} placeholder="Facebook profile URL" placeholderTextColor="#AAAAAA" autoCapitalize="none" />
      </View>
    </>
  );

  const stepContent = [renderStep0, renderStep1, renderStep2, renderStep3, renderStep4];

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0052CC" />

        {/* Header */}
        <LinearGradient colors={['#0052CC', '#0066FF']} style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={goBack}>
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Mentor Application</Text>
            <Text style={styles.headerSub}>Step {step + 1} of {STEPS.length} — {STEPS[step].label}</Text>
          </View>
        </LinearGradient>

        {/* Step indicator */}
        <View style={styles.stepBar}>
          {STEPS.map((s, i) => (
            <React.Fragment key={i}>
              <View style={styles.stepItem}>
                <View style={[styles.stepDot, i <= step && styles.stepDotActive, i < step && styles.stepDotDone]}>
                  {i < step
                    ? <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                    : <Ionicons name={s.icon} size={14} color={i <= step ? '#FFFFFF' : '#AAAAAA'} />
                  }
                </View>
                <Text style={[styles.stepBarLabel, i <= step && styles.stepBarLabelActive]}>{s.label}</Text>
              </View>
              {i < STEPS.length - 1 && (
                <View style={[styles.stepLine, i < step && styles.stepLineDone]} />
              )}
            </React.Fragment>
          ))}
        </View>

        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${((step + 1) / STEPS.length) * 100}%` }]} />
        </View>

        {/* Form */}
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.stepHeading}>{STEPS[step].label} Details</Text>
          {stepContent[step]()}
          <View style={{ height: 24 }} />
        </ScrollView>

        {/* Footer CTA */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.nextBtn} onPress={goNext} activeOpacity={0.85} disabled={loading}>
            <LinearGradient colors={['#0052CC', '#0066FF']} style={styles.nextBtnGradient}>
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.nextBtnText}>
                    {step === STEPS.length - 1 ? 'Submit Application' : 'Continue'}
                  </Text>
                  <Ionicons name={step === STEPS.length - 1 ? 'checkmark-circle' : 'arrow-forward'} size={20} color="#FFFFFF" />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FF' },

  // Header
  header: {
    paddingTop: 52,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },

  // Step bar
  stepBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2FF',
  },
  stepItem: { alignItems: 'center', gap: 4 },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E8EEFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: { backgroundColor: '#0052CC' },
  stepDotDone: { backgroundColor: '#4CAF50' },
  stepBarLabel: { fontSize: 9, color: '#AAAAAA', fontWeight: '600' },
  stepBarLabelActive: { color: '#0052CC' },
  stepLine: { flex: 1, height: 2, backgroundColor: '#E8EEFF', marginBottom: 14 },
  stepLineDone: { backgroundColor: '#4CAF50' },

  // Progress
  progressTrack: { height: 3, backgroundColor: '#E8EEFF' },
  progressFill: { height: 3, backgroundColor: '#0052CC' },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { padding: 20 },
  stepHeading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 20,
    letterSpacing: -0.3,
  },

  // Fields
  fieldWrap: { marginBottom: 16 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 7 },
  required: { color: '#FF6B6B' },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    color: '#1A1A2E',
    borderWidth: 1.5,
    borderColor: '#E8EEFF',
  },
  inputMultiline: { height: 110, paddingTop: 13 },
  row: { flexDirection: 'row' },

  // Chips
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E8EEFF',
  },
  chipActive: { backgroundColor: '#0052CC', borderColor: '#0052CC' },
  chipText: { fontSize: 13, color: '#555', fontWeight: '500' },
  chipTextActive: { color: '#FFFFFF', fontWeight: '600' },

  // Photo
  photoPicker: {
    alignSelf: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  photoPreview: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: '#0052CC',
  },
  photoPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#C5D8FF',
    borderStyle: 'dashed',
    gap: 4,
  },
  photoPlaceholderText: { fontSize: 11, color: '#0052CC', fontWeight: '600' },
  photoEditBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF8C42',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },

  // Rate card hint
  rateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF5EE',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FFD9B8',
  },
  rateCardLabel: { fontSize: 13, color: '#FF8C42', fontWeight: '600' },

  // Social
  socialNote: {
    fontSize: 13,
    color: '#999',
    marginBottom: 20,
    textAlign: 'center',
  },
  socialField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E8EEFF',
    marginBottom: 12,
    paddingHorizontal: 12,
    gap: 10,
  },
  socialIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialInput: {
    flex: 1,
    fontSize: 14,
    color: '#1A1A2E',
    paddingVertical: 13,
  },

  // Footer
  footer: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEF2FF',
  },
  nextBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#0052CC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  nextBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  nextBtnText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});
