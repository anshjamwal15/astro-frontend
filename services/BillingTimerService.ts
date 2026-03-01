import { Alert } from 'react-native';
import { WalletService } from './WalletService';
import { ApiService } from './apiService';

export interface BillingTimerConfig {
  sessionId: string;
  userId: string;
  mentorId: string;
  sessionType: 'AUDIO_CALL' | 'VIDEO_CALL' | 'CHAT';
  ratePerMinute: number;
  onMinuteComplete: (minutesPassed: number, amountDeducted: number, remainingBalance: number) => void;
  onInsufficientBalance: (minutesPassed: number, totalCost: number) => void;
  onSessionEnd: (summary: SessionSummary) => void;
}

export interface SessionSummary {
  totalMinutes: number;
  totalCost: number;
  remainingBalance: number;
  endReason: 'USER_CANCELLED' | 'INSUFFICIENT_BALANCE' | 'NORMAL_END';
}

export class BillingTimerService {
  private static activeTimers: Map<string, any> = new Map();
  private static sessionData: Map<string, {
    startTime: number;
    minutesPassed: number;
    totalDeducted: number;
    config: BillingTimerConfig;
  }> = new Map();

  /**
   * Start a billing timer for a session
   */
  static startTimer(config: BillingTimerConfig): void {
    const { sessionId } = config;

    // Clear any existing timer for this session
    this.stopTimer(sessionId);

    // Initialize session data
    this.sessionData.set(sessionId, {
      startTime: Date.now(),
      minutesPassed: 0,
      totalDeducted: 0,
      config,
    });

    console.log(`🕐 Starting billing timer for session ${sessionId} at ₹${config.ratePerMinute}/min`);

    // Set up timer to run every minute (60000ms)
    const timer = setInterval(() => {
      this.onMinuteTick(sessionId);
    }, 60000); // 60 seconds

    this.activeTimers.set(sessionId, timer);
  }

