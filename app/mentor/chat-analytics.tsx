import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function ChatAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('month');
  
  const analyticsData = {
    week: {
      totalMessages: 234,
      responseTime: '2.5 min',
      activeChats: 12,
      newClients: 3,
      clientSatisfaction: 4.8,
      busyHours: '2-4 PM',
      messagesByDay: [
        { day: 'Mon', sent: 45, received: 38 },
        { day: 'Tue', sent: 52, received: 41 },
        { day: 'Wed', sent: 38, received: 35 },
        { day: 'Thu', sent: 41, received: 39 },
        { day: 'Fri', sent: 48, received: 42 },
        { day: 'Sat', sent: 35, received: 28 },
        { day: 'Sun', sent: 29, received: 25 },
      ],
    },
    month: {
      totalMessages: 1247,
      responseTime: '3.2 min',
      activeChats: 45,
      newClients: 18,
      clientSatisfaction: 4.7,
      busyHours: '7-9 PM',
      messagesByDay: [
        { day: 'Week 1', sent: 312, received: 289 },
        { day: 'Week 2', sent: 298, received: 276 },
        { day: 'Week 3', sent: 334, received: 301 },
        { day: 'Week 4', sent: 289, received: 267 },
      ],
    },
    quarter: {
      totalMessages: 3891,
      responseTime: '2.8 min',
      activeChats: 89,
      newClients: 67,
      clientSatisfaction: 4.9,
      busyHours: '6-8 PM',
      messagesByDay: [
        { day: 'Month 1', sent: 1234, received: 1156 },
        { day: 'Month 2', sent: 1298, received: 1201 },
        { day: 'Month 3', sent: 1359, received: 1243 },
      ],
    },
  };

  const currentData = analyticsData[selectedPeriod];

  const StatCard = ({ 
    title, 
    value, 
    subtitle, 
    icon, 
    color = '#4CAF50',
    trend 
  }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: string;
    color?: string;
    trend?: 'up' | 'down' | 'stable';
  }) => (
    <View style={styles.statCard}>
      <View style={styles.statHeader}>
        <View style={[styles.statIcon, { backgroundColor: color }]}>
          <Ionicons name={icon as any} size={20} color="#FFFFFF" />
        </View>
        {trend && (
          <View style={styles.trendContainer}>
            <Ionicons 
              name={trend === 'up' ? 'trending-up' : trend === 'down' ? 'trending-down' : 'remove'} 
              size={16} 
              color={trend === 'up' ? '#4CAF50' : trend === 'down' ? '#FF4444' : '#999'} 
            />
          </View>
        )}
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  const MessageChart = () => (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Messages Overview</Text>
      <View style={styles.chartLegend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#0052CC' }]} />
          <Text style={styles.legendText}>Sent</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#4CAF50' }]} />
          <Text style={styles.legendText}>Received</Text>
        </View>
      </View>
      
      <View style={styles.chart}>
        {currentData.messagesByDay.map((item) => {
          const maxValue = Math.max(...currentData.messagesByDay.map(d => Math.max(d.sent, d.received)));
          const sentHeight = (item.sent / maxValue) * 120;
          const receivedHeight = (item.received / maxValue) * 120;
          
          return (
            <View key={item.day} style={styles.chartBar}>
              <View style={styles.barContainer}>
                <View style={[styles.bar, { height: sentHeight, backgroundColor: '#0052CC' }]} />
                <View style={[styles.bar, { height: receivedHeight, backgroundColor: '#4CAF50' }]} />
              </View>
              <Text style={styles.barLabel}>{item.day}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );

  const TopClients = () => {
    const topClients = [
      { name: 'Priya Sharma', messages: 45, lastActive: '2 hours ago', avatar: '👩' },
      { name: 'Rahul Kumar', messages: 38, lastActive: '5 hours ago', avatar: '👨' },
      { name: 'Anita Patel', messages: 32, lastActive: '1 day ago', avatar: '👩' },
      { name: 'Vikash Singh', messages: 28, lastActive: '2 days ago', avatar: '👨' },
      { name: 'Meera Joshi', messages: 24, lastActive: '3 days ago', avatar: '👩' },
    ];

    return (
      <View style={styles.topClientsContainer}>
        <Text style={styles.sectionTitle}>Most Active Clients</Text>
        {topClients.map((client) => (
          <View key={client.name} style={styles.clientItem}>
            <View style={styles.clientLeft}>
              <Text style={styles.clientAvatar}>{client.avatar}</Text>
              <View style={styles.clientInfo}>
                <Text style={styles.clientName}>{client.name}</Text>
                <Text style={styles.clientLastActive}>Last active: {client.lastActive}</Text>
              </View>
            </View>
            <View style={styles.clientRight}>
              <Text style={styles.clientMessages}>{client.messages}</Text>
              <Text style={styles.clientMessagesLabel}>messages</Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0052CC" />
      
      {/* Header */}
      <LinearGradient
        colors={['#0052CC', '#0066FF']}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chat Analytics</Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Period Selection */}
        <View style={styles.periodContainer}>
          {(['week', 'month', 'quarter'] as const).map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.periodButtonActive
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text style={[
                styles.periodText,
                selectedPeriod === period && styles.periodTextActive
              ]}>
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Key Metrics */}
        <View style={styles.metricsContainer}>
          <StatCard
            title="Total Messages"
            value={currentData.totalMessages}
            icon="chatbubbles"
            color="#2196F3"
            trend="up"
          />
          <StatCard
            title="Avg Response Time"
            value={currentData.responseTime}
            icon="time"
            color="#FF9800"
            trend="down"
          />
          <StatCard
            title="Active Chats"
            value={currentData.activeChats}
            icon="chatbubble-ellipses"
            color="#4CAF50"
            trend="up"
          />
          <StatCard
            title="New Clients"
            value={currentData.newClients}
            icon="person-add"
            color="#9C27B0"
            trend="up"
          />
        </View>

        {/* Additional Metrics */}
        <View style={styles.additionalMetrics}>
          <View style={styles.metricRow}>
            <View style={styles.metricItem}>
              <Ionicons name="star" size={20} color="#FF8C42" />
              <Text style={styles.metricLabel}>Client Satisfaction</Text>
              <Text style={styles.metricValue}>{currentData.clientSatisfaction}/5.0</Text>
            </View>
            <View style={styles.metricItem}>
              <Ionicons name="time" size={20} color="#FF9800" />
              <Text style={styles.metricLabel}>Busiest Hours</Text>
              <Text style={styles.metricValue}>{currentData.busyHours}</Text>
            </View>
          </View>
        </View>

        {/* Message Chart */}
        <MessageChart />

        {/* Top Clients */}
        <TopClients />

        {/* Insights */}
        <View style={styles.insightsContainer}>
          <Text style={styles.sectionTitle}>Key Insights</Text>
          <View style={styles.insightItem}>
            <Ionicons name="trending-up" size={16} color="#4CAF50" />
            <Text style={styles.insightText}>
              Your response time improved by 15% this {selectedPeriod}
            </Text>
          </View>
          <View style={styles.insightItem}>
            <Ionicons name="people" size={16} color="#2196F3" />
            <Text style={styles.insightText}>
              {currentData.newClients} new clients started conversations
            </Text>
          </View>
          <View style={styles.insightItem}>
            <Ionicons name="star" size={16} color="#FF8C42" />
            <Text style={styles.insightText}>
              Client satisfaction increased to {currentData.clientSatisfaction}/5.0
            </Text>
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
    height: 100,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingBottom: 20,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  periodContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 10,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#0052CC',
  },
  periodText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  periodTextActive: {
    color: '#FFFFFF',
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 15,
  },
  statCard: {
    width: (width - 55) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  statTitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  statSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  additionalMetrics: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 14,
    color: '#666',
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 150,
  },
  chartBar: {
    alignItems: 'center',
    flex: 1,
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    marginBottom: 10,
  },
  bar: {
    width: 12,
    borderRadius: 6,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  topClientsContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  clientItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  clientLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  clientAvatar: {
    fontSize: 24,
    marginRight: 12,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  clientLastActive: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  clientRight: {
    alignItems: 'flex-end',
  },
  clientMessages: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0052CC',
  },
  clientMessagesLabel: {
    fontSize: 12,
    color: '#666',
  },
  insightsContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
});