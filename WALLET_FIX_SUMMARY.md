# Wallet Deduction Fix - Final Solution

## Problem
The backend API endpoint `PUT /api/wallet/update` was returning a 500 Internal Server Error when trying to deduct money from the wallet during video calls.

## Root Cause
The backend might not have the `/api/wallet/update` endpoint implemented, or it might have different validation/authentication requirements.

## Solution
Implemented a **dual-endpoint fallback system**:

1. **Primary Endpoint**: `PUT /api/wallet/update`
   - Request: `{ userId, amount: -34, reason: "VIDEO_CALL" }`
   - Response: `{ walletId, userId, balance }`

2. **Fallback Endpoint**: `POST /api/wallet/deduct-money`
   - Request: `{ userId, amount: 34, method: "VIDEO_CALL" }`
   - Response: `{ userId, balance, createdAt, updatedAt }`

The app now automatically tries the primary endpoint first, and if it fails, it falls back to the legacy endpoint.

## Changes Made

### 1. WalletApiService.ts
- Split `deductMoney()` into three methods:
  - `deductMoney()` - Public method with fallback logic
  - `deductMoneyUpdate()` - Primary endpoint (PUT /api/wallet/update)
  - `deductMoneyLegacy()` - Fallback endpoint (POST /api/wallet/deduct-money)
- Added API key headers (`X-API-Key`, `X-Client-Secret`)
- Enhanced logging for both endpoints

### 2. test-wallet-api.sh
- Updated to test both endpoints
- Added API key headers
- Reduced test amount to ₹1 for safety

## How It Works

```
1. User makes video call
2. After 1 minute, billing timer triggers
3. App calls WalletApiService.deductMoney()
4. Try PUT /api/wallet/update
   ├─ Success (200) → Use updated balance
   └─ Failure (500) → Try POST /api/wallet/deduct-money
      ├─ Success (200) → Use updated balance
      └─ Failure → Show insufficient balance dialog
```

## Testing

### Option 1: Run the test script
```bash
chmod +x test-wallet-api.sh
./test-wallet-api.sh
```

This will test both endpoints and show which one works.

### Option 2: Test manually with curl

**Test Primary Endpoint:**
```bash
curl -X PUT \
  'http://172.20.10.5:3000/api/wallet/update' \
  -H 'accept: application/hal+json' \
  -H 'Content-Type: application/json' \
  -H 'X-API-Key: test-api-key-2024' \
  -H 'X-Client-Secret: test-client-secret-2024' \
  -d '{
  "userId": "5844f740-94af-41cb-ba66-d02e849cbaf7",
  "amount": -1,
  "reason": "VIDEO_CALL"
}'
```

**Test Fallback Endpoint:**
```bash
curl -X POST \
  'http://172.20.10.5:3000/api/wallet/deduct-money' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -H 'X-API-Key: test-api-key-2024' \
  -H 'X-Client-Secret: test-client-secret-2024' \
  -d '{
  "userId": "5844f740-94af-41cb-ba66-d02e849cbaf7",
  "amount": 1,
  "method": "VIDEO_CALL"
}'
```

## Expected Logs

### Success with Primary Endpoint:
```
🔄 API Request (UPDATE): { url: "...", method: "PUT", body: {...} }
📡 API Response (UPDATE): { status: 200, statusText: "OK", ok: true }
📄 Response body: {"walletId":"...","userId":"...","balance":599}
✅ Wallet updated (UPDATE): { walletId: "...", userId: "...", balance: 599 }
✅ Successfully deducted ₹34. New balance: ₹599
```

### Success with Fallback Endpoint:
```
🔄 API Request (UPDATE): { url: "...", method: "PUT", body: {...} }
📡 API Response (UPDATE): { status: 500, statusText: "", ok: false }
❌ API Error (UPDATE): { status: 500, ... }
⚠️ Primary endpoint failed, trying fallback... Wallet update failed (500): ...
🔄 API Request (DEDUCT): { url: "...", method: "POST", body: {...} }
📡 API Response (DEDUCT): { status: 200, statusText: "OK", ok: true }
📄 Response body: {"userId":"...","balance":599,"createdAt":"...","updatedAt":"..."}
✅ Wallet deducted (DEDUCT): { userId: "...", balance: 599, ... }
✅ Successfully deducted ₹34. New balance: ₹599
```

## Backend Requirements

Your backend needs to implement **at least one** of these endpoints:

### Option A: PUT /api/wallet/update (Recommended)
```typescript
PUT /api/wallet/update
Headers: X-API-Key, X-Client-Secret, Authorization (optional)
Body: { userId: string, amount: number, reason: string }
Response: { walletId: string, userId: string, balance: number }
```

### Option B: POST /api/wallet/deduct-money (Fallback)
```typescript
POST /api/wallet/deduct-money
Headers: X-API-Key, X-Client-Secret, Authorization (optional)
Body: { userId: string, amount: number, method: string }
Response: { userId: string, balance: number, createdAt: string, updatedAt: string }
```

## Next Steps

1. **Run the test script** to see which endpoint works
2. **Check backend logs** to understand why `/api/wallet/update` returns 500
3. **Fix the backend** to implement the endpoint properly, or
4. **Use the fallback** - the app will automatically use `/api/wallet/deduct-money` if `/api/wallet/update` fails

## Benefits of This Approach

✅ **Automatic fallback** - No manual intervention needed
✅ **Backward compatible** - Works with both old and new backends
✅ **Detailed logging** - Easy to debug which endpoint is being used
✅ **Graceful degradation** - App continues to work even if one endpoint fails
✅ **Future-proof** - Can easily add more fallback endpoints if needed

## If Still Not Working

If both endpoints fail:

1. **Check backend is running**: `curl http://172.20.10.5:3000/health`
2. **Check user exists**: Verify userId in database
3. **Check wallet exists**: User must have a wallet record
4. **Check balance**: User must have sufficient funds
5. **Check authentication**: Verify API keys and JWT token
6. **Check backend logs**: Look for the actual error message

The detailed logs will show exactly which endpoint was tried and what error was returned.
