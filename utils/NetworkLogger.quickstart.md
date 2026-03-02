# Network Logger Quick Start 🚀

## ✅ Already Set Up!

The network logger is already configured and running. Just start your app and make API calls.

## 🎯 What You Get

Every `fetch` call automatically logs:
- ✅ Request URL, method, headers, payload
- ✅ Response status, headers, payload  
- ✅ Request duration
- ✅ Color-coded by status (green=success, red=error)
- ✅ Sensitive headers masked

## 🎨 Console Output

```
🚀 REQUEST → GET /api/wallet/balance
📦 Payload: { userId: "123" }

✅ RESPONSE → 200 OK (245ms)
📦 Payload: { balance: 1500 }
```

## ⚙️ Customize

Edit `config/networkLogger.config.ts`:

```typescript
export const NETWORK_LOGGER_CONFIG = {
  enabled: __DEV__,        // Only in dev mode
  logHeaders: true,        // Show headers
  logRequestBody: true,    // Show request payload
  logResponseBody: true,   // Show response payload
  maxBodyLength: 10000,    // Max chars to log
};
```

## 🎛️ Manual Control

```typescript
import { disableNetworkLogger, enableNetworkLogger } from '@/utils/NetworkLogger';

disableNetworkLogger(); // Turn off
enableNetworkLogger();  // Turn on
```

## 🔍 Filter Logs

Exclude specific URLs:

```typescript
// In config/networkLogger.config.ts
excludeUrls: [
  /analytics/,
  /tracking/,
]
```

Only log specific URLs:

```typescript
includeUrls: [
  /api\/wallet/,
  /api\/auth/,
]
```

## 🐛 Troubleshooting

**No logs appearing?**
- Check `enabled: true` in config
- Verify using `fetch` (not axios)
- Check console filters

**Too much noise?**
- Set `logHeaders: false`
- Add URLs to `excludeUrls`
- Reduce `maxBodyLength`

**Colors not showing?**
- ANSI colors work in most terminals
- Try different console viewer

## 📚 More Info

- Full docs: `utils/NetworkLogger.README.md`
- Visual guide: `utils/NETWORK_LOGGER_VISUAL_GUIDE.md`
- Example: `utils/NetworkLogger.example.tsx`

---

That's it! Your API calls are now being logged. Check your console! 🎉
