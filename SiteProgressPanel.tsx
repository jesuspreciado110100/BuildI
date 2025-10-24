import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SimpleProgressBar } from './SimpleProgressBar';

interface SiteProgressPanelProps {
  contractorId?: string;
}

interface ProgressData {
  overall: number;
  planning: number;
  construction: number;
  finishing: number;
}

export default function SiteProgressPanel({ contractorId }: SiteProgressPanelProps) {
  // Mock data
  const progressData: ProgressData = {
    overall: 65,
    planning: 100,
    construction: 45,
    finishing: 10
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return '#10B981';
    if (progress >= 60) return '#3B82F6';
    if (progress >= 40) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Site Progress</Text>
      
      <View style={styles.overallProgress}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Overall Progress</Text>
          <Text style={styles.progressValue}>{progressData.overall}%</Text>
        </View>
        <SimpleProgressBar 
          progress={progressData.overall} 
          color={getProgressColor(progressData.overall)}
          height={12}
        />
      </View>

      <View style={styles.phaseProgress}>
        <Text style={styles.phaseTitle}>Phase Breakdown</Text>
        
        <View style={styles.phaseItem}>
          <View style={styles.phaseHeader}>
            <Text style={styles.phaseLabel}>Planning</Text>
            <Text style={styles.phaseValue}>{progressData.planning}%</Text>
          </View>
          <SimpleProgressBar 
            progress={progressData.planning} 
            color={getProgressColor(progressData.planning)}
            height={8}
          />
        </View>

        <View style={styles.phaseItem}>
          <View style={styles.phaseHeader}>
            <Text style={styles.phaseLabel}>Construction</Text>
            <Text style={styles.phaseValue}>{progressData.construction}%</Text>
          </View>
          <SimpleProgressBar 
            progress={progressData.construction} 
            color={getProgressColor(progressData.construction)}
            height={8}
          />
        </View>

        <View style={styles.phaseItem}>
          <View style={styles.phaseHeader}>
            <Text style={styles.phaseLabel}>Finishing</Text>
            <Text style={styles.phaseValue}>{progressData.finishing}%</Text>
          </View>
          <SimpleProgressBar 
            progress={progressData.finishing} 
            color={getProgressColor(progressData.finishing)}
            height={8}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 20,
  },
  overallProgress: {
    marginBottom: 24,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  progressValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  phaseProgress: {
    gap: 16,
  },
  phaseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  phaseItem: {
    gap: 8,
  },
  phaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  phaseLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  phaseValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
});