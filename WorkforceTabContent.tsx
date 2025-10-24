import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { HireLaborTab } from './HireLaborTab';
import { LaborRequestHistoryTab } from './LaborRequestHistoryTab';
import { CompletedJobsTab } from './CompletedJobsTab';
import { LaborPerformanceTab } from './LaborPerformanceTab';

interface WorkforceTabContentProps {
  userId: string;
  userRole: string;
}

export function WorkforceTabContent({ userId, userRole }: WorkforceTabContentProps) {
  const { theme } = useTheme();
  const [activeSubTab, setActiveSubTab] = useState('hire');

  const subTabs = [
    { id: 'hire', label: 'Hire Labor', icon: 'person-add-outline' },
    { id: 'requests', label: 'Requests', icon: 'list-outline' },
    { id: 'completed', label: 'Completed', icon: 'checkmark-circle-outline' },
    { id: 'performance', label: 'Performance', icon: 'analytics-outline' }
  ];

  const renderSubTabContent = () => {
    switch (activeSubTab) {
      case 'hire':
        return <HireLaborTab userId={userId} userRole={userRole} />;
      case 'requests':
        return <LaborRequestHistoryTab userId={userId} userRole={userRole} />;
      case 'completed':
        return <CompletedJobsTab userId={userId} userRole={userRole} />;
      case 'performance':
        return <LaborPerformanceTab userId={userId} userRole={userRole} />;
      default:
        return <HireLaborTab userId={userId} userRole={userRole} />;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Workforce Management</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Manage your labor and teams</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subTabsContainer}>
        {subTabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.subTab, activeSubTab === tab.id && styles.activeSubTab]}
            onPress={() => setActiveSubTab(tab.id)}
          >
            <Ionicons
              name={tab.icon}
              size={16}
              color={activeSubTab === tab.id ? '#007AFF' : '#666'}
            />
            <Text style={[styles.subTabText, { color: activeSubTab === tab.id ? '#007AFF' : '#666' }]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.content}>
        {renderSubTabContent()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingTop: 50 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  subtitle: { fontSize: 16 },
  subTabsContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  subTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  activeSubTab: {
    backgroundColor: '#e3f2fd',
  },
  subTabText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  content: { flex: 1 },
});