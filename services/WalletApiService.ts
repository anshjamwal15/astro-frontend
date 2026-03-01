import { AUTH_CONFIG } from "@/config/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';

export type TransactionType = 'CREDIT' | 'DEBIT';
export type TransactionStatus = 'PENDING' | 'SUCCESS' | 'FAILED';

export interface WalletBalance {
  userId: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  walletId: string;
  transactionType: TransactionType;
  amount: number;
  status: TransactionStatus;
  paymentGatewayReference: string;
  createdAt: string;
}

export interface TransactionsResponse {
  userId: string;
  transactions: Transaction[];
}

export interface AddMoneyResponse {
  userId: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export class WalletApiService {
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

  /**
   * Get wallet balance for a user
   */
  static async getBalance(userId: string): Promise<WalletBalance> {
    try {
      const jwtToken = await this.getJwtToken();
      
      const response = await fetch(`${AUTH_CONFIG.API.BASE_URL}/api/wallet/balance/${userId}`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
          ...(jwtToken && { 'Authorization': `Bearer ${jwtToken}` }),
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch balance: ${response.statusText}`);
      }

      const data: any = await response.json();
      
      // Transform snake_case to camelCase
      const transformedData: WalletBalance = {
        userId: data.userId || data.user_id,
        balance: data.balance,
        createdAt: data.createdAt || data.created_at,
        updatedAt: data.updatedAt || data.updated_at,
      };
      
      return transformedData;
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      throw error;
    }
  }

  /**
   * Get transaction history for a user
   * Transactions are returned in descending order by createdAt (newest first)
   */
  static async getTransactions(userId?: string): Promise<TransactionsResponse> {
    try {
      const jwtToken = await this.getJwtToken();
      
      const response = await fetch(`${AUTH_CONFIG.API.BASE_URL}/api/wallet/transactions`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
          ...(jwtToken && { 'Authorization': `Bearer ${jwtToken}` }),
        },
        body: JSON.stringify(userId ? { userId } : {}),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch transactions: ${response.statusText}`);
      }

      const data: any = await response.json();
      
      // Transform snake_case to camelCase
      const transformedData: TransactionsResponse = {
        userId: data.userId || data.user_id,
        transactions: (data.transactions || []).map((tx: any) => ({
          id: tx.id,
          walletId: tx.walletId || tx.wallet_id,
          transactionType: tx.transactionType || tx.transaction_type,
          amount: tx.amount,
          status: tx.status,
          paymentGatewayReference: tx.paymentGatewayReference || tx.payment_gateway_reference,
          createdAt: tx.createdAt || tx.created_at,
        })),
      };
      
      return transformedData;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  }

  /**
   * Add money to wallet (creates a CREDIT transaction)
   */
  static async addMoney(amount: number, method: string, userId?: string): Promise<AddMoneyResponse> {
    try {
      const jwtToken = await this.getJwtToken();
      
      const response = await fetch(`${AUTH_CONFIG.API.BASE_URL}/api/wallet/add-money`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
          ...(jwtToken && { 'Authorization': `Bearer ${jwtToken}` }),
        },
        body: JSON.stringify({
          ...(userId && { userId }),
          amount,
          method,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to add money: ${response.statusText}`);
      }

      const data: any = await response.json();
      
      // Transform snake_case to camelCase
      const transformedData: AddMoneyResponse = {
        userId: data.userId || data.user_id,
        balance: data.balance,
        createdAt: data.createdAt || data.created_at,
        updatedAt: data.updatedAt || data.updated_at,
      };
      
      return transformedData;
    } catch (error) {
      console.error('Error adding money to wallet:', error);
      throw error;
    }
  }

  /**
   * Deduct money from wallet (creates a DEBIT transaction)
   * Used for video calls, voice calls, and chat sessions
   */
  static async deductMoney(amount: number, reference: string, userId?: string): Promise<AddMoneyResponse> {
    try {
      const jwtToken = await this.getJwtToken();
      
      const response = await fetch(`${AUTH_CONFIG.API.BASE_URL}/api/wallet/deduct-money`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
          ...(jwtToken && { 'Authorization': `Bearer ${jwtToken}` }),
        },
        body: JSON.stringify({
          ...(userId && { userId }),
          amount,
          method: reference, // Reference like "VIDEO_CALL", "AUDIO_CALL", "CHAT"
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to deduct money: ${response.statusText} - ${errorText}`);
      }

      const data: any = await response.json();
      
      // Transform snake_case to camelCase
      const transformedData: AddMoneyResponse = {
        userId: data.userId || data.user_id,
        balance: data.balance,
        createdAt: data.createdAt || data.created_at,
        updatedAt: data.updatedAt || data.updated_at,
      };
      
      return transformedData;
    } catch (error) {
      console.error('Error deducting money from wallet:', error);
      throw error;
    }
  }
}
