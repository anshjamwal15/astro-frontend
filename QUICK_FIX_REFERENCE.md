# Quick Fix Reference - Wallet Deduction

## What Changed?

The app now tries **TWO** endpoints automatically:

1. `PUT /api/wallet/update` (tries first)
2. `POST /api/wallet/deduct-money` (fallback if first fails)

## Test Right Now

Run this command to test both endpoints:

```bash
# Make script executable
chmod +x test-wallet-api.sh

# Run test
./test-wallet-api.sh
```

Or test manually:

```bash
# Test endpoint 1 (PUT /api/wallet/update)
curl -X PUT 'http://172.20.10.5:3000/api/wallet/update' \
  -H 'Content-Type: application/json' \
  -H 'X-API-Key: test-api-key-2024' \
  -H 'X-Client-Secret: test-client-secret-2024' \
  -d '{"userId":"5844f740-94af-41cb-ba66-d02e849cbaf7","amount":-1,"reason":"VIDEO_CALL"}'

# Test endpoint 2 (POST /api/wallet/deduct-money)
curl -X POST 'http://172.20.10.5:3000/api/wallet/deduct-money' \
  -H 'Content-Type: application/json' \
  -H 'X-API-Key: test-api-key-2024' \
  -H 'X-Client-Secret: test-client-secret-2024' \
  -d '{"userId":"5844f740-94af-41cb-ba66-d02e849cbaf7","amount":1,"method":"VIDEO_CALL"}'
```

## What to Look For

### ✅ Success (200 OK)
```json
{
  "userId": "5844f740-94af-41cb-ba66-d02e849cbaf7",
  "balance": 599
}
```

### ❌ Failure (500 Error)
```json
{
  "error": "Internal Server Error",
  "message": "An error occurred while processing your request"
}
```

## If Both Fail

The issue is in your **backend**, not the app. Check:

1. **Backend running?** `curl http://172.20.10.5:3000/health`
2. **User exists?** Check database for userId
3. **Wallet exists?** User needs a wallet record
4. **Backend logs?** Check for actual error

## Files Modified

- `services/WalletApiService.ts` - Added fallback logic
- `test-wallet-api.sh` - Test script for both endpoints

## Run the App

The app will now automatically:
1. Try PUT /api/wallet/update
2. If that fails → Try POST /api/wallet/deduct-money
3. If both fail → Show insufficient balance

Watch the logs to see which endpoint works!
