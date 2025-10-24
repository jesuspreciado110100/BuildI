import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SiteSafetyDashboard } from './SiteSafetyDashboard';
import { SafetyIncidentModal } from './SafetyIncidentModal';
import { SafetyLogService } from '../services/SafetyLogService';
import { SafetyIncident } from '../types';

interface SafetySystemIntegrationProps {
  siteId: string;
  userId: string;
}

export const SafetySystemIntegration: React.FC<SafetySystemIntegrationProps> = ({
  siteId,
  userId
}) => {
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleIncidentCreated = (incident: SafetyIncident) => {
    Alert.alert(
      'Safety Incident Reported',
      `Incident #${incident.id} has been logged successfully.`,
      [{ text: 'OK', onPress: () => setRefreshKey(prev => prev + 1) }]
    );
  };

  const simulateIoTEvent = async () => {
    try {
      const incident = await SafetyLogService.simulateIoTEvent('fall_detected', siteId);
      if (incident) {
        Alert.alert(
          'IoT Alert Triggered',
          `Fall detected! Incident #${incident.id} automatically logged.`,
          [{ text: 'OK', onPress: () => setRefreshKey(prev => prev + 1) }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to simulate IoT event');
    }
  };

  if (showDashboard) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setShowDashboard(false)}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Safety Dashboard</Text>
        </View>
        <SiteSafetyDashboard key={refreshKey} siteId={siteId} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Safety System</Text>
      <Text style={styles.subtitle}>IoT Safety Alert System & Incident Logging</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.reportButton]}
          onPress={() => setShowIncidentModal(true)}
        >
          <Text style={styles.buttonIcon}>⚠️</Text>
          <Text style={styles.buttonText}>Report Safety Incident</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.dashboardButton]}
          onPress={() => setShowDashboard(true)}
        >
          <Text style={styles.buttonIcon}>📊</Text>
          <Text style={styles.buttonText}>View Safety Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.iotButton]}
          onPress={simulateIoTEvent}
        >
          <Text style={styles.buttonIcon}>🤖</Text>
          <Text style={styles.buttonText}>Simulate IoT Fall Detection</Text>
        </TouchableOpacity>
      </View>

      <SafetyIncidentModal
        visible={showIncidentModal}
        onClose={() => setShowIncidentModal(false)}
        siteId={siteId}
        reporterId={userId}
        onIncidentCreated={handleIncidentCreated}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 10,
    marginRight: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  buttonContainer: {
    gap: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reportButton: {
    backgroundColor: '#FF3B30',
  },
  dashboardButton: {
    backgroundColor: '#007AFF',
  },
  iotButton: {
    backgroundColor: '#FF9500',
  },
  buttonIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});