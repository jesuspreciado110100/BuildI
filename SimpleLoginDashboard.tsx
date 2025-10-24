import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface SimpleLoginDashboardProps {
  userId: string;
  userRole: string;
}

export const SimpleLoginDashboard: React.FC<SimpleLoginDashboardProps> = ({
  userId,
  userRole
}) => {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('home');

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
      progress: 75,
    },
    {
      title: 'Book Equipment',
      subtitle: 'Concrete mixer needed',
      icon: '🚜',
    },
    {
      title: 'Order Materials',
      subtitle: '3 items running low',
      icon: '🧱',
    },
  ];

  const navItems = [
    { key: 'home', label: 'Home', icon: '🏠' },
    { key: 'sites', label: 'Sites', icon: '🏗️' },
    { key: 'equipment', label: 'Equipment', icon: '🚜' },
    { key: 'materials', label: 'Materials', icon: '🧱' },
  ];

  const renderContent = () => {
    if (activeTab === 'home') {
      return (
        <View style={styles.homeContent}>
          <Text style={styles.sectionTitle}>Your Action Items</Text>
          {actionItems.map((item, index) => (
            <View key={index} style={styles.actionCard}>
              <View style={styles.cardContent}>
                <Text style={styles.cardIcon}>{item.icon}</Text>
                <View style={styles.cardText}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
                  {item.progress && (
                    <View style={styles.progressContainer}>
                      <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${item.progress}%` }]} />
                      </View>
                      <Text style={styles.progressText}>{item.progress}% complete</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
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
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {renderContent()}
      </ScrollView>

      <View style={styles.bottomNav}>
        {navItems.map((item) => {
          const isActive = activeTab === item.key;
          return (
            <TouchableOpacity
              key={item.key}
              style={styles.navItem}
              onPress={() => setActiveTab(item.key)}
            >
              <Text style={[styles.navIcon, { color: isActive ? '#3B82F6' : '#9CA3AF' }]}>
                {item.icon}
              </Text>
              <Text style={[styles.navLabel, { color: isActive ? '#3B82F6' : '#9CA3AF' }]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
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
  logoutButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
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
    marginBottom: 16,
  },
  actionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
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
  bottomNav: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    flexDirection: 'row',
    paddingTop: 8,
    paddingBottom: 34,
    paddingHorizontal: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  navLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
});