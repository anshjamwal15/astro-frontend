import { Redirect } from 'expo-router';

export default function Index() {
  // For demo purposes, redirect to signin
  // In a real app, you'd check authentication state here
  return <Redirect href="/auth/signin" />;
}