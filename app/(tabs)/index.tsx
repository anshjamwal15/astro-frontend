import { Redirect } from 'expo-router';

export default function HomeScreen() {
  // Redirect to home tab as the main screen
  return <Redirect href="/(tabs)/home" />;
}