import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SubTab {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  userType?: 'contractor' | 'worker' | 'both';
}

interface WorkforceSubTabsProps {
  activeSubTab: string;
  onSubTabPress: (tabId: string) => void;
  userType?: 'contractor' | 'worker';
}

const subTabs: SubTab[] = [
  { id: 'overview', title: 'Overview', icon: 'grid-outline', userType: 'both' },
  { id: 'hire', title: 'Hire Labor', icon: 'person-add-outline', userType: 'contractor' },
  { id: 'requests', title: 'Labor Requests', icon: 'clipboard-outline', userType: 'contractor' },
  { id: 'completed', title: 'Completed Jobs', icon: 'checkmark-circle-outline', userType: 'contractor' },
  { id: 'performance', title: 'Performance', icon: 'analytics-outline', userType: 'contractor' },
  { id: 'microjobs', title: 'Micro Jobs', icon: 'hammer-outline', userType: 'worker' },
];

export function WorkforceSubTabs({ activeSubTab, onSubTabPress, userType = 'contractor' }: WorkforceSubTabsProps) {
  const filteredTabs = subTabs.filter(tab => 
    tab.userType === 'both' || tab.userType === userType
  );

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filteredTabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.subTab, activeSubTab === tab.id && styles.activeSubTab]}
            onPress={() => onSubTabPress(tab.id)}
          >
            <Ionicons
              name={tab.icon}
              size={16}
              color={activeSubTab === tab.id ? '#3B82F6' : '#6B7280'}
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
    backgroundColor: '#EBF4FF',
  },
  subTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeSubTabText: {
    color: '#3B82F6',
  },
});