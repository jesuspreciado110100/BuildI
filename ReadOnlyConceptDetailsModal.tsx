import React, { useState, useEffect } from 'react';
import { View, Text, Modal, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Concept, ProgressLog } from '../types';
import { ClientPortalService } from '../services/ClientPortalService';

interface ReadOnlyConceptDetailsModalProps {
  visible: boolean;
  concepts: Concept[];
  siteId: string;
  onClose: () => void;
}

export const ReadOnlyConceptDetailsModal: React.FC<ReadOnlyConceptDetailsModalProps> = ({
  visible,
  concepts,
  siteId,
  onClose
}) => {
  const [progressLogs, setProgressLogs] = useState<ProgressLog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && concepts.length > 0) {
      loadProgressLogs();
    }
  }, [visible, concepts]);

  const loadProgressLogs = async () => {
    setLoading(true);
    try {
      const allLogs: ProgressLog[] = [];
      for (const concept of concepts) {
        const logs = await ClientPortalService.getConceptProgressLogs(concept.id);
        allLogs.push(...logs);
      }
      setProgressLogs(allLogs);
    } catch (error) {
      console.error('Error loading progress logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderProgressBar = (planned: number, actual: number) => {
    return (
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.plannedProgress,
              { width: `${planned}%` }
            ]}
          />
          <View 
            style={[
              styles.actualProgress,
              { width: `${actual}%` }
            ]}
          />
        </View>
        <View style={styles.progressLabels}>
          <Text style={styles.progressLabel}>Planned: {planned}%</Text>
          <Text style={styles.progressLabel}>Actual: {actual}%</Text>
        </View>
      </View>
    );
  };

  const renderAIForecast = (forecast: Concept['ai_forecast']) => {
    if (!forecast) return null;
    
    return (
      <View style={styles.forecastContainer}>
        <Text style={styles.forecastTitle}>🤖 AI Forecast</Text>
        <Text style={styles.forecastText}>
          Predicted completion: {new Date(forecast.predicted_completion).toLocaleDateString()}
        </Text>
        <Text style={styles.forecastText}>
          Confidence: {forecast.confidence}%
        </Text>
        <Text style={styles.forecastFactors}>
          Factors: {forecast.factors.join(', ')}
        </Text>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Concept Details</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {concepts.map((concept) => (
            <View key={concept.id} style={styles.conceptCard}>
              <View style={styles.conceptHeader}>
                <Text style={styles.conceptTrade}>{concept.trade}</Text>
                <Text style={styles.lastUpdated}>
                  {ClientPortalService.formatLastUpdated(concept.last_updated)}
                </Text>
              </View>

              {renderProgressBar(concept.planned_progress, concept.actual_progress)}

              {concept.photos && concept.photos.length > 0 && (
                <View style={styles.photosContainer}>
                  <Text style={styles.photosTitle}>📸 Progress Photos</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {concept.photos.map((photo, index) => (
                      <View key={index} style={styles.photoContainer}>
                        <View style={styles.photoPlaceholder}>
                          <Text style={styles.photoText}>{photo}</Text>
                        </View>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}

              {renderAIForecast(concept.ai_forecast)}
            </View>
          ))}

          {progressLogs.length > 0 && (
            <View style={styles.logsContainer}>
              <Text style={styles.logsTitle}>Recent Progress Updates</Text>
              {progressLogs.map((log) => (
                <View key={log.id} style={styles.logCard}>
                  <Text style={styles.logDate}>{new Date(log.date).toLocaleDateString()}</Text>
                  <Text style={styles.logProgress}>Progress: {log.progress_percentage}%</Text>
                  {log.notes && <Text style={styles.logNotes}>{log.notes}</Text>}
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  conceptCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  conceptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  conceptTrade: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  lastUpdated: {
    fontSize: 12,
    color: '#999',
  },
  progressBarContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 8,
  },
  plannedProgress: {
    position: 'absolute',
    height: '100%',
    backgroundColor: '#FFC107',
    borderRadius: 6,
  },
  actualProgress: {
    position: 'absolute',
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 6,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 12,
    color: '#666',
  },
  photosContainer: {
    marginBottom: 16,
  },
  photosTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  photoContainer: {
    marginRight: 12,
  },
  photoPlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoText: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  forecastContainer: {
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  forecastTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 4,
  },
  forecastText: {
    fontSize: 12,
    color: '#1976D2',
    marginBottom: 2,
  },
  forecastFactors: {
    fontSize: 11,
    color: '#1976D2',
    fontStyle: 'italic',
  },
  logsContainer: {
    marginTop: 16,
  },
  logsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  logCard: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  logDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  logProgress: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  logNotes: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
});