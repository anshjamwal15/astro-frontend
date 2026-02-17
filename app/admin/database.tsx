import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import DatabaseManager from '../../components/DatabaseManager';

export default function DatabaseScreen() {
  return (
    <View style={styles.container}>
      <DatabaseManager />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});