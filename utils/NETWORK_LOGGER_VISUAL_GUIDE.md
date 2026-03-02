# Network Logger Visual Guide 🎨

This guide shows you exactly what the network logger output looks like in your console.

## 📊 Log Structure

### 1. Request Log (Cyan/Blue Theme)

```
================================================================================
🚀 API REQUEST [REQ_1709380245123_abc123]
================================================================================
📍 URL: https://api.example.com/api/wallet/balance/user123
🔧 Method: GET
⏰ Time: 2026-03-02T10:30:45.123Z

📋 Request Headers:
  accept: application/json
  content-type: application/json
  authorization: ***MASKED***
  x-api-key: ***MASKED***

📦 Request Payload:
{
  "userId": "user123",
  "amount": 100,
  "method": "upi"
}
================================================================================
```

### 2. Success Response Log (Green Theme)

```
================================================================================
✅ API RESPONSE [REQ_1709380245123_abc123]
================================================================================
📍 URL: https://api.example.com/api/wallet/balance/user123
📊 Status: 200 OK
⏱️  Duration: 245ms

📋 Response Headers:
  content-type: application/json
  content-length: 156
  date: Mon, 02 Mar 2026 10:30:45 GMT

📦 Response Payload:
{
  "userId": "user123",
  "balance": 1500,
  "createdAt": "2026-03-01T00:00:00.000Z",
  "updatedAt": "2026-03-02T10:30:45.123Z"
}
================================================================================
```

### 3. Error Response Log (Red Theme)

```
================================================================================
⚠️ API RESPONSE [REQ_1709380245456_def456]
================================================================================
📍 URL: https://api.example.com/api/wallet/update
📊 Status: 400 Bad Request
⏱️  Duration: 180ms

📋 Response Headers:
  content-type: application/json
  content-length: 89

📦 Response Payload:
{
  "error": "Insufficient balance",
  "message": "Cannot deduct ₹500. Current balance: ₹100",
  "code": "INSUFFICIENT_FUNDS"
}
================================================================================
```

### 4. Network Error Log (Red Theme)

```
================================================================================
❌ API ERROR [REQ_1709380245789_ghi789]
================================================================================
⏱️  Duration: 5000ms

🚨 Error Details:
TypeError: Network request failed
    at fetch (native)
    at WalletApiService.getBalance (WalletApiService.ts:45)
================================================================================
```

## 🎨 Color Coding Reference

| Element | Color | Meaning |
|---------|-------|---------|
| Request Header | Cyan | Outgoing API request |
| Response Header (2xx) | Blue/Green | Successful response |
| Response Header (4xx/5xx) | Red/Orange | Error response |
| Error Header | Red | Network/fetch error |
| URL | Bright White | Request destination |
| Method | Yellow | HTTP method |
| Status 2xx | Green | Success |
| Status 3xx | Yellow | Redirect |
| Status 4xx | Orange | Client error |
| Status 5xx | Red | Server error |
| Headers Section | Magenta | Header information |
| Request Payload | Green | Outgoing data |
| Response Payload | Cyan | Incoming data |
| Duration | Yellow | Request timing |
| Masked Values | White | Sensitive data hidden |

## 📱 Real-World Examples

### Example 1: Wallet Balance Check

```
🚀 API REQUEST [REQ_1709380245123_abc123]
📍 URL: https://api.example.com/api/wallet/balance/user123
🔧 Method: GET
⏰ Time: 2026-03-02T10:30:45.123Z

✅ API RESPONSE [REQ_1709380245123_abc123]
📊 Status: 200 OK
⏱️  Duration: 245ms
📦 Response: { "balance": 1500 }
```

### Example 2: Add Money to Wallet

```
🚀 API REQUEST [REQ_1709380246234_bcd234]
📍 URL: https://api.example.com/api/wallet/add-money
🔧 Method: POST
📦 Request: { "amount": 500, "method": "upi" }

✅ API RESPONSE [REQ_1709380246234_bcd234]
📊 Status: 200 OK
⏱️  Duration: 1250ms
📦 Response: { "balance": 2000, "transactionId": "TXN123" }
```

### Example 3: Deduct Money (Insufficient Balance)

```
🚀 API REQUEST [REQ_1709380247345_cde345]
📍 URL: https://api.example.com/api/wallet/update
🔧 Method: PUT
📦 Request: { "userId": "user123", "amount": -5000, "reason": "video_call" }

⚠️ API RESPONSE [REQ_1709380247345_cde345]
📊 Status: 400 Bad Request
⏱️  Duration: 180ms
📦 Response: { "error": "Insufficient balance" }
```

### Example 4: Network Timeout

```
🚀 API REQUEST [REQ_1709380248456_def456]
📍 URL: https://api.example.com/api/wallet/transactions
🔧 Method: POST

❌ API ERROR [REQ_1709380248456_def456]
⏱️  Duration: 30000ms
🚨 Error: TypeError: Network request failed
```

## 🔍 What to Look For

### Debugging Tips

1. **Request ID**: Match requests with responses using the ID
2. **Duration**: Identify slow API calls (>1000ms)
3. **Status Codes**: 
   - 2xx = Success ✅
   - 4xx = Client error (check your request) ⚠️
   - 5xx = Server error (backend issue) ❌
4. **Masked Headers**: Security headers are automatically hidden
5. **Payload Size**: Large payloads may be truncated

### Common Patterns

**Successful Flow:**
```
🚀 REQUEST → ✅ RESPONSE (2xx) → Duration: ~200-500ms
```

**Client Error:**
```
🚀 REQUEST → ⚠️ RESPONSE (4xx) → Check request payload
```

**Server Error:**
```
🚀 REQUEST → ❌ RESPONSE (5xx) → Backend issue
```

**Network Error:**
```
🚀 REQUEST → ❌ ERROR → Check internet connection
```

## 🎯 Quick Reference

| Symbol | Meaning |
|--------|---------|
| 🚀 | Request sent |
| ✅ | Success response |
| ⚠️ | Warning/client error |
| ❌ | Error/failure |
| 📍 | URL/endpoint |
| 🔧 | HTTP method |
| ⏰ | Timestamp |
| ⏱️ | Duration |
| 📋 | Headers |
| 📦 | Payload/body |
| 🚨 | Error details |
| 📊 | Status code |

## 💡 Pro Tips

1. **Filter by Request ID**: Search console for specific request ID to see full flow
2. **Monitor Duration**: Set alerts for requests >2000ms
3. **Check Patterns**: Look for repeated failed requests
4. **Payload Validation**: Verify request payload matches API spec
5. **Header Debugging**: Check if required headers are present

---

Happy debugging! 🐛🔍
