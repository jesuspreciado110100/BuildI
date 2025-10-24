import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafetyAnalyticsService, SafetyScoreResult } from '../services/SafetyAnalyticsService';
import { SafetyReportExporter } from './SafetyReportExporter';

interface SiteSafetyOverviewPanelProps {
  siteId: string;
  siteName: string;
  onExportReport?: () => void;
}

export const SiteSafetyOverviewPanel: React.FC<SiteSafetyOverviewPanelProps> = ({
  siteId,
  siteName,
  onExportReport
}) => {
  const [safetyData, setSafetyData] = useState<SafetyScoreResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [showExporter, setShowExporter] = useState(false);
  const safetyService = SafetyAnalyticsService.getInstance();

  useEffect(() => {
    loadSafetyData();
  }, [siteId]);

  const loadSafetyData = async () => {
    try {
      setLoading(true);
      const data = await safetyService.calculateSafetyScore(siteId);
      setSafetyData(data);
    } catch (error) {
      console.error('Error loading safety data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (colorLevel: string) => {
    switch (colorLevel) {
      case 'green': return '#22c55e';
      case 'yellow': return '#eab308';
      case 'red': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getScoreEmoji = (colorLevel: string) => {
    switch (colorLevel) {
      case 'green': return '✅';
      case 'yellow': return '⚠️';
      case 'red': return '🔴';
      default: return '⚪';
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading safety data...</Text>
      </View>
    );
  }

  if (!safetyData) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Failed to load safety data</Text>
      </View>
    );
  }

  const resolutionRate = safetyData.incidentCount > 0 
    ? Math.round((safetyData.resolvedIncidents / safetyData.incidentCount) * 100)
    : 100;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.siteTitle}>{siteName}</Text>
        <TouchableOpacity 
          style={styles.exportButton} 
          onPress={() => setShowExporter(!showExporter)}
        >
          <Text style={styles.exportButtonText}>📊 Export</Text>
        </TouchableOpacity>
      </View>

      {/* Safety Score Gauge */}
      <View style={styles.scoreSection}>
        <View style={styles.scoreGauge}>
          <View style={[styles.scoreBar, { backgroundColor: '#e5e7eb' }]}>
            <View style={[
              styles.scoreProgress, 
              { 
                width: `${safetyData.score}%`,
                backgroundColor: getScoreColor(safetyData.colorLevel)
              }
            ]} />
          </View>
          <Text style={[styles.scoreText, { color: getScoreColor(safetyData.colorLevel) }]}>
            Score: {safetyData.score} {getScoreEmoji(safetyData.colorLevel)}
          </Text>
        </View>
        <Text style={styles.riskReason}>{safetyData.riskReason}</Text>
      </View>

      {/* Metrics Grid */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{safetyData.incidentCount}</Text>
          <Text style={styles.metricLabel}>Incidents (30d)</Text>
          <Text style={styles.metricSubtext}>{resolutionRate}% resolved</Text>
        </View>
        
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{safetyData.ppeCompliance}%</Text>
          <Text style={styles.metricLabel}>PPE Compliance</Text>
          <Text style={styles.metricSubtext}>Average</Text>
        </View>
        
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{safetyData.entryViolations}</Text>
          <Text style={styles.metricLabel}>Entry Violations</Text>
          <Text style={styles.metricSubtext}>Last 30 days</Text>
        </View>
      </View>

      {/* Export Component */}
      {showExporter && (
        <SafetyReportExporter
          siteId={siteId}
          siteName={siteName}
          onExportComplete={(success) => {
            if (success) {
              setShowExporter(false);
            }
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  siteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  exportButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  exportButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  scoreSection: {
    marginBottom: 20,
  },
  scoreGauge: {
    alignItems: 'center',
    marginBottom: 8,
  },
  scoreBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  scoreProgress: {
    height: '100%',
  },
  scoreText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  riskReason: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricCard: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  metricLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
  },
  metricSubtext: {
    fontSize: 10,
    color: '#9ca3af',
    marginTop: 2,
  },
  loadingText: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 16,
  },
  errorText: {
    textAlign: 'center',
    color: '#ef4444',
    fontSize: 16,
  },
});