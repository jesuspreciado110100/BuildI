import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { TopNavigation } from './TopNavigation';
import { AnimatedTabBar } from './AnimatedTabBar';
import { PortfolioViewTab } from './PortfolioViewTab';
import { CostForecastPanel } from './CostForecastPanel';
import { InvestorLedgerTab } from './InvestorLedgerTab';
import { ClientReportsTab } from './ClientReportsTab';
import { User } from '../types';

interface EnhancedInvestorDashboardProps {
  user: User;
  onLogout: () => void;
}

export const EnhancedInvestorDashboard: React.FC<EnhancedInvestorDashboardProps> = ({
  user,
  onLogout
}) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('investments');

  const tabs = [
    { key: 'investments', label: 'My Investments', icon: '💼', component: PortfolioViewTab },
    { key: 'forecasts', label: 'ROI Forecasts', icon: '📈', component: CostForecastPanel },
    { key: 'ledger', label: 'Ledger', icon: '📊', component: InvestorLedgerTab },
    { key: 'reports', label: 'Reports', icon: '📄', component: ClientReportsTab }
  ];

  const renderTabContent = () => {
    const activeTabData = tabs.find(tab => tab.key === activeTab);
    if (!activeTabData) return null;
    const TabComponent = activeTabData.component;
    return <TabComponent userId={user.id} userRole={user.role} />;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <TopNavigation user={user} onLogout={onLogout} />
      <AnimatedTabBar
        tabs={tabs.map(tab => ({ key: tab.key, label: tab.label, icon: tab.icon }))}
        activeTab={activeTab}
        onTabPress={setActiveTab}
      />
      <View style={styles.content}>{renderTabContent()}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
});