import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { IncomingRequestsTab } from './IncomingRequestsTab';
import { LiveBookingsTab } from './LiveBookingsTab';
import { RentalHistoryTab } from './RentalHistoryTab';
import { RentalSummaryTab } from './RentalSummaryTab';
import { FleetTrackerTab } from './FleetTrackerTab';
import { FleetVerificationTab } from './FleetVerificationTab';
import { InventoryHealthTab } from './InventoryHealthTab';
import { FavoriteRentersPanel } from './FavoriteRentersPanel';
import { EarningsAnalyticsPanel } from './EarningsAnalyticsPanel';
import { AnalyticsDashboardPanel } from './AnalyticsDashboardPanel';
import { ReviewsTab } from './ReviewsTab';
import { PaymentHistoryTab } from './PaymentHistoryTab';
import { SafetyComplianceTab } from './SafetyComplianceTab';
import { TelemetryLogPanel } from './TelemetryLogPanel';
import { PortfolioViewTab } from './PortfolioViewTab';
import { EquipmentAnalyticsPanel } from './EquipmentAnalyticsPanel';
import { SafetyReportFAB } from './SafetyReportFAB';

export function MachineryRenterDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const userId = 'renter-123';
  const siteId = 'site-456';

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'incoming', label: 'Incoming Requests', icon: '📥' },
    { id: 'live-bookings', label: 'Live Bookings', icon: '🔴' },
    { id: 'rental-history', label: 'Rental History', icon: '📜' },
    { id: 'rental-summary', label: 'Rental Summary', icon: '📋' },
    { id: 'fleet-tracker', label: 'Fleet Tracker', icon: '🚜' },
    { id: 'fleet-verification', label: 'Fleet Verification', icon: '✅' },
    { id: 'inventory-health', label: 'Inventory Health', icon: '🔧' },
    { id: 'equipment-analytics', label: 'Equipment Analytics', icon: '📈' },
    { id: 'favorites', label: 'Favorite Renters', icon: '⭐' },
    { id: 'earnings', label: 'Earnings Analytics', icon: '💰' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'reviews', label: 'Reviews', icon: '⭐' },
    { id: 'payments', label: 'Payments', icon: '💳' },
    { id: 'safety', label: 'Safety Compliance', icon: '🦺' },
    { id: 'telemetry', label: 'Telemetry', icon: '📡' },
    { id: 'portfolio', label: 'Portfolio', icon: '💼' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>Machinery Renter Overview</Text>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Active Rentals</Text>
              <Text style={styles.cardValue}>8</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Fleet Size</Text>
              <Text style={styles.cardValue}>25</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Monthly Revenue</Text>
              <Text style={styles.cardValue}>$45,000</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Fleet Analytics</Text>
              <Text style={styles.cardSubtitle}>Equipment performance and maintenance insights</Text>
              <TouchableOpacity 
                style={styles.analyticsButton}
                onPress={() => setActiveTab('equipment-analytics')}
              >
                <Text style={styles.analyticsButtonText}>View Equipment Analytics</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      case 'incoming': return <IncomingRequestsTab />;
      case 'live-bookings': return <LiveBookingsTab />;
      case 'rental-history': return <RentalHistoryTab />;
      case 'rental-summary': return <RentalSummaryTab />;
      case 'fleet-tracker': return <FleetTrackerTab />;
      case 'fleet-verification': return <FleetVerificationTab />;
      case 'inventory-health': return <InventoryHealthTab />;
      case 'equipment-analytics': return <EquipmentAnalyticsPanel showAll={true} />;
      case 'favorites': return <FavoriteRentersPanel />;
      case 'earnings': return <EarningsAnalyticsPanel />;
      case 'analytics': return <AnalyticsDashboardPanel />;
      case 'reviews': return <ReviewsTab />;
      case 'payments': return <PaymentHistoryTab />;
      case 'safety': return <SafetyComplianceTab />;
      case 'telemetry': return <TelemetryLogPanel />;
      case 'portfolio': return <PortfolioViewTab />;
      default: return <View><Text>Select a tab</Text></View>;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Machinery Renter Dashboard</Text>
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
      <SafetyReportFAB
        siteId={siteId}
        reporterId={userId}
        onIncidentCreated={(incident) => {
          console.log('Safety incident created:', incident);
        }}
      />
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
  cardSubtitle: { fontSize: 14, color: '#666', marginTop: 4 },
  analyticsButton: { backgroundColor: '#2563eb', padding: 10, borderRadius: 6, marginTop: 10 },
  analyticsButtonText: { color: 'white', textAlign: 'center', fontWeight: 'bold' }
});