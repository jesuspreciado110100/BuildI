import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SubTab {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
}

interface MaterialSubTabsProps {
  activeSubTab: string;
  onSubTabPress: (tabId: string) => void;
}

const subTabs: SubTab[] = [
  { id: 'catalog', title: 'Catalog', icon: 'library-outline' },
  { id: 'orders', title: 'Orders', icon: 'receipt-outline' },
  { id: 'compare', title: 'Compare', icon: 'git-compare-outline' },
  { id: 'suppliers', title: 'Suppliers', icon: 'business-outline' },
];

export function MaterialSubTabs({ activeSubTab, onSubTabPress }: MaterialSubTabsProps) {
  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {subTabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.subTab, activeSubTab === tab.id && styles.activeSubTab]}
            onPress={() => onSubTabPress(tab.id)}
          >
            <Ionicons
              name={tab.icon}
              size={16}
              color={activeSubTab === tab.id ? '#10B981' : '#6B7280'}
            />
            <Text style={[styles.subTabText, activeSubTab === tab.id && styles.activeSubTabText]}>
              {tab.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  subTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    gap: 6,
  },
  activeSubTab: {
    backgroundColor: '#ECFDF5',
  },
  subTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeSubTabText: {
    color: '#10B981',
  },
});