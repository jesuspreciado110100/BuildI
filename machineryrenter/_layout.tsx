import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { GlobalTopBar } from '../components/GlobalTopBar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MachineryRenterLayout() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const handleMenuPress = () => {
    Alert.alert('Menu', 'Opening menu...');
  };

  const handleProfilePress = () => {
    Alert.alert('Profile', 'Opening profile...');
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme === 'dark' ? '#000000' : '#F2F2F7',
    },
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <GlobalTopBar 
        onMenuPress={handleMenuPress}
        onProfilePress={handleProfilePress}
      />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: theme === 'dark' ? '#8E8E93' : '#999999',
          tabBarStyle: {
            backgroundColor: theme === 'dark' ? '#1C1C1E' : '#FFFFFF',
            borderTopColor: theme === 'dark' ? '#38383A' : '#E5E5EA',
            height: 85,
            paddingBottom: 20,
            paddingTop: 10,
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="machinery"
          options={{
            title: 'My Machinery',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="construct" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="fleet"
          options={{
            title: 'Fleet Access',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="car-sport" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="add-machinery"
          options={{
            href: null,
          }}
        />
      </Tabs>
    </View>
  );
}
