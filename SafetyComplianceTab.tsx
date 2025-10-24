import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Phase } from '../types';
import { SafetyService } from '../services/SafetyService';
import { SafetyChecklistPanel } from './SafetyChecklistPanel';

interface SafetyComplianceTabProps {
  laborChiefId: string;
  assignedPhases: Phase[];
}

interface PhaseProgress {
  phase_id: string;
  completed: number;
  total: number;
  overdue: number;
}

export const SafetyComplianceTab: React.FC<SafetyComplianceTabProps> = ({
  laborChiefId,
  assignedPhases
}) => {
  const [selectedPhase, setSelectedPhase] = useState<Phase | null>(null);
  const [phaseProgress, setPhaseProgress] = useState<Record<string, PhaseProgress>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPhaseProgress();
  }, [assignedPhases]);

  const loadPhaseProgress = async () => {
    try {
      const progressData: Record<string, PhaseProgress> = {};
      
      for (const phase of assignedPhases) {
        const progress = await SafetyService.getPhaseChecklistProgress(phase.id);
        progressData[phase.id] = {
          phase_id: phase.id,
          ...progress
        };
      }
      
      setPhaseProgress(progressData);
    } catch (error) {
      console.error('Failed to load phase progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemComplete = async (itemId: string) => {
    // Refresh progress after item completion
    await loadPhaseProgress();
  };

  const getPhaseStatusColor = (phase: Phase) => {
    const progress = phaseProgress[phase.id];
    if (!progress) return '#ddd';
    
    if (progress.overdue > 0) return '#f44336'; // Red for overdue
    if (progress.completed === progress.total) return '#4CAF50'; // Green for complete
    if (progress.completed > 0) return '#FF9800'; // Orange for in progress
    return '#2196F3'; // Blue for not started
  };

  const getPhaseStatusText = (phase: Phase) => {
    const progress = phaseProgress[phase.id];
    if (!progress) return 'Loading...';
    
    if (progress.overdue > 0) return `${progress.overdue} overdue items`;
    if (progress.completed === progress.total) return 'All items completed';
    return `${progress.completed}/${progress.total} completed`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading safety checklists...</Text>
      </View>
    );
  }

  if (selectedPhase) {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setSelectedPhase(null)}
        >
          <Text style={styles.backButtonText}>← Back to Phases</Text>
        </TouchableOpacity>
        
        <SafetyChecklistPanel
          phase={selectedPhase}
          tradeType={selectedPhase.required_skills[0] || 'general'}
          laborChiefId={laborChiefId}
          onItemComplete={handleItemComplete}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Safety & Compliance</Text>
      <Text style={styles.subtitle}>Active checklists by assigned phase</Text>
      
      <ScrollView style={styles.phasesList}>
        {assignedPhases.map((phase) => {
          const progress = phaseProgress[phase.id];
          const statusColor = getPhaseStatusColor(phase);
          const statusText = getPhaseStatusText(phase);
          
          return (
            <TouchableOpacity
              key={phase.id}
              style={styles.phaseCard}
              onPress={() => setSelectedPhase(phase)}
            >
              <View style={styles.phaseHeader}>
                <Text style={styles.phaseName}>{phase.title}</Text>
                <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                  <Text style={styles.statusText}>{phase.status.toUpperCase()}</Text>
                </View>
              </View>
              
              <Text style={styles.phaseDescription}>{phase.description}</Text>
              
              {progress && (
                <View style={styles.progressSection}>
                  <View style={styles.progressBar}>
                    <View style={[
                      styles.progressFill,
                      { 
                        width: `${(progress.completed / progress.total) * 100}%`,
                        backgroundColor: statusColor
                      }
                    ]} />
                  </View>
                  <Text style={[
                    styles.progressText,
                    progress.overdue > 0 && styles.overdueText
                  ]}>
                    {statusText}
                  </Text>
                </View>
              )}
              
              <View style={styles.phaseFooter}>
                <Text style={styles.tradeType}>
                  Trade: {phase.required_skills.join(', ') || 'General'}
                </Text>
                {progress && progress.overdue > 0 && (
                  <Text style={styles.overdueWarning}>⚠️ Overdue items</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      
      {assignedPhases.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No assigned phases</Text>
          <Text style={styles.emptySubtext}>You'll see safety checklists here when phases are assigned to your crew</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    padding: 12,
    backgroundColor: '#2196F3',
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  backButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  phasesList: {
    flex: 1,
  },
  phaseCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  phaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  phaseName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  phaseDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  progressSection: {
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
  },
  overdueText: {
    color: '#f44336',
    fontWeight: 'bold',
  },
  phaseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tradeType: {
    fontSize: 12,
    color: '#666',
  },
  overdueWarning: {
    fontSize: 12,
    color: '#f44336',
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});