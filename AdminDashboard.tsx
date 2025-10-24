import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { AdminUsersTab } from './AdminUsersTab';
import { AdminContractsTab } from './AdminContractsTab';
import { AdminOrdersTab } from './AdminOrdersTab';
import { AdminPaymentsTab } from './AdminPaymentsTab';
import { AdminDisputesTab } from './AdminDisputesTab';
import { AdminKPIsTab } from './AdminKPIsTab';
import { AdminPerformanceTab } from './AdminPerformanceTab';
import { AdminActivityLogsTab } from './AdminActivityLogsTab';
import { AdminGuaranteeClaimsTab } from './AdminGuaranteeClaimsTab';
import { AdminContractorPortfolioTab } from './AdminContractorPortfolioTab';
import { FlaggedJobsTab } from './FlaggedJobsTab';
import { PlatformHealthTab } from './PlatformHealthTab';
import { UserActivityTab } from './UserActivityTab';
import { FeesEarningsTab } from './FeesEarningsTab';
import { AdminSmartContractsTab } from './AdminSmartContractsTab';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'contracts', label: 'Contracts', icon: '📋' },
    { id: 'smart-contracts', label: 'Smart Contracts', icon: '🔗' },
    { id: 'orders', label: 'Orders', icon: '📦' },
    { id: 'payments', label: 'Payments', icon: '💳' },
    { id: 'disputes', label: 'Disputes', icon: '⚖️' },
    { id: 'kpis', label: 'KPIs', icon: '📈' },
    { id: 'performance', label: 'Performance', icon: '🎯' },
    { id: 'activity', label: 'Activity', icon: '📝' },
    { id: 'guarantees', label: 'Guarantees', icon: '🛡️' },
    { id: 'portfolios', label: 'Portfolios', icon: '💼' },
    { id: 'flagged', label: 'Flagged', icon: '🚩' },
    { id: 'health', label: 'Platform Health', icon: '🏥' },
    { id: 'user-activity', label: 'User Activity', icon: '👤' },
    { id: 'fees', label: 'Fees & Earnings', icon: '💰' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>Admin Overview</Text>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Total Users</Text>
              <Text style={styles.cardValue}>1,234</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Active Projects</Text>
              <Text style={styles.cardValue}>89</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Platform Revenue</Text>
              <Text style={styles.cardValue}>$125,000</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Smart Contracts</Text>
              <Text style={styles.cardValue}>156</Text>
            </View>
          </View>
        );
      case 'users': return <AdminUsersTab />;
      case 'contracts': return <AdminContractsTab />;
      case 'smart-contracts': return <AdminSmartContractsTab />;
      case 'orders': return <AdminOrdersTab />;
      case 'payments': return <AdminPaymentsTab />;
      case 'disputes': return <AdminDisputesTab />;
      case 'kpis': return <AdminKPIsTab />;
      case 'performance': return <AdminPerformanceTab />;
      case 'activity': return <AdminActivityLogsTab />;
      case 'guarantees': return <AdminGuaranteeClaimsTab />;
      case 'portfolios': return <AdminContractorPortfolioTab />;
      case 'flagged': return <FlaggedJobsTab />;
      case 'health': return <PlatformHealthTab />;
      case 'user-activity': return <UserActivityTab />;
      case 'fees': return <FeesEarningsTab />;
      default: return <View><Text>Select a tab</Text></View>;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>
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
  title: { fontSize: 24, fontWeight: 'bold', padding: 20, textAlign: 'center' },
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
  card: { backgroundColor: 'white', padding: 15, borderRadius: 8, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  cardValue: { fontSize: 24, fontWeight: 'bold', color: '#2563eb', marginTop: 8 }
});