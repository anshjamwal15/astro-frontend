import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Get the appropriate base URL based on platform and environment
// const getBaseUrl = () => {
//   // For development, use the manifest debuggerHost if available
//   const debuggerHost = Constants.expoConfig?.hostUri?.split(':').shift();
  
//   if (Platform.OS === 'web') {
//     // For web, use localhost
//     return 'http://localhost:3000';
//   } else if (debuggerHost) {
//     // For mobile, use the debugger host (Expo's automatic detection)
//     return `http://${debuggerHost}:3000`;
//   } else {
//     // Fallback for mobile - replace with your computer's IP address
//     return 'http://192.168.1.100:3000'; // Update this with your actual IP
//   }
// };

// Authentication Configuration
// Replace these with your actual API keys

export const AUTH_CONFIG = {
  // Google OAuth Configuration
  GOOGLE: {
    WEB_CLIENT_ID: 'YOUR_GOOGLE_WEB_CLIENT_ID.apps.googleusercontent.com',
    IOS_CLIENT_ID: 'YOUR_GOOGLE_IOS_CLIENT_ID.apps.googleusercontent.com',
    ANDROID_CLIENT_ID: 'YOUR_GOOGLE_ANDROID_CLIENT_ID.apps.googleusercontent.com',
  },

  // Backend API Configuration
  API: {
    BASE_URL: "http://192.168.1.11:3000", // Dynamic URL with Expo auto-detection
    ENDPOINTS: {
      REGISTER: '/api/user/register',
      LOGIN: '/api/user/login',
      GET_USER: '/api/user',
      UPDATE_USER: '/api/user/update',
      GET_ADVISORS: '/api/mentor/list',
      GET_SERVICES: '/api/services',
    },
    // API Keys for backend authentication (from mindaro-backend)
    API_KEY: 'test-api-key-2024', // Matches backend configuration
    CLIENT_SECRET: 'test-client-secret-2024', // Matches backend co`nfiguration
    
    // Request timeout in milliseconds
    TIMEOUT: 10000,
    
    // Retry configuration
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000,
  },
  
  // Database Configuration (for reference)
  DATABASE: {
    TYPE: 'MariaDB', // MariaDB/MySQL
    HOST: 'localhost',
    PORT: 3306,
    NAME: 'test_advj',
    // Note: Database credentials should be on the backend only
  }
};

// MINDARO BACKEND INTEGRATION:
// Using production MariaDB database with live API endpoints
// 
// Backend Endpoints Available:
// - POST /api/user/register - User registration
// - POST /api/user/login - User login
// - GET /api/user/:email - Get user profile
// - PUT /api/user/update - Update user profile
// - GET /api/mentor/list - Get mentors list
// - GET /api/services - Get astrology services
//
// API Authentication:
// - X-API-Key: mindaro-api-key-2024
// - X-Client-Secret: mindaro-client-secret-2024
//
// Database Tables:
// - a1_user (users with UUID primary key)
// - a1_mentor (mentors with specialties and languages)
// - astrology_services (with categories and pricing)

// TO ENABLE GOOGLE & FACEBOOK AUTH:
// 1. Follow the detailed setup guide in AUTHENTICATION_SETUP.md
// 2. Replace the placeholder values above with your real API keys
// 3. Update app.json with Facebook configuration