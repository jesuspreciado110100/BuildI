import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { FeeConfigurationPanel } from './FeeConfigurationPanel';
import { EarningsAnalyticsPanel } from './EarningsAnalyticsPanel';

export const FeesEarningsTab: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'config' | 'analytics'>('config');

  return (
    <View style={styles.container}>
      <View style={styles.tabHeader}>
        <TouchableOpacity
          style={[styles.tabButton, activeSection === 'config' && styles.activeTab]}
          onPress={() => setActiveSection('config')}
        >
          <Text style={[styles.tabText, activeSection === 'config' && styles.activeTabText]}>
            Fee Configuration
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeSection === 'analytics' && styles.activeTab]}
          onPress={() => setActiveSection('analytics')}
        >
          <Text style={[styles.tabText, activeSection === 'analytics' && styles.activeTabText]}>
            Earnings Analytics
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeSection === 'config' ? (
          <FeeConfigurationPanel />
        ) : (
          <EarningsAnalyticsPanel />
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  tabHeader: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  tabButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent'
  },
  activeTab: {
    borderBottomColor: '#007AFF'
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500'
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600'
  },
  content: {
    flex: 1,
    padding: 16
  }
});