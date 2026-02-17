# Firebase Console – Android fingerprints

Add these **SHA-1** and **SHA-256** values in the Firebase Console for your Android app so Auth (e.g. Google Sign-In) and other services work.

## Where to add them

1. Open [Firebase Console](https://console.firebase.google.com) → your project.
2. Go to **Project settings** (gear) → **Your apps**.
3. Select your Android app (`com.dekhokaun.advijr`).
4. Under **SHA certificate fingerprints**, click **Add fingerprint** and paste each value below.

---

## App keystore (used for debug & release builds)

Your app is signed with `android/app/debug.keystore`. Use these in Firebase:

**SHA-1**
```
5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
```

**SHA-256**
```
FA:C6:17:45:DC:09:03:78:6F:B9:ED:E6:2A:96:2B:39:9F:73:48:F0:BB:6F:89:9B:83:32:66:75:91:03:3B:9C
```

---

## System debug keystore (optional)

If you ever run or test with the default `~/.android/debug.keystore`, add these too:

**SHA-1**
```
5B:CA:30:02:80:AE:DC:77:AF:5A:95:DB:9B:DB:33:94:77:6C:FC:E9
```

**SHA-256**
```
3E:3C:09:89:04:51:FC:1D:C8:4A:48:DF:68:8B:D9:31:01:E1:93:51:F0:E2:92:AE:39:7F:E5:2A:13:D4:59:50
```

---

## Regenerating fingerprints

From project root:

```bash
cd android && ./gradlew signingReport
```

Then under `:app:signingReport` → your variant, copy the **SHA1** and **SHA-256** lines. For release builds with a different keystore, add that keystore’s SHA-1 and SHA-256 in Firebase as well.
