# Network Logger

A comprehensive network logging utility for React Native that intercepts and logs all API calls with color-coded formatting.

## Features

- 🚀 Automatic interception of all `fetch` API calls
- 🎨 Color-coded console output for easy debugging
- 📦 Logs request and response payloads
- 📋 Logs headers (with sensitive data masking)
- ⏱️ Tracks request duration
- 🔒 Masks sensitive headers (Authorization, API keys, etc.)
- ⚙️ Configurable logging options

## Installation

The network logger is already initialized in `app/_layout.tsx` and will automatically start logging all API calls when the app starts.

## Usage

### Default Configuration

The logger is initialized with these default settings:

```typescript
{
  enabled: true,
  logHeaders: true,
  logRequestBody: true,
  logResponseBody: true,
  maxBodyLength: 10000, // Max characters to log
}
```

### Manual Control

You can manually control the logger:

```typescript
import { 
  initNetworkLogger, 
  disableNetworkLogger, 
  enableNetworkLogger 
} from '@/utils/NetworkLogger';

// Initialize with custom config
initNetworkLogger({
  enabled: true,
  logHeaders: false, // Don't log headers
  logRequestBody: true,
  logResponseBody: true,
  maxBodyLength: 5000,
});

// Disable logging
disableNetworkLogger();

// Re-enable logging
enableNetworkLogger();
```

## Log Format

### Request Log (Cyan)
```
================================================================================
🚀 API REQUEST [REQ_1234567890_abc123]
================================================================================
📍 URL: https://api.example.com/wallet/balance/user123
🔧 Method: GET
⏰ Time: 2026-03-02T10:30:45.123Z

📋 Request Headers:
  accept: application/json
  content-type: application/json
  authorization: ***MASKED***

📦 Request Payload:
{
  "userId": "user123",
  "amount": 100
}
================================================================================
```

### Response Log (Blue)
```
================================================================================
✅ API RESPONSE [REQ_1234567890_abc123]
================================================================================
📍 URL: https://api.example.com/wallet/balance/user123
📊 Status: 200 OK
⏱️  Duration: 245ms

📋 Response Headers:
  content-type: application/json
  content-length: 156

📦 Response Payload:
{
  "userId": "user123",
  "balance": 1500,
  "createdAt": "2026-03-01T00:00:00.000Z",
  "updatedAt": "2026-03-02T10:30:45.123Z"
}
================================================================================
```

### Error Log (Red)
```
================================================================================
❌ API ERROR [REQ_1234567890_abc123]
================================================================================
⏱️  Duration: 5000ms

🚨 Error Details:
TypeError: Network request failed
================================================================================
```

## Color Coding

- **Cyan**: Request logs
- **Blue**: Response logs
- **Green**: Successful status (2xx) and request payloads
- **Yellow**: Redirect status (3xx) and method/duration
- **Red**: Error status (4xx, 5xx) and error logs
- **Magenta**: Headers section
- **White/Bright**: Important values

## Security

The logger automatically masks sensitive headers:
- `authorization`
- `x-api-key`
- `x-client-secret`
- `cookie`
- `set-cookie`

These will appear as `***MASKED***` in the logs.

## Performance

- Minimal overhead on API calls
- Response cloning ensures original response is not consumed
- Configurable body length limits prevent excessive logging
- Can be disabled in production builds

## Tips

1. **Disable in Production**: Add environment check to disable logging in production:
   ```typescript
   initNetworkLogger({
     enabled: __DEV__, // Only enable in development
   });
   ```

2. **Reduce Noise**: Disable headers if you only care about payloads:
   ```typescript
   initNetworkLogger({
     logHeaders: false,
   });
   ```

3. **Large Responses**: Adjust `maxBodyLength` for large API responses:
   ```typescript
   initNetworkLogger({
     maxBodyLength: 50000, // Increase limit
   });
   ```

## Troubleshooting

### Logs not appearing
- Check that the logger is initialized in `app/_layout.tsx`
- Verify `enabled: true` in configuration
- Check console filters in your development tools

### Colors not showing
- ANSI colors work in most terminals and React Native debuggers
- Some environments may not support color codes
- Colors will appear as escape sequences in unsupported environments

### Performance issues
- Reduce `maxBodyLength` to limit log size
- Disable `logHeaders` if not needed
- Consider disabling in production builds
