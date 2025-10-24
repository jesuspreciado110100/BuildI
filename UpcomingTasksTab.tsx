import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Phase, ConstructionConcept } from '../types';
import { ProgressTrackingService } from '../services/ProgressTrackingService';

interface UpcomingTasksTabProps {
  laborChiefId: string;
}

export default function UpcomingTasksTab({ laborChiefId }: UpcomingTasksTabProps) {
  const [assignedPhases, setAssignedPhases] = useState<(Phase & { conceptName: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssignedPhases();
  }, [laborChiefId]);

  const loadAssignedPhases = async () => {
    try {
      setLoading(true);
      const phases = await ProgressTrackingService.getAssignedPhases(laborChiefId);
      setAssignedPhases(phases);
    } catch (error) {
      console.error('Error loading assigned phases:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDependencyStatus = (phase: Phase): { status: string; color: string } => {
    if (phase.status === 'ready') {
      return { status: 'Ready to start', color: '#10b981' };
    }
    if (phase.status === 'in_progress') {
      return { status: 'In progress', color: '#3b82f6' };
    }
    if (phase.status === 'completed') {
      return { status: 'Completed', color: '#059669' };
    }
    if (phase.start_trigger_type === 'progress_percent') {
      return { status: 'Pending prior crew', color: '#f59e0b' };
    }
    if (phase.start_trigger_type === 'date') {
      const triggerDate = new Date(phase.trigger_value as string);
      const now = new Date();
      if (triggerDate <= now) {
        return { status: 'Ready to start', color: '#10b981' };
      }
      return { status: `Scheduled for ${triggerDate.toLocaleDateString()}`, color: '#6b7280' };
    }
    return { status: 'Awaiting manual start', color: '#6b7280' };
  };

  const formatEstimatedStart = (phase: Phase): string => {
    if (phase.estimated_start_date) {
      return new Date(phase.estimated_start_date).toLocaleDateString();
    }
    if (phase.start_trigger_type === 'date') {
      return new Date(phase.trigger_value as string).toLocaleDateString();
    }
    return 'TBD';
  };

  const renderPhaseCard = (phase: Phase & { conceptName: string }) => {
    const dependencyStatus = getDependencyStatus(phase);
    
    return (
      <View key={phase.id} style={styles.phaseCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.conceptName}>{phase.conceptName}</Text>
          <View style={[styles.statusBadge, { backgroundColor: dependencyStatus.color + '20' }]}>
            <Text style={[styles.statusText, { color: dependencyStatus.color }]}>
              {dependencyStatus.status}
            </Text>
          </View>
        </View>
        
        <Text style={styles.phaseTitle}>{phase.title}</Text>
        <Text style={styles.phaseDescription}>{phase.description}</Text>
        
        <View style={styles.phaseDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Volume:</Text>
            <Text style={styles.detailValue}>{phase.volume} {phase.unit}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Required Skills:</Text>
            <Text style={styles.detailValue}>{phase.required_skills.join(', ')}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Estimated Start:</Text>
            <Text style={styles.detailValue}>{formatEstimatedStart(phase)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Progress:</Text>
            <Text style={styles.detailValue}>{phase.progress_percent}%</Text>
          </View>
        </View>
        
        {phase.start_trigger_type === 'progress_percent' && (
          <View style={styles.triggerInfo}>
            <Text style={styles.triggerText}>
              Starts when previous phase reaches {phase.trigger_value}%
            </Text>
          </View>
        )}
        
        {phase.status === 'ready' && (
          <TouchableOpacity style={styles.startButton}>
            <Text style={styles.startButtonText}>Start Phase</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading upcoming tasks...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Upcoming Tasks</Text>
        <Text style={styles.subtitle}>{assignedPhases.length} phases assigned</Text>
      </View>
      
      {assignedPhases.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No upcoming tasks assigned</Text>
          <Text style={styles.emptySubtext}>New phase assignments will appear here</Text>
        </View>
      ) : (
        assignedPhases.map(renderPhaseCard)
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16, color: '#6b7280' },
  header: { padding: 16, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },
  subtitle: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  phaseCard: { backgroundColor: 'white', margin: 16, padding: 16, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  conceptName: { fontSize: 14, fontWeight: '600', color: '#374151' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 12, fontWeight: '600' },
  phaseTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginBottom: 8 },
  phaseDescription: { fontSize: 14, color: '#6b7280', marginBottom: 16 },
  phaseDetails: { marginBottom: 16 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  detailLabel: { fontSize: 13, color: '#6b7280', fontWeight: '500' },
  detailValue: { fontSize: 13, color: '#374151', fontWeight: '600' },
  triggerInfo: { backgroundColor: '#fef3c7', padding: 12, borderRadius: 8, marginBottom: 12 },
  triggerText: { fontSize: 12, color: '#92400e', textAlign: 'center' },
  startButton: { backgroundColor: '#10b981', padding: 12, borderRadius: 8, alignItems: 'center' },
  startButtonText: { color: 'white', fontSize: 14, fontWeight: '600' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#374151', marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: '#6b7280', textAlign: 'center' }
});