/**
 * Wallet API Test Utility
 * 
 * This file helps test the wallet API endpoints directly
 * Run this to verify the API is working correctly
 */

import { WalletApiService } from '../WalletApiService';

export async function testWalletDeduction(userId: string, amount: number) {
  console.log('='.repeat(50));
  console.log('WALLET API DEDUCTION TEST');
  console.log('='.repeat(50));
  
  try {
    // Step 1: Get current balance
    console.log('\n1️⃣ Getting current balance...');
    const balanceBefore = await WalletApiService.getBalance(userId);
    console.log('✅ Balance before:', balanceBefore);
    
    // Step 2: Attempt deduction
    console.log(`\n2️⃣ Attempting to deduct ₹${amount}...`);
    const result = await WalletApiService.deductMoney(amount, 'VIDEO_CALL', userId);
    console.log('✅ Deduction successful:', result);
    
    // Step 3: Verify new balance
    console.log('\n3️⃣ Verifying new balance...');
    const balanceAfter = await WalletApiService.getBalance(userId);
    console.log('✅ Balance after:', balanceAfter);
    
    // Step 4: Calculate difference
    const difference = balanceBefore.balance - balanceAfter.balance;
    console.log(`\n📊 Difference: ₹${difference} (expected: ₹${amount})`);
    
    if (Math.abs(difference - amount) < 0.01) {
      console.log('✅ TEST PASSED: Amount deducted correctly');
    } else {
      console.log('⚠️ TEST WARNING: Amount mismatch');
    }
    
    console.log('\n' + '='.repeat(50));
    return { success: true, result };
    
  } catch (error: any) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error('Error details:', error);
    console.log('\n' + '='.repeat(50));
    return { success: false, error: error.message };
  }
}

// Example usage:
// import { testWalletDeduction } from './services/__tests__/wallet-api-test';
// testWalletDeduction('your-user-id-here', 34);
