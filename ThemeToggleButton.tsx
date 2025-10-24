import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Switch } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Switch
      value={theme.isDark}
      onValueChange={toggleTheme}
      trackColor={{ false: '#767577', true: '#81b0ff' }}
      thumbColor={theme.isDark ? '#f5dd4b' : '#f4f3f4'}
      ios_backgroundColor="#3e3e3e"
    />
  );
}

const styles = StyleSheet.create({
  // No styles needed for Switch component
});