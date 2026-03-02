/**
 * Example usage of Network Logger
 * 
 * This component demonstrates how the network logger automatically
 * intercepts and logs all API calls made with fetch.
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { disableNetworkLogger, enableNetworkLogger } from './NetworkLogger';

export default function NetworkLoggerExample() {
  const [response, setResponse] = useState<string>('');
  const [isLoggingEnabled, setIsLoggingEnabled] = useState(true);

  const testGetRequest = async () => {
    try {
      setResponse('Loading...');
      const res = await fetch('https://jsonplaceholder.typicode.com/posts/1');
      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      setResponse(`Error: ${error}`);
    }
  };

  const testPostRequest = async () => {
    try {
      setResponse('Loading...');
      const res = await fetch('https://jsonplaceholder.typicode.com/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token-12345',
        },
        body: JSON.stringify({
          title: 'Test Post',
          body: 'This is a test post body',
          userId: 1,
        }),
      });
      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      setResponse(`Error: ${error}`);
    }
  };

  const testErrorRequest = async () => {
    try {
      setResponse('Loading...');
      const res = await fetch('https://jsonplaceholder.typicode.com/invalid-endpoint');
      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      setResponse(`Error: ${error}`);
    }
  };

  const toggleLogging = () => {
    if (isLoggingEnabled) {
      disableNetworkLogger();
      setIsLoggingEnabled(false);
    } else {
      enableNetworkLogger();
      setIsLoggingEnabled(true);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Network Logger Test</Text>
      <Text style={styles.subtitle}>
        Check your console to see color-coded API logs
      </Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.primaryButton]} 
          onPress={testGetRequest}
        >
          <Text style={styles.buttonText}>Test GET Request</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.primaryButton]} 
          onPress={testPostRequest}
        >
          <Text style={styles.buttonText}>Test POST Request</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.warningButton]} 
          onPress={testErrorRequest}
        >
          <Text style={styles.buttonText}>Test Error Request</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.button, 
            isLoggingEnabled ? styles.dangerButton : styles.successButton
          ]} 
          onPress={toggleLogging}
        >
          <Text style={styles.buttonText}>
            {isLoggingEnabled ? 'Disable Logging' : 'Enable Logging'}
          </Text>
        </TouchableOpacity>
      </View>

      {response ? (
        <View style={styles.responseContainer}>
          <Text style={styles.responseTitle}>Response:</Text>
          <Text style={styles.responseText}>{response}</Text>
        </View>
      ) : null}
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
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  buttonContainer: {
    gap: 10,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  successButton: {
    backgroundColor: '#34C759',
  },
  warningButton: {
    backgroundColor: '#FF9500',
  },
  dangerButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  responseContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  responseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  responseText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#666',
  },
});
