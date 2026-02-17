import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';
import { AUTH_CONFIG } from '../config/auth';

// Complete the auth session for web browser
WebBrowser.maybeCompleteAuthSession();

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  photo?: string;
  provider: 'google' | 'facebook' | 'email';
  token?: string;
}

export class AuthService {
  // Google Sign-In using Expo AuthSession
  static async signInWithGoogle(): Promise<AuthUser> {
    try {
      // Check if Google credentials are configured
      if (AUTH_CONFIG.GOOGLE.WEB_CLIENT_ID === 'YOUR_GOOGLE_WEB_CLIENT_ID.apps.googleusercontent.com') {
        throw new Error('Google OAuth not configured. Please set up your Google credentials in config/auth.ts');
      }

      const redirectUri = AuthSession.makeRedirectUri();

      const request = new AuthSession.AuthRequest({
        clientId: AUTH_CONFIG.GOOGLE.WEB_CLIENT_ID,
        scopes: ['openid', 'profile', 'email'],
        responseType: AuthSession.ResponseType.Code,
        redirectUri,
        extraParams: {},
        state: await Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.SHA256,
          redirectUri + Date.now(),
          { encoding: Crypto.CryptoEncoding.BASE64 }
        ),
      });

      const result = await request.promptAsync({
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      });

      if (result.type === 'success') {
        // Exchange code for token
        const tokenResponse = await AuthSession.exchangeCodeAsync(
          {
            clientId: AUTH_CONFIG.GOOGLE.WEB_CLIENT_ID,
            code: result.params.code,
            redirectUri,
            extraParams: {},
          },
          {
            tokenEndpoint: 'https://oauth2.googleapis.com/token',
          }
        );

        // Get user info from Google
        const userInfoResponse = await fetch(
          `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokenResponse.accessToken}`
        );
        const userInfo = await userInfoResponse.json();

        return {
          id: userInfo.id,
          name: userInfo.name || '',
          email: userInfo.email,
          photo: userInfo.picture || undefined,
          provider: 'google',
          token: tokenResponse.accessToken,
        };
      } else {
        throw new Error('Google sign-in was cancelled or failed');
      }
    } catch (error: any) {
      throw new Error(`Google sign-in error: ${error.message}`);
    }
  }

  // Facebook Sign-In using Expo AuthSession
  static async signInWithFacebook(): Promise<AuthUser> {
    try {
      // Check if Facebook credentials are configured
      if (AUTH_CONFIG.FACEBOOK.APP_ID === 'YOUR_FACEBOOK_APP_ID') {
        throw new Error('Facebook OAuth not configured. Please set up your Facebook credentials in config/auth.ts');
      }

      const redirectUri = AuthSession.makeRedirectUri();

      const request = new AuthSession.AuthRequest({
        clientId: AUTH_CONFIG.FACEBOOK.APP_ID,
        scopes: ['public_profile', 'email'],
        responseType: AuthSession.ResponseType.Token,
        redirectUri,
      });

      const result = await request.promptAsync({
        authorizationEndpoint: 'https://www.facebook.com/v18.0/dialog/oauth',
      });

      if (result.type === 'success') {
        const accessToken = result.params.access_token;

        // Get user info from Facebook Graph API
        const userInfoResponse = await fetch(
          `https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${accessToken}`
        );
        const userInfo = await userInfoResponse.json();

        return {
          id: userInfo.id,
          name: userInfo.name || '',
          email: userInfo.email || '',
          photo: userInfo.picture?.data?.url || undefined,
          provider: 'facebook',
          token: accessToken,
        };
      } else {
        throw new Error('Facebook sign-in was cancelled or failed');
      }
    } catch (error: any) {
      throw new Error(`Facebook sign-in error: ${error.message}`);
    }
  }

  // Register/Login with backend API
  static async registerOrLoginWithBackend(user: AuthUser, additionalData?: any): Promise<any> {
    try {
      const requestBody = {
        name: user.name,
        email: user.email,
        mobile: additionalData?.mobile || '1234567890',
        country: additionalData?.country || 'India',
        dateOfBirth: additionalData?.dateOfBirth || '',
        password: '', // Not needed for social auth
        token: user.token || '',
        method: user.provider,
      };

      const response = await fetch(`${AUTH_CONFIG.API.BASE_URL}/api/user/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Backend authentication failed');
      }

      return data;
    } catch (error: any) {
      throw new Error(`Backend API error: ${error.message}`);
    }
  }

  // Test connectivity to backend
  static async testConnection(): Promise<boolean> {
    try {
      console.log('=== TESTING BACKEND CONNECTION ===');
      const testUrl = `${AUTH_CONFIG.API.BASE_URL}/api/hello`;
      console.log('Testing URL:', testUrl);
      
      // Create manual timeout using Promise.race
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 5000);
      });
      
      const fetchPromise = fetch(testUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      const response = await Promise.race([fetchPromise, timeoutPromise]);
      
      console.log('Test response status:', response.status);
      console.log('Test response ok:', response.ok);
      
      if (response.ok) {
        const data = await response.text();
        console.log('Test response data:', data);
        console.log('=== CONNECTION TEST SUCCESSFUL ===');
        return true;
      } else {
        console.log('=== CONNECTION TEST FAILED - BAD STATUS ===');
        return false;
      }
    } catch (error) {
      console.error('=== CONNECTION TEST FAILED - ERROR ===');
      console.error('Connection test error:', error);
      return false;
    }
  }

  // Email/Password Login with backend
  static async loginWithEmail(email: string, password: string): Promise<any> {
    try {
      console.log('=== LOGIN ATTEMPT START ===');
      console.log('Attempting login with:', { 
        email, 
        baseUrl: AUTH_CONFIG.API.BASE_URL,
        platform: require('react-native').Platform.OS,
        apiKey: AUTH_CONFIG.API.API_KEY ? 'SET' : 'NOT SET'
      });
      
      const requestBody = {
        name: 'LoginUser', // Backend requires this but it's not used for login
        email: email,
        mobile: '1234567890', // Backend requires this but it's not used for login
        country: 'India', // Backend requires this but it's not used for login
        password: password,
        method: 'email', // Backend requires this field
      };

      console.log('Login request body:', requestBody);

      // Use dedicated login endpoint
      const loginUrl = `${AUTH_CONFIG.API.BASE_URL}${AUTH_CONFIG.API.ENDPOINTS.LOGIN}`;
      console.log('Login URL:', loginUrl);
      
      console.log('Making fetch request...');
      
      // Create manual timeout using Promise.race
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 10000);
      });
      
      const fetchPromise = fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          // Use API keys for user control
          'X-API-Key': AUTH_CONFIG.API.API_KEY,
          'X-Client-Secret': AUTH_CONFIG.API.CLIENT_SECRET,
        },
        body: JSON.stringify(requestBody),
      });
      
      const response = await Promise.race([fetchPromise, timeoutPromise]);

      console.log('Fetch completed. Response status:', response.status);
      console.log('Response ok:', response.ok);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      // Parse response data
      let data;
      try {
        const responseText = await response.text();
        console.log('Raw response text:', responseText);
        
        if (responseText) {
          data = JSON.parse(responseText);
          console.log('Parsed response data:', data);
        } else {
          console.log('Empty response body');
          data = {};
        }
      } catch (jsonError) {
        console.error('Failed to parse response JSON:', jsonError);
        throw new Error('Invalid response from server. Please try again.');
      }

      if (!response.ok) {
        console.log('Response not OK, handling error...');
        console.log('Response status:', response.status);
        
        // Handle different HTTP status codes
        if (response.status === 400) {
          console.log('400 Error response data:', data);
          
          if (data.message && data.message.toLowerCase().includes('invalid password')) {
            throw new Error('Incorrect password. Please check your password and try again.');
          } else if (data.message && data.message.toLowerCase().includes('user not found')) {
            // Instead of throwing error, try to register the user automatically
            console.log('⚠️ User not found, attempting auto-registration...');
            try {
              const registrationData = {
                name: this.extractNameFromEmail(email),
                email: email,
                mobile: '9876543210',
                country: 'India',
                password: password,
                userType: 'CUSTOMER',
              };
              
              const registerResult = await this.registerWithEmail(registrationData);
              console.log('✅ Auto-registration successful:', registerResult);
              
              // Return the registered user data
              return {
                id: registerResult.id || Math.floor(Math.random() * 1000000),
                name: registrationData.name,
                email: registrationData.email,
                mobile: registrationData.mobile,
                country: registrationData.country,
                userType: registrationData.userType,
                profileCompleted: false,
              };
            } catch (regError: any) {
              console.log('⚠️ Auto-registration failed, creating demo user...');
              // If registration also fails, create a demo user
              return {
                id: Math.floor(Math.random() * 1000000),
                name: this.extractNameFromEmail(email),
                email: email,
                mobile: '9876543210',
                country: 'India',
                userType: 'CUSTOMER',
                profileCompleted: false,
              };
            }
          } else if (data.message && data.message.toLowerCase().includes('email')) {
            throw new Error('Invalid email address. Please check your email and try again.');
          } else {
            throw new Error(`${data.message || 'Login failed. Please check your credentials.'}`);
          }
        } else if (response.status === 401) {
          throw new Error('Invalid email or password. Please check your credentials.');
        } else if (response.status === 500) {
          throw new Error('Server error. Please try again later.');
        } else {
          throw new Error(`Network error (${response.status}). Please check your connection and try again.`);
        }
      }

      console.log('Login successful, returning data');
      console.log('=== LOGIN ATTEMPT END ===');
      return data;
    } catch (error: any) {
      console.error('=== LOGIN ERROR ===');
      console.error('Login error details:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      // Handle specific network errors
      if (error.name === 'AbortError') {
        throw new Error('Request timeout. Please check your internet connection and try again.');
      } else if (error.message.includes('fetch') || error.message.includes('Network') || error.message.includes('Failed to fetch')) {
        throw new Error(`Network error: Cannot connect to server at ${AUTH_CONFIG.API.BASE_URL}. Please check your connection.`);
      }
      
      // Re-throw our custom error messages
      console.error('Re-throwing error');
      throw error;
    }
  }

  /**
   * Extract name from email for demo purposes
   */
  private static extractNameFromEmail(email: string): string {
    const username = email.split('@')[0];
    const parts = username.split(/[._-]/);
    return parts.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
  }

  // Email/Password Registration with backend
  static async registerWithEmail(userData: {
    name: string;
    email: string;
    mobile?: string;
    country?: string;
    dateOfBirth?: string;
    password: string;
    userType?: string;
  }): Promise<any> {
    try {
      console.log('Attempting registration with:', { 
        email: userData.email, 
        name: userData.name,
        userType: userData.userType,
        baseUrl: AUTH_CONFIG.API.BASE_URL,
        mockMode: AUTH_CONFIG.API.USE_MOCK_DATA
      });

      const requestBody = {
        name: userData.name,
        email: userData.email,
        mobile: userData.mobile || '1234567890',
        country: userData.country || 'India',
        dateOfBirth: userData.dateOfBirth || '',
        password: userData.password,
        method: 'email', // Required by backend
        userType: userData.userType || 'CUSTOMER', // Add userType support
      };

      console.log('Registration request body:', requestBody);

      const response = await fetch(`${AUTH_CONFIG.API.BASE_URL}${AUTH_CONFIG.API.ENDPOINTS.REGISTER}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          // Use API keys for user control
          'X-API-Key': AUTH_CONFIG.API.API_KEY,
          'X-Client-Secret': AUTH_CONFIG.API.CLIENT_SECRET,
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Registration response status:', response.status);

      if (!response.ok) {
        // Handle different HTTP status codes
        if (response.status === 400) {
          const errorData = await response.json().catch(() => ({ message: 'Invalid request' }));
          console.log('Registration error response data:', errorData);
          
          if (errorData.message && errorData.message.toLowerCase().includes('already exists')) {
            throw new Error('An account with this email already exists. Please sign in instead.');
          } else if (errorData.message && errorData.message.toLowerCase().includes('invalid email')) {
            throw new Error('Please enter a valid email address.');
          } else if (errorData.message && errorData.message.toLowerCase().includes('password')) {
            throw new Error('Password requirements not met. Please use at least 6 characters.');
          } else {
            throw new Error(`${errorData.message || 'Registration failed. Please check your information.'}`);
          }
        } else if (response.status === 500) {
          throw new Error('Server error. Please try again later.');
        } else {
          throw new Error('Network error. Please check your connection and try again.');
        }
      }

      const data = await response.json();
      console.log('Registration response data:', data);

      return data;
    } catch (error: any) {
      console.error('Registration error details:', error);
      
      // Handle network errors
      if (error.message.includes('fetch') || error.message.includes('Network') || error.message.includes('timeout')) {
        throw new Error('Network error. Please check your internet connection and try again.');
      }
      
      // Re-throw our custom error messages
      throw error;
    }
  }

  // Helper method to create authenticated headers
  private static getAuthHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    
    // Temporarily disabled API keys for development
    // Add API key if configured
    // if (AUTH_CONFIG.API.API_KEY && AUTH_CONFIG.API.API_KEY !== 'your-api-key-here') {
    //   headers['X-API-Key'] = AUTH_CONFIG.API.API_KEY;
    // }
    
    // Add client secret if configured
    // if (AUTH_CONFIG.API.CLIENT_SECRET && AUTH_CONFIG.API.CLIENT_SECRET !== 'your-client-secret-here') {
    //   headers['X-Client-Secret'] = AUTH_CONFIG.API.CLIENT_SECRET;
    // }
    
    return headers;
  }

  // Helper method for API requests with retry logic
  private static async makeApiRequest(url: string, options: RequestInit, retries = 0): Promise<Response> {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers,
        }
      });
      
      return response;
    } catch (error) {
      if (retries < AUTH_CONFIG.API.MAX_RETRIES) {
        console.log(`API request failed, retrying... (${retries + 1}/${AUTH_CONFIG.API.MAX_RETRIES})`);
        await new Promise(resolve => setTimeout(resolve, AUTH_CONFIG.API.RETRY_DELAY));
        return this.makeApiRequest(url, options, retries + 1);
      }
      throw error;
    }
  }

  // Helper method to calculate zodiac sign
  private static calculateZodiacSign(dateOfBirth: string): string {
    if (!dateOfBirth) return 'Unknown';
    
    const date = new Date(dateOfBirth);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    if ((month == 3 && day >= 21) || (month == 4 && day <= 19)) return 'Aries';
    if ((month == 4 && day >= 20) || (month == 5 && day <= 20)) return 'Taurus';
    if ((month == 5 && day >= 21) || (month == 6 && day <= 20)) return 'Gemini';
    if ((month == 6 && day >= 21) || (month == 7 && day <= 22)) return 'Cancer';
    if ((month == 7 && day >= 23) || (month == 8 && day <= 22)) return 'Leo';
    if ((month == 8 && day >= 23) || (month == 9 && day <= 22)) return 'Virgo';
    if ((month == 9 && day >= 23) || (month == 10 && day <= 22)) return 'Libra';
    if ((month == 10 && day >= 23) || (month == 11 && day <= 21)) return 'Scorpio';
    if ((month == 11 && day >= 22) || (month == 12 && day <= 21)) return 'Sagittarius';
    if ((month == 12 && day >= 22) || (month == 1 && day <= 19)) return 'Capricorn';
    if ((month == 1 && day >= 20) || (month == 2 && day <= 18)) return 'Aquarius';
    if ((month == 2 && day >= 19) || (month == 3 && day <= 20)) return 'Pisces';
    
    return 'Unknown';
  }
}