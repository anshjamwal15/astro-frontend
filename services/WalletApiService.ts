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
   * Deduct money from wallet using the /api/wallet/update endpoint
   * Used for video calls, voice calls, and chat sessions
   * 
   * API Spec:
   * PUT /api/wallet/update
   * Body: { userId: string, amount: number (negative for deduction), reason: string }
   * Response: { walletId: string, userId: string, balance: number }
   */
  static async deductMoney(amount: number, reference: string, userId?: string): Promise<AddMoneyResponse> {
    try {
      if (!userId) {
        throw new Error('userId is required for deducting money');
      }

      const jwtToken = await this.getJwtToken();
      
      const deductAmount = Math.abs(amount);
      
      const requestBody = {
        userId: userId,
        amount: deductAmount,
        reason: reference,
      };

      console.log('🔄 API Request:', {
        url: `${AUTH_CONFIG.API.BASE_URL}/api/wallet/update`,
        method: 'PUT',
        body: requestBody,
      });
      
      const response = await fetch(`${AUTH_CONFIG.API.BASE_URL}/api/wallet/update`, {
        method: 'PUT',
        headers: {
          'accept': 'application/hal+json',
          'Content-Type': 'application/json',
          'X-API-Key': AUTH_CONFIG.API.API_KEY,
          'X-Client-Secret': AUTH_CONFIG.API.CLIENT_SECRET,
          ...(jwtToken && { 'Authorization': `Bearer ${jwtToken}` }),
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📡 API Response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      });

      // Read response body once
      const responseText = await response.text();
      console.log('📄 Response body:', responseText);

      if (!response.ok) {
        let errorData: any = null;
        
        try {
          errorData = JSON.parse(responseText);
        } catch {
          // Not JSON
        }

        console.error('❌ API Error:', {
          status: response.status,
          statusText: response.statusText,
          body: responseText,
          parsed: errorData,
        });
        
        const errorMessage = errorData?.message || errorData?.error || responseText || response.statusText;
        throw new Error(`Wallet update failed (${response.status}): ${errorMessage}`);
      }

      // Parse the successful response
      let data: any;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('❌ Failed to parse response JSON:', responseText);
        throw new Error('Invalid JSON response from wallet API');
      }

      console.log('✅ Wallet updated:', data);
      
      // Transform response to match expected format
      return {
        userId: data.userId || userId,
        balance: data.balance !== undefined ? data.balance : 0,
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
      };
    } catch (error: any) {
      console.error('❌ deductMoney error:', {
        name: error.name,
        message: error.message,
      });
      throw error;
    }
  }
}
