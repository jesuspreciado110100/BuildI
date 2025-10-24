import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import TelemetryService from '../services/TelemetryService';

interface MaintenanceForecastCardProps {
  machineId: string;
  machineName: string;
}

interface MaintenanceData {
  riskScore: number;
  nextMaintenance: string;
  alerts: string[];
}

const MaintenanceForecastCard: React.FC<MaintenanceForecastCardProps> = ({ machineId, machineName }) => {
  const [maintenanceData, setMaintenanceData] = useState<MaintenanceData | null>(null);
  const [alertsResolved, setAlertsResolved] = useState<boolean[]>([]);

  useEffect(() => {
    loadMaintenanceData();
  }, [machineId]);

  const loadMaintenanceData = () => {
    const data = TelemetryService.predictMaintenanceRisk(machineId);
    setMaintenanceData(data);
    setAlertsResolved(new Array(data.alerts.length).fill(false));
  };

  const getRiskColor = (riskScore: number) => {
    if (riskScore >= 80) return '#ff4444';
    if (riskScore >= 60) return '#ffaa00';
    if (riskScore >= 40) return '#ffdd00';
    return '#44aa44';
  };

  const getRiskLevel = (riskScore: number) => {
    if (riskScore >= 80) return 'CRITICAL';
    if (riskScore >= 60) return 'HIGH';
    if (riskScore >= 40) return 'MEDIUM';
    return 'LOW';
  };

  const handleAlertAction = (index: number) => {
    Alert.alert(
      'Maintenance Alert',
      `Would you like to schedule maintenance for this issue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Schedule', 
          onPress: () => {
            const newResolved = [...alertsResolved];
            newResolved[index] = true;
            setAlertsResolved(newResolved);
            Alert.alert('Success', 'Maintenance scheduled successfully!');
          }
        }
      ]
    );
  };

  if (!maintenanceData) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading maintenance data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.machineName}>{machineName}</Text>
        <Text style={styles.machineId}>{machineId}</Text>
      </View>
      
      <View style={styles.riskSection}>
        <Text style={styles.sectionTitle}>Risk Assessment</Text>
        <View style={styles.riskIndicator}>
          <View style={[styles.riskBar, { backgroundColor: getRiskColor(maintenanceData.riskScore) }]}>
            <Text style={styles.riskScore}>{maintenanceData.riskScore}%</Text>
          </View>
          <Text style={[styles.riskLevel, { color: getRiskColor(maintenanceData.riskScore) }]}>
            {getRiskLevel(maintenanceData.riskScore)}
          </Text>
        </View>
      </View>
      
      <View style={styles.maintenanceSection}>
        <Text style={styles.sectionTitle}>Next Maintenance</Text>
        <Text style={styles.maintenanceDate}>{maintenanceData.nextMaintenance}</Text>
      </View>
      
      {maintenanceData.alerts.length > 0 && (
        <View style={styles.alertsSection}>
          <Text style={styles.sectionTitle}>Active Alerts</Text>
          {maintenanceData.alerts.map((alert, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.alertItem, alertsResolved[index] && styles.resolvedAlert]}
              onPress={() => !alertsResolved[index] && handleAlertAction(index)}
            >
              <Text style={[styles.alertText, alertsResolved[index] && styles.resolvedText]}>
                {alertsResolved[index] ? '✓' : '⚠️'} {alert}
              </Text>
              {alertsResolved[index] && (
                <Text style={styles.scheduledText}>Scheduled</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  header: {
    marginBottom: 16
  },
  machineName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  machineId: {
    fontSize: 12,
    color: '#666',
    marginTop: 2
  },
  riskSection: {
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8
  },
  riskIndicator: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  riskBar: {
    height: 24,
    borderRadius: 12,
    paddingHorizontal: 12,
    justifyContent: 'center',
    marginRight: 12,
    minWidth: 60
  },
  riskScore: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold'
  },
  riskLevel: {
    fontSize: 12,
    fontWeight: 'bold'
  },
  maintenanceSection: {
    marginBottom: 16
  },
  maintenanceDate: {
    fontSize: 16,
    color: '#007bff',
    fontWeight: '600'
  },
  alertsSection: {
    marginTop: 8
  },
  alertItem: {
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107'
  },
  resolvedAlert: {
    backgroundColor: '#d4edda',
    borderLeftColor: '#28a745'
  },
  alertText: {
    fontSize: 12,
    color: '#856404',
    fontWeight: '500'
  },
  resolvedText: {
    color: '#155724',
    textDecorationLine: 'line-through'
  },
  scheduledText: {
    fontSize: 10,
    color: '#28a745',
    fontWeight: 'bold',
    marginTop: 4
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    padding: 20
  }
});

export default MaintenanceForecastCard;