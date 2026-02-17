import { Stack } from 'expo-router';

export default function MentorLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="broadcast" />
      <Stack.Screen name="chat-analytics" />
      <Stack.Screen name="mentor-chatbox" />
    </Stack>
  );
}