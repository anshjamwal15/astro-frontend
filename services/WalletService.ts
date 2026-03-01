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
      const result = await WalletApiService.deductMoney(amount, sessionType, ensureUUID(userId));
      return {
        userId: result.userId,
        balance: result.balance,
        currency: 'INR'
      };
    } catch (error: any) {
      console.error('Error deducting money from wallet:', error);
      throw new Error(`Failed to deduct money: ${error.message}`);
    }
  }

  // Start billable session (webhook) - Optional, for backend billing tracking
  static async startSession(
    sessionId: string, 
    userId: string, 
    mentorId: string, 
    sessionType: 'AUDIO_CALL' | 'VIDEO_CALL' | 'CHAT'
  ): Promise<SessionStatus> {
    try {
      const jwtToken = await this.getJwtToken();
      
      const response = await fetch(`${this.baseUrl}/api/billing/session/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(jwtToken && { 'Authorization': `Bearer ${jwtToken}` }),
          'X-API-Key': AUTH_CONFIG.API.API_KEY,
          'X-Client-Secret': AUTH_CONFIG.API.CLIENT_SECRET,
        },
        body: JSON.stringify({
          session_id: sessionId,
          user_id: ensureUUID(userId),
          mentor_id: ensureUUID(mentorId),
          session_type: sessionType
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.warn('Backend session start failed:', errorData.message || response.status);
        // Return a default status instead of throwing
        return {
          sessionId,
          status: 'STARTED',
          currentBalance: 0,
          ratePerMinute: 0,
          estimatedMinutes: 0,
          message: 'Session started (backend tracking unavailable)'
        };
      }

      const data = await response.json();
      return {
        sessionId: data.session_id || sessionId,
        status: data.status,
        currentBalance: parseFloat(data.current_balance || 0),
        ratePerMinute: parseFloat(data.rate_per_minute || 0),
        estimatedMinutes: data.estimated_minutes || 0,
        message: data.message || 'Session started'
      };
    } catch (error: any) {
      console.warn('Error starting backend session:', error.message);
      // Return a default status instead of throwing
      return {
        sessionId,
        status: 'STARTED',
        currentBalance: 0,
        ratePerMinute: 0,
        estimatedMinutes: 0,
        message: 'Session started (backend tracking unavailable)'
      };
    }
  }

  // End billable session (webhook) - Optional, for backend billing tracking
  static async endSession(sessionId: string, reason: string = 'NORMAL_END'): Promise<SessionStatus> {
    try {
      const jwtToken = await this.getJwtToken();
      
      const response = await fetch(`${this.baseUrl}/api/billing/session/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(jwtToken && { 'Authorization': `Bearer ${jwtToken}` }),
          'X-API-Key': AUTH_CONFIG.API.API_KEY,
          'X-Client-Secret': AUTH_CONFIG.API.CLIENT_SECRET,
        },
        body: JSON.stringify({
          session_id: sessionId,
          reason: reason
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.warn('Backend session end failed:', errorData.message || response.status);
        // Return a default status instead of throwing
        return {
          sessionId,
          status: 'ENDED',
          currentBalance: 0,
          ratePerMinute: 0,
          estimatedMinutes: 0,
          message: 'Session ended (backend tracking unavailable)'
        };
      }

      const data = await response.json();
      return {
        sessionId: data.session_id || sessionId,
        status: data.status,
        currentBalance: parseFloat(data.current_balance || 0),
        ratePerMinute: parseFloat(data.rate_per_minute || 0),
        estimatedMinutes: data.estimated_minutes || 0,
        totalCost: data.total_cost ? parseFloat(data.total_cost) : undefined,
        durationMinutes: data.duration_minutes,
        message: data.message || 'Session ended'
      };
    } catch (error: any) {
      console.warn('Error ending backend session:', error.message);
      // Return a default status instead of throwing
      return {
        sessionId,
        status: 'ENDED',
        currentBalance: 0,
        ratePerMinute: 0,
        estimatedMinutes: 0,
        message: 'Session ended (backend tracking unavailable)'
      };
    }
  }

  // Check session status (webhook) - Optional, for backend billing tracking
  static async checkSessionStatus(sessionId: string): Promise<SessionStatus> {
    try {
      const jwtToken = await this.getJwtToken();
      
      const response = await fetch(`${this.baseUrl}/api/billing/session/${sessionId}/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(jwtToken && { 'Authorization': `Bearer ${jwtToken}` }),
          'X-API-Key': AUTH_CONFIG.API.API_KEY,
          'X-Client-Secret': AUTH_CONFIG.API.CLIENT_SECRET,
        },
      });

      if (!response.ok) {
        console.warn('Backend session status check failed:', response.status);
        // Return a default status instead of throwing
        return {
          sessionId,
          status: 'NOT_FOUND',
          currentBalance: 0,
          ratePerMinute: 0,
          estimatedMinutes: 0,
          message: 'Session status unavailable'
        };
      }

      const data = await response.json();
      return {
        sessionId: data.session_id || sessionId,
        status: data.status,
        currentBalance: parseFloat(data.current_balance || 0),
        ratePerMinute: parseFloat(data.rate_per_minute || 0),
        estimatedMinutes: data.estimated_minutes || 0,
        message: data.message || 'Status checked'
      };
    } catch (error: any) {
      console.warn('Error checking backend session status:', error.message);
      // Return a default status instead of throwing
      return {
        sessionId,
        status: 'NOT_FOUND',
        currentBalance: 0,
        ratePerMinute: 0,
        estimatedMinutes: 0,
        message: 'Session status unavailable'
      };
    }
  }

  // Get billing rates
  static async getBillingRates(): Promise<BillingRates> {
    try {
      const response = await fetch(`${this.baseUrl}/api/billing/rates`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get billing rates: ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('Error getting billing rates:', error);
      throw error;
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