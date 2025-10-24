import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { SimpleContractorTabs } from './SimpleContractorTabs';
import { CleanBottomTabHeader } from './CleanBottomTabHeader';
import { ActiveJobsTab } from './ActiveJobsTab';
import { CompletedJobsTab } from './CompletedJobsTab';
import { NotificationBell, SiteSelector, ThemeToggleButton } from './MissingComponents';

interface CleanContractorDashboardProps {
  userId: string;
  userRole: string;
}

export const CleanContractorDashboard: React.FC<CleanContractorDashboardProps> = ({ userId, userRole }) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('home');
  const [activeSection, setActiveSection] = useState('overview');
  const [selectedSite] = useState({ id: '1', name: 'Downtown Plaza', location: 'New York, NY', status: 'active' as const });

  const renderContent = () => {
    if (activeTab === 'home') {
      switch (activeSection) {
        case 'overview':
          return (
            <View style={styles.content}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Dashboard Overview</Text>
              <ActiveJobsTab userId={userId} userRole={userRole} />
            </View>
          );
        case 'sites':
          return (
            <View style={styles.content}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>My Sites</Text>
              <Text style={[styles.sectionDescription, { color: theme.colors.textSecondary }]}>Manage your construction sites</Text>
            </View>
          );
        case 'tasks':
          return (
            <View style={styles.content}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Tasks & Jobs</Text>
              <CompletedJobsTab userId={userId} userRole={userRole} />
            </View>
          );
        case 'reports':
          return (
            <View style={styles.content}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Reports</Text>
              <Text style={[styles.sectionDescription, { color: theme.colors.textSecondary }]}>View project reports and analytics</Text>
            </View>
          );
        default:
          return null;
      }
    }
    
    return (
      <View style={styles.content}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
        </Text>
        <Text style={[styles.sectionDescription, { color: theme.colors.textSecondary }]}>
          {activeTab} features coming soon
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <SiteSelector selectedSite={selectedSite} onSiteChange={() => {}} sticky />
      
      <View style={[styles.header, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Construction Manager</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Welcome back!</Text>
        </View>
        <View style={styles.headerActions}>
          <ThemeToggleButton />
          <NotificationBell userId={userId} />
        </View>
      </View>

      {activeTab === 'home' && (
        <SimpleContractorTabs 
          activeSection={activeSection} 
          onSectionChange={setActiveSection} 
        />
      )}

      <ScrollView style={styles.scrollContent}>
        {renderContent()}
      </ScrollView>

      <CleanBottomTabHeader activeTab={activeTab} onTabPress={setActiveTab} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    padding: 20, 
    paddingTop: 50, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    borderBottomWidth: 1 
  },
  headerContent: { flex: 1 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  subtitle: { fontSize: 16 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  scrollContent: { flex: 1 },
  content: { padding: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  sectionDescription: { fontSize: 16, lineHeight: 24, marginBottom: 16 }
});