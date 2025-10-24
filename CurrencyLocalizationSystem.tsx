import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { CurrencyService } from '../services/CurrencyService';
import { CurrencyToggle } from './CurrencyToggle';
import { CurrencySettingsPanel } from './CurrencySettingsPanel';
import { CurrencyBudgetPanel } from './CurrencyBudgetPanel';
import { CurrencyMaterialCatalog } from './CurrencyMaterialCatalog';
import { CurrencyNotificationCard } from './CurrencyNotificationCard';
import { CurrencyReportPanel } from './CurrencyReportPanel';

interface CurrencyLocalizationSystemProps {
  userCurrency?: string;
  siteCurrency?: string;
}

export const CurrencyLocalizationSystem: React.FC<CurrencyLocalizationSystemProps> = ({
  userCurrency = 'USD',
  siteCurrency = 'MXN'
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [currentCurrency, setCurrentCurrency] = useState(userCurrency);

  // Mock data
  const mockBudgetItems = [
    { id: '1', category: 'Materials', amount: 45000, currency: 'MXN', timestamp: '2024-01-15' },
    { id: '2', category: 'Labor', amount: 2500, currency: 'USD', timestamp: '2024-01-16' },
    { id: '3', category: 'Equipment', amount: 18000, currency: 'MXN', timestamp: '2024-01-17' }
  ];

  const mockMaterials = [
    {
      id: '1',
      name: 'Concrete Mix',
      description: 'High-strength concrete for foundations',
      price: 2500,
      currency: 'MXN',
      unit: 'm³',
      supplier_id: '1',
      supplier_name: 'ConcreMex'
    },
    {
      id: '2',
      name: 'Steel Rebar',
      description: 'Grade 60 reinforcement steel',
      price: 850,
      currency: 'USD',
      unit: 'ton',
      supplier_id: '2',
      supplier_name: 'SteelCorp USA'
    }
  ];

  const mockNotifications = [
    {
      type: 'quote' as const,
      title: 'Material Quote',
      amount: 58000,
      currency: 'MXN',
      itemDescription: '5,000 bricks',
      timestamp: '2024-01-20T10:30:00Z'
    },
    {
      type: 'booking' as const,
      title: 'Equipment Booking',
      amount: 1200,
      currency: 'USD',
      itemDescription: 'Excavator rental',
      timestamp: '2024-01-20T14:15:00Z'
    }
  ];

  const mockReportData = [
    {
      id: '1',
      category: 'Materials',
      amount: 25000,
      currency: 'MXN',
      description: 'Concrete delivery',
      date: '2024-01-15'
    },
    {
      id: '2',
      category: 'Labor',
      amount: 1500,
      currency: 'USD',
      description: 'Foundation crew',
      date: '2024-01-16'
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Currency Overview</Text>
            
            <View style={styles.overviewCard}>
              <Text style={styles.cardTitle}>Current Settings</Text>
              <Text style={styles.cardText}>User Currency: {userCurrency}</Text>
              <Text style={styles.cardText}>Site Currency: {siteCurrency}</Text>
              <Text style={styles.cardText}>Exchange Rate: 1 USD = {CurrencyService.getExchangeRate('USD', 'MXN').toFixed(2)} MXN</Text>
            </View>

            <View style={styles.toggleDemo}>
              <Text style={styles.cardTitle}>Currency Toggle Demo</Text>
              <CurrencyToggle
                amount={58000}
                baseCurrency="MXN"
                alternateCurrency="USD"
                onCurrencyChange={setCurrentCurrency}
              />
            </View>

            <View style={styles.notificationsDemo}>
              <Text style={styles.cardTitle}>Notification Examples</Text>
              {mockNotifications.map((notification, index) => (
                <CurrencyNotificationCard
                  key={index}
                  {...notification}
                />
              ))}
            </View>
          </View>
        );

      case 'settings':
        return (
          <CurrencySettingsPanel
            defaultCurrency={siteCurrency}
            onSettingsChange={(settings) => console.log('Settings updated:', settings)}
          />
        );

      case 'budget':
        return (
          <CurrencyBudgetPanel
            siteId="site-1"
            baseCurrency={siteCurrency}
            budgetItems={mockBudgetItems}
            totalBudget={75000}
          />
        );

      case 'catalog':
        return (
          <CurrencyMaterialCatalog
            materials={mockMaterials}
            userCurrency={currentCurrency}
            onAddToCart={(item) => console.log('Added to cart:', item)}
          />
        );

      case 'reports':
        return (
          <CurrencyReportPanel
            reportData={mockReportData}
            baseCurrency={siteCurrency}
            reportTitle="Project Cost Report"
            showDualColumns={true}
          />
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Currency Localization System</Text>
        <Text style={styles.subtitle}>Multi-currency price tracking and conversion</Text>
      </View>

      <View style={styles.tabBar}>
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'settings', label: 'Settings' },
          { key: 'budget', label: 'Budget' },
          { key: 'catalog', label: 'Catalog' },
          { key: 'reports', label: 'Reports' }
        ].map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && styles.activeTab
            ]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[
              styles.tabText,
              activeTab === tab.key && styles.activeTabText
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content}>
        {renderTabContent()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4
  },
  subtitle: {
    fontSize: 16,
    color: '#666'
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent'
  },
  activeTab: {
    borderBottomColor: '#007AFF'
  },
  tabText: {
    fontSize: 14,
    color: '#666'
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600'
  },
  content: {
    flex: 1
  },
  tabContent: {
    padding: 16
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16
  },
  overviewCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8
  },
  cardText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4
  },
  toggleDemo: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center'
  },
  notificationsDemo: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8
  }
});