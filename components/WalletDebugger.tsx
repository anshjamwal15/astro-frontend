import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { WalletService } from '../services/WalletService';
import { useUser } from '../contexts/UserContext';

/**
 * Wallet Debugger Component
 * 
 * Add this to your video call screen to see real-time wallet status
 * Helps debug wallet deduction issues
 * 
 * Usage:
 * import { WalletDebugger } from '../components/WalletDebugger';
 * 
 * <WalletDebugger />
 */
export function WalletDebugger() {
  const { user } = useUser();
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchBalance = async () => {
    if (!user?.id) {
      setError('No user ID');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await WalletService.getBalance(user.id);
      setBalance(result.balance);
      setLastUpdate(new Date());
      console.log('💰 Wallet balance fetched:', result.balance);
    } catch (err: any) {
      setError(err.message);
      console.error('❌ Failed to fetch balance:', err);
    } finally {
      setLoading(false);
    }
  };

  const testDeduction = async () => {
    if (!user?.id) {
      setError('No user ID');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🧪 Testing deduction of ₹1...');
      const result = await WalletService.deductMoney(user.id, 1, 'VIDEO_CALL');
      setBalance(result.balance);
      setLastUpdate(new Date());
      console.log('✅ Test deduction successful. New balance:', result.balance);
    } catch (err: any) {
      setError(err.message);
      console.error('❌ Test deduction failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
    
    // Auto-refresh every 5 seconds
    const interval = setInterval(fetchBalance, 5000);
    
    return () => clearInterval(interval);
  }, [user?.id]);

  if (!user?.id) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No user logged in</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>💰 Wallet Debugger</Text>
        <TouchableOpacity onPress={fetchBalance} disabled={loading}>
          <Text style={styles.refreshButton}>🔄</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={styles.label}>User ID:</Text>
          <Text style={styles.value} numberOfLines={1}>
            {user.id.substring(0, 8)}...
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Balance:</Text>
          {loading ? (
            <Text style={styles.value}>Loading...</Text>
          ) : balance !== null ? (
            <Text style={[styles.value, styles.balance]}>₹{balance.toFixed(2)}</Text>
          ) : (
            <Text style={styles.value}>-</Text>
          )}
        </View>

        {lastUpdate && (
          <View style={styles.row}>
            <Text style={styles.label}>Updated:</Text>
            <Text style={styles.value}>
              {lastUpdate.toLocaleTimeString()}
            </Text>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>❌ {error}</Text>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.button}
          onPress={testDeduction}
          disabled={loading || balance === null || balance < 1}
        >
          <Text style={styles.buttonText}>Test Deduct ₹1</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 120,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  refreshButton: {
    fontSize: 18,
  },
  content: {
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    color: '#999',
    fontSize: 12,
  },
  value: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  balance: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: 'bold',
  },
  errorContainer: {
    marginTop: 4,
    padding: 6,
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
    borderRadius: 4,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 11,
  },
  actions: {
    marginTop: 8,
    gap: 6,
  },
  button: {
    backgroundColor: '#0052CC',
    padding: 8,
    borderRadius: 4,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
