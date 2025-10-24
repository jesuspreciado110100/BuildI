import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCatalogTab } from './MaterialCatalogTab';
import { MaterialOrdersTab } from './MaterialOrdersTab';
import { MaterialQuoteRequestsTab } from './MaterialQuoteRequestsTab';
import { InventoryHealthTab } from './InventoryHealthTab';
import { InventoryReorderSystem } from './InventoryReorderSystem';
import { MaterialComparisonPanel } from './MaterialComparisonPanel';
import { ForecastMaterialsPanel } from './ForecastMaterialsPanel';
import { DeliveryStatusPanel } from './DeliveryStatusPanel';
import { EarningsAnalyticsPanel } from './EarningsAnalyticsPanel';
import { AnalyticsDashboardPanel } from './AnalyticsDashboardPanel';
import { ReviewsTab } from './ReviewsTab';
import { PaymentHistoryTab } from './PaymentHistoryTab';
import { SharedFilesTab } from './SharedFilesTab';
import { PlansModelsTab } from './PlansModelsTab';
import { PortfolioViewTab } from './PortfolioViewTab';
import MaterialForecastPanel from './MaterialForecastPanel';

export function MaterialSupplierDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'catalog', label: 'Material Catalog', icon: '📦' },
    { id: 'orders', label: 'Orders', icon: '📋' },
    { id: 'quotes', label: 'Quote Requests', icon: '💰' },
    { id: 'inventory', label: 'Inventory Health', icon: '📈' },
    { id: 'reorder', label: 'Reorder System', icon: '🔄' },
    { id: 'comparison', label: 'Price Comparison', icon: '⚖️' },
    { id: 'forecast', label: 'AI Forecast', icon: '🤖' },
    { id: 'delivery', label: 'Delivery Status', icon: '🚚' },
    { id: 'earnings', label: 'Earnings Analytics', icon: '💰' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'reviews', label: 'Reviews', icon: '⭐' },
    { id: 'payments', label: 'Payments', icon: '💳' },
    { id: 'files', label: 'Shared Files', icon: '📁' },
    { id: 'plans', label: 'Plans & Models', icon: '📐' },
    { id: 'portfolio', label: 'Portfolio', icon: '💼' }
  ];

  const handleReorderRequest = (materialId: string, quantity: number) => {
    console.log(`Reorder request: ${quantity} units of material ${materialId}`);
    // Handle reorder logic here
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>Material Supplier Overview</Text>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Active Orders</Text>
              <Text style={styles.cardValue}>15</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Inventory Items</Text>
              <Text style={styles.cardValue}>342</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Monthly Revenue</Text>
              <Text style={styles.cardValue}>$85,000</Text>
            </View>
            <View style={styles.aiSuggestion}>
              <Text style={styles.aiTitle}>🤖 AI Suggestion</Text>
              <Text style={styles.aiText}>Prepare 5 more tons of Gravel — depletion in 2 days</Text>
              <Text style={styles.aiText}>Concrete demand expected to increase 15% next week</Text>
            </View>
          </View>
        );
      case 'catalog': return <MaterialCatalogTab />;
      case 'orders': return <MaterialOrdersTab />;
      case 'quotes': return <MaterialQuoteRequestsTab />;
      case 'inventory': return <InventoryHealthTab />;
      case 'reorder': return <InventoryReorderSystem />;
      case 'comparison': return <MaterialComparisonPanel />;
      case 'forecast': return <MaterialForecastPanel siteId="site1" onReorderRequest={handleReorderRequest} />;
      case 'delivery': return <DeliveryStatusPanel />;
      case 'earnings': return <EarningsAnalyticsPanel />;
      case 'analytics': return <AnalyticsDashboardPanel />;
      case 'reviews': return <ReviewsTab />;
      case 'payments': return <PaymentHistoryTab />;
      case 'files': return <SharedFilesTab />;
      case 'plans': return <PlansModelsTab />;
      case 'portfolio': return <PortfolioViewTab />;
      default: return <View><Text>Select a tab</Text></View>;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Material Supplier Dashboard</Text>
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
  aiSuggestion: { backgroundColor: '#E8F4FD', padding: 15, borderRadius: 8, marginTop: 10, borderLeftWidth: 4, borderLeftColor: '#007AFF' },
  aiTitle: { fontSize: 16, fontWeight: 'bold', color: '#007AFF', marginBottom: 8 },
  aiText: { fontSize: 14, color: '#333', marginBottom: 4 }
});