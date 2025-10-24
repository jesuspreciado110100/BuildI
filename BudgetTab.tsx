import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import CostRiskPanel from './CostRiskPanel';
import BudgetTracker from './BudgetTracker';

interface BudgetTabProps {
  userId: string;
  siteId: string;
}

const BudgetTab: React.FC<BudgetTabProps> = ({ userId, siteId }) => {
  const { theme } = useTheme();
  const [activeSubTab, setActiveSubTab] = useState('overview');

  const subTabs = [
    { key: 'overview', label: 'Overview', icon: '📊' },
    { key: 'forecast', label: 'AI Forecast', icon: '🤖' },
    { key: 'tracker', label: 'Budget Tracker', icon: '💰' }
  ];

  const renderSubTabContent = () => {
    switch (activeSubTab) {
      case 'overview':
        return (
          <View style={styles.overviewContainer}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Budget Overview</Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Total Budget</Text>
                <Text style={[styles.summaryValue, { color: theme.colors.text }]}>$250,000</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Spent</Text>
                <Text style={[styles.summaryValue, { color: '#ff4444' }]}>$185,000</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Remaining</Text>
                <Text style={[styles.summaryValue, { color: '#00aa00' }]}>$65,000</Text>
              </View>
            </View>
          </View>
        );
      case 'forecast':
        return <CostRiskPanel siteId={siteId} />;
      case 'tracker':
        return <BudgetTracker siteId={siteId} />;
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.subTabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subTabScroll}>
          {subTabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.subTab,
                {
                  backgroundColor: activeSubTab === tab.key ? theme.colors.primary : 'transparent',
                  borderColor: theme.colors.border
                }
              ]}
              onPress={() => setActiveSubTab(tab.key)}
            >
              <Text style={styles.subTabIcon}>{tab.icon}</Text>
              <Text
                style={[
                  styles.subTabText,
                  {
                    color: activeSubTab === tab.key ? '#fff' : theme.colors.text
                  }
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      <ScrollView style={styles.content}>
        {renderSubTabContent()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  subTabContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  subTabScroll: {
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  subTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1
  },
  subTabIcon: {
    fontSize: 16,
    marginRight: 6
  },
  subTabText: {
    fontSize: 14,
    fontWeight: '600'
  },
  content: {
    flex: 1
  },
  overviewContainer: {
    padding: 16
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: '500'
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold'
  }
});

export default BudgetTab;