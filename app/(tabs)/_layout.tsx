import { Tabs } from 'expo-router';
import React from 'react';
import { Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#0052CC',
        tabBarInactiveTintColor: '#999999',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E0E0E0',
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 20,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <Ionicons 
              name={focused ? "home" : "home-outline"} 
              size={24} 
              color={focused ? '#0052CC' : '#999999'} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="mentors"
        options={{
          title: 'Mentors',
          tabBarIcon: ({ focused }) => (
            <Ionicons 
              name={focused ? "people" : "people-outline"} 
              size={24} 
              color={focused ? '#0052CC' : '#999999'} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ focused }) => (
            <Ionicons 
              name={focused ? "chatbubbles" : "chatbubbles-outline"} 
              size={24} 
              color={focused ? '#0052CC' : '#999999'} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="call"
        options={{
          title: 'Call',
          tabBarIcon: ({ focused }) => (
            <Ionicons 
              name={focused ? "call" : "call-outline"} 
              size={24} 
              color={focused ? '#333333' : '#999999'} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="horoscope"
        options={{
          title: 'Horoscope',
          tabBarIcon: ({ focused }) => (
            <Ionicons 
              name={focused ? "star" : "star-outline"} 
              size={24} 
              color={focused ? '#333333' : '#999999'} 
            />
          ),
        }}
      />
      
      {/* Hidden screens - accessible via navigation but not in tab bar */}
      <Tabs.Screen
        name="index"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="profile"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="settings"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="notifications"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="categories"
        options={{ href: null }}
      />
    </Tabs>
  );
}