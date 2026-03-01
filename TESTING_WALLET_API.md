# Testing Wallet API - Quick Guide

## Test with curl (Recommended First Step)

Before running the app, test the API directly to ensure it works:

```bash
# 1. Get your user's wallet balance
curl -X 'GET' \
  'http://172.20.10.5:3000/api/wallet/balance/YOUR_USER_ID' \
  -H 'accept: application/json'

# Expected response:
# {
#   "userId": "YOUR_USER_ID",
#   "balance": 600,
#   "createdAt": "2024-01-01T00:00:00Z",
#   "updatedAt": "2024-01-01T00:00:00Z"
# }

# 2. Test deduction (deduct ₹34)
curl -X 'PUT' \
  'http://172.20.10.5:3000/api/wallet/update' \
  -H 'accept: application/hal+json' \
  -H 'Content-Type: application/json' \
  -d '{
  "userId": "YOUR_USER_ID",
  "amount": -34,
  "reason": "VIDEO_CALL"
}'

# Expected response:
# {
#   "walletId": "...",
#   "userId": "YOUR_USER_ID",
#   "balance": 566
# }

# 3. Verify balance decreased
curl -X 'GET' \
  'http://172.20.10.5:3000/api/wallet/balance/YOUR_USER_ID' \
  -H 'accept: application/json'

# Expected: balance should be 566 now
```

## Common Issues & Solutions

### Issue 1: "userId not found" or 500 error

**Problem**: The user doesn't have a wallet record in the database.

**Solution**: Create a wallet for the user first (check your backend API for wallet creation endpoint).

### Issue 2: "Insufficient balance" but user has money

**Problem**: The API call is failing, but the balance check succeeds.

**Solution**: 
1. Check the logs for the exact error message
2. Verify the userId format (should be UUID)
3. Test with curl to isolate the issue

### Issue 3: Balance doesn't update

**Problem**: API returns success but balance doesn't change.

**Solution**:
1. Check if the backend is actually updating the database
2. Verify the response contains the new balance
3. Check for caching issues

## What to Look For in Logs

When you run the app and make a video call, watch for these logs:

### ✅ Success Pattern:
```
⏰ Minute 1 completed for session vid-xxx
💰 Attempting to deduct ₹34 from wallet for user xxx
📊 Current balance BEFORE deduction: ₹600
🔄 API Request: { url: "...", body: { userId: "...", amount: -34, reason: "VIDEO_CALL" } }
📡 API Response: { status: 200, statusText: "OK", ok: true }
📄 Response body: {"walletId":"...","userId":"...","balance":566}
✅ Wallet updated: { walletId: "...", userId: "...", balance: 566 }
✅ Successfully deducted ₹34. New balance: ₹566
```

### ❌ Error Pattern:
```
⏰ Minute 1 completed for session vid-xxx
💰 Attempting to deduct ₹34 from wallet for user xxx
📊 Current balance BEFORE deduction: ₹600
🔄 API Request: { url: "...", body: { userId: "...", amount: -34, reason: "VIDEO_CALL" } }
📡 API Response: { status: 500, statusText: "Internal Server Error", ok: false }
📄 Response body: {"path":null,"error":"Internal Server Error","message":"..."}
❌ API Error: { status: 500, ... }
❌ Error processing minute tick: ...
🛑 Stopped billing timer for session vid-xxx
```

## Debugging Steps

1. **Check userId format**:
   ```typescript
   console.log('User ID:', user.id);
   // Should be UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   ```

2. **Test API with curl** (see above)

3. **Check backend logs** for the actual error

4. **Verify database**:
   - Does the user exist?
   - Does the user have a wallet record?
   - Is the wallet balance correct?

5. **Check network**:
   - Can the app reach the backend?
   - Is the BASE_URL correct?
   - Are there any firewall issues?

## Quick Fix Checklist

- [ ] Backend API is running on `http://172.20.10.5:3000`
- [ ] User has a wallet record in the database
- [ ] User's wallet has sufficient balance (≥₹34)
- [ ] userId is in correct UUID format
- [ ] API endpoint `/api/wallet/update` exists and accepts PUT requests
- [ ] Request body format matches: `{ userId, amount, reason }`
- [ ] Response format matches: `{ walletId, userId, balance }`
- [ ] No authentication/authorization issues

## Still Not Working?

If the API test with curl works but the app doesn't:

1. **Check JWT token**: The app might be sending an invalid/expired token
2. **Check userId conversion**: The app might be converting the userId incorrectly
3. **Compare requests**: Use the logs to compare the app's request with the curl request
4. **Network issues**: The device might not be able to reach the backend

If curl also fails:

1. **Backend issue**: Check backend logs and database
2. **API not implemented**: Verify the endpoint exists
3. **Database issue**: Check if the wallet table exists and has data
