import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafetyIncident, safetyService } from '../services/SafetyService';
import { SafetyScanResult } from '../services/SafetyScanService';
import SafetyScanCard from './SafetyScanCard';

interface SafetyLogPanelProps {
  siteId: string;
}

interface SafetyViolationEntry {
  id: string;
  type: 'zone_breach' | 'photo_violation';
  timestamp: Date;
  description: string;
  severity: 'low' | 'medium' | 'high';
  status: 'unresolved' | 'resolved';
  workerName?: string;
  zoneName?: string;
  photoUrl?: string;
}

const mockPhotoViolations: SafetyViolationEntry[] = [
  {
    id: 'pv1',
    type: 'photo_violation',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    description: 'Missing hard hat detected in progress photo',
    severity: 'high',
    status: 'unresolved',
    workerName: 'John Smith',
    photoUrl: 'https://example.com/photo1.jpg'
  },
  {
    id: 'pv2',
    type: 'photo_violation',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    description: 'Unsafe posture detected',
    severity: 'medium',
    status: 'resolved',
    workerName: 'Mike Johnson',
    photoUrl: 'https://example.com/photo2.jpg'
  }
];

export default function SafetyLogPanel({ siteId }: SafetyLogPanelProps) {
  const [incidents, setIncidents] = useState<SafetyIncident[]>([]);
  const [photoViolations, setPhotoViolations] = useState<SafetyViolationEntry[]>(mockPhotoViolations);
  const [filterType, setFilterType] = useState<'all' | 'zone_breach' | 'photo_violation'>('all');
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'unresolved' | 'resolved'>('all');

  useEffect(() => {
    const interval = setInterval(() => {
      const allIncidents = safetyService.getIncidents();
      setIncidents(allIncidents);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleResolveIncident = (incidentId: string) => {
    Alert.alert(
      'Resolve Incident',
      'Mark this safety incident as resolved?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Resolve',
          onPress: () => {
            safetyService.resolveIncident(incidentId);
            setIncidents(prev => prev.map(incident => 
              incident.id === incidentId ? { ...incident, resolved: true } : incident
            ));
          }
        }
      ]
    );
  };

  const handleResolvePhotoViolation = (violationId: string) => {
    Alert.alert(
      'Resolve Violation',
      'Mark this photo violation as resolved?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Resolve',
          onPress: () => {
            setPhotoViolations(prev => prev.map(violation => 
              violation.id === violationId ? { ...violation, status: 'resolved' } : violation
            ));
          }
        }
      ]
    );
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return '#dc2626';
      case 'medium': return '#d97706';
      case 'low': return '#059669';
      default: return '#6b7280';
    }
  };

  // Convert zone incidents to unified format
  const zoneViolations: SafetyViolationEntry[] = incidents.map(incident => ({
    id: incident.id,
    type: 'zone_breach',
    timestamp: new Date(incident.timestamp),
    description: `${incident.zoneType.toUpperCase()} zone breach`,
    severity: incident.zoneType === 'restricted' ? 'high' : 'medium',
    status: incident.resolved ? 'resolved' : 'unresolved',
    workerName: incident.workerName,
    zoneName: incident.zoneName
  }));

  // Combine all violations
  const allViolations = [...zoneViolations, ...photoViolations];

  // Apply filters
  const filteredViolations = allViolations.filter(violation => {
    if (filterType !== 'all' && violation.type !== filterType) return false;
    if (filterSeverity !== 'all' && violation.severity !== filterSeverity) return false;
    if (filterStatus !== 'all' && violation.status !== filterStatus) return false;
    return true;
  });

  const unresolvedViolations = filteredViolations.filter(v => v.status === 'unresolved');
  const resolvedViolations = filteredViolations.filter(v => v.status === 'resolved');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Safety Violations</Text>
      
      {/* Filters */}
      <View style={styles.filtersContainer}>
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Type:</Text>
          <View style={styles.filterButtons}>
            {['all', 'zone_breach', 'photo_violation'].map(type => (
              <TouchableOpacity
                key={type}
                style={[styles.filterButton, filterType === type && styles.activeFilter]}
                onPress={() => setFilterType(type as any)}
              >
                <Text style={[styles.filterButtonText, filterType === type && styles.activeFilterText]}>
                  {type.replace('_', ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Severity:</Text>
          <View style={styles.filterButtons}>
            {['all', 'high', 'medium', 'low'].map(severity => (
              <TouchableOpacity
                key={severity}
                style={[styles.filterButton, filterSeverity === severity && styles.activeFilter]}
                onPress={() => setFilterSeverity(severity as any)}
              >
                <Text style={[styles.filterButtonText, filterSeverity === severity && styles.activeFilterText]}>
                  {severity}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
      
      <ScrollView style={styles.scrollView}>
        {unresolvedViolations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔴 Active Violations ({unresolvedViolations.length})</Text>
            {unresolvedViolations.map((violation) => (
              <View key={violation.id} style={[styles.violationCard, styles.activeViolation]}>
                <View style={styles.violationHeader}>
                  <Text style={styles.violationIcon}>
                    {violation.type === 'zone_breach' ? '🚫' : '📷'}
                  </Text>
                  <View style={styles.violationInfo}>
                    <Text style={styles.workerName}>{violation.workerName || 'Unknown Worker'}</Text>
                    <Text style={styles.violationDescription}>{violation.description}</Text>
                    {violation.zoneName && (
                      <Text style={styles.zoneName}>{violation.zoneName}</Text>
                    )}
                  </View>
                  <View style={styles.violationActions}>
                    <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(violation.severity) }]}>
                      <Text style={styles.severityText}>{violation.severity}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.resolveButton}
                      onPress={() => {
                        if (violation.type === 'zone_breach') {
                          handleResolveIncident(violation.id);
                        } else {
                          handleResolvePhotoViolation(violation.id);
                        }
                      }}
                    >
                      <Text style={styles.resolveButtonText}>Resolve</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={styles.timestamp}>
                  {violation.timestamp.toLocaleString()}
                </Text>
              </View>
            ))}
          </View>
        )}

        {resolvedViolations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✅ Resolved Violations ({resolvedViolations.length})</Text>
            {resolvedViolations.map((violation) => (
              <View key={violation.id} style={[styles.violationCard, styles.resolvedViolation]}>
                <View style={styles.violationHeader}>
                  <Text style={styles.violationIcon}>✅</Text>
                  <View style={styles.violationInfo}>
                    <Text style={styles.workerName}>{violation.workerName || 'Unknown Worker'}</Text>
                    <Text style={styles.violationDescription}>{violation.description}</Text>
                    {violation.zoneName && (
                      <Text style={styles.zoneName}>{violation.zoneName}</Text>
                    )}
                  </View>
                </View>
                <Text style={styles.timestamp}>
                  {violation.timestamp.toLocaleString()}
                </Text>
              </View>
            ))}
          </View>
        )}

        {filteredViolations.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🛡️</Text>
            <Text style={styles.emptyTitle}>No Safety Violations</Text>
            <Text style={styles.emptyText}>All workers are following safety protocols</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  title: { fontSize: 18, fontWeight: 'bold', padding: 16, color: '#1e293b' },
  filtersContainer: { backgroundColor: 'white', padding: 16, marginBottom: 8 },
  filterRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  filterLabel: { fontSize: 14, fontWeight: '600', color: '#374151', width: 80 },
  filterButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filterButton: { backgroundColor: '#f3f4f6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  activeFilter: { backgroundColor: '#3b82f6' },
  filterButtonText: { fontSize: 12, color: '#374151' },
  activeFilterText: { color: 'white' },
  scrollView: { flex: 1 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12, paddingHorizontal: 16, color: '#1e293b' },
  violationCard: { backgroundColor: 'white', marginHorizontal: 16, marginBottom: 8, borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  activeViolation: { borderLeftWidth: 4, borderLeftColor: '#ef4444' },
  resolvedViolation: { borderLeftWidth: 4, borderLeftColor: '#10b981', opacity: 0.7 },
  violationHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  violationIcon: { fontSize: 24, marginRight: 12 },
  violationInfo: { flex: 1 },
  workerName: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
  violationDescription: { fontSize: 14, color: '#374151', marginBottom: 2 },
  zoneName: { fontSize: 12, color: '#6b7280' },
  violationActions: { alignItems: 'flex-end' },
  severityBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, marginBottom: 8 },
  severityText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  resolveButton: { backgroundColor: '#059669', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  resolveButtonText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  timestamp: { fontSize: 12, color: '#6b7280', marginBottom: 4 },
  emptyState: { alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8, color: '#1e293b' },
  emptyText: { fontSize: 14, color: '#6b7280', textAlign: 'center' }
});