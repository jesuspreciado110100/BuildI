import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { MachineryScreen } from './MachineryScreen';
import { MachineryRequestsTab } from './MachineryRequestsTab';
import { MaterialCatalogTab } from './MaterialCatalogTab';
import { MaterialOrdersTab } from './MaterialOrdersTab';

interface MachineryTabContentProps {
  userId: string;
  userRole: string;
}

export function MachineryTabContent({ userId, userRole }: MachineryTabContentProps) {
  const { theme } = useTheme();
  const [activeSubTab, setActiveSubTab] = useState('equipment');

  const subTabs = [
    { id: 'equipment', label: 'Equipment', icon: 'construct-outline' },
    { id: 'requests', label: 'Requests', icon: 'document-outline' },
    { id: 'materials', label: 'Materials', icon: 'cube-outline' },
    { id: 'orders', label: 'Orders', icon: 'receipt-outline' }
  ];

  const renderSubTabContent = () => {
    switch (activeSubTab) {
      case 'equipment':
        return <MachineryScreen userId={userId} userRole={userRole} />;
      case 'requests':
        return <MachineryRequestsTab userId={userId} userRole={userRole} />;
      case 'materials':
        return <MaterialCatalogTab userId={userId} userRole={userRole} />;
      case 'orders':
        return <MaterialOrdersTab userId={userId} userRole={userRole} />;
      default:
        return <MachineryScreen userId={userId} userRole={userRole} />;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Equipment & Materials</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Manage machinery and materials</Text>
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