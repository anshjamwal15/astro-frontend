import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WalletService, WalletBalance as WalletBalanceType } from '../services/WalletService';
import { useUser } from '../contexts/UserContext';

interface WalletBalanceProps {
  onBalanceUpdate?: (balance: number) => void;
  showAddMoney?: boolean;
}

export default function WalletBalance({ onBalanceUpdate, showAddMoney = true }: WalletBalanceProps) {
  const { user } = useUser();
  const [balance, setBalance] = useState<WalletBalanceType | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [addAmount, setAddAmount] = useState('');
  const [addingMoney, setAddingMoney] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadBalance();
    }
  }, [user?.id]);

  const loadBalance = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const walletBalance = await WalletService.getBalance(user.id);
      setBalance(walletBalance);
      onBalanceUpdate?.(walletBalance.balance);
    } catch (error: any) {
      console.error('Error loading wallet balance:', error);
      // Default to 0 balance instead of showing error
      const defaultBalance: WalletBalanceType = {
        userId: user.id,
        balance: 0,
        currency: 'INR'
      };
      setBalance(defaultBalance);
      onBalanceUpdate?.(0);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMoney = async () => {
    if (!user?.id || !addAmount) return;
    
    const amount = parseFloat(addAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    if (amount < 10) {
      Alert.alert('Minimum Amount', 'Minimum amount to add is ₹10');
      return;
    }

    try {
      setAddingMoney(true);
      const updatedBalance = await WalletService.addMoney(user.id, amount, 'UPI');
      setBalance(updatedBalance);
      onBalanceUpdate?.(updatedBalance.balance);
      setShowAddMoneyModal(false);
      setAddAmount('');
      Alert.alert('Success', `₹${amount} added to your wallet successfully!`);
    } catch (error: any) {
      console.error('Error adding money:', error);
      Alert.alert('Error', error.message || 'Failed to add money to wallet');
    } finally {
      setAddingMoney(false);
    }
  };

  const quickAddAmounts = [50, 100, 200, 500, 1000];

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color="#10b981" />
        <Text style={styles.loadingText}>Loading balance...</Text>
      </View>
    );
  }

  return (
    <>
      <View style={styles.container}>
        <View style={styles.balanceContainer}>
          <Ionicons name="wallet" size={20} color="#10b981" />
          <Text style={styles.balanceText}>
            ₹{balance?.balance.toFixed(2) || '0.00'}
          </Text>
          <TouchableOpacity onPress={loadBalance} style={styles.refreshButton}>
            <Ionicons name="refresh" size={16} color="#666" />
          </TouchableOpacity>
        </View>
        
        {showAddMoney && (
          <TouchableOpacity 
            style={styles.addMoneyButton}
            onPress={() => setShowAddMoneyModal(true)}
          >
            <Ionicons name="add" size={16} color="#fff" />
            <Text style={styles.addMoneyText}>Add Money</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Add Money Modal */}
      <Modal
        visible={showAddMoneyModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddMoneyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Money to Wallet</Text>
              <TouchableOpacity 
                onPress={() => setShowAddMoneyModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <Text style={styles.currentBalanceText}>
              Current Balance: ₹{balance?.balance.toFixed(2) || '0.00'}
            </Text>

            <Text style={styles.inputLabel}>Enter Amount</Text>
            <TextInput
              style={styles.amountInput}
              value={addAmount}
              onChangeText={setAddAmount}
              placeholder="Enter amount (min ₹10)"
              keyboardType="numeric"
              editable={!addingMoney}
            />

            <Text style={styles.quickAddLabel}>Quick Add</Text>
            <View style={styles.quickAddContainer}>
              {quickAddAmounts.map((amount) => (
                <TouchableOpacity
                  key={amount}
                  style={styles.quickAddButton}
                  onPress={() => setAddAmount(amount.toString())}
                  disabled={addingMoney}
                >
                  <Text style={styles.quickAddButtonText}>₹{amount}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.confirmButton, addingMoney && styles.disabledButton]}
              onPress={handleAddMoney}
              disabled={addingMoney || !addAmount}
            >
              {addingMoney ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.confirmButtonText}>Add Money</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.noteText}>
              Note: This is a demo. In production, integrate with payment gateway.
            </Text>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginVertical: 8,
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  balanceText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  refreshButton: {
    marginLeft: 8,
    padding: 4,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  addMoneyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginLeft: 8,
  },
  addMoneyText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  currentBalanceText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  amountInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  quickAddLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
  },
  quickAddContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  quickAddButton: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  quickAddButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
  },
  confirmButton: {
    backgroundColor: '#10b981',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  noteText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});