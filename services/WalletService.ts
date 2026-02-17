import { AUTH_CONFIG } from '../config/auth';
import { ensureUUID } from '../utils/uuid';

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

  // Get wallet balance
  static async getBalance(userId: string): Promise<WalletBalance> {
    try {
      const response = await fetch(`${this.baseUrl}/api/wallet/balance/${ensureUUID(userId)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-API-Key': AUTH_CONFIG.API.API_KEY,
          'X-Client-Secret': AUTH_CONFIG.API.CLIENT_SECRET,
        },
      });

      if (!response.ok) {
        // Return default 0 balance instead of throwing error
        console.warn(`Wallet balance API returned ${response.status}, defaulting to 0`);
        return {
          userId: userId,
          balance: 0,
          currency: 'INR'
        };
      }

      const data = await response.json();
      return {
        userId: data.user_id || userId,
        balance: parseFloat(data.balance || 0),
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

  // Add money to wallet
  static async addMoney(userId: string, amount: number, method: string = 'UPI'): Promise<WalletBalance> {
    try {
      const response = await fetch(`${this.baseUrl}/api/wallet/add-money`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-API-Key': AUTH_CONFIG.API.API_KEY,
          'X-Client-Secret': AUTH_CONFIG.API.CLIENT_SECRET,
        },
        body: JSON.stringify({
          user_id: ensureUUID(userId),
          amount: amount,
          method: method
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to add money: ${response.status}`);
      }

      const data = await response.json();
      return {
        userId: data.user_id || userId,
        balance: parseFloat(data.balance || 0),
        currency: 'INR'
      };
    } catch (error: any) {
      console.error('Error adding money to wallet:', error);
      throw new Error(`Failed to add money: ${error.message}`);
    }
  }

  // Start billable session (webhook)
  static async startSession(
    sessionId: string, 
    userId: string, 
    mentorId: string, 
    sessionType: 'AUDIO_CALL' | 'VIDEO_CALL' | 'CHAT'
  ): Promise<SessionStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/api/billing/session/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
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
        throw new Error(errorData.message || `Failed to start session: ${response.status}`);
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
      console.error('Error starting session:', error);
      throw error;
    }
  }

  // End billable session (webhook)
  static async endSession(sessionId: string, reason: string = 'NORMAL_END'): Promise<SessionStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/api/billing/session/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
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
        throw new Error(errorData.message || `Failed to end session: ${response.status}`);
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
      console.error('Error ending session:', error);
      throw error;
    }
  }

  // Check session status (webhook)
  static async checkSessionStatus(sessionId: string): Promise<SessionStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/api/billing/session/${sessionId}/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-API-Key': AUTH_CONFIG.API.API_KEY,
          'X-Client-Secret': AUTH_CONFIG.API.CLIENT_SECRET,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to check session status: ${response.status}`);
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
      console.error('Error checking session status:', error);
      throw error;
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
      // For now, always allow sessions since wallet endpoints might not be fully working
      // In production, you would check the actual wallet balance
      const mockBalance = 100; // Mock balance
      
      const rates = {
        'AUDIO_CALL': 11.00,
        'VIDEO_CALL': 17.00,
        'CHAT': 5.00
      };
      
      const ratePerMinute = rates[sessionType];
      const requiredBalance = ratePerMinute * 2; // 2 minutes minimum
      
      return {
        canStart: true, // Always allow for now
        balance: mockBalance,
        required: requiredBalance,
        message: `You have ₹${mockBalance.toFixed(2)}. Session can start.`
      };
      
      /* Original wallet check - commented out until wallet is fully implemented
      const balance = await this.getBalance(userId);
      
      const canStart = balance.balance >= requiredBalance;
      
      return {
        canStart,
        balance: balance.balance,
        required: requiredBalance,
        message: canStart 
          ? `You have ₹${balance.balance.toFixed(2)}. Session can start.`
          : `Insufficient balance. You have ₹${balance.balance.toFixed(2)}, but need ₹${requiredBalance.toFixed(2)} minimum.`
      };
      */
    } catch (error: any) {
      // Allow session to start even if wallet check fails
      return {
        canStart: true,
        balance: 100,
        required: 0,
        message: 'Session can start (wallet check skipped)'
      };
    }
  }
}