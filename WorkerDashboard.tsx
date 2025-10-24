import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { IncomingMicroJobsTab } from './IncomingMicroJobsTab';

interface WorkerDashboardProps {
  workerId: string;
}

export const WorkerDashboard: React.FC<WorkerDashboardProps> = ({ workerId }) => {
  const [selectedTab, setSelectedTab] = useState('IncomingMicroJobs');

  const tabs = ['IncomingMicroJobs', 'ActiveJobs', 'CompletedJobs'];

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'IncomingMicroJobs':
        return <IncomingMicroJobsTab workerId={workerId} />;
      case 'ActiveJobs':
        return (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderText}>Active Jobs</Text>
          </View>
        );
      case 'CompletedJobs':
        return (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderText}>Completed Jobs</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Worker Dashboard</Text>
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabContainer}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, selectedTab === tab && styles.activeTab]}
            onPress={() => setSelectedTab(tab)}
          >
            <Text style={[styles.tabText, selectedTab === tab && styles.activeTabText]}>
              {tab === 'IncomingMicroJobs' ? 'Incoming Jobs' : tab}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
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
    backgroundColor: '#2196F3',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white'
  },
  tabContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent'
  },
  activeTab: {
    borderBottomColor: '#2196F3'
  },
  tabText: {
    fontSize: 16,
    color: '#666'
  },
  activeTabText: {
    color: '#2196F3',
    fontWeight: '600'
  },
  content: {
    flex: 1
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  placeholderText: {
    fontSize: 18,
    color: '#666'
  }
});