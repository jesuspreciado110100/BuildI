import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface GlobalTopBarProps {
  onMenuPress?: () => void;
  onProfilePress?: () => void;
  profileImageUri?: string;
}

export const GlobalTopBar: React.FC<GlobalTopBarProps> = ({
  onMenuPress,
  onProfilePress,
  profileImageUri = 'https://d64gsuwffb70l.cloudfront.net/682b9339d741dd6bcf28bb65_1753556491699_87c932a9.jpeg',
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.menuButton}
        onPress={onMenuPress}
        activeOpacity={0.7}
      >
        <Ionicons name="menu" size={24} color="#1E293B" />
      </TouchableOpacity>
      
      <View style={styles.logoContainer}>
        <Image 
          source={{ uri: 'https://d64gsuwffb70l.cloudfront.net/682b9339d741dd6bcf28bb65_1753556490589_08f9ed5f.png' }}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <TouchableOpacity 
        style={styles.profileButton}
        onPress={onProfilePress}
        activeOpacity={0.7}
      >
        <Image 
          source={{ uri: profileImageUri }}
          style={styles.profileImage}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    zIndex: 1000,
  },
  menuButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 120,
    height: 24,
  },
  profileButton: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 18,
  },
});