import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export function RoleBasedApp() {
  const router = useRouter();
  const pathname = usePathname();

  const isBuilderRoute = pathname.startsWith('/builder');
  const isClientRoute = pathname.startsWith('/client');

  const switchRole = () => {
    if (isBuilderRoute) {
      router.push('/client/home');
    } else {
      router.push('/builder/home');
    }
  };

  const goHome = () => {
    router.push('/');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goHome} style={styles.homeButton}>
          <Ionicons name="home" size={24} color="#007aff" />
        </TouchableOpacity>
        
        <Text style={styles.currentRole}>
          {isBuilderRoute ? 'Builder View' : isClientRoute ? 'Client View' : 'Select Role'}
        </Text>
        
        {(isBuilderRoute || isClientRoute) && (
          <TouchableOpacity onPress={switchRole} style={styles.switchButton}>
            <Ionicons name="swap-horizontal" size={24} color="#007aff" />
            <Text style={styles.switchText}>Switch</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  homeButton: {
    padding: 8,
  },
  currentRole: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  switchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  switchText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#007aff',
    fontWeight: '500',
  },
});