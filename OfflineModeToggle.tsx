import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';

interface OfflineModeToggleProps {
  isOfflineMode: boolean;
  onToggle: (value: boolean) => void;
}

export const OfflineModeToggle: React.FC<OfflineModeToggleProps> = ({
  isOfflineMode,
  onToggle
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Offline Mode</Text>
      <Switch
        value={isOfflineMode}
        onValueChange={onToggle}
        trackColor={{ false: '#767577', true: '#81b0ff' }}
        thumbColor={isOfflineMode ? '#f5dd4b' : '#f4f3f4'}
      />
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
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});