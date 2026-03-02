# Network Logger Setup Complete ✅

A comprehensive network logging system has been created for your React Native app. All API calls will now be automatically logged with color-coded formatting.

## 📁 Files Created

1. **utils/NetworkLogger.ts** - Main logger implementation
2. **utils/ConsoleColors.ts** - ANSI color utilities
3. **utils/NetworkLogger.types.ts** - TypeScript type definitions
4. **utils/NetworkLogger.README.md** - Detailed documentation
5. **utils/NetworkLogger.example.tsx** - Example usage component
6. **config/networkLogger.config.ts** - Configuration file

## 🚀 Already Configured

The network logger is already initialized in `app/_layout.tsx` and will start automatically when your app launches.

## 🎨 Color Scheme

- **🔵 Cyan** - Request logs
- **🔷 Blue** - Response logs  
- **🟢 Green** - Success status (2xx) & request payloads
- **🟡 Yellow** - Redirect status (3xx) & timing info
- **🔴 Red** - Error status (4xx, 5xx) & errors
- **🟣 Magenta** - Headers sections
- **⚪ White** - Important values

## 📊 What Gets Logged

For every API call, you'll see:

### Request Log
- Request ID (for tracking)
- URL
- HTTP Method
- Timestamp
- Headers (with sensitive data masked)
- Request payload/body

### Response Log
- Request ID (matches request)
- URL
- Status code with color indicator
- Duration in milliseconds
- Response headers
- Response payload/body

### Error Log
- Request ID
- Duration
- Error details

## ⚙️ Configuration

Edit `config/networkLogger.config.ts` to customize:

```typescript
export const NETWORK_LOGGER_CONFIG = {
  enabled: __DEV__, // Only in development
  logHeaders: true,
  logRequestBody: true,
  logResponseBody: true,
  maxBodyLength: 10000,
  excludeUrls: [], // Add regex patterns to exclude
  includeUrls: [], // Add regex patterns to include only
  logMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
};
```

## 🔒 Security Features

- Automatically masks sensitive headers:
  - `authorization`
  - `x-api-key`
  - `x-client-secret`
  - `cookie`
  - `set-cookie`

## 🎯 Usage Examples

### Automatic (Default)
All fetch calls are automatically logged:

```typescript
// This will be automatically logged
const response = await fetch('https://api.example.com/data');
```

### Manual Control

```typescript
import { disableNetworkLogger, enableNetworkLogger } from '@/utils/NetworkLogger';

// Temporarily disable
disableNetworkLogger();

// Re-enable
enableNetworkLogger();
```

### Custom Configuration

```typescript
import { initNetworkLogger } from '@/utils/NetworkLogger';

initNetworkLogger({
  enabled: true,
  logHeaders: false, // Don't log headers
  maxBodyLength: 5000, // Smaller limit
});
```

## 🧪 Testing

A test component is available at `utils/NetworkLogger.example.tsx` that you can import into any screen to test the logger with sample API calls.

## 📱 Example Output

When you make an API call, you'll see something like this in your console:

```
================================================================================
🚀 API REQUEST [REQ_1709380245123_abc123]
================================================================================
📍 URL: https://api.example.com/wallet/balance/user123
🔧 Method: GET
⏰ Time: 2026-03-02T10:30:45.123Z

📋 Request Headers:
  accept: application/json
  authorization: ***MASKED***

================================================================================

================================================================================
✅ API RESPONSE [REQ_1709380245123_abc123]
================================================================================
📍 URL: https://api.example.com/wallet/balance/user123
📊 Status: 200 OK
⏱️  Duration: 245ms

📦 Response Payload:
{
  "userId": "user123",
  "balance": 1500
}
================================================================================
```

## 🎓 Next Steps

1. Run your app: `npm start`
2. Make any API call (wallet, auth, etc.)
3. Check your console for color-coded logs
4. Customize settings in `config/networkLogger.config.ts` if needed

## 💡 Tips

- Disable in production by keeping `enabled: __DEV__` in config
- Reduce noise by excluding analytics/tracking URLs
- Adjust `maxBodyLength` for large API responses
- Use the example component to test the logger

## 🐛 Troubleshooting

If logs aren't appearing:
1. Check that `enabled: true` in config
2. Verify the logger is initialized in `app/_layout.tsx`
3. Check your console filters
4. Ensure you're using `fetch` for API calls (not axios or other libraries)

---

The network logger is now active and will help you debug API calls with ease! 🎉
