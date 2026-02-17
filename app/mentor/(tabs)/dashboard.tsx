import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function MentorDashboard() {
  const [isOnline, setIsOnline] = useState(true);
  const [mentorData] = useState({
    name: 'Dr. Rajesh Sharma',
    specialization: 'Vedic Astrology, Numerology',
    rating: 4.8,
    totalConsultations: 1247,
    todayConsultations: 8,
    pendingConsultations: 3,
    earnings: {
      today: 2400,
      thisMonth: 45600,
      total: 234500,
    },
    reviews: 156,
  });

  const handleOnlineToggle = (value: boolean) => {
    setIsOnline(value);
    Alert.alert(
      'Status Updated',
      `You are now ${value ? 'online' : 'offline'}. ${
        value ? 'You will receive consultation requests.' : 'You will not receive new consultation requests.'
      }`
    );
  };

  const StatCard = ({ title, value, icon, color = '#4CAF50' }: any) => (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color }]}>
        <Ionicons name={icon} size={24} color="#FFFFFF" />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0052CC" />
      
      {/* Header */}
      <LinearGradient
        colors={['#0052CC', '#0066FF']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.mentorInfo}>
            <Text style={styles.greeting}>Welcome back!</Text>
            <Text style={styles.mentorName}>{mentorData.name}</Text>
            <Text style={styles.specialization}>{mentorData.specialization}</Text>
          </View>
          
          <Link href="/mentor/(tabs)/settings" asChild>
            <TouchableOpacity style={styles.settingsButton}>
              <Ionicons name="settings" size={24} color="#333" />
            </TouchableOpacity>
          </Link>
        </View>

        {/* Online Status Toggle */}
        <View style={styles.statusContainer}>
          <View style={styles.statusInfo}>
            <View style={[styles.statusDot, { backgroundColor: isOnline ? '#4CAF50' : '#FF5722' }]} />
            <Text style={styles.statusText}>
              {isOnline ? 'You are Online' : 'You are Offline'}
            </Text>
          </View>
          <Switch
            value={isOnline}
            onValueChange={handleOnlineToggle}
            trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
            thumbColor={isOnline ? '#FFFFFF' : '#FFFFFF'}
          />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Overview</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="Consultations Today"
              value={mentorData.todayConsultations}
              icon="chatbubbles"
              color="#2196F3"
            />
            <StatCard
              title="Pending Requests"
              value={mentorData.pendingConsultations}
              icon="time"
              color="#FF9800"
            />
            <StatCard
              title="Today's Earnings"
              value={`₹${mentorData.earnings.today}`}
              icon="wallet"
              color="#4CAF50"
            />
            <StatCard
              title="Rating"
              value={`${mentorData.rating} ⭐`}
              icon="star"
              color="#FF8C42"
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <Link href="/mentor/(tabs)/chat" asChild>
              <TouchableOpacity style={styles.actionCard}>
                <Ionicons name="chatbubble-ellipses" size={32} color="#2196F3" />
                <Text style={styles.actionTitle}>Client Chats</Text>
                <Text style={styles.actionSubtitle}>Respond to messages</Text>
              </TouchableOpacity>
            </Link>

            <Link href="/mentor/(tabs)/consultations" asChild>
              <TouchableOpacity style={styles.actionCard}>
                <Ionicons name="calendar" size={32} color="#9C27B0" />
                <Text style={styles.actionTitle}>Consultations</Text>
                <Text style={styles.actionSubtitle}>Manage sessions</Text>
              </TouchableOpacity>
            </Link>

            <Link href="/mentor/(tabs)/earnings" asChild>
              <TouchableOpacity style={styles.actionCard}>
                <Ionicons name="analytics" size={32} color="#4CAF50" />
                <Text style={styles.actionTitle}>Earnings Report</Text>
                <Text style={styles.actionSubtitle}>View your income</Text>
              </TouchableOpacity>
            </Link>

            <Link href="/mentor/(tabs)/profile" asChild>
              <TouchableOpacity style={styles.actionCard}>
                <Ionicons name="person" size={32} color="#FF9800" />
                <Text style={styles.actionTitle}>Update Profile</Text>
                <Text style={styles.actionSubtitle}>Edit your details</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>

        {/* Performance Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Summary</Text>
          <View style={styles.performanceCard}>
            <View style={styles.performanceRow}>
              <Text style={styles.performanceLabel}>Total Consultations</Text>
              <Text style={styles.performanceValue}>{mentorData.totalConsultations}</Text>
            </View>
            <View style={styles.performanceRow}>
              <Text style={styles.performanceLabel}>Customer Reviews</Text>
              <Text style={styles.performanceValue}>{mentorData.reviews}</Text>
            </View>
            <View style={styles.performanceRow}>
              <Text style={styles.performanceLabel}>This Month Earnings</Text>
              <Text style={styles.performanceValue}>₹{mentorData.earnings.thisMonth}</Text>
            </View>
            <View style={styles.performanceRow}>
              <Text style={styles.performanceLabel}>Total Earnings</Text>
              <Text style={styles.performanceValue}>₹{mentorData.earnings.total}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  mentorInfo: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  mentorName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  specialization: {
    fontSize: 14,
    color: '#666',
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 10,
    marginBottom: 4,
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  performanceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  performanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  performanceLabel: {
    fontSize: 16,
    color: '#666',
  },
  performanceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});