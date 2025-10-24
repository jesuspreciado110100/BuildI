import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LocalizationService } from '../services/LocalizationService';

interface LocalizedProgressCardProps {
  conceptName: string;
  progress: number;
  measurement: number;
  unitType: 'area' | 'volume' | 'weight' | 'length';
  action?: string;
  style?: any;
}

export const LocalizedProgressCard: React.FC<LocalizedProgressCardProps> = ({
  conceptName,
  progress,
  measurement,
  unitType,
  action = 'completed',
  style
}) => {
  const getProgressColor = (progress: number) => {
    if (progress >= 90) return '#28a745';
    if (progress >= 70) return '#ffc107';
    if (progress >= 50) return '#fd7e14';
    return '#dc3545';
  };

  const translatedConcept = LocalizationService.t(`concepts.${conceptName}`);
  const translatedAction = LocalizationService.t(`measurements.${action}`);
  const formattedMeasurement = LocalizationService.formatMeasurement(measurement, unitType);
  const progressText = LocalizationService.t('dashboard.progress');
  const statusText = LocalizationService.t('dashboard.status');

  return (
    <View style={[styles.card, style]}>
      <View style={styles.header}>
        <Text style={styles.conceptName}>{translatedConcept}</Text>
        <View style={[styles.progressBadge, { backgroundColor: getProgressColor(progress) }]}>
          <Text style={styles.progressText}>{progress}%</Text>
        </View>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.measurementText}>
          {formattedMeasurement} {translatedAction}
        </Text>
        
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${progress}%`,
                backgroundColor: getProgressColor(progress)
              }
            ]} 
          />
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.statusLabel}>{statusText}:</Text>
          <Text style={[styles.statusValue, { color: getProgressColor(progress) }]}>
            {progress >= 100 ? 
              LocalizationService.t('status.completed') : 
              LocalizationService.t('status.active')
            }
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
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
    marginBottom: 12,
  },
  conceptName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  progressBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  progressText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    gap: 8,
  },
  measurementText: {
    fontSize: 16,
    color: '#555',
    fontWeight: '500',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
  },
});