import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  name: string;
  email: string;
  mobile?: string;
  country?: string;
  dateOfBirth?: string;
  userType?: string;
  profileCompleted?: boolean;
  profilePicture?: string; // URL or base64 string
  bio?: string;
  zodiacSign?: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user data from storage on app start
  useEffect(() => {
    loadUserFromStorage();
  }, []);

  const loadUserFromStorage = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUserState(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
    } finally {
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

  const updateUser = async (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      await setUser(updatedUser);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove(['user', 'authToken']);
      setUserState(null);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const value: UserContextType = {
    user,
    setUser,
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