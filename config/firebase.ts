// React Native Firebase requires native modules (not available in Expo Go or web).
// This module gracefully handles both Expo Go and development builds.

import Constants from 'expo-constants';

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

// Firebase initialization flag
let isFirebaseInitialized = false;

/**
 * Initialize Firebase
 * This function is safe to call in both Expo Go and development builds
 */
const initializeFirebase = () => {
  try {
    // Try to import Firebase modules
    const appModule = require('@react-native-firebase/app');
    const firestoreModule = require('@react-native-firebase/firestore');
    const authModule = require('@react-native-firebase/auth');
    
    // Check if native modules are actually available
    if (!appModule || !appModule.default) {
      throw new Error('Firebase app module not available');
    }
    
    // Get existing apps
    const apps = appModule.getApps ? appModule.getApps() : [];
    
    if (apps.length === 0) {
      // Firebase auto-initializes from google-services.json (Android) or GoogleService-Info.plist (iOS)
      console.log('🔥 Initializing Firebase from platform config files...');
      
      // Access the default app instance (triggers auto-initialization)
      firebaseApp = appModule.default.app();
      
      if (!firebaseApp) {
        throw new Error('Firebase app failed to initialize');
      }
    } else {
      // Firebase already initialized
      firebaseApp = appModule.getApp ? appModule.getApp() : apps[0];
      console.log('🔥 Firebase already initialized:', firebaseApp.name);
    }
    
    // Initialize Firestore and Auth instances
    firebaseFirestore = firestoreModule.default();
    firebaseAuth = authModule.default();
    
    if (!firebaseFirestore || !firebaseAuth) {
      throw new Error('Failed to initialize Firestore or Auth');
    }
    
    // Set up field value
    firestoreFieldValue = firestoreModule.default.FieldValue;
    
    // Set up modular API functions
    firestoreDoc = (db: any, collectionPath: string, docId: string) => {
      return db.collection(collectionPath).doc(docId);
    };
    
    firestoreCollection = (docRef: any, collectionPath: string) => {
      return docRef.collection(collectionPath);
    };
    
    firestoreSetDoc = async (ref: any, data: any) => {
      return await ref.set(data);
    };
    
    firestoreUpdateDoc = async (ref: any, data: any) => {
      return await ref.update(data);
    };
    
    firestoreDeleteDoc = async (ref: any) => {
      return await ref.delete();
    };
    
    firestoreAddDoc = async (ref: any, data: any) => {
      return await ref.add(data);
    };
    
    firestoreOnSnapshot = (ref: any, onNext: any, onError?: any) => {
      return ref.onSnapshot(onNext, onError);
    };
    
    firestoreGetDoc = async (ref: any) => {
      return await ref.get();
    };
    
    isFirebaseInitialized = true;
    
    console.log('✅ Firebase initialized successfully');
    console.log('   App name:', firebaseApp.name);
    console.log('   Firestore:', firebaseFirestore ? '✓' : '✗');
    console.log('   Auth:', firebaseAuth ? '✓' : '✗');
    
    return true;
  } catch (error: any) {
    isFirebaseInitialized = false;
    
    // Check if this is Expo Go
    const isExpoGo = !Constants.appOwnership || Constants.appOwnership === 'expo';
    
    if (isExpoGo) {
      console.log('ℹ️ Running in Expo Go - Firebase native modules not available');
      console.log('   Build a development build to use Firebase features');
    } else {
      console.error('❌ Firebase initialization failed:', error.message);
      console.error('   Make sure google-services.json (Android) or GoogleService-Info.plist (iOS) is configured');
    }
    
    return false;
  }
};

// Auto-initialize Firebase on module load
initializeFirebase();

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
  isFirebaseInitialized,
};
