import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { EquipmentAnalyticsPanel } from './EquipmentAnalyticsPanel';
import { EquipmentAnalyticsService } from '../services/EquipmentAnalyticsService';
import { EquipmentAnalytics } from '../types';
import { MachineryEmptyState } from './MachineryEmptyState';

interface ContractorRentalsTabProps {
  userId?: string;
  userRole?: string;
}

export const ContractorRentalsTab: React.FC<ContractorRentalsTabProps> = ({ userId, userRole }) => {
  const [activeSubTab, setActiveSubTab] = useState('overview');
  const [equipmentAnalytics, setEquipmentAnalytics] = useState<EquipmentAnalytics[]>([]);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRentalData();
  }, []);

  const loadRentalData = async () => {
    try {
      const service = EquipmentAnalyticsService.getInstance();
      const analytics = await service.getAllEquipmentAnalytics();
      const alerts = await service.getEquipmentNotifications();
      
      setEquipmentAnalytics(analytics);
      setNotifications(alerts);
    } catch (error) {
      console.error('Error loading rental data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestMachine = () => {
    console.log('Request machine pressed');
    // Navigate to machinery request form
  };

  const subTabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'analytics', label: 'Equipment Analytics', icon: '📈' },
    { id: 'alerts', label: 'Alerts', icon: '⚠️' }
  ];

  const renderOverview = () => {
    if (equipmentAnalytics.length === 0) {
      return <MachineryEmptyState onRequestMachine={handleRequestMachine} />;
    }

    const totalRentals = equipmentAnalytics.length;
    const highUtilization = equipmentAnalytics.filter(e => e.utilization_level === 'high').length;
    const lowUtilization = equipmentAnalytics.filter(e => e.utilization_level === 'low').length;
    const maintenanceNeeded = equipmentAnalytics.filter(e => e.maintenance_suggestion).length;

    return (
      <View style={styles.overviewContainer}>
        <Text style={styles.sectionTitle}>Rental Equipment Overview</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalRentals}</Text>
            <Text style={styles.statLabel}>Total Rentals</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#4CAF50' }]}>{highUtilization}</Text>
            <Text style={styles.statLabel}>High Utilization</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#f44336' }]}>{lowUtilization}</Text>
            <Text style={styles.statLabel}>Low Utilization</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#FF9800' }]}>{maintenanceNeeded}</Text>
            <Text style={styles.statLabel}>Maintenance Due</Text>
          </View>
        </View>

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setActiveSubTab('analytics')}
          >
            <Text style={styles.actionButtonText}>📈 View Equipment Analytics</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setActiveSubTab('alerts')}
          >
            <Text style={styles.actionButtonText}>⚠️ Check Alerts ({notifications.length})</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderAlerts = () => {
    return (
      <View style={styles.alertsContainer}>
        <Text style={styles.sectionTitle}>Equipment Alerts</Text>
        {notifications.length === 0 ? (
          <View style={styles.noAlertsContainer}>
            <Text style={styles.noAlertsText}>No alerts at this time</Text>
            <Text style={styles.noAlertsSubtext}>Your equipment is performing well!</Text>
          </View>
        ) : (
          <ScrollView style={styles.alertsList}>
            {notifications.map((notification, index) => (
              <View key={index} style={styles.alertCard}>
                <Text style={styles.alertText}>{notification}</Text>
                <TouchableOpacity 
                  style={styles.alertAction}
                  onPress={() => Alert.alert('Alert', notification)}
                >
                  <Text style={styles.alertActionText}>View Details</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading rental data...</Text>
        </View>
      );
    }

    switch (activeSubTab) {
      case 'overview':
        return renderOverview();
      case 'analytics':
        return <EquipmentAnalyticsPanel showAll={true} />;
      case 'alerts':
        return renderAlerts();
      default:
        return renderOverview();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Rental Equipment</Text>
        <Text style={styles.subtitle}>Monitor your rented equipment performance</Text>
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subTabsContainer}>
        <View style={styles.subTabs}>
          {subTabs.map(tab => (
            <TouchableOpacity 
              key={tab.id}
              style={[styles.subTab, activeSubTab === tab.id && styles.activeSubTab]}
              onPress={() => setActiveSubTab(tab.id)}
            >
              <Text style={styles.subTabIcon}>{tab.icon}</Text>
              <Text style={[styles.subTabText, activeSubTab === tab.id && styles.activeSubTabText]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      
      <ScrollView style={styles.content}>
        {renderContent()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 4 },
  subTabsContainer: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  subTabs: { flexDirection: 'row', paddingHorizontal: 16 },
  subTab: { padding: 12, alignItems: 'center', marginRight: 16 },
  activeSubTab: { borderBottomWidth: 2, borderBottomColor: '#2563eb' },
  subTabIcon: { fontSize: 16, marginBottom: 4 },
  subTabText: { fontSize: 12, color: '#666' },
  activeSubTabText: { color: '#2563eb', fontWeight: 'bold' },
  content: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { fontSize: 16, color: '#666' },
  overviewContainer: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 16 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24 },
  statCard: { backgroundColor: '#fff', padding: 16, borderRadius: 8, width: '48%', marginBottom: 12, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  statLabel: { fontSize: 12, color: '#666', marginTop: 4 },
  quickActions: { marginBottom: 24 },
  actionButton: { backgroundColor: '#2563eb', padding: 12, borderRadius: 8, marginBottom: 8 },
  actionButtonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  alertsContainer: { padding: 16 },
  noAlertsContainer: { alignItems: 'center', padding: 32 },
  noAlertsText: { fontSize: 16, color: '#666', marginBottom: 8 },
  noAlertsSubtext: { fontSize: 14, color: '#999' },
  alertsList: { flex: 1 },
  alertCard: { backgroundColor: '#fff', padding: 16, borderRadius: 8, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: '#FF9800', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  alertText: { fontSize: 14, color: '#333', marginBottom: 8 },
  alertAction: { alignSelf: 'flex-end' },
  alertActionText: { color: '#2563eb', fontWeight: 'bold' }
});