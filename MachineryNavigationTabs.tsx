import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface MachineryNavigationTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'browse', label: 'Explorar', icon: '🔍' },
  { id: 'book', label: 'Reservar', icon: '📅' },
  { id: 'request', label: 'Solicitar', icon: '📋' },
  { id: 'requests', label: 'Mis Solicitudes', icon: '📊' },
  { id: 'types', label: 'Tipos', icon: '🏗️' }
];

export default function MachineryNavigationTabs({ activeTab, onTabChange }: MachineryNavigationTabsProps) {
  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[styles.tab, activeTab === tab.id && styles.activeTab]}
          onPress={() => onTabChange(tab.id)}
        >
          <Text style={styles.tabIcon}>{tab.icon}</Text>
          <Text style={[styles.tabLabel, activeTab === tab.id && styles.activeTabLabel]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginVertical: 4,
  },
  activeTab: {
    backgroundColor: '#F0F9FF',
    borderBottomWidth: 3,
    borderBottomColor: '#0EA5E9',
  },
  tabIcon: {
    fontSize: 18,
    marginBottom: 6,
  },
  tabLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    textAlign: 'center',
    fontFamily: 'Inter',
    lineHeight: 14,
  },
  activeTabLabel: {
    color: '#0EA5E9',
    fontWeight: '600',
  },
});