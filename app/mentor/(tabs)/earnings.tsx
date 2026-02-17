import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function MentorEarnings() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  
  const earningsData = {
    today: {
      total: 2400,
      consultations: 8,
      avgPerConsultation: 300,
      hours: 6.5,
    },
    week: {
      total: 12800,
      consultations: 42,
      avgPerConsultation: 305,
      hours: 32,
    },
    month: {
      total: 45600,
      consultations: 156,
      avgPerConsultation: 292,
      hours: 124,
    },
    year: {
      total: 234500,
      consultations: 1247,
      avgPerConsultation: 188,
      hours: 986,
    },
  };

  const recentTransactions = [
    {
      id: '1',
      clientName: 'Priya Sharma',
      type: 'Chat Consultation',
      amount: 250,
      date: '2 hours ago',
      status: 'completed',
    },
    {
      id: '2',
      clientName: 'Rahul Kumar',
      type: 'Video Call',
      amount: 400,
      date: '5 hours ago',
      status: 'completed',
    },
    {
      id: '3',
      clientName: 'Anita Patel',
      type: 'Chat Consultation',
      amount: 300,
      date: 'Yesterday',
      status: 'completed',
    },
    {
      id: '4',
      clientName: 'Suresh Gupta',
      type: 'Video Call',
      amount: 450,
      date: 'Yesterday',
      status: 'completed',
    },
    {
      id: '5',
      clientName: 'Meera Singh',
      type: 'Chat Consultation',
      amount: 200,
      date: '2 days ago',
      status: 'pending',
    },
  ];

  const currentData = earningsData[selectedPeriod as keyof typeof earningsData];

  const StatCard = ({ title, value, icon, color = '#4CAF50', subtitle }: any) => (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color }]}>
        <Ionicons name={icon} size={24} color="#FFFFFF" />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
        {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
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
        <Text style={styles.headerTitle}>Earnings</Text>
        <Text style={styles.headerSubtitle}>Track your income and performance</Text>
      </LinearGradient>

      {/* Period Selector */}
      <View style={styles.periodSelector}>
        {['today', 'week', 'month', 'year'].map((period) => (
          <TouchableOpacity
            key={period}
            style={[styles.periodButton, selectedPeriod === period && styles.activePeriodButton]}
            onPress={() => setSelectedPeriod(period)}
          >
            <Text style={[styles.periodText, selectedPeriod === period && styles.activePeriodText]}>
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Main Earnings Card */}
        <View style={styles.mainEarningsCard}>
          <Text style={styles.mainEarningsLabel}>Total Earnings</Text>
          <Text style={styles.mainEarningsValue}>₹{currentData.total.toLocaleString()}</Text>
          <Text style={styles.mainEarningsPeriod}>This {selectedPeriod}</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Overview</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="Consultations"
              value={currentData.consultations}
              icon="chatbubbles"
              color="#2196F3"
              subtitle={`${currentData.hours}h total`}
            />
            <StatCard
              title="Avg per Session"
              value={`₹${currentData.avgPerConsultation}`}
              icon="trending-up"
              color="#4CAF50"
            />
          </View>
        </View>

        {/* Earnings Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Earnings Breakdown</Text>
          <View style={styles.breakdownCard}>
            <View style={styles.breakdownRow}>
              <View style={styles.breakdownItem}>
                <Text style={styles.breakdownLabel}>Chat Consultations</Text>
                <Text style={styles.breakdownValue}>₹{Math.floor(currentData.total * 0.6).toLocaleString()}</Text>
                <Text style={styles.breakdownPercentage}>60%</Text>
              </View>
            </View>
            <View style={styles.breakdownRow}>
              <View style={styles.breakdownItem}>
                <Text style={styles.breakdownLabel}>Video Calls</Text>
                <Text style={styles.breakdownValue}>₹{Math.floor(currentData.total * 0.4).toLocaleString()}</Text>
                <Text style={styles.breakdownPercentage}>40%</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {recentTransactions.map((transaction) => (
            <View key={transaction.id} style={styles.transactionCard}>
              <View style={styles.transactionInfo}>
                <Text style={styles.clientName}>{transaction.clientName}</Text>
                <Text style={styles.transactionType}>{transaction.type}</Text>
                <Text style={styles.transactionDate}>{transaction.date}</Text>
              </View>
              <View style={styles.transactionAmount}>
                <Text style={styles.amountValue}>₹{transaction.amount}</Text>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: transaction.status === 'completed' ? '#E8F5E8' : '#FFF3E0' }
                ]}>
                  <Text style={[
                    styles.statusText,
                    { color: transaction.status === 'completed' ? '#4CAF50' : '#FF9800' }
                  ]}>
                    {transaction.status}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Payout Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payout Information</Text>
          <View style={styles.payoutCard}>
            <View style={styles.payoutRow}>
              <Text style={styles.payoutLabel}>Available Balance</Text>
              <Text style={styles.payoutValue}>₹{(currentData.total * 0.85).toLocaleString()}</Text>
            </View>
            <View style={styles.payoutRow}>
              <Text style={styles.payoutLabel}>Pending Clearance</Text>
              <Text style={styles.payoutValue}>₹{(currentData.total * 0.15).toLocaleString()}</Text>
            </View>
            <View style={styles.payoutRow}>
              <Text style={styles.payoutLabel}>Next Payout</Text>
              <Text style={styles.payoutValue}>15th Jan 2026</Text>
            </View>
            
            <TouchableOpacity style={styles.withdrawButton}>
              <Ionicons name="card" size={16} color="#FFFFFF" />
              <Text style={styles.withdrawButtonText}>Request Withdrawal</Text>
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
    backgroundColor: '#F8F8F8',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  activePeriodButton: {
    backgroundColor: '#0052CC',
  },
  periodText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activePeriodText: {
    color: '#333',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  mainEarningsCard: {
    backgroundColor: '#4CAF50',
    margin: 20,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  mainEarningsLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  mainEarningsValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  mainEarningsPeriod: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  viewAllText: {
    fontSize: 14,
    color: '#0052CC',
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
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
    marginBottom: 2,
  },
  statSubtitle: {
    fontSize: 10,
    color: '#999',
  },
  breakdownCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  breakdownRow: {
    marginBottom: 15,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownLabel: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  breakdownValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 10,
  },
  breakdownPercentage: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  transactionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  transactionInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  transactionType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#999',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  payoutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  payoutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  payoutLabel: {
    fontSize: 16,
    color: '#666',
  },
  payoutValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  withdrawButton: {
    backgroundColor: '#2196F3',
    borderRadius: 10,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    gap: 8,
  },
  withdrawButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});