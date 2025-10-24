import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FinancialDashboard() {
  const [activeTab, setActiveTab] = useState('cashflow');

  const tabs = [
    { id: 'cashflow', title: 'Cash Flow' },
    { id: 'income', title: 'Income Statement' },
    { id: 'balance', title: 'Balance Sheet' },
    { id: 'statement', title: 'General Statement' },
    { id: 'breakeven', title: 'Break Even' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'cashflow':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.tabTitle}>Cash Flow Analysis</Text>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Operating Cash Flow</Text>
              <Text style={styles.amount}>$125,000</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Investment Cash Flow</Text>
              <Text style={styles.amount}>-$45,000</Text>
            </View>
          </View>
        );
      case 'income':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.tabTitle}>Income Statement</Text>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Total Revenue</Text>
              <Text style={styles.amount}>$450,000</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Net Income</Text>
              <Text style={styles.amount}>$85,000</Text>
            </View>
          </View>
        );
      default:
        return (
          <View style={styles.tabContent}>
            <Text style={styles.tabTitle}>{tabs.find(t => t.id === activeTab)?.title}</Text>
            <Text style={styles.placeholder}>Financial data will be displayed here</Text>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Financial Dashboard</Text>
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.activeTab]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>
              {tab.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.content}>
        {renderTabContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 20, paddingBottom: 10 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1e293b' },
  tabsContainer: { paddingHorizontal: 20, marginBottom: 20 },
  tab: { 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    marginRight: 12, 
    borderRadius: 20, 
    backgroundColor: '#e2e8f0' 
  },
  activeTab: { backgroundColor: '#3b82f6' },
  tabText: { fontSize: 14, color: '#64748b' },
  activeTabText: { color: 'white', fontWeight: '600' },
  content: { flex: 1, paddingHorizontal: 20 },
  tabContent: { paddingBottom: 40 },
  tabTitle: { fontSize: 20, fontWeight: '600', color: '#1e293b', marginBottom: 16 },
  card: { 
    backgroundColor: 'white', 
    padding: 16, 
    borderRadius: 12, 
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2
  },
  cardTitle: { fontSize: 16, color: '#64748b', marginBottom: 4 },
  amount: { fontSize: 24, fontWeight: 'bold', color: '#1e293b' },
  placeholder: { fontSize: 16, color: '#64748b', textAlign: 'center', marginTop: 40 }
});