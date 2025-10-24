import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const ContractorComplianceTab: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Compliance</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Safety Compliance</Text>
        <Text style={styles.cardValue}>98%</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>License Status</Text>
        <Text style={styles.cardValue}>Active</Text>
      </View>
    </View>
  );
};

export const MachineryRequestsTab: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Machinery Requests</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Pending Requests</Text>
        <Text style={styles.cardValue}>3</Text>
      </View>
    </View>
  );
};

export const MaterialOrdersTab: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Material Orders</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Active Orders</Text>
        <Text style={styles.cardValue}>5</Text>
      </View>
    </View>
  );
};

export const HireLaborTab: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hire Labor</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Available Workers</Text>
        <Text style={styles.cardValue}>12</Text>
      </View>
    </View>
  );
};

export const AnalyticsDashboardPanel: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Analytics</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Monthly Revenue</Text>
        <Text style={styles.cardValue}>$45,000</Text>
      </View>
    </View>
  );
};

export const BudgetTracker: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Budget Tracker</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Total Budget</Text>
        <Text style={styles.cardValue}>$125,000</Text>
      </View>
    </View>
  );
};

export const DelaysTab: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Delays</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Current Delays</Text>
        <Text style={styles.cardValue}>2</Text>
      </View>
    </View>
  );
};

export const SafetyComplianceTab: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Safety</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Safety Score</Text>
        <Text style={styles.cardValue}>95%</Text>
      </View>
    </View>
  );
};

export const PaymentHistoryTab: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment History</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Total Payments</Text>
        <Text style={styles.cardValue}>$89,500</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  card: { backgroundColor: 'white', padding: 15, borderRadius: 8, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  cardValue: { fontSize: 24, fontWeight: 'bold', color: '#2563eb', marginTop: 8 }
});