import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { RentalReportService, RentalSummary } from '../services/RentalReportService';

interface RentalSummaryTabProps {
  userId: string;
  role: string;
}

const { width } = Dimensions.get('window');

export function RentalSummaryTab({ userId, role }: RentalSummaryTabProps) {
  const [summary, setSummary] = useState<RentalSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<'overview' | 'machines' | 'partners'>('overview');

  useEffect(() => {
    loadSummary();
  }, [userId]);

  const loadSummary = async () => {
    try {
      setLoading(true);
      const data = await RentalReportService.getRentalSummary(userId);
      setSummary(data);
    } catch (error) {
      console.error('Error loading rental summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderOverview = () => {
    if (!summary) return null;

    return (
      <View style={styles.overviewContainer}>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{RentalReportService.formatHours(summary.totalHoursRented)}</Text>
            <Text style={styles.statLabel}>Total Hours</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{RentalReportService.formatCurrency(summary.totalSpent)}</Text>
            <Text style={styles.statLabel}>Total Spent</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{summary.totalRentals}</Text>
            <Text style={styles.statLabel}>Rentals</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{summary.averageRating.toFixed(1)}⭐</Text>
            <Text style={styles.statLabel}>Avg Rating</Text>
          </View>
        </View>

        <View style={styles.recentActivity}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {summary.recentActivity.slice(0, 3).map((activity) => (
            <View key={activity.id} style={styles.activityItem}>
              <Text style={styles.activityIcon}>{RentalReportService.getActivityIcon(activity.type)}</Text>
              <View style={styles.activityContent}>
                <Text style={styles.activityDescription}>{activity.description}</Text>
                <Text style={styles.activityDate}>{new Date(activity.date).toLocaleDateString()}</Text>
              </View>
              {activity.amount && (
                <Text style={styles.activityAmount}>{RentalReportService.formatCurrency(activity.amount)}</Text>
              )}
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderMachineTypes = () => {
    if (!summary) return null;

    return (
      <View style={styles.machineTypesContainer}>
        <Text style={styles.sectionTitle}>Machine Usage</Text>
        {summary.mostUsedMachineTypes.map((machine, index) => (
          <View key={index} style={styles.machineCard}>
            <View style={styles.machineHeader}>
              <Text style={styles.machineName}>{machine.category}</Text>
              <Text style={styles.machineSpent}>{RentalReportService.formatCurrency(machine.totalSpent)}</Text>
            </View>
            <View style={styles.machineStats}>
              <Text style={styles.machineStat}>{RentalReportService.formatHours(machine.hoursUsed)} used</Text>
              <Text style={styles.machineStat}>{machine.timesRented} rentals</Text>
              <Text style={styles.machineStat}>${Math.round(machine.totalSpent / machine.hoursUsed)}/hr avg</Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderRenterPartners = () => {
    if (!summary) return null;

    return (
      <View style={styles.partnersContainer}>
        <Text style={styles.sectionTitle}>Top Renter Partners</Text>
        {summary.topRenterPartners.map((partner, index) => (
          <View key={partner.id} style={styles.partnerCard}>
            <View style={styles.partnerHeader}>
              <Text style={styles.partnerName}>{partner.name}</Text>
              <Text style={styles.partnerRating}>{partner.averageRating.toFixed(1)}⭐</Text>
            </View>
            <View style={styles.partnerStats}>
              <Text style={styles.partnerStat}>{partner.totalRentals} rentals</Text>
              <Text style={styles.partnerStat}>{RentalReportService.formatCurrency(partner.totalSpent)} spent</Text>
            </View>
            <Text style={styles.partnerLastRental}>
              Last rental: {new Date(partner.lastRental).toLocaleDateString()}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading rental summary...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedView === 'overview' && styles.activeTab]}
          onPress={() => setSelectedView('overview')}
        >
          <Text style={[styles.tabText, selectedView === 'overview' && styles.activeTabText]}>Overview</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedView === 'machines' && styles.activeTab]}
          onPress={() => setSelectedView('machines')}
        >
          <Text style={[styles.tabText, selectedView === 'machines' && styles.activeTabText]}>Machines</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedView === 'partners' && styles.activeTab]}
          onPress={() => setSelectedView('partners')}
        >
          <Text style={[styles.tabText, selectedView === 'partners' && styles.activeTabText]}>Partners</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {selectedView === 'overview' && renderOverview()}
        {selectedView === 'machines' && renderMachineTypes()}
        {selectedView === 'partners' && renderRenterPartners()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  tabContainer: { flexDirection: 'row', backgroundColor: 'white', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  tab: { flex: 1, paddingVertical: 16, alignItems: 'center' },
  activeTab: { borderBottomWidth: 2, borderBottomColor: '#dc2626' },
  tabText: { fontSize: 14, color: '#666' },
  activeTabText: { color: '#dc2626', fontWeight: 'bold' },
  content: { flex: 1, padding: 16 },
  overviewContainer: { gap: 20 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: { backgroundColor: 'white', padding: 16, borderRadius: 12, width: (width - 44) / 2, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#374151', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#6b7280' },
  recentActivity: { backgroundColor: 'white', padding: 16, borderRadius: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 16 },
  activityItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  activityIcon: { fontSize: 20, marginRight: 12 },
  activityContent: { flex: 1 },
  activityDescription: { fontSize: 14, color: '#374151', marginBottom: 2 },
  activityDate: { fontSize: 12, color: '#6b7280' },
  activityAmount: { fontSize: 14, fontWeight: '600', color: '#059669' },
  machineTypesContainer: { backgroundColor: 'white', padding: 16, borderRadius: 12 },
  machineCard: { marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  machineHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  machineName: { fontSize: 16, fontWeight: '600', color: '#374151' },
  machineSpent: { fontSize: 16, fontWeight: 'bold', color: '#059669' },
  machineStats: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  machineStat: { fontSize: 12, color: '#6b7280' },
  partnersContainer: { backgroundColor: 'white', padding: 16, borderRadius: 12 },
  partnerCard: { marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  partnerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  partnerName: { fontSize: 16, fontWeight: '600', color: '#374151' },
  partnerRating: { fontSize: 14, color: '#f59e0b' },
  partnerStats: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  partnerStat: { fontSize: 12, color: '#6b7280' },
  partnerLastRental: { fontSize: 12, color: '#6b7280' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16, color: '#6b7280' }
});