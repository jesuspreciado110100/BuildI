import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafetyService } from '../services/SafetyService';

interface SafetyLogTabProps {
  adminId: string;
}

interface FlaggedJob {
  job_id: string;
  site_name: string;
  concept_name: string;
  crew_name: string;
  flagged_items: number;
  last_updated: string;
}

interface SafetyPattern {
  pattern_type: 'crew' | 'site' | 'trade';
  name: string;
  incidents: number;
  completion_rate: number;
  trend: 'improving' | 'declining' | 'stable';
}

export const SafetyLogTab: React.FC<SafetyLogTabProps> = ({ adminId }) => {
  const [flaggedJobs, setFlaggedJobs] = useState<FlaggedJob[]>([]);
  const [safetyPatterns, setSafetyPatterns] = useState<SafetyPattern[]>([]);
  const [selectedView, setSelectedView] = useState<'flagged' | 'patterns'>('flagged');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSafetyData();
  }, [adminId]);

  const loadSafetyData = async () => {
    try {
      const [flagged, patterns] = await Promise.all([
        SafetyService.getFlaggedJobs(),
        loadSafetyPatterns()
      ]);
      
      setFlaggedJobs(flagged);
      setSafetyPatterns(patterns);
    } catch (error) {
      console.error('Failed to load safety data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSafetyPatterns = async (): Promise<SafetyPattern[]> => {
    return [
      {
        pattern_type: 'crew',
        name: 'Elite Electric Crew',
        incidents: 3,
        completion_rate: 85,
        trend: 'declining'
      },
      {
        pattern_type: 'site',
        name: 'Downtown Office Complex',
        incidents: 1,
        completion_rate: 95,
        trend: 'improving'
      },
      {
        pattern_type: 'trade',
        name: 'Electrical',
        incidents: 5,
        completion_rate: 78,
        trend: 'stable'
      },
    ];
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return '#4CAF50';
      case 'declining': return '#f44336';
      case 'stable': return '#FF9800';
      default: return '#666';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return '↗️';
      case 'declining': return '↘️';
      case 'stable': return '→';
      default: return '';
    }
  };

  const renderFlaggedJobs = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Flagged Jobs</Text>
      <ScrollView style={styles.jobsList}>
        {flaggedJobs.map((job) => (
          <View key={job.job_id} style={styles.jobCard}>
            <View style={styles.jobHeader}>
              <Text style={styles.jobSite}>{job.site_name}</Text>
              <View style={styles.flaggedBadge}>
                <Text style={styles.flaggedText}>⚠️ {job.flagged_items} flagged</Text>
              </View>
            </View>
            <Text style={styles.jobConcept}>{job.concept_name}</Text>
            <Text style={styles.jobCrew}>Crew: {job.crew_name}</Text>
            <View style={styles.jobFooter}>
              <Text style={styles.lastUpdated}>
                Last updated: {new Date(job.last_updated).toLocaleDateString()}
              </Text>
              <TouchableOpacity style={styles.reviewButton}>
                <Text style={styles.reviewButtonText}>Review</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderSafetyPatterns = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Safety Patterns</Text>
      <ScrollView style={styles.patternsList}>
        {safetyPatterns.map((pattern, index) => (
          <View key={index} style={styles.patternCard}>
            <View style={styles.patternHeader}>
              <Text style={styles.patternName}>{pattern.name}</Text>
              <View style={styles.patternType}>
                <Text style={styles.patternTypeText}>{pattern.pattern_type.toUpperCase()}</Text>
              </View>
            </View>
            <View style={styles.patternMetrics}>
              <View style={styles.metric}>
                <Text style={styles.metricValue}>{pattern.incidents}</Text>
                <Text style={styles.metricLabel}>Incidents</Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricValue}>{pattern.completion_rate}%</Text>
                <Text style={styles.metricLabel}>Completion Rate</Text>
              </View>
              <View style={styles.metric}>
                <Text style={[styles.trendValue, { color: getTrendColor(pattern.trend) }]}>
                  {getTrendIcon(pattern.trend)} {pattern.trend}
                </Text>
                <Text style={styles.metricLabel}>Trend</Text>
              </View>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { 
                width: `${pattern.completion_rate}%`,
                backgroundColor: pattern.completion_rate >= 90 ? '#4CAF50' : pattern.completion_rate >= 70 ? '#FF9800' : '#f44336'
              }]} />
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading safety data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Safety Log</Text>
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[styles.toggleButton, selectedView === 'flagged' && styles.activeToggleButton]}
            onPress={() => setSelectedView('flagged')}
          >
            <Text style={[styles.toggleText, selectedView === 'flagged' && styles.activeToggleText]}>Flagged Jobs</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, selectedView === 'patterns' && styles.activeToggleButton]}
            onPress={() => setSelectedView('patterns')}
          >
            <Text style={[styles.toggleText, selectedView === 'patterns' && styles.activeToggleText]}>Patterns</Text>
          </TouchableOpacity>
        </View>
      </View>
      {selectedView === 'flagged' ? renderFlaggedJobs() : renderSafetyPatterns()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold' },
  viewToggle: { flexDirection: 'row', backgroundColor: '#e0e0e0', borderRadius: 8, padding: 2 },
  toggleButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6 },
  activeToggleButton: { backgroundColor: '#2196F3' },
  toggleText: { fontSize: 14, color: '#666', fontWeight: '500' },
  activeToggleText: { color: 'white' },
  section: { flex: 1 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  jobsList: { flex: 1 },
  jobCard: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  jobHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  jobSite: { fontSize: 16, fontWeight: 'bold' },
  flaggedBadge: { backgroundColor: '#fff3cd', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: '#ffeaa7' },
  flaggedText: { fontSize: 12, color: '#856404', fontWeight: 'bold' },
  jobConcept: { fontSize: 14, fontWeight: '500', marginBottom: 4 },
  jobCrew: { fontSize: 12, color: '#666', marginBottom: 12 },
  jobFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  lastUpdated: { fontSize: 12, color: '#666' },
  reviewButton: { backgroundColor: '#2196F3', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  reviewButtonText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  patternsList: { flex: 1 },
  patternCard: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  patternHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  patternName: { fontSize: 16, fontWeight: 'bold' },
  patternType: { backgroundColor: '#e3f2fd', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  patternTypeText: { fontSize: 10, color: '#1976d2', fontWeight: 'bold' },
  patternMetrics: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12 },
  metric: { alignItems: 'center' },
  metricValue: { fontSize: 18, fontWeight: 'bold', marginBottom: 2 },
  metricLabel: { fontSize: 12, color: '#666' },
  trendValue: { fontSize: 14, fontWeight: 'bold', marginBottom: 2 },
  progressBar: { height: 6, backgroundColor: '#e0e0e0', borderRadius: 3 },
  progressFill: { height: '100%', borderRadius: 3 },
});