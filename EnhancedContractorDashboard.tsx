import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { ContractorHomePanel } from './ContractorHomePanel';
import { ActiveJobsTab } from './ActiveJobsTab';
import { CompletedJobsTab } from './CompletedJobsTab';
import { ContractorProgressTab } from './ContractorProgressTab';
import { ContractorComplianceTab } from './ContractorComplianceTab';
import { BudgetTab } from './BudgetTab';
import { PaymentHistoryTab } from './PaymentHistoryTab';
import { MySitesTab } from './MySitesTab';
import { ClientReportsTab } from './ClientReportsTab';
import { EnhancedJobBoardPanel } from './EnhancedJobBoardPanel';
import { JobNotificationBell } from './JobNotificationBell';

export function EnhancedContractorDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '🏠' },
    { id: 'job-board', label: 'Job Board', icon: '📋' },
    { id: 'active-jobs', label: 'Active Jobs', icon: '🔄' },
    { id: 'completed-jobs', label: 'Completed', icon: '✅' },
    { id: 'progress', label: 'Progress', icon: '📈' },
    { id: 'compliance', label: 'Compliance', icon: '📋' },
    { id: 'budget', label: 'Budget', icon: '💰' },
    { id: 'payments', label: 'Payments', icon: '💳' },
    { id: 'sites', label: 'My Sites', icon: '🏗️' },
    { id: 'reports', label: 'Reports', icon: '📊' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>Contractor Overview</Text>
            
            <View style={styles.quickActions}>
              <TouchableOpacity 
                style={styles.quickActionCard}
                onPress={() => setActiveTab('job-board')}
              >
                <Text style={styles.quickActionIcon}>📋</Text>
                <Text style={styles.quickActionTitle}>Post New Job</Text>
                <Text style={styles.quickActionDesc}>Find labor for your projects</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickActionCard}
                onPress={() => setActiveTab('active-jobs')}
              >
                <Text style={styles.quickActionIcon}>🔄</Text>
                <Text style={styles.quickActionTitle}>Active Jobs</Text>
                <Text style={styles.quickActionDesc}>Monitor ongoing work</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.statsGrid}>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Active Projects</Text>
                <Text style={styles.cardValue}>8</Text>
              </View>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Posted Jobs</Text>
                <Text style={styles.cardValue}>15</Text>
              </View>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Applications</Text>
                <Text style={styles.cardValue}>42</Text>
              </View>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Completion Rate</Text>
                <Text style={styles.cardValue}>94%</Text>
              </View>
            </View>
          </View>
        );
      case 'job-board': 
        return (
          <EnhancedJobBoardPanel 
            isOfflineMode={true} 
            userType="contractor"
          />
        );
      case 'active-jobs': return <ActiveJobsTab />;
      case 'completed-jobs': return <CompletedJobsTab />;
      case 'progress': return <ContractorProgressTab />;
      case 'compliance': return <ContractorComplianceTab />;
      case 'budget': return <BudgetTab />;
      case 'payments': return <PaymentHistoryTab />;
      case 'sites': return <MySitesTab />;
      case 'reports': return <ClientReportsTab />;
      default: return <View><Text>Select a tab</Text></View>;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Contractor Dashboard</Text>
        <JobNotificationBell userType="contractor" userId="contractor_1" />
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
        <View style={styles.tabs}>
          {tabs.map(tab => (
            <TouchableOpacity 
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.activeTab]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text style={styles.tabIcon}>{tab.icon}</Text>
              <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      
      <ScrollView style={styles.scrollView}>
        {renderContent()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  title: { fontSize: 24, fontWeight: 'bold' },
  tabsContainer: { backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  tabs: { flexDirection: 'row', paddingHorizontal: 10 },
  tab: { padding: 15, alignItems: 'center', minWidth: 80 },
  activeTab: { borderBottomWidth: 2, borderBottomColor: '#2563eb' },
  tabIcon: { fontSize: 20, marginBottom: 4 },
  tabText: { fontSize: 12, color: '#666', textAlign: 'center' },
  activeTabText: { color: '#2563eb', fontWeight: '600' },
  scrollView: { flex: 1 },
  content: { padding: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  quickActionCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    width: '48%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  quickActionDesc: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { backgroundColor: 'white', padding: 15, borderRadius: 8, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2, width: '48%' },
  cardTitle: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  cardValue: { fontSize: 20, fontWeight: 'bold', color: '#2563eb', marginTop: 8 }
});
