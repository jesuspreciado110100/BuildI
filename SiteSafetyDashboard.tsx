import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafetyLogService } from '../services/SafetyLogService';
import { SafetyIncident } from '../types';

interface SiteSafetyDashboardProps {
  siteId: string;
}

export const SiteSafetyDashboard: React.FC<SiteSafetyDashboardProps> = ({ siteId }) => {
  const [incidents, setIncidents] = useState<SafetyIncident[]>([]);
  const [safetyScore, setSafetyScore] = useState(100);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIncidents();
  }, [siteId]);

  const loadIncidents = async () => {
    try {
      const siteIncidents = await SafetyLogService.getSiteIncidents(siteId);
      setIncidents(siteIncidents);
      setSafetyScore(SafetyLogService.getSafetyScore(siteId));
    } catch (error) {
      console.error('Failed to load incidents:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIncidentStats = () => {
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);
    
    const recentIncidents = incidents.filter(
      incident => new Date(incident.timestamp) >= last30Days
    );

    return {
      total: recentIncidents.length,
      critical: recentIncidents.filter(i => i.severity === 'critical').length,
      high: recentIncidents.filter(i => i.severity === 'high').length,
      resolved: recentIncidents.filter(i => i.resolution_status === 'resolved').length,
      open: recentIncidents.filter(i => i.resolution_status === 'open').length,
    };
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#FF3B30';
      case 'high': return '#FF9500';
      case 'medium': return '#FFCC00';
      case 'low': return '#34C759';
      default: return '#8E8E93';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return '#34C759';
      case 'investigating': return '#FF9500';
      case 'open': return '#FF3B30';
      default: return '#8E8E93';
    }
  };

  const stats = getIncidentStats();

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading safety data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Site Safety Dashboard</Text>
      
      {/* Safety Score */}
      <View style={styles.scoreCard}>
        <Text style={styles.scoreLabel}>Safety Score</Text>
        <Text style={[styles.scoreValue, { color: safetyScore >= 80 ? '#34C759' : safetyScore >= 60 ? '#FF9500' : '#FF3B30' }]}>
          {Math.round(safetyScore)}%
        </Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Last 30 Days</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: '#FF3B30' }]}>{stats.critical}</Text>
          <Text style={styles.statLabel}>Critical</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: '#34C759' }]}>{stats.resolved}</Text>
          <Text style={styles.statLabel}>Resolved</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: '#FF9500' }]}>{stats.open}</Text>
          <Text style={styles.statLabel}>Open</Text>
        </View>
      </View>

      {/* Incidents Table */}
      <View style={styles.tableContainer}>
        <Text style={styles.tableTitle}>Recent Incidents</Text>
        {incidents.length === 0 ? (
          <Text style={styles.emptyText}>No incidents reported</Text>
        ) : (
          incidents.slice(0, 10).map(incident => (
            <View key={incident.id} style={styles.incidentRow}>
              <View style={styles.incidentInfo}>
                <Text style={styles.incidentId}>#{incident.id}</Text>
                <Text style={styles.incidentCategory}>
                  {incident.category.charAt(0).toUpperCase() + incident.category.slice(1)}
                </Text>
                <Text style={styles.incidentDate}>
                  {new Date(incident.timestamp).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.badges}>
                <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(incident.severity) }]}>
                  <Text style={styles.badgeText}>{incident.severity}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(incident.resolution_status) }]}>
                  <Text style={styles.badgeText}>{incident.resolution_status}</Text>
                </View>
              </View>
            </View>
          ))
        )}
      </View>

      {/* IoT Simulation */}
      <View style={styles.simulationContainer}>
        <Text style={styles.simulationTitle}>IoT Simulation</Text>
        <TouchableOpacity 
          style={styles.simulateButton}
          onPress={async () => {
            await SafetyLogService.simulateIoTEvent('fall_detected', siteId);
            loadIncidents();
          }}
        >
          <Text style={styles.simulateButtonText}>Simulate Fall Detection</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  scoreCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  tableContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  tableTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
  incidentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  incidentInfo: {
    flex: 1,
  },
  incidentId: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  incidentCategory: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  incidentDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  simulationContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  simulationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  simulateButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  simulateButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});