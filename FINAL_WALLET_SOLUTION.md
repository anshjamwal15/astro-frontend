# Final Wallet Deduction Solution

## Summary

Cleaned up the wallet deduction implementation to use **ONLY** the `PUT /api/wallet/update` endpoint as specified.

## API Endpoint

```
PUT http://172.20.10.5:3000/api/wallet/update
```

### Request Format
```json
{
  "userId": "5844f740-94af-41cb-ba66-d02e849cbaf7",
  "amount": -34,
  "reason": "VIDEO_CALL"
}
```

### Headers
```
Content-Type: application/json
accept: application/hal+json
X-API-Key: test-api-key-2024
X-Client-Secret: test-client-secret-2024
Authorization: Bearer <JWT_TOKEN> (optional)
```

### Response Format
```json
{
  "walletId": "...",
  "userId": "5844f740-94af-41cb-ba66-d02e849cbaf7",
  "balance": 566
}
```

## What Was Changed

### 1. Removed Fallback Logic
- Removed `deductMoneyUpdate()` method
- Removed `deductMoneyLegacy()` method  
- Removed all references to `/api/wallet/deduct-money`
- Simplified `deductMoney()` to call only `PUT /api/wallet/update`

### 2. Clean Implementation
The `deductMoney()` method now:
- Takes positive amount (e.g., 34)
- Converts to negative (e.g., -34)
- Sends to `PUT /api/wallet/update`
- Returns updated balance

### 3. Enhanced Logging
Detailed logs show:
- Request URL, method, and body
- Response status and body
- Parsed error messages
- Success confirmation with new balance

## Testing

### Quick Test with curl
```bash
# Make script executable
chmod +x test-wallet-api.sh

# Run test
./test-wallet-api.sh
```

### Manual Test
```bash
curl -X PUT 'http://172.20.10.5:3000/api/wallet/update' \
  -H 'Content-Type: application/json' \
  -H 'accept: application/hal+json' \
  -H 'X-API-Key: test-api-key-2024' \
  -H 'X-Client-Secret: test-client-secret-2024' \
  -d '{
  "userId": "5844f740-94af-41cb-ba66-d02e849cbaf7",
  "amount": -1,
  "reason": "VIDEO_CALL"
}'
```

## Expected Behavior

### During Video Call:
1. User starts video call
2. After 1 minute, billing timer triggers
3. App calls `WalletApiService.deductMoney(34, 'VIDEO_CALL', userId)`
4. API request sent: `PUT /api/wallet/update` with `amount: -34`
5. Backend deducts ₹34 from wallet
6. Response returns new balance
7. App shows continue dialog or insufficient balance

### Success Logs:
```
⏰ Minute 1 completed for session vid-xxx
💰 Attempting to deduct ₹34 from wallet
📊 Current balance BEFORE deduction: ₹600
🔄 API Request: {
  url: "http://172.20.10.5:3000/api/wallet/update",
  method: "PUT",
  body: { userId: "...", amount: -34, reason: "VIDEO_CALL" }
}
📡 API Response: { status: 200, statusText: "OK", ok: true }
📄 Response body: {"walletId":"...","userId":"...","balance":566}
✅ Wallet updated: { walletId: "...", userId: "...", balance: 566 }
✅ Successfully deducted ₹34. New balance: ₹566
```

### Error Logs (500):
```
⏰ Minute 1 completed for session vid-xxx
💰 Attempting to deduct ₹34 from wallet
📊 Current balance BEFORE deduction: ₹600
🔄 API Request: { ... }
📡 API Response: { status: 500, statusText: "", ok: false }
📄 Response body: {"error":"Internal Server Error","message":"..."}
❌ API Error: { status: 500, ... }
❌ deductMoney error: { name: "Error", message: "Wallet update failed (500): ..." }
🛑 Stopped billing timer
```

## If You Get 500 Error

The 500 error means your **backend** has an issue. Check:

### 1. Backend Endpoint Exists
```bash
# Check if endpoint is implemented
curl -X PUT 'http://172.20.10.5:3000/api/wallet/update' \
  -H 'Content-Type: application/json' \
  -d '{"userId":"test","amount":-1,"reason":"TEST"}'
```

### 2. User Has Wallet
```sql
-- Check if user has wallet record
SELECT * FROM wallets WHERE user_id = '5844f740-94af-41cb-ba66-d02e849cbaf7';
```

### 3. Backend Logs
Check your backend console/logs for the actual error:
- Database connection issues?
- Validation errors?
- Missing fields?
- Authentication issues?

### 4. API Implementation
Your backend needs to:
- Accept `PUT /api/wallet/update`
- Parse JSON body: `{ userId, amount, reason }`
- Validate userId exists
- Update wallet balance: `balance = balance + amount` (amount is negative)
- Return: `{ walletId, userId, balance }`

## Files Modified

- `services/WalletApiService.ts` - Simplified to use only PUT /api/wallet/update
- `test-wallet-api.sh` - Updated to test only the correct endpoint

## Next Steps

1. **Test the endpoint** with curl (see above)
2. **Check backend logs** if you get 500 error
3. **Fix backend** to properly implement the endpoint
4. **Run the app** - it should work once backend is fixed

## Backend Implementation Example

Your backend should handle it like this:

```typescript
// PUT /api/wallet/update
app.put('/api/wallet/update', async (req, res) => {
  const { userId, amount, reason } = req.body;
  
  // Validate
  if (!userId || amount === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  // Get wallet
  const wallet = await db.query('SELECT * FROM wallets WHERE user_id = ?', [userId]);
  if (!wallet) {
    return res.status(404).json({ error: 'Wallet not found' });
  }
  
  // Update balance (amount is already negative for deduction)
  const newBalance = wallet.balance + amount;
  
  if (newBalance < 0) {
    return res.status(400).json({ error: 'Insufficient balance' });
  }
  
  // Save
  await db.query('UPDATE wallets SET balance = ? WHERE user_id = ?', [newBalance, userId]);
  
  // Return
  res.json({
    walletId: wallet.id,
    userId: userId,
    balance: newBalance
  });
});
```

The frontend is now correct and ready. The 500 error is a backend issue that needs to be fixed on the server side.
