import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const zodiacSigns = [
  { name: 'Aries', symbol: '♈', dates: 'Mar 21 - Apr 19' },
  { name: 'Taurus', symbol: '♉', dates: 'Apr 20 - May 20' },
  { name: 'Gemini', symbol: '♊', dates: 'May 21 - Jun 20' },
  { name: 'Cancer', symbol: '♋', dates: 'Jun 21 - Jul 22' },
  { name: 'Leo', symbol: '♌', dates: 'Jul 23 - Aug 22' },
  { name: 'Virgo', symbol: '♍', dates: 'Aug 23 - Sep 22' },
  { name: 'Libra', symbol: '♎', dates: 'Sep 23 - Oct 22' },
  { name: 'Scorpio', symbol: '♏', dates: 'Oct 23 - Nov 21' },
  { name: 'Sagittarius', symbol: '♐', dates: 'Nov 22 - Dec 21' },
  { name: 'Capricorn', symbol: '♑', dates: 'Dec 22 - Jan 19' },
  { name: 'Aquarius', symbol: '♒', dates: 'Jan 20 - Feb 18' },
  { name: 'Pisces', symbol: '♓', dates: 'Feb 19 - Mar 20' },
];

export default function HoroscopeScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#0052CC" />
      
      {/* Header */}
      <LinearGradient
        colors={['#0052CC', '#0066FF']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Horoscope</Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Your Zodiac Sign</Text>
          
          <View style={styles.zodiacGrid}>
            {zodiacSigns.map((sign) => (
              <TouchableOpacity key={sign.name} style={styles.zodiacCard}>
                <Text style={styles.zodiacSymbol}>{sign.symbol}</Text>
                <Text style={styles.zodiacName}>{sign.name}</Text>
                <Text style={styles.zodiacDates}>{sign.dates}</Text>
              </TouchableOpacity>
            ))}
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
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  zodiacGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  zodiacCard: {
    width: '48%',
    backgroundColor: '#F8F8F8',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  zodiacSymbol: {
    fontSize: 30,
    marginBottom: 8,
  },
  zodiacName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  zodiacDates: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});