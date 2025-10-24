import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';

export function SimpleMachineryRenterDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'requests', label: 'Requests', icon: '📋' },
    { id: 'fleet', label: 'Fleet', icon: '🚜' },
    { id: 'earnings', label: 'Earnings', icon: '💰' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>Machinery Renter Dashboard</Text>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Active Rentals</Text>
              <Text style={styles.cardValue}>8</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Monthly Revenue</Text>
              <Text style={styles.cardValue}>$15,000</Text>
            </View>
          </View>
        );
      case 'requests':
        return (
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>Rental Requests</Text>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Excavator Request</Text>
              <Text style={styles.cardSubtitle}>Dec 10-15 - $500/day</Text>
            </View>
          </View>
        );
      default:
        return <View><Text>Select a tab</Text></View>;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Machinery Renter</Text>
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

export function SimpleMaterialSupplierDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'orders', label: 'Orders', icon: '📦' },
    { id: 'inventory', label: 'Inventory', icon: '📋' },
    { id: 'quotes', label: 'Quotes', icon: '💰' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>Material Supplier Dashboard</Text>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Active Orders</Text>
              <Text style={styles.cardValue}>12</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Monthly Sales</Text>
              <Text style={styles.cardValue}>$45,000</Text>
            </View>
          </View>
        );
      case 'orders':
        return (
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>Material Orders</Text>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Concrete Order</Text>
              <Text style={styles.cardSubtitle}>50 tons - Processing</Text>
            </View>
          </View>
        );
      default:
        return <View><Text>Select a tab</Text></View>;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Material Supplier</Text>
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
  cardValue: { fontSize: 24, fontWeight: 'bold', color: '#2563eb', marginTop: 8 },
  cardSubtitle: { fontSize: 14, color: '#666', marginTop: 4 }
});