import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';

export function AdminDashboardPanel() {
  const [activeTab, setActiveTab] = useState('health');

  const renderContent = () => {
    switch (activeTab) {
      case 'health':
        return (
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>Platform Health</Text>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>System Status</Text>
              <Text style={styles.cardValue}>Online</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Active Sessions</Text>
              <Text style={styles.cardValue}>1,456</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Response Time</Text>
              <Text style={styles.cardValue}>125ms</Text>
            </View>
          </View>
        );
      case 'bookings':
        return (
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>Live Bookings</Text>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Active Bookings</Text>
              <Text style={styles.cardValue}>23</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Pending Approval</Text>
              <Text style={styles.cardValue}>8</Text>
            </View>
          </View>
        );
      default:
        return <View><Text>Select a tab</Text></View>;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Super Admin Panel</Text>
      <View style={styles.tabs}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'health' && styles.activeTab]}
          onPress={() => setActiveTab('health')}
        >
          <Text style={[styles.tabText, activeTab === 'health' && styles.activeTabText]}>Health</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'bookings' && styles.activeTab]}
          onPress={() => setActiveTab('bookings')}
        >
          <Text style={[styles.tabText, activeTab === 'bookings' && styles.activeTabText]}>Bookings</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.scrollView}>
        {renderContent()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', padding: 20, textAlign: 'center' },
  tabs: { flexDirection: 'row', backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  tab: { flex: 1, padding: 15, alignItems: 'center' },
  activeTab: { borderBottomWidth: 2, borderBottomColor: '#2563eb' },
  tabText: { fontSize: 16, color: '#666' },
  activeTabText: { color: '#2563eb', fontWeight: '600' },
  scrollView: { flex: 1 },
  content: { padding: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  card: { backgroundColor: 'white', padding: 15, borderRadius: 8, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  cardValue: { fontSize: 24, fontWeight: 'bold', color: '#2563eb', marginTop: 8 }
});