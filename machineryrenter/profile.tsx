import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { ProfileScreen } from '../components/ProfileScreen';

export default function MachineryRenterProfile() {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme === 'dark' ? '#000000' : '#F2F2F7',
    },
  });

  return (
    <View style={styles.container}>
      <ProfileScreen />
    </View>
  );
}
