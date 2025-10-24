import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface Tab {
  key: string;
  label: string;
  icon: string;
}

interface AnimatedTabBarProps {
  tabs: Tab[];
  activeTab: string;
  onTabPress: (tabId: string) => void;
}

export const AnimatedTabBar: React.FC<AnimatedTabBarProps> = ({ tabs, activeTab, onTabPress }) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          onPress={() => onTabPress(tab.key)}
          style={[
            styles.tab,
            { backgroundColor: activeTab === tab.key ? theme.colors.primary : 'transparent' }
          ]}
        >
          <Text style={styles.icon}>{tab.icon}</Text>
          <Text style={[
            styles.label,
            { color: activeTab === tab.key ? theme.colors.background : theme.colors.text }
          ]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  icon: {
    fontSize: 16,
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
});