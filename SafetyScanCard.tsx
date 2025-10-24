import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafetyScanResult, SafetyViolation } from '../services/SafetyScanService';

interface SafetyScanCardProps {
  scanResult: SafetyScanResult;
  onResolveViolation?: (violationId: string) => void;
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'high': return '#dc2626';
    case 'medium': return '#d97706';
    case 'low': return '#059669';
    default: return '#6b7280';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'safe': return '#059669';
    case 'warning': return '#d97706';
    case 'violation': return '#dc2626';
    default: return '#6b7280';
  }
};

const getViolationIcon = (type: string) => {
  switch (type) {
    case 'missing_helmet': return '⛑️';
    case 'missing_vest': return '🦺';
    case 'missing_gloves': return '🧤';
    case 'unsafe_posture': return '🚶';
    case 'unsafe_behavior': return '⚠️';
    default: return '❗';
  }
};

export default function SafetyScanCard({ scanResult, onResolveViolation }: SafetyScanCardProps) {
  const { violations, overallScore, status, scannedAt } = scanResult;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.scoreContainer}>
          <Text style={[styles.score, { color: getStatusColor(status) }]}>
            {overallScore}%
          </Text>
          <Text style={styles.scoreLabel}>Safety Score</Text>
        </View>
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) }]}>
            <Text style={styles.statusText}>{status.toUpperCase()}</Text>
          </View>
          <Text style={styles.timestamp}>
            {scannedAt.toLocaleTimeString()}
          </Text>
        </View>
      </View>

      {violations.length > 0 && (
        <View style={styles.violationsContainer}>
          <Text style={styles.violationsTitle}>Violations Detected:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {violations.map((violation) => (
              <View key={violation.id} style={styles.violationCard}>
                <View style={styles.violationHeader}>
                  <Text style={styles.violationIcon}>
                    {getViolationIcon(violation.type)}
                  </Text>
                  <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(violation.severity) }]}>
                    <Text style={styles.severityText}>{violation.severity}</Text>
                  </View>
                </View>
                <Text style={styles.violationDescription}>
                  {violation.description}
                </Text>
                <Text style={styles.confidence}>
                  {Math.round(violation.confidence * 100)}% confidence
                </Text>
                {onResolveViolation && (
                  <TouchableOpacity 
                    style={styles.resolveButton}
                    onPress={() => onResolveViolation(violation.id)}
                  >
                    <Text style={styles.resolveButtonText}>Resolve</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {violations.length === 0 && (
        <View style={styles.safeContainer}>
          <Text style={styles.safeIcon}>✅</Text>
          <Text style={styles.safeText}>No safety violations detected</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginVertical: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  scoreContainer: { alignItems: 'center' },
  score: { fontSize: 24, fontWeight: 'bold' },
  scoreLabel: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  statusContainer: { alignItems: 'flex-end' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  timestamp: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  violationsContainer: { marginTop: 8 },
  violationsTitle: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  violationCard: { backgroundColor: '#fef2f2', borderRadius: 8, padding: 12, marginRight: 12, width: 160, borderWidth: 1, borderColor: '#fecaca' },
  violationHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  violationIcon: { fontSize: 20 },
  severityBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  severityText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  violationDescription: { fontSize: 12, color: '#374151', marginBottom: 4 },
  confidence: { fontSize: 10, color: '#6b7280', marginBottom: 8 },
  resolveButton: { backgroundColor: '#059669', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  resolveButtonText: { color: 'white', fontSize: 10, fontWeight: 'bold', textAlign: 'center' },
  safeContainer: { alignItems: 'center', paddingVertical: 16 },
  safeIcon: { fontSize: 24, marginBottom: 8 },
  safeText: { fontSize: 14, color: '#059669', fontWeight: '500' }
});