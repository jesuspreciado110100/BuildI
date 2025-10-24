import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { supabase } from '@/app/lib/supabase';

interface ProgressData {
  id: string;
  conceptId: string;
  progress: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold';
  lastUpdated: string;
  updatedBy: string;
  notes?: string;
}

interface ProgressTrackingIntegrationProps {
  siteId: string;
  conceptId?: string;
  onProgressUpdate?: (progress: ProgressData) => void;
}

const ProgressTrackingIntegration: React.FC<ProgressTrackingIntegrationProps> = ({
  siteId,
  conceptId,
  onProgressUpdate,
}) => {
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgressData();
  }, [siteId, conceptId]);

  const loadProgressData = async () => {
    try {
      setLoading(true);
      
      // Mock progress data - replace with actual Supabase query
      const mockData: ProgressData[] = [
        {
          id: '1',
          conceptId: conceptId || 'concept-1',
          progress: 75,
          status: 'in_progress',
          lastUpdated: new Date().toISOString(),
          updatedBy: 'John Doe',
          notes: 'Foundation work completed, moving to framing'
        },
        {
          id: '2',
          conceptId: 'concept-2',
          progress: 100,
          status: 'completed',
          lastUpdated: new Date(Date.now() - 86400000).toISOString(),
          updatedBy: 'Jane Smith',
          notes: 'All electrical work completed and inspected'
        },
        {
          id: '3',
          conceptId: 'concept-3',
          progress: 25,
          status: 'in_progress',
          lastUpdated: new Date(Date.now() - 172800000).toISOString(),
          updatedBy: 'Mike Johnson',
          notes: 'Site preparation in progress'
        }
      ];

      setProgressData(mockData);
    } catch (error) {
      console.error('Error loading progress data:', error);
      Alert.alert('Error', 'Failed to load progress data');
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (progressId: string, newProgress: number) => {
    try {
      // Mock update - replace with actual Supabase update
      setProgressData(prev => 
        prev.map(item => 
          item.id === progressId 
            ? { 
                ...item, 
                progress: newProgress, 
                lastUpdated: new Date().toISOString(),
                status: newProgress === 100 ? 'completed' : 'in_progress'
              }
            : item
        )
      );

      const updatedItem = progressData.find(item => item.id === progressId);
      if (updatedItem && onProgressUpdate) {
        onProgressUpdate({
          ...updatedItem,
          progress: newProgress,
          lastUpdated: new Date().toISOString(),
          status: newProgress === 100 ? 'completed' : 'in_progress'
        });
      }

      Alert.alert('Success', 'Progress updated successfully');
    } catch (error) {
      console.error('Error updating progress:', error);
      Alert.alert('Error', 'Failed to update progress');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'in_progress': return '#FF9800';
      case 'on_hold': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getStatusText = (status: string) => {
    return status.replace('_', ' ').toUpperCase();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading progress data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Progress Tracking</Text>
        <Text style={styles.subtitle}>Site: {siteId}</Text>
      </View>

      {progressData.map(item => (
        <View key={item.id} style={styles.progressCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.conceptId}>Concept {item.conceptId}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
              <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${item.progress}%`,
                    backgroundColor: getStatusColor(item.status)
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>{item.progress}%</Text>
          </View>

          {item.notes && (
            <Text style={styles.notes}>{item.notes}</Text>
          )}

          <View style={styles.cardFooter}>
            <Text style={styles.lastUpdated}>
              Updated by {item.updatedBy} • {new Date(item.lastUpdated).toLocaleDateString()}
            </Text>
            
            <View style={styles.quickActions}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => updateProgress(item.id, Math.min(100, item.progress + 25))}
              >
                <Text style={styles.actionText}>+25%</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.completeButton]}
                onPress={() => updateProgress(item.id, 100)}
              >
                <Text style={[styles.actionText, styles.completeText]}>Complete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16, color: '#666' },
  header: { padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 4 },
  progressCard: { backgroundColor: '#fff', margin: 16, borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  conceptId: { fontSize: 18, fontWeight: '600', color: '#333' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  progressContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  progressBar: { flex: 1, height: 8, backgroundColor: '#e0e0e0', borderRadius: 4, marginRight: 12 },
  progressFill: { height: '100%', borderRadius: 4 },
  progressText: { fontSize: 16, fontWeight: '600', color: '#333', minWidth: 40 },
  notes: { fontSize: 14, color: '#666', fontStyle: 'italic', marginBottom: 12 },
  cardFooter: { borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 12 },
  lastUpdated: { fontSize: 12, color: '#999', marginBottom: 8 },
  quickActions: { flexDirection: 'row', gap: 8 },
  actionButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, backgroundColor: '#f0f0f0' },
  completeButton: { backgroundColor: '#4CAF50' },
  actionText: { fontSize: 12, fontWeight: '600', color: '#333' },
  completeText: { color: '#fff' },
});

export default ProgressTrackingIntegration;