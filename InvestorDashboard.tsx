import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { InvestorLedgerTab } from './InvestorLedgerTab';

interface InvestorDashboardProps {
  investorId: string;
}

export const InvestorDashboard: React.FC<InvestorDashboardProps> = ({ investorId }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'ledger', label: 'Ledger', icon: '📋' },
    { id: 'sites', label: 'Sites', icon: '🏗️' },
    { id: 'reports', label: 'Reports', icon: '📈' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'ledger':
        return <InvestorLedgerTab investorId={investorId} />;
      case 'overview':
        return (
          <ScrollView style={styles.tabContent}>
            <View style={styles.overviewCard}>
              <Text style={styles.cardTitle}>Investment Summary</Text>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Total Invested</Text>
                  <Text style={styles.summaryValue}>$125,000</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Total Received</Text>
                  <Text style={styles.summaryValue}>$40,000</Text>
                </View>
              </View>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Active Sites</Text>
                  <Text style={styles.summaryValue}>3</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>ROI</Text>
                  <Text style={styles.summaryValue}>32%</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.overviewCard}>
              <Text style={styles.cardTitle}>Recent Activity</Text>
              <View style={styles.activityItem}>
                <Text style={styles.activityText}>✅ Milestone payout received: $15,000</Text>
                <Text style={styles.activityDate}>2 days ago</Text>
              </View>
              <View style={styles.activityItem}>
                <Text style={styles.activityText}>⏳ Upcoming payout due in 5 days</Text>
                <Text style={styles.activityDate}>Structure Phase</Text>
              </View>
            </View>
          </ScrollView>
        );
      case 'sites':
        return (
          <ScrollView style={styles.tabContent}>
            <View style={styles.overviewCard}>
              <Text style={styles.cardTitle}>Investment Sites</Text>
              <View style={styles.siteItem}>
                <Text style={styles.siteName}>Downtown Office Complex</Text>
                <Text style={styles.siteProgress}>Progress: 65%</Text>
                <Text style={styles.siteStatus}>Status: Active</Text>
              </View>
              <View style={styles.siteItem}>
                <Text style={styles.siteName}>Residential Tower</Text>
                <Text style={styles.siteProgress}>Progress: 30%</Text>
                <Text style={styles.siteStatus}>Status: Active</Text>
              </View>
            </View>
          </ScrollView>
        );
      case 'reports':
        return (
          <ScrollView style={styles.tabContent}>
            <View style={styles.overviewCard}>
              <Text style={styles.cardTitle}>Financial Reports</Text>
              <TouchableOpacity style={styles.reportItem}>
                <Text style={styles.reportText}>📄 Monthly Investment Report</Text>
                <Text style={styles.reportDate}>March 2024</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.reportItem}>
                <Text style={styles.reportText}>📊 Quarterly Performance</Text>
                <Text style={styles.reportDate}>Q1 2024</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Investor Dashboard</Text>
        <Text style={styles.subtitle}>Investment Portfolio Overview</Text>
      </View>

      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              activeTab === tab.id && styles.activeTab
            ]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text style={[
              styles.tabLabel,
              activeTab === tab.id && styles.activeTabLabel
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.content}>
        {renderTabContent()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4
  },
  subtitle: {
    fontSize: 14,
    color: '#666'
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#2196F3'
  },
  tabIcon: {
    fontSize: 16,
    marginBottom: 4
  },
  tabLabel: {
    fontSize: 12,
    color: '#666'
  },
  activeTabLabel: {
    color: '#2196F3',
    fontWeight: 'bold'
  },
  content: {
    flex: 1
  },
  tabContent: {
    flex: 1,
    padding: 16
  },
  overviewCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center'
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  activityItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  activityText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2
  },
  activityDate: {
    fontSize: 12,
    color: '#666'
  },
  siteItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  siteName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4
  },
  siteProgress: {
    fontSize: 14,
    color: '#4CAF50',
    marginBottom: 2
  },
  siteStatus: {
    fontSize: 12,
    color: '#666'
  },
  reportItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  reportText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2
  },
  reportDate: {
    fontSize: 12,
    color: '#666'
  }
});