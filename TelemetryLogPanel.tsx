import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { TelemetryLog } from '../types';
import TelemetryService from '../services/TelemetryService';

interface TelemetryLogPanelProps {
  selectedMachine?: string;
}

const TelemetryLogPanel: React.FC<TelemetryLogPanelProps> = ({ selectedMachine }) => {
  const [telemetryLogs, setTelemetryLogs] = useState<TelemetryLog[]>([]);
  const [filter, setFilter] = useState<'all' | 'anomalies'>('all');

  useEffect(() => {
    loadTelemetryData();
  }, [selectedMachine, filter]);

  const loadTelemetryData = () => {
    let logs: TelemetryLog[];
    
    if (selectedMachine) {
      logs = TelemetryService.getTelemetryForMachine(selectedMachine);
    } else {
      logs = TelemetryService.getAllTelemetry();
    }
    
    if (filter === 'anomalies') {
      logs = logs.filter(log => log.anomaly_detected);
    }
    
    setTelemetryLogs(logs.slice(0, 20)); // Show latest 20 entries
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusColor = (log: TelemetryLog) => {
    if (log.anomaly_detected) return '#ff4444';
    if (log.temp > 80 || log.vibration > 6) return '#ffaa00';
    return '#44aa44';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Telemetry Logs</Text>
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'all' && styles.activeFilter]}
            onPress={() => setFilter('all')}
          >
            <Text style={styles.filterText}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'anomalies' && styles.activeFilter]}
            onPress={() => setFilter('anomalies')}
          >
            <Text style={styles.filterText}>Anomalies</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView style={styles.logsList}>
        {telemetryLogs.map((log) => (
          <View key={log.id} style={[styles.logCard, { borderLeftColor: getStatusColor(log) }]}>
            <View style={styles.logHeader}>
              <Text style={styles.machineId}>{log.machine_id}</Text>
              <Text style={styles.timestamp}>{formatTimestamp(log.timestamp)}</Text>
            </View>
            
            <View style={styles.metricsRow}>
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>Temp</Text>
                <Text style={[styles.metricValue, log.temp > 85 && styles.anomalyValue]}>
                  {log.temp.toFixed(1)}°C
                </Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>Vibration</Text>
                <Text style={[styles.metricValue, log.vibration > 7.5 && styles.anomalyValue]}>
                  {log.vibration.toFixed(1)} mm/s
                </Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>Hours</Text>
                <Text style={[styles.metricValue, log.hours_run > 500 && styles.anomalyValue]}>
                  {log.hours_run.toFixed(0)}h
                </Text>
              </View>
            </View>
            
            {log.anomaly_detected && (
              <View style={styles.anomalyBanner}>
                <Text style={styles.anomalyText}>⚠️ ANOMALY DETECTED</Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333'
  },
  filterContainer: {
    flexDirection: 'row'
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 16
  },
  activeFilter: {
    backgroundColor: '#007bff'
  },
  filterText: {
    fontSize: 12,
    color: '#333'
  },
  logsList: {
    flex: 1
  },
  logCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  machineId: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333'
  },
  timestamp: {
    fontSize: 12,
    color: '#666'
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  metric: {
    alignItems: 'center'
  },
  metricLabel: {
    fontSize: 10,
    color: '#666',
    marginBottom: 2
  },
  metricValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333'
  },
  anomalyValue: {
    color: '#ff4444'
  },
  anomalyBanner: {
    backgroundColor: '#ffebee',
    padding: 6,
    borderRadius: 4,
    marginTop: 8
  },
  anomalyText: {
    fontSize: 10,
    color: '#d32f2f',
    textAlign: 'center',
    fontWeight: 'bold'
  }
});

export default TelemetryLogPanel;