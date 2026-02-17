import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '../hooks/use-color-scheme';
import { UserProvider } from '../contexts/UserContext';
import { MentorProvider } from '../contexts/MentorContext';

export const unstable_settings = {
  // Ensure initial route name is set correctly
  initialRouteName: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <UserProvider>
      <MentorProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="auth" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="mentor" />
            <Stack.Screen name="chatbox" />
            <Stack.Screen name="video-room" />
            <Stack.Screen name="video-call-screen" />
            <Stack.Screen name="otp-verification" />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </MentorProvider>
    </UserProvider>
  );
}
