import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { ActiveJobsTab } from './ActiveJobsTab';
import { CompletedJobsTab } from './CompletedJobsTab';
import { NotificationBell, SiteSelector, ThemeToggleButton, SmartSuggestionsPanel } from './MissingComponents';

interface ContractorDashboardProps {
  userId: string;
  userRole: string;
}

export const ContractorDashboard: React.FC<ContractorDashboardProps> = ({ userId, userRole }) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('active');
  const [selectedSite] = useState({ id: '1', name: 'Downtown Plaza', location: 'New York, NY', status: 'active' as const });

  const tabs = [
    { key: 'active', label: 'Active Jobs', icon: '🔨' },
    { key: 'completed', label: 'Completed', icon: '✅' },
    { key: 'sites', label: 'Sites', icon: '🏗️' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'active':
        return (
          <View>
            <SmartSuggestionsPanel userId={userId} siteId={selectedSite.id} type="dashboard" />
            <ActiveJobsTab userId={userId} userRole={userRole} />
          </View>
        );
      case 'completed':
        return <CompletedJobsTab userId={userId} userRole={userRole} />;
      case 'sites':
        return (
          <View style={styles.tabContent}>
            <Text style={[styles.tabTitle, { color: theme.colors.text }]}>Sites Overview</Text>
            <Text style={[styles.tabDescription, { color: theme.colors.textSecondary }]}>Manage your construction sites</Text>
          </View>
        );
      default:
        return <ActiveJobsTab userId={userId} userRole={userRole} />;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <SiteSelector selectedSite={selectedSite} onSiteChange={() => {}} sticky />
      
      <View style={[styles.header, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Dashboard</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Welcome back!</Text>
        </View>
        <View style={styles.headerActions}>
          <ThemeToggleButton />
          <NotificationBell userId={userId} />
        </View>
      </View>

      <View style={[styles.tabBar, { backgroundColor: theme.colors.surface }]}>
        {tabs.map((tab) => (
          <TouchableOpacity key={tab.key} onPress={() => setActiveTab(tab.key)} style={[styles.tab, { backgroundColor: activeTab === tab.key ? theme.colors.primary : 'transparent' }]}>
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text style={[styles.tabLabel, { color: activeTab === tab.key ? theme.colors.background : theme.colors.text }]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content}>
        {renderTabContent()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingTop: 50, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1 },
  headerContent: { flex: 1 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  subtitle: { fontSize: 16 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tabBar: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  tab: { flex: 1, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center', marginHorizontal: 4 },
  tabIcon: { fontSize: 16, marginBottom: 4 },
  tabLabel: { fontSize: 14, fontWeight: '600' },
  content: { flex: 1 },
  tabContent: { padding: 20 },
  tabTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  tabDescription: { fontSize: 16, lineHeight: 24 }
});