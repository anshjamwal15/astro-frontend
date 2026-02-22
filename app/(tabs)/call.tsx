import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useUser, getFirstName } from '../../contexts/UserContext';
import WalletBalance from '../../components/WalletBalance';

interface CallHistory {
  id: string;
  mentorId: string;
  mentorName: string;
  mentorPhoto: string;
  callType: 'voice' | 'video';
  callStatus: 'completed' | 'missed' | 'declined';
  duration: string;
  timestamp: string;
  cost: number;
}

// Mock call history data
const MOCK_CALL_HISTORY: CallHistory[] = [
  {
    id: '1',
    mentorId: 'mentor1',
    mentorName: 'Dr. Rajesh Kumar',
    mentorPhoto: 'https://via.placeholder.com/60x60/4A90E2/FFFFFF?text=RK',
    callType: 'video',
    callStatus: 'completed',
    duration: '15:30',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    cost: 255.0,
  },
  {
    id: '2',
    mentorId: 'mentor2',
    mentorName: 'Priya Sharma',
    mentorPhoto: 'https://via.placeholder.com/60x60/E91E63/FFFFFF?text=PS',
    callType: 'voice',
    callStatus: 'completed',
    duration: '22:45',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    cost: 386.65,
  },
  {
    id: '3',
    mentorId: 'mentor3',
    mentorName: 'Amit Patel',
    mentorPhoto: 'https://via.placeholder.com/60x60/9C27B0/FFFFFF?text=AP',
    callType: 'video',
    callStatus: 'missed',
    duration: '0:00',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    cost: 0,
  },
  {
    id: '4',
    mentorId: 'mentor4',
    mentorName: 'Sneha Reddy',
    mentorPhoto: 'https://via.placeholder.com/60x60/FF9800/FFFFFF?text=SR',
    callType: 'voice',
    callStatus: 'completed',
    duration: '18:20',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    cost: 311.40,
  },
  {
    id: '5',
    mentorId: 'mentor5',
    mentorName: 'Vikram Singh',
    mentorPhoto: 'https://via.placeholder.com/60x60/4CAF50/FFFFFF?text=VS',
    callType: 'video',
    callStatus: 'declined',
    duration: '0:00',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    cost: 0,
  },
  {
    id: '6',
    mentorId: 'mentor6',
    mentorName: 'Anjali Mehta',
    mentorPhoto: 'https://via.placeholder.com/60x60/F44336/FFFFFF?text=AM',
    callType: 'voice',
    callStatus: 'completed',
    duration: '25:10',
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    cost: 427.70,
  },
  {
    id: '7',
    mentorId: 'mentor7',
    mentorName: 'Rahul Verma',
    mentorPhoto: 'https://via.placeholder.com/60x60/2196F3/FFFFFF?text=RV',
    callType: 'video',
    callStatus: 'completed',
    duration: '12:05',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    cost: 204.85,
  },
  {
    id: '8',
    mentorId: 'mentor8',
    mentorName: 'Kavita Joshi',
    mentorPhoto: 'https://via.placeholder.com/60x60/00BCD4/FFFFFF?text=KJ',
    callType: 'voice',
    callStatus: 'completed',
    duration: '30:00',
    timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    cost: 510.0,
  },
  {
    id: '9',
    mentorId: 'mentor9',
    mentorName: 'Suresh Nair',
    mentorPhoto: 'https://via.placeholder.com/60x60/673AB7/FFFFFF?text=SN',
    callType: 'video',
    callStatus: 'missed',
    duration: '0:00',
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    cost: 0,
  },
  {
    id: '10',
    mentorId: 'mentor10',
    mentorName: 'Deepa Iyer',
    mentorPhoto: 'https://via.placeholder.com/60x60/795548/FFFFFF?text=DI',
    callType: 'voice',
    callStatus: 'completed',
    duration: '20:15',
    timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    cost: 344.55,
  },
];