  /**
   * Handle each minute tick
   */
  private static async onMinuteTick(sessionId: string): Promise<void> {
    const session = this.sessionData.get(sessionId);
    if (!session) {
      console.warn(`Session ${sessionId} not found in billing timer`);
      return;
    }

    const { config } = session;
    session.minutesPassed += 1;
    const amountToDeduct = config.ratePerMinute;

    console.log(`⏰ Minute ${session.minutesPassed} completed for session ${sessionId}`);
    console.log(`💰 Attempting to deduct ₹${amountToDeduct} from wallet for user ${config.userId}`);

    try {
      // Get current balance BEFORE deduction
      const balanceInfo = await WalletService.getBalance(config.userId);
      const currentBalance = balanceInfo.balance;

      console.log(`📊 Current balance BEFORE deduction: ₹${currentBalance}`);

      // Check if user has sufficient balance
      if (currentBalance < amountToDeduct) {
        console.warn(`⚠️ Insufficient balance: ₹${currentBalance} < ₹${amountToDeduct}`);
        
        // Stop the timer
        this.stopTimer(sessionId);
        
        // Notify about insufficient balance
        config.onInsufficientBalance(session.minutesPassed, session.totalDeducted);
        return;
      }

      // Deduct the amount from wallet (creates DEBIT transaction)
      console.log(`🔄 Calling WalletService.deductMoney with:`, {
        userId: config.userId,
        amount: amountToDeduct,
        sessionType: config.sessionType,
      });

      const updatedBalance = await WalletService.deductMoney(
        config.userId, 
        amountToDeduct, 
        config.sessionType
      );
      
      session.totalDeducted += amountToDeduct;
      const remainingBalance = updatedBalance.balance;

      console.log(`✅ Successfully deducted ₹${amountToDeduct}. New balance: ₹${remainingBalance}`);

      // Notify about minute completion
      config.onMinuteComplete(session.minutesPassed, amountToDeduct, remainingBalance);

    } catch (error: any) {
      console.error('❌ Error processing minute tick:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
      });
      
      // Stop timer on deduction error to prevent further charges
      this.stopTimer(sessionId);
      
      // Notify about the error
      config.onInsufficientBalance(session.minutesPassed, session.totalDeducted);
    }
  }

  /**
   * Stop the billing timer
   */
  static stopTimer(sessionId: string): void {
    const timer = this.activeTimers.get(sessionId);
    if (timer) {
      clearInterval(timer);
      this.activeTimers.delete(sessionId);
      console.log(`🛑 Stopped billing timer for session ${sessionId}`);
    }
  }

  /**
   * End the session and get summary
   */
  static async endSession(
    sessionId: string,
    endReason: 'USER_CANCELLED' | 'INSUFFICIENT_BALANCE' | 'NORMAL_END'
  ): Promise<SessionSummary> {
    const session = this.sessionData.get(sessionId);
    
    // Stop the timer
    this.stopTimer(sessionId);

    if (!session) {
      console.warn(`Session ${sessionId} not found when ending`);
      return {
        totalMinutes: 0,
        totalCost: 0,
        remainingBalance: 0,
        endReason,
      };
    }

    const { config, minutesPassed, totalDeducted } = session;

    // Get final balance
    let remainingBalance = 0;
    try {
      const balanceInfo = await WalletService.getBalance(config.userId);
      remainingBalance = balanceInfo.balance;
    } catch (error) {
      console.error('Error getting final balance:', error);
    }

    // Clean up session data
    this.sessionData.delete(sessionId);

    const summary: SessionSummary = {
      totalMinutes: minutesPassed,
      totalCost: totalDeducted,
      remainingBalance,
      endReason,
    };

    console.log(`📊 Session ${sessionId} ended:`, summary);

    // Notify about session end
    config.onSessionEnd(summary);

    // End the billing session on the backend (optional - for tracking purposes)
    // This is not critical, so we just log warnings if it fails
    try {
      await WalletService.endSession(sessionId, endReason);
      console.log(`✅ Backend session ${sessionId} ended successfully`);
    } catch (error) {
      console.warn('Backend session end failed (non-critical):', error);
    }

    return summary;
  }

  /**
   * Get current session info
   */
  static getSessionInfo(sessionId: string): {
    minutesPassed: number;
    totalDeducted: number;
  } | null {
    const session = this.sessionData.get(sessionId);
    if (!session) return null;

    return {
      minutesPassed: session.minutesPassed,
      totalDeducted: session.totalDeducted,
    };
  }

  /**
   * Show continue dialog after each minute
   */
  static showContinueDialog(
    minutesPassed: number,
    amountDeducted: number,
    remainingBalance: number,
    onContinue: () => void,
    onCancel: () => void
  ): void {
    Alert.alert(
      '💰 Payment Deducted',
      `₹${amountDeducted} has been deducted from your wallet.\n\n` +
      `Time elapsed: ${minutesPassed} minute${minutesPassed > 1 ? 's' : ''}\n` +
      `Remaining balance: ₹${remainingBalance.toFixed(2)}\n\n` +
      `Do you want to continue for one more minute?`,
      [
        {
          text: 'Cancel',
          style: 'destructive',
          onPress: onCancel,
        },
        {
          text: 'Continue',
          style: 'default',
          onPress: onContinue,
        },
      ],
      { cancelable: false }
    );
  }

  /**
   * Show insufficient balance dialog
   */
  static showInsufficientBalanceDialog(
    minutesPassed: number,
    totalCost: number,
    onAddMoney: () => void,
    onCancel: () => void
  ): void {
    Alert.alert(
      '⚠️ Insufficient Balance',
      `Your wallet balance is too low to continue.\n\n` +
      `Time elapsed: ${minutesPassed} minute${minutesPassed > 1 ? 's' : ''}\n` +
      `Total cost: ₹${totalCost.toFixed(2)}\n\n` +
      `Please add money to your wallet to continue.`,
      [
        {
          text: 'Cancel',
          style: 'destructive',
          onPress: onCancel,
        },
        {
          text: 'Add Money',
          style: 'default',
          onPress: onAddMoney,
        },
      ],
      { cancelable: false }
    );
  }

  /**
   * Clean up all timers (call on app exit)
   */
  static cleanupAll(): void {
    console.log('🧹 Cleaning up all billing timers');
    this.activeTimers.forEach((timer, sessionId) => {
      this.stopTimer(sessionId);
    });
    this.sessionData.clear();
  }
}
