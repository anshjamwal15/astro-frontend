import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  name: string;
  email: string;
  mobile?: string;
  country?: string;
  dateOfBirth?: string;
  currentAddress?: string | null;
  pincode?: string | null;
  gender?: string | null;
  userType?: string;
  profileCompleted?: boolean;
  profilePicture?: string; // URL or base64 string
  bio?: string;
  zodiacSign?: string;
  isMentor?: boolean;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  jwtToken: string | null;
  setJwtToken: (token: string | null) => void;
  isLoading: boolean;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [jwtToken, setJwtTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user data and JWT token from storage on app start
  useEffect(() => {
    loadUserFromStorage();
  }, []);

  const loadUserFromStorage = async () => {
    try {
      console.log('🔄 Loading user data from storage...');
      const [userData, token] = await Promise.all([
        AsyncStorage.getItem('user'),
        AsyncStorage.getItem('jwt_token')
      ]);
      
      if (userData) {
        console.log('✅ User data loaded from storage');
        setUserState(JSON.parse(userData));
      } else {
        console.log('⚠️ No user data in storage');
      }
      
      if (token) {
        console.log('✅ JWT token loaded from storage');
        console.log('🔑 Token preview:', token.substring(0, 50) + '...');
        setJwtTokenState(token);
      } else {
        console.log('⚠️ No JWT token in storage');
      }
    } catch (error) {
      console.error('❌ Error loading user from storage:', error);
    } finally {
      console.log('✅ UserContext loading complete');
      setIsLoading(false);
    }
  };

  const setUser = async (userData: User | null) => {
    try {
      if (userData) {
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        setUserState(userData);
      } else {
        await AsyncStorage.removeItem('user');
        setUserState(null);
      }
    } catch (error) {
      console.error('Error saving user to storage:', error);
    }
  };

  const setJwtToken = async (token: string | null) => {
    try {
      if (token) {
        console.log('💾 Saving JWT token to storage...');
        await AsyncStorage.setItem('jwt_token', token);
        setJwtTokenState(token);
        console.log('✅ JWT token saved successfully');
      } else {
        console.log('🗑️ Removing JWT token from storage...');
        await AsyncStorage.removeItem('jwt_token');
        setJwtTokenState(null);
        console.log('✅ JWT token removed successfully');
      }
    } catch (error) {
      console.error('❌ Error saving JWT token to storage:', error);
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      await setUser(updatedUser);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove(['user', 'jwt_token', 'authToken']);
      setUserState(null);
      setJwtTokenState(null);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const value: UserContextType = {
    user,
    setUser,
    jwtToken,
    setJwtToken,
    isLoading,
    logout,
    updateUser,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

// Helper function to get first name from full name
export const getFirstName = (fullName: string): string => {
  if (!fullName) return 'User';
  return fullName.split(' ')[0];
};