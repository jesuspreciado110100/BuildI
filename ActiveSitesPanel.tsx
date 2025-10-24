import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ActiveSitesPanelProps {
  contractorId: string;
}

export default function ActiveSitesPanel({ contractorId }: ActiveSitesPanelProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', title: 'Overview', icon: 'list' },
    { id: 'calendar', title: 'Calendar', icon: 'calendar' },
    { id: 'documents', title: 'Documents', icon: 'document' },
    { id: 'payments', title: 'Payments', icon: 'card' },
    { id: 'analytics', title: 'Analytics', icon: 'analytics' }
  ];

  const mockSites = [
    {
      id: '1',
      name: 'Downtown Plaza',
      location: 'New York, NY',
      status: 'active',
      progress: 75
    },
    {
      id: '2',
      name: 'Shopping Center',
      location: 'Los Angeles, CA',
      status: 'active',
      progress: 45
    }
  ];

  const renderOverview = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Active Sites</Text>
      {(mockSites || []).map((site) => (
        <View key={site.id} style={styles.siteCard}>
          <View style={styles.siteHeader}>
            <Text style={styles.siteName}>{site.name || 'Unnamed Site'}</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{site.status || 'Unknown'}</Text>
            </View>
          </View>
          <Text style={styles.siteLocation}>📍 {site.location || 'No location'}</Text>
          <View style={styles.progressContainer}>
            <Text style={styles.progressLabel}>Progress: {site.progress || 0}%</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${site.progress || 0}%` }]} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  const renderCalendar = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Site Calendar</Text>
      <View style={styles.calendarCard}>
        <Text style={styles.calendarTitle}>Upcoming Events</Text>
        <Text style={styles.calendarItem}>• Site inspection - Tomorrow 9:00 AM</Text>
        <Text style={styles.calendarItem}>• Material delivery - Friday 2:00 PM</Text>
        <Text style={styles.calendarItem}>• Team meeting - Monday 10:00 AM</Text>
      </View>
    </View>
  );

  const renderDocuments = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Site Documents</Text>
      <View style={styles.documentCard}>
        <Text style={styles.documentTitle}>Recent Documents</Text>
        <Text style={styles.documentItem}>📄 Project Blueprint v2.1</Text>
        <Text style={styles.documentItem}>📄 Safety Report - Week 12</Text>
        <Text style={styles.documentItem}>📄 Material Order #1234</Text>
      </View>
    </View>
  );

  const renderPayments = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Payment Overview</Text>
      <View style={styles.paymentCard}>
        <Text style={styles.paymentTitle}>Recent Transactions</Text>
        <Text style={styles.paymentItem}>💰 Payment received - $15,000</Text>
        <Text style={styles.paymentItem}>💰 Material cost - $8,500</Text>
        <Text style={styles.paymentItem}>💰 Labor payment - $12,000</Text>
      </View>
    </View>
  );

  const renderAnalytics = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Site Analytics</Text>
      <View style={styles.analyticsCard}>
        <Text style={styles.analyticsTitle}>Performance Metrics</Text>
        <Text style={styles.analyticsItem}>📊 Average completion: 60%</Text>
        <Text style={styles.analyticsItem}>📊 On-time delivery: 85%</Text>
        <Text style={styles.analyticsItem}>📊 Budget utilization: 72%</Text>
      </View>
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'calendar': return renderCalendar();
      case 'documents': return renderDocuments();
      case 'payments': return renderPayments();
      case 'analytics': return renderAnalytics();
      default: return renderOverview();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {(tabs || []).map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.activeTab]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Ionicons 
                name={tab.icon as any} 
                size={20} 
                color={activeTab === tab.id ? '#007AFF' : '#6B7280'} 
              />
              <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>
                {tab.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      <ScrollView style={styles.content}>
        {renderTabContent()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB'
  },
  tabBar: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF'
  },
  tabText: {
    fontSize: 14,
    color: '#6B7280'
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600'
  },
  content: {
    flex: 1
  },
  tabContent: {
    padding: 16,
    gap: 16
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16
  },
  siteCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12
  },
  siteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  siteName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1
  },
  statusBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600'
  },
  siteLocation: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12
  },
  progressContainer: {
    marginBottom: 8
  },
  progressLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 3
  },
  calendarCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  calendarTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12
  },
  calendarItem: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8
  },
  documentCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12
  },
  documentItem: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8
  },
  paymentCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12
  },
  paymentItem: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8
  },
  analyticsCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  analyticsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12
  },
  analyticsItem: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8
  }
});