import { logger } from '@/utils/Logger';
import { AUTH_CONFIG } from '../config/auth';
import { ensureUUID } from '../utils/uuid';
import { WalletApiService } from './WalletApiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface WalletBalance {
  userId: string;
  balance: number;
  currency: string;
}

export interface SessionStatus {
  sessionId: string;
  status: 'STARTED' | 'ACTIVE' | 'LOW_BALANCE' | 'ENDED' | 'INSUFFICIENT_BALANCE' | 'NOT_FOUND' | 'ERROR';
  currentBalance: number;
  ratePerMinute: number;
  estimatedMinutes: number;
  totalCost?: number;
  durationMinutes?: number;
  message: string;
}

export interface BillingRates {
  audioCall: string;
  videoCall: string;
  chat: string;
  minimumBalance: string;
  note: string;
}

export class WalletService {
  private static baseUrl = AUTH_CONFIG.API.BASE_URL;

  /**
   * Get JWT token from storage
   */
  private static async getJwtToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('jwt_token');
    } catch (error) {
      console.error('Error getting JWT token:', error);
      return null;
    }
  }

  // Get wallet balance using new WalletApiService
  static async getBalance(userId: string): Promise<WalletBalance> {
    try {
      const balanceData = await WalletApiService.getBalance(ensureUUID(userId));
      return {
        userId: balanceData.userId,
        balance: balanceData.balance,
        currency: 'INR'
      };
    } catch (error: any) {
      console.error('Error getting wallet balance:', error);
      // Return default 0 balance instead of throwing error
      return {
        userId: userId,
        balance: 0,
        currency: 'INR'
      };
    }
  }

  // Add money to wallet using new WalletApiService
  static async addMoney(userId: string, amount: number, method: string = 'UPI'): Promise<WalletBalance> {
    try {
      const result = await WalletApiService.addMoney(amount, method, ensureUUID(userId));
      return {
        userId: result.userId,
        balance: result.balance,
        currency: 'INR'
      };
    } catch (error: any) {
      console.error('Error adding money to wallet:', error);
      throw new Error(`Failed to add money: ${error.message}`);
    }
  }

  // Deduct money from wallet for calls/chat (creates DEBIT transaction)
  static async deductMoney(userId: string, amount: number, sessionType: 'AUDIO_CALL' | 'VIDEO_CALL' | 'CHAT'): Promise<WalletBalance> {
    try {
      const uuidUserId = ensureUUID(userId);
      const jwtToken = await this.getJwtToken();

      console.log('💳 WalletService.deductMoney called with:', {
        originalUserId: userId,
        convertedUserId: uuidUserId,
        amount,
        sessionType,
      });
      const response = await fetch(`${this.baseUrl}/api/wallet/deduct-money`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/hal+json',
          ...(jwtToken && { 'Authorization': `Bearer ${jwtToken}` }),
          'X-API-Key': AUTH_CONFIG.API.API_KEY,
          'X-Client-Secret': AUTH_CONFIG.API.CLIENT_SECRET,
        },
        body: JSON.stringify({
          userId: uuidUserId,
          amount,
          reason: sessionType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ WalletService.deductMoney result:', data);

      return {
        userId: data.userId,
        balance: data.balance,
        currency: 'INR',
      };
    } catch (error: any) {
      console.error('❌ WalletService.deductMoney error:', error.message);
      throw new Error(`Failed to deduct money: ${error.message}`);
    }
  }

  // Helper method to check if balance is sufficient for session type
  static async canStartSession(
    userId: string, 
    sessionType: 'AUDIO_CALL' | 'VIDEO_CALL' | 'CHAT'
  ): Promise<{ canStart: boolean; balance: number; required: number; message: string }> {
    try {
      const balance = await this.getBalance(userId);
      
      const rates = {
        'AUDIO_CALL': 11.00,
        'VIDEO_CALL': 17.00,
        'CHAT': 5.00
      };
      
      const ratePerMinute = rates[sessionType];
      const requiredBalance = ratePerMinute * 2; // 2 minutes minimum
      
      const canStart = balance.balance >= requiredBalance;
      
      return {
        canStart,
        balance: balance.balance,
        required: requiredBalance,
        message: canStart 
          ? `You have ₹${balance.balance.toFixed(2)}. Session can start.`
          : `Insufficient balance. You have ₹${balance.balance.toFixed(2)}, but need ₹${requiredBalance.toFixed(2)} minimum.`
      };
    } catch (error: any) {
      console.error('Error checking if session can start:', error);
      // Return false if wallet check fails
      return {
        canStart: false,
        balance: 0,
        required: 0,
        message: 'Unable to verify wallet balance. Please try again.'
      };
    }
  }
}