export default function CallScreen() {
  const [callHistory] = useState<CallHistory[]>(MOCK_CALL_HISTORY);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const { user } = useUser();

  // Get user's first name for greeting
  const firstName = user ? getFirstName(user.name) : 'User';

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const getCallStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'missed': return '#FF9800';
      case 'declined': return '#F44336';
      default: return '#666';
    }
  };

  const getCallStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return 'checkmark-circle';
      case 'missed': return 'alert-circle';
      case 'declined': return 'close-circle';
      default: return 'help-circle';
    }
  };

  const handleCallHistoryPress = (call: CallHistory) => {
    Alert.alert(
      'Call Details',
      `Mentor: ${call.mentorName}\nType: ${call.callType}\nDuration: ${call.duration}\nCost: ₹${call.cost.toFixed(2)}`,
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#0052CC" />
      
      {/* Header */}
      <LinearGradient
        colors={['#0052CC', '#0066FF']}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <View style={styles.userInfo}>
            <Image 
              source={{ uri: user?.profilePicture || `https://via.placeholder.com/40x40/4A90E2/FFFFFF?text=${firstName.charAt(0)}` }}
              style={styles.userAvatar}
            />
            <Text style={styles.greeting}>Hi {firstName}</Text>
          </View>
          
          <WalletBalance 
            onBalanceUpdate={() => {}} // No need for callback since WalletBalance handles its own state
            showAddMoney={true}
          />
        </View>
      </LinearGradient>

      {/* Call History Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {callHistory.length > 0 ? (
          callHistory.map((call) => (
            <TouchableOpacity
              key={call.id}
              style={styles.historyItem}
              onPress={() => handleCallHistoryPress(call)}
            >
              <View style={styles.historyImageContainer}>
                {call.mentorPhoto && !imageErrors.has(call.id) ? (
                  <Image 
                    source={{ uri: call.mentorPhoto }} 
                    style={styles.historyImage}
                    onError={() => {
                      setImageErrors(prev => new Set(prev).add(call.id));
                    }}
                  />
                ) : (
                  <View style={[styles.historyImage, styles.defaultImageContainer]}>
                    <Ionicons name="person" size={30} color="#999" />
                  </View>
                )}
              </View>
              
              <View style={styles.historyContent}>
                <View style={styles.historyHeader}>
                  <Text style={styles.historyName}>{call.mentorName}</Text>
                  <Text style={styles.historyTime}>{formatTime(call.timestamp)}</Text>
                </View>
                
                <View style={styles.historyFooter}>
                  <View style={styles.callInfo}>
                    <Ionicons 
                      name={call.callType === 'video' ? 'videocam' : 'call'} 
                      size={16} 
                      color={getCallStatusColor(call.callStatus)} 
                    />
                    <Text style={[styles.callType, { color: getCallStatusColor(call.callStatus) }]}>
                      {call.callType === 'video' ? 'Video' : 'Voice'} • {call.duration}
                    </Text>
                  </View>
                  
                  <View style={styles.callStatusContainer}>
                    <Ionicons 
                      name={getCallStatusIcon(call.callStatus)} 
                      size={16} 
                      color={getCallStatusColor(call.callStatus)} 
                    />
                    {call.cost > 0 && (
                      <Text style={styles.callCost}>₹{call.cost.toFixed(2)}</Text>
                    )}
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.noResultsContainer}>
            <Ionicons name="call-outline" size={64} color="#CCC" />
            <Text style={styles.noResultsText}>No call history</Text>
            <Text style={styles.noResultsSubtext}>Your calls will appear here</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  greeting: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  noResultsText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
    textAlign: 'center',
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  
  // History Item Styles
  historyItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  historyImageContainer: {
    position: 'relative',
    marginRight: 15,
  },
  historyImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  defaultImageContainer: {
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyContent: {
    flex: 1,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  historyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  historyTime: {
    fontSize: 12,
    color: '#999',
  },
  historyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  // Call History Styles
  callInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  callType: {
    fontSize: 14,
    marginLeft: 6,
    fontWeight: '500',
  },
  callStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  callCost: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
  },
});