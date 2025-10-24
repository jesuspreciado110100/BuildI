import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface CleanBottomTabHeaderProps {
  activeTab: string;
  onTabPress: (tab: string) => void;
}

export const CleanBottomTabHeader: React.FC<CleanBottomTabHeaderProps> = ({ activeTab, onTabPress }) => {
  const { theme } = useTheme();
  
  const tabs = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'sites', label: 'Sites', icon: '🏗️' },
    { id: 'tasks', label: 'Tasks', icon: '✅' },
    { id: 'reports', label: 'Reports', icon: '📊' }
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card, borderTopColor: theme.colors.border }]}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={styles.tab}
          onPress={() => onTabPress(tab.id)}
        >
          <Text style={styles.icon}>{tab.icon}</Text>
          <Text style={[styles.label, { color: activeTab === tab.id ? theme.colors.primary : theme.colors.textSecondary }]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', paddingVertical: 8, borderTopWidth: 1 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 8 },
  icon: { fontSize: 20, marginBottom: 4 },
  label: { fontSize: 12, fontWeight: '500' }
});