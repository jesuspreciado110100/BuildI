import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SimpleContractorTabsProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function SimpleContractorTabs({ activeSection, onSectionChange }: SimpleContractorTabsProps) {
  const sections = [
    { id: 'overview', label: 'Overview', icon: 'grid-outline' },
    { id: 'sites', label: 'Sites', icon: 'business-outline' },
    { id: 'tasks', label: 'Tasks', icon: 'checkbox-outline' },
    { id: 'reports', label: 'Reports', icon: 'document-text-outline' }
  ];

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
        {sections.map((section) => (
          <TouchableOpacity
            key={section.id}
            style={[styles.tab, activeSection === section.id && styles.activeTab]}
            onPress={() => onSectionChange(section.id)}
          >
            <Ionicons
              name={section.icon}
              size={16}
              color={activeSection === section.id ? '#007AFF' : '#666'}
            />
            <Text style={[styles.tabText, { color: activeSection === section.id ? '#007AFF' : '#666' }]}>
              {section.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  scrollView: {
    paddingHorizontal: 16,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  activeTab: {
    backgroundColor: '#e3f2fd',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
});