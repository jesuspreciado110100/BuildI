import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { AirbnbActionCard } from './AirbnbActionCard';
import { AirbnbBottomNav } from './AirbnbBottomNav';
import { AirbnbFAB } from './AirbnbFAB';
import { SimpleSmartSuggestions } from './SimpleSmartSuggestions';
import { NotificationBell } from './NotificationBell';

interface AirbnbContractorDashboardProps {
  userId: string;
  userRole: string;
}

export const AirbnbContractorDashboard: React.FC<AirbnbContractorDashboardProps> = ({
  userId,
  userRole
}) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const scrollViewRef = useRef<ScrollView>(null);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const actionItems = [
    {
      title: 'Review Site Progress',
      subtitle: 'Site #2 - Downtown Plaza',
      icon: '🏗️',
      iconColor: '#3B82F6',
      progress: 75,
      showWarning: true,
      priority: 'high' as const,
      onPress: () => setActiveTab('sites')
    },
    {
      title: 'Book Equipment',
      subtitle: 'Concrete mixer needed for Phase 2',
      icon: '🚜',
      iconColor: '#10B981',
      onPress: () => setActiveTab('machinery')
    },
    {
      title: 'Order Materials',
      subtitle: '3 items running low',
      icon: '🧱',
      iconColor: '#F59E0B',
      onPress: () => setActiveTab('materials')
    },
    {
      title: 'Hire Labor',
      subtitle: '2 electricians needed next week',
      icon: '👷',
      iconColor: '#8B5CF6',
      onPress: () => setActiveTab('labor')
    }
  ];

  const navItems = [
    { key: 'home', label: 'Home', icon: '🏠' },
    { key: 'sites', label: 'Sites', icon: '🏗️' },
    { key: 'machinery', label: 'Machinery', icon: '🚜' },
    { key: 'labor', label: 'Labor', icon: '👷' },
    { key: 'materials', label: 'Materials', icon: '🧱' }
  ];

  const quickActions = [
    {
      key: 'add-site',
      label: 'Add Site',
      icon: '🏗️',
      onPress: () => console.log('Add site')
    },
    {
      key: 'book-equipment',
      label: 'Book Equipment',
      icon: '🚜',
      onPress: () => setActiveTab('machinery')
    },
    {
      key: 'hire-worker',
      label: 'Hire Worker',
      icon: '👷',
      onPress: () => setActiveTab('labor')
    }
  ];

  const renderContent = () => {
    if (activeTab === 'home') {
      return (
        <View style={styles.homeContent}>
          <SimpleSmartSuggestions
            userId={userId}
            siteId="1"
            type="dashboard"
          />
          
          <Text style={styles.sectionTitle}>Your Action Items</Text>
          
          {actionItems.map((item, index) => (
            <AirbnbActionCard
              key={index}
              title={item.title}
              subtitle={item.subtitle}
              icon={item.icon}
              iconColor={item.iconColor}
              progress={item.progress}
              showWarning={item.showWarning}
              priority={item.priority}
              onPress={item.onPress}
            />
          ))}
        </View>
      );
    }
    
    return (
      <View style={styles.tabContent}>
        <Text style={styles.tabTitle}>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</Text>
        <Text style={styles.tabSubtitle}>Content for {activeTab} tab</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>
            {getGreeting()}, {user?.name || 'User'}
          </Text>
          <Text style={styles.roleLabel}>General Contractor</Text>
        </View>
        <NotificationBell userId={userId} />
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {renderContent()}
        <View style={styles.bottomPadding} />
      </ScrollView>

      <AirbnbBottomNav
        items={navItems}
        activeTab={activeTab}
        onTabPress={setActiveTab}
      />

      <AirbnbFAB quickActions={quickActions} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  roleLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  homeContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
    marginTop: 8,
  },
  tabContent: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  tabTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  tabSubtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  bottomPadding: {
    height: 100,
  },
});