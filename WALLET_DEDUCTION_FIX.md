# Wallet Deduction Fix

## Changes Made

### 1. Updated API Endpoint
Changed from `POST /api/wallet/deduct-money` to `PUT /api/wallet/update` to match your backend API specification.

### 2. Request Format
```json
{
  "userId": "user-uuid-here",
  "amount": -34,  // Negative for deduction
  "reason": "VIDEO_CALL"
}
```

### 3. Enhanced Logging
Added comprehensive logging throughout the wallet deduction flow:

- **WalletApiService.deductMoney**: Logs request details, response status, and full response body
- **WalletService.deductMoney**: Logs userId conversion and balance updates
- **BillingTimerService.onMinuteTick**: Logs balance before/after deduction

### 4. Better Error Handling
- Reads response body only once (fixes potential parsing issues)
- Provides detailed error messages with status codes
- Handles both JSON and text error responses

## How to Debug

### Step 1: Check the Logs
When a call is made, you should see logs like:

```
🔄 API Request: {
  url: "http://172.20.10.5:3000/api/wallet/update",
  method: "PUT",
  body: { userId: "...", amount: -34, reason: "VIDEO_CALL" }
}

📡 API Response: {
  status: 200,
  statusText: "OK",
  ok: true
}

📄 Response body: {"walletId":"...","userId":"...","balance":566}

✅ Wallet updated: { walletId: "...", userId: "...", balance: 566 }
```

### Step 2: Common Issues

#### Issue: 500 Internal Server Error
**Possible Causes:**
1. **Invalid userId**: The userId might not exist in the database
2. **Database connection**: Backend can't connect to the database
3. **Missing wallet**: User doesn't have a wallet record yet
4. **Invalid amount**: Backend validation might reject the amount

**Solution:**
- Check the backend logs for the actual error
- Verify the userId exists in the database
- Ensure the user has a wallet record
- Test with curl first:

```bash
curl -X 'PUT' \
  'http://172.20.10.5:3000/api/wallet/update' \
  -H 'accept: application/hal+json' \
  -H 'Content-Type: application/json' \
  -d '{
  "userId": "YOUR_USER_ID_HERE",
  "amount": -34,
  "reason": "VIDEO_CALL"
}'
```

#### Issue: Insufficient Balance Dialog Shows Immediately
**Possible Causes:**
1. API call fails but balance check succeeds
2. Error in deduction logic
3. Backend returns success but doesn't actually deduct

**Solution:**
- Check the detailed logs to see the exact error
- Verify the response body contains the updated balance
- Compare balance before and after deduction

### Step 3: Test the API Directly

Use the test utility:

```typescript
import { testWalletDeduction } from './services/__tests__/wallet-api-test';

// Replace with actual user ID
testWalletDeduction('your-user-id-here', 34);
```

This will:
1. Get balance before deduction
2. Attempt deduction
3. Get balance after deduction
4. Verify the amounts match

### Step 4: Backend Verification

Check your backend to ensure:

1. **Endpoint exists**: `PUT /api/wallet/update`
2. **Request validation**: Accepts `{ userId, amount, reason }`
3. **Response format**: Returns `{ walletId, userId, balance }`
4. **Database**: User has a wallet record
5. **Permissions**: API key/JWT token is valid

## Files Modified

1. `services/WalletApiService.ts` - Updated deductMoney method
2. `services/WalletService.ts` - Enhanced logging
3. `services/BillingTimerService.ts` - Better error handling
4. `services/__tests__/wallet-api-test.ts` - New test utility

## Next Steps

1. **Run the app** and make a video call
2. **Watch the logs** carefully - they will show exactly what's happening
3. **Copy the exact request** from the logs and test with curl
4. **Check backend logs** to see why it's returning 500
5. **Verify the userId** is correct and exists in the database

## Expected Flow

```
1. User starts video call
2. Timer starts (1 minute intervals)
3. After 1 minute:
   - Get current balance (₹600)
   - Check if sufficient (₹600 >= ₹34) ✓
   - Call API: PUT /api/wallet/update with amount: -34
   - API returns: { balance: 566 }
   - Show continue dialog
4. User continues or cancels
```

## If Still Not Working

Share the complete logs showing:
- The exact request being sent (userId, amount, reason)
- The exact response (status, body)
- Any backend error logs

This will help identify if the issue is:
- Frontend (request format)
- Network (connectivity)
- Backend (processing error)
- Database (data issue)
