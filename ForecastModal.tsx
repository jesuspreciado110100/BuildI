import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { ConceptForecast, Concept } from '../types';

interface ForecastModalProps {
  visible: boolean;
  onClose: () => void;
  forecast: ConceptForecast | null;
  concept: Concept | null;
}

export const ForecastModal: React.FC<ForecastModalProps> = ({
  visible,
  onClose,
  forecast,
  concept
}) => {
  if (!forecast || !concept) return null;

  const getDeviationColor = (deviation: number) => {
    if (deviation >= 0) return '#10B981';
    if (deviation >= -10) return '#F59E0B';
    return '#EF4444';
  };

  const getDeviationIcon = (deviation: number) => {
    if (deviation >= 0) return '✅';
    if (deviation >= -10) return '⚠️';
    return '🚨';
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>AI Forecast Analysis</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>×</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.content}>
            <View style={styles.conceptInfo}>
              <Text style={styles.conceptName}>{concept.name}</Text>
              <Text style={styles.conceptDescription}>{concept.description}</Text>
            </View>

            <View style={styles.progressSection}>
              <Text style={styles.sectionTitle}>Progress Analysis</Text>
              
              <View style={styles.progressRow}>
                <Text style={styles.progressLabel}>Planned Progress:</Text>
                <Text style={styles.progressValue}>{forecast.planned_progress}%</Text>
              </View>
              
              <View style={styles.progressRow}>
                <Text style={styles.progressLabel}>Actual Progress:</Text>
                <Text style={styles.progressValue}>{forecast.actual_progress}%</Text>
              </View>
              
              <View style={styles.progressRow}>
                <Text style={styles.progressLabel}>Deviation:</Text>
                <View style={styles.deviationContainer}>
                  <Text style={styles.deviationIcon}>
                    {getDeviationIcon(forecast.deviation_percentage)}
                  </Text>
                  <Text style={[styles.deviationText, { color: getDeviationColor(forecast.deviation_percentage) }]}>
                    {forecast.deviation_percentage > 0 ? '+' : ''}{forecast.deviation_percentage}%
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.aiSection}>
              <Text style={styles.sectionTitle}>AI Suggested Reasons</Text>
              {forecast.ai_suggested_reasons.map((reason, index) => (
                <View key={index} style={styles.reasonItem}>
                  <Text style={styles.reasonBullet}>•</Text>
                  <Text style={styles.reasonText}>{reason}</Text>
                </View>
              ))}
            </View>

            {forecast.related_log_tags.length > 0 && (
              <View style={styles.tagsSection}>
                <Text style={styles.sectionTitle}>Related Log Tags</Text>
                <View style={styles.tagsContainer}>
                  {forecast.related_log_tags.map((tag, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  closeText: {
    fontSize: 24,
    color: '#6B7280',
  },
  content: {
    padding: 16,
  },
  conceptInfo: {
    marginBottom: 16,
  },
  conceptName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  conceptDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  progressSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  deviationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviationIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  deviationText: {
    fontSize: 14,
    fontWeight: '600',
  },
  aiSection: {
    marginBottom: 16,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  reasonBullet: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 8,
    marginTop: 2,
  },
  reasonText: {
    fontSize: 14,
    color: '#1F2937',
    flex: 1,
  },
  tagsSection: {
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 12,
    color: '#6B7280',
  },
});