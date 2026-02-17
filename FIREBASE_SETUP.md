# Firebase setup for React Native

This project is linked to the Firebase project **mindaro-astrology-app** via the Firebase CLI.

## Link an existing Firebase project (CLI)

If you need to link this repo to a different Firebase project or set it up from scratch:

### 1. Install Firebase CLI (if needed)

```bash
npm install -g firebase-tools
```

### 2. Log in

```bash
firebase login
```

### 3. Select your project

From the project root:

```bash
# Use a specific project by ID
firebase use <your-project-id>

# Or add an alias and choose interactively
firebase use --add
```

Your choice is stored in `.firebaserc`. The current default is **mindaro-astrology-app**.

### 4. Confirm link

```bash
firebase use
# or
npm run firebase use
```

You should see your project ID with `(current)`.

### 5. Native app config (Android / iOS)

The CLI link only affects **Firestore rules**, **indexes**, and **hosting**. For the React Native app to talk to Firebase you need:

- **Android:** `android/app/google-services.json` from [Firebase Console](https://console.firebase.google.com) → Project settings → Your apps → Android app (download config).
- **iOS:** `ios/<YourApp>/GoogleService-Info.plist` from the same place for your iOS app.

Package name (Android) must be **com.dekhokaun.advijr** and bundle ID (iOS) must match your app. Add the Android/iOS apps in the Firebase project if they don’t exist, then download and replace the config files.

## NPM scripts

| Script | Command | Description |
|--------|---------|-------------|
| `npm run firebase` | `firebase` | Run any Firebase CLI command |
| `npm run firebase:use` | `firebase use` | Show or switch active project |
| `npm run firebase:deploy:rules` | `firebase deploy --only firestore:rules` | Deploy Firestore rules |
| `npm run firebase:deploy:indexes` | `firebase deploy --only firestore:indexes` | Deploy Firestore indexes |

## Deploy rules or indexes

```bash
npm run firebase:deploy:rules
npm run firebase:deploy:indexes
```

Or deploy both:

```bash
npx firebase deploy
```

## Android SHA fingerprints

See [FIREBASE_ANDROID_FINGERPRINTS.md](./FIREBASE_ANDROID_FINGERPRINTS.md) for SHA-1/SHA-256 values to add in Firebase Console for Auth (e.g. Google Sign-In).
