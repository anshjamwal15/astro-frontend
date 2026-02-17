import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function MentorConsultations() {
  const [selectedTab, setSelectedTab] = useState('pending');
  
  const consultations = {
    pending: [
      {
        id: '1',
        clientName: 'Priya Sharma',
        type: 'Chat',
        scheduledTime: '2:30 PM Today',
        duration: '30 min',
        amount: '₹250',
        topic: 'Career Guidance',
      },
      {
        id: '2',
        clientName: 'Rahul Kumar',
        type: 'Video Call',
        scheduledTime: '4:00 PM Today',
        duration: '45 min',
        amount: '₹375',
        topic: 'Relationship Issues',
      },
    ],
    ongoing: [
      {
        id: '3',
        clientName: 'Anita Patel',
        type: 'Chat',
        startedAt: '1:15 PM',
        duration: '15 min elapsed',
        amount: '₹250',
        topic: 'Health Concerns',
      },
    ],
    completed: [
      {
        id: '4',
        clientName: 'Suresh Gupta',
        type: 'Video Call',
        completedAt: '11:30 AM Today',
        duration: '40 min',
        amount: '₹400',
        topic: 'Business Consultation',
        rating: 5,
      },
      {
        id: '5',
        clientName: 'Meera Singh',
        type: 'Chat',
        completedAt: '10:00 AM Today',
        duration: '25 min',
        amount: '₹200',
        topic: 'Marriage Compatibility',
        rating: 4,
      },
    ],
  };

  const handleAcceptConsultation = (id: string) => {
    Alert.alert(
      'Accept Consultation',
      'Are you ready to start this consultation?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Accept', onPress: () => Alert.alert('Success', 'Consultation accepted!') },
      ]
    );
  };

  const handleDeclineConsultation = (id: string) => {
    Alert.alert(
      'Decline Consultation',
      'Are you sure you want to decline this consultation?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Decline', style: 'destructive', onPress: () => Alert.alert('Declined', 'Consultation declined.') },
      ]
    );
  };

  const renderConsultationCard = (consultation: any, type: string) => (
    <View key={consultation.id} style={styles.consultationCard}>
      <View style={styles.consultationHeader}>
        <View style={styles.clientInfo}>
          <Text style={styles.clientName}>{consultation.clientName}</Text>
          <View style={styles.consultationType}>
            <Ionicons 
              name={consultation.type === 'Chat' ? 'chatbubbles' : 'videocam'} 
              size={14} 
              color="#666" 
            />
            <Text style={styles.typeText}>{consultation.type}</Text>
          </View>
        </View>
        <Text style={styles.amount}>{consultation.amount}</Text>
      </View>

      <Text style={styles.topic}>{consultation.topic}</Text>

      <View style={styles.consultationDetails}>
        <View style={styles.timeInfo}>
          <Ionicons name="time" size={14} color="#666" />
          <Text style={styles.timeText}>
            {type === 'pending' && consultation.scheduledTime}
            {type === 'ongoing' && `Started: ${consultation.startedAt}`}
            {type === 'completed' && `Completed: ${consultation.completedAt}`}
          </Text>
        </View>
        <View style={styles.durationInfo}>
          <Ionicons name="hourglass" size={14} color="#666" />
          <Text style={styles.durationText}>{consultation.duration}</Text>
        </View>
      </View>

      {type === 'completed' && consultation.rating && (
        <View style={styles.rating}>
          <Text style={styles.ratingText}>Rating: </Text>
          {[...Array(5)].map((_, i) => (
            <Ionicons
              key={`rating-${consultation.id}-${i}`}
              name={i < consultation.rating ? 'star' : 'star-outline'}
              size={16}
              color="#FF8C42"
            />
          ))}
        </View>
      )}

      <View style={styles.consultationActions}>
        {type === 'pending' && (
          <>
            <TouchableOpacity 
              style={styles.declineButton}
              onPress={() => handleDeclineConsultation(consultation.id)}
            >
              <Text style={styles.declineButtonText}>Decline</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.acceptButton}
              onPress={() => handleAcceptConsultation(consultation.id)}
            >
              <Text style={styles.acceptButtonText}>Accept</Text>
            </TouchableOpacity>
          </>
        )}
        
        {type === 'ongoing' && (
          <TouchableOpacity style={styles.joinButton}>
            <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
            <Text style={styles.joinButtonText}>Continue</Text>
          </TouchableOpacity>
        )}
        
        {type === 'completed' && (
          <TouchableOpacity style={styles.viewButton}>
            <Text style={styles.viewButtonText}>View Details</Text>
          </TouchableOpacity>
        )}
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
        <Text style={styles.headerTitle}>Consultations</Text>
        <Text style={styles.headerSubtitle}>Manage your client sessions</Text>
      </LinearGradient>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {['pending', 'ongoing', 'completed'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, selectedTab === tab && styles.activeTab]}
            onPress={() => setSelectedTab(tab)}
          >
            <Text style={[styles.tabText, selectedTab === tab && styles.activeTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {consultations[tab as keyof typeof consultations].length}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {consultations[selectedTab as keyof typeof consultations].length > 0 ? (
          consultations[selectedTab as keyof typeof consultations].map((consultation) =>
            renderConsultationCard(consultation, selectedTab)
          )
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color="#CCC" />
            <Text style={styles.emptyTitle}>No {selectedTab} consultations</Text>
            <Text style={styles.emptySubtitle}>
              {selectedTab === 'pending' && 'New consultation requests will appear here'}
              {selectedTab === 'ongoing' && 'Active consultations will appear here'}
              {selectedTab === 'completed' && 'Completed consultations will appear here'}
            </Text>
          </View>
        )}
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: '#0052CC',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    marginRight: 6,
  },
  activeTabText: {
    color: '#333',
    fontWeight: '600',
  },
  badge: {
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  consultationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  consultationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  consultationType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  typeText: {
    fontSize: 14,
    color: '#666',
  },
  amount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4CAF50',
  },
  topic: {
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
    fontStyle: 'italic',
  },
  consultationDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 14,
    color: '#666',
  },
  durationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    fontSize: 14,
    color: '#666',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
    marginRight: 4,
  },
  consultationActions: {
    flexDirection: 'row',
    gap: 10,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  declineButton: {
    flex: 1,
    backgroundColor: '#FF5722',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  declineButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  joinButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  viewButton: {
    flex: 1,
    backgroundColor: '#9E9E9E',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  viewButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});