import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { User } from '../types';

interface AppHeaderProps {
  user: User | null;
  onProfilePress?: () => void;
  onMenuPress?: () => void;
}

export function AppHeader({ user, onProfilePress, onMenuPress }: AppHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.logoContainer}>
        <Image 
          source={{ uri: 'https://d64gsuwffb70l.cloudfront.net/682b9339d741dd6bcf28bb65_1752439416975_2cdd4474.jpeg' }}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      
      <TouchableOpacity 
        style={styles.profileContainer}
        onPress={onProfilePress}
      >
        <Image 
          source={{ uri: 'https://d64gsuwffb70l.cloudfront.net/682b9339d741dd6bcf28bb65_1752439399522_a14fbb3a.jpeg' }}
          style={styles.profileAvatar}
          resizeMode="cover"
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  logoContainer: {
    flex: 1,
  },
  logo: {
    width: 120,
    height: 40,
  },
  profileContainer: {
    padding: 4,
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
});