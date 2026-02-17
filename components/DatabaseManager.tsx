import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { ApiService } from '../services/apiService';

export default function DatabaseManager() {
  const [loading, setLoading] = useState(false);
  const [mentors, setMentors] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  const loadMentors = async () => {
    setLoading(true);
    try {
      const response = await ApiService.getMentors();
      if (response.success) {
        setMentors(response.data || []);
        Alert.alert('Success', `Loaded ${response.data?.length || 0} mentors`);
      } else {
        Alert.alert('Error', response.message || 'Failed to load mentors');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load mentors');
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    setLoading(true);
    try {
      const response = await ApiService.testConnection();
      if (response.success) {
        Alert.alert('Success', response.message || 'Connection successful');
      } else {
        Alert.alert('Error', response.message || 'Connection failed');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Connection test failed');
    } finally {
      setLoading(false);
    }
  };

  const clearData = () => {
    Alert.alert(
      'Clear Data',
      'This will clear all local data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            setMentors([]);
            setUsers([]);
            Alert.alert('Success', 'Local data cleared');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Database Manager</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Connection</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={testConnection}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Test Connection</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={loadMentors}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Load Mentors</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.dangerButton]}
          onPress={clearData}
          disabled={loading}
        >
          <Text style={[styles.buttonText, styles.dangerButtonText]}>Clear Local Data</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Statistics</Text>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Mentors:</Text>
          <Text style={styles.statValue}>{mentors.length}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Users:</Text>
          <Text style={styles.statValue}>{users.length}</Text>
        </View>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007BFF" />
          <Text style={styles.loadingText}>Processing...</Text>
        </View>
      )}

      {mentors.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mentors ({mentors.length})</Text>
          {mentors.slice(0, 5).map((mentor, index) => (
            <View key={mentor.id || `mentor-${index}`} style={styles.dataItem}>
              <Text style={styles.dataName}>{mentor.name}</Text>
              <Text style={styles.dataEmail}>{mentor.email}</Text>
              <Text style={styles.dataStatus}>Status: {mentor.status}</Text>
            </View>
          ))}
          {mentors.length > 5 && (
            <Text style={styles.moreText}>... and {mentors.length - 5} more</Text>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
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
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#007BFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  dangerButton: {
    backgroundColor: '#dc3545',
  },
  dangerButtonText: {
    color: '#fff',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  statLabel: {
    fontSize: 16,
    color: '#666',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  dataItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  dataName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  dataEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  dataStatus: {
    fontSize: 12,
    color: '#28a745',
    marginTop: 2,
  },
  moreText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
  },
});