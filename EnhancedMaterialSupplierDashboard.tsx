import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { TopNavigation } from './TopNavigation';
import { AnimatedTabBar } from './AnimatedTabBar';
import { MaterialCatalogTab } from './MaterialCatalogTab';
import { MaterialQuoteRequestsTab } from './MaterialQuoteRequestsTab';
import { MaterialOrdersTab } from './MaterialOrdersTab';
import { ReviewsTab } from './ReviewsTab';
import { FleetTrackerTab } from './FleetTrackerTab';
import { InventoryHealthTab } from './InventoryHealthTab';
import { SupplierInvoicesTab } from './SupplierInvoicesTab';
import { TaxInvoiceSystem } from './TaxInvoiceSystem';
import { User } from '../types';

interface EnhancedMaterialSupplierDashboardProps {
  user: User;
  onLogout: () => void;
}

export const EnhancedMaterialSupplierDashboard: React.FC<EnhancedMaterialSupplierDashboardProps> = ({
  user,
  onLogout
}) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('catalog');
  const [showCompliance, setShowCompliance] = useState(false);

  const tabs = [
    {
      key: 'catalog',
      label: 'Catalog',
      icon: '📦',
      component: MaterialCatalogTab
    },
    {
      key: 'quotes',
      label: 'Quote Requests',
      icon: '💬',
      component: MaterialQuoteRequestsTab
    },
    {
      key: 'orders',
      label: 'Orders',
      icon: '📋',
      component: MaterialOrdersTab
    },
    {
      key: 'reviews',
      label: 'Reviews',
      icon: '⭐',
      component: ReviewsTab
    },
    {
      key: 'fleet',
      label: 'Fleet Tracker',
      icon: '🚛',
      component: FleetTrackerTab
    },
    {
      key: 'inventory',
      label: 'Inventory Health',
      icon: '📊',
      component: InventoryHealthTab
    },
    {
      key: 'compliance',
      label: 'Compliance',
      icon: '📄',
      component: null // Special handling
    }
  ];

  const renderTabContent = () => {
    if (activeTab === 'compliance') {
      return (
        <View style={styles.complianceContainer}>
          <View style={styles.complianceHeader}>
            <Text style={[styles.complianceTitle, { color: theme.colors.text }]}>
              Tax & Invoice Compliance
            </Text>
          </View>
          
          <View style={styles.complianceTabs}>
            <View style={[styles.complianceTab, { backgroundColor: theme.colors.card }]}>
              <Text style={[styles.complianceTabTitle, { color: theme.colors.text }]}>
                📄 Invoices
              </Text>
              <SupplierInvoicesTab userId={user.id} userRole={user.role} />
            </View>
            
            <View style={[styles.complianceTab, { backgroundColor: theme.colors.card }]}>
              <Text style={[styles.complianceTabTitle, { color: theme.colors.text }]}>
                🧾 Tax System
              </Text>
              <TaxInvoiceSystem currentUser={user} />
            </View>
          </View>
        </View>
      );
    }

    const activeTabData = tabs.find(tab => tab.key === activeTab);
    if (!activeTabData?.component) return null;

    const TabComponent = activeTabData.component;
    return <TabComponent userId={user.id} userRole={user.role} />;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <TopNavigation
        user={user}
        onLogout={onLogout}
      />
      
      <AnimatedTabBar
        tabs={tabs.map(tab => ({
          key: tab.key,
          label: tab.label,
          icon: tab.icon
        }))}
        activeTab={activeTab}
        onTabPress={setActiveTab}
      />
      
      <View style={styles.content}>
        {renderTabContent()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  complianceContainer: {
    flex: 1,
    padding: 16,
  },
  complianceHeader: {
    marginBottom: 16,
  },
  complianceTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  complianceTabs: {
    flex: 1,
    gap: 16,
  },
  complianceTab: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
  },
  complianceTabTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
});