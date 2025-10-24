import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface BottomTabHeaderProps {
  activeTab: string;
  onTabPress: (tab: string) => void;
}

export function BottomTabHeader({ activeTab, onTabPress }: BottomTabHeaderProps) {
  const tabs = [
    { id: 'home', icon: 'home-outline', activeIcon: 'home' },
    { id: 'machinery', icon: 'hardware-chip-outline', activeIcon: 'hardware-chip' },
    { id: 'workforce', icon: 'construct-outline', activeIcon: 'construct' },
    { id: 'community', icon: 'people-outline', activeIcon: 'people' },
    { id: 'profile', icon: 'person-outline', activeIcon: 'person' }
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[styles.tab, activeTab === tab.id && styles.activeTab]}
          onPress={() => onTabPress(tab.id)}
        >
          <Ionicons
            name={activeTab === tab.id ? tab.activeIcon : tab.icon}
            size={24}
            color={activeTab === tab.id ? '#007AFF' : '#666'}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingVertical: 10,
    paddingHorizontal: 20,
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 60,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  activeTab: {
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
  },
});