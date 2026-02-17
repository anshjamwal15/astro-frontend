import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MentorAuthData } from '../services/mentorAuthService';

interface MentorContextType {
  mentor: MentorAuthData | null;
  setMentor: (mentor: MentorAuthData | null) => void;
  isLoading: boolean;
  logout: () => Promise<void>;
}

const MentorContext = createContext<MentorContextType | undefined>(undefined);

interface MentorProviderProps {
  children: ReactNode;
}

export const MentorProvider: React.FC<MentorProviderProps> = ({ children }) => {
  const [mentor, setMentorState] = useState<MentorAuthData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load mentor data from storage on app start
  useEffect(() => {
    loadMentorFromStorage();
  }, []);

  const loadMentorFromStorage = async () => {
    try {
      const mentorData = await AsyncStorage.getItem('mentorData');
      if (mentorData) {
        const parsedMentor = JSON.parse(mentorData);
        console.log('📱 Loaded mentor from storage:', parsedMentor.name);
        setMentorState(parsedMentor);
      }
    } catch (error) {
      console.error('Error loading mentor from storage:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setMentor = async (mentorData: MentorAuthData | null) => {
    try {
      if (mentorData) {
        // Save to AsyncStorage
        await AsyncStorage.setItem('mentorData', JSON.stringify(mentorData));
        console.log('💾 Mentor data saved to storage');
      } else {
        // Remove from AsyncStorage
        await AsyncStorage.removeItem('mentorData');
        console.log('🗑️ Mentor data removed from storage');
      }
      setMentorState(mentorData);
    } catch (error) {
      console.error('Error saving mentor to storage:', error);
      // Still update state even if storage fails
      setMentorState(mentorData);
    }
  };

  const logout = async () => {
    console.log('👋 Mentor logging out...');
    await setMentor(null);
  };

  const value: MentorContextType = {
    mentor,
    setMentor,
    isLoading,
    logout,
  };

  return (
    <MentorContext.Provider value={value}>
      {children}
    </MentorContext.Provider>
  );
};

export const useMentor = (): MentorContextType => {
  const context = useContext(MentorContext);
  if (context === undefined) {
    throw new Error('useMentor must be used within a MentorProvider');
  }
  return context;
};