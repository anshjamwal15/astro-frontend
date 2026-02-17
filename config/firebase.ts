// React Native Firebase requires native modules (not available in Expo Go or web).
// Load only when native module is present to avoid "RNFBAppModule not found" crash.
let firebaseApp: any = null;
let firebaseAuth: any = null;
let firebaseFirestore: any = null;
let firestoreFieldValue: { serverTimestamp: () => any } | null = null;

// Modular API functions
let firestoreDoc: any = null;
let firestoreCollection: any = null;
let firestoreSetDoc: any = null;
let firestoreUpdateDoc: any = null;
let firestoreDeleteDoc: any = null;
let firestoreAddDoc: any = null;
let firestoreOnSnapshot: any = null;
let firestoreGetDoc: any = null;

try {
  const app = require('@react-native-firebase/app').default;
  const auth = require('@react-native-firebase/auth').default;
  const firestoreModule = require('@react-native-firebase/firestore');
  
  firebaseApp = app;
  firebaseAuth = auth();
  firebaseFirestore = firestoreModule.default();
  firestoreFieldValue = firestoreModule.default.FieldValue;
  
  // Import modular API functions
  firestoreDoc = firestoreModule.doc;
  firestoreCollection = firestoreModule.collection;
  firestoreSetDoc = firestoreModule.setDoc;
  firestoreUpdateDoc = firestoreModule.updateDoc;
  firestoreDeleteDoc = firestoreModule.deleteDoc;
  firestoreAddDoc = firestoreModule.addDoc;
  firestoreOnSnapshot = firestoreModule.onSnapshot;
  firestoreGetDoc = firestoreModule.getDoc;
} catch (e) {
  if (__DEV__) {
    console.warn(
      'Firebase native module not available (expected in Expo Go or web). Use a development build for full Firebase support.'
    );
  }
}

export { 
  firebaseApp, 
  firebaseAuth, 
  firebaseFirestore, 
  firestoreFieldValue,
  firestoreDoc,
  firestoreCollection,
  firestoreSetDoc,
  firestoreUpdateDoc,
  firestoreDeleteDoc,
  firestoreAddDoc,
  firestoreOnSnapshot,
  firestoreGetDoc,
};
