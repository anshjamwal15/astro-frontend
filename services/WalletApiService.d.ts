export interface WalletBalance {
  walletId: string;
  userId: string;
  balance: number;
}

export interface Transaction {
  id: string;
  walletId: string;
  transactionType: string;
  amount: number;
  status: string;
  paymentGatewayReference: string;
  createdAt: string;
}

export interface TransactionsResponse {
  userId: string;
  transactions: Transaction[];
}

export interface AddMoneyResponse {
  walletId: string;
  userId: string;
  balance: number;
}

export declare class WalletApiService {
  static getBalance(userId: string): Promise<WalletBalance>;
  static getTransactions(userId: string, amount?: number, method?: string): Promise<TransactionsResponse>;
  static addMoney(userId: string, amount: number, method: string): Promise<AddMoneyResponse>;
}
