import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function SimpleContractorDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('sites');

  const tabs = [
    { key: 'sites', label: 'Sites', icon: '🏗️' },
    { key: 'machinery', label: 'Machinery', icon: '🚜' },
    { key: 'labor', label: 'Labor', icon: '👷' },
    { key: 'materials', label: 'Materials', icon: '🧱' },
    { key: 'progress', label: 'Progress', icon: '📈' },
    { key: 'finance', label: 'Finance', icon: '💰' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'sites':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.tabTitle}>My Sites</Text>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Construction Site A</Text>
              <Text style={styles.cardText}>Progress: 75%</Text>
              <Text style={styles.cardText}>Status: Active</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Office Building B</Text>
              <Text style={styles.cardText}>Progress: 45%</Text>
              <Text style={styles.cardText}>Status: In Progress</Text>
            </View>
          </View>
        );
      case 'machinery':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.tabTitle}>Machinery Requests</Text>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Excavator Request</Text>
              <Text style={styles.cardText}>Status: Pending</Text>
              <Text style={styles.cardText}>Date: Tomorrow</Text>
            </View>
          </View>
        );
      case 'labor':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.tabTitle}>Labor Management</Text>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Active Workers: 12</Text>
              <Text style={styles.cardText}>Available: 8</Text>
              <Text style={styles.cardText}>On Break: 4</Text>
            </View>
          </View>
        );
      case 'materials':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.tabTitle}>Material Orders</Text>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Cement - 50 bags</Text>
              <Text style={styles.cardText}>Status: Delivered</Text>
              <Text style={styles.cardText}>Cost: $2,500</Text>
            </View>
          </View>
        );
      case 'progress':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.tabTitle}>Project Progress</Text>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Overall Progress</Text>
              <Text style={styles.cardText}>Completed: 60%</Text>
              <Text style={styles.cardText}>On Schedule: Yes</Text>
            </View>
          </View>
        );
      case 'finance':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.tabTitle}>Financial Overview</Text>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Monthly Revenue</Text>
              <Text style={styles.cardText}>$45,000</Text>
              <Text style={styles.cardText}>Expenses: $32,000</Text>
            </View>
          </View>
        );
      default:
        return (
          <View style={styles.tabContent}>
            <Text style={styles.tabTitle}>Welcome</Text>
            <Text style={styles.cardText}>Select a tab to view content</Text>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Construction Dashboard</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBar}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && styles.activeTab
            ]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text style={[
              styles.tabLabel,
              activeTab === tab.key && styles.activeTabLabel
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <ScrollView style={styles.content}>
        {renderTabContent()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2563eb',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  logoutButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  logoutText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  tabBar: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 80,
  },
  activeTab: {
    backgroundColor: '#2563eb',
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  activeTabLabel: {
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  tabTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1e293b',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1e293b',
  },
  cardText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
});