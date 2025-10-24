import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { TimeLapseViewer } from './TimeLapseViewer';
import { SnapshotUploader } from './SnapshotUploader';
import { ProgressSnapshotService } from '../services/ProgressSnapshotService';
import { TimeLapseData, ProgressSnapshot } from '../types';
import { ConceptProgressEmptyState } from './ConceptProgressEmptyState';

interface ConceptTimeLapseTabProps {
  conceptId: string;
  siteId: string;
  conceptName: string;
  isReadOnly?: boolean;
}

export const ConceptTimeLapseTab: React.FC<ConceptTimeLapseTabProps> = ({
  conceptId,
  siteId,
  conceptName,
  isReadOnly = false
}) => {
  const [activeView, setActiveView] = useState<'viewer' | 'uploader' | 'list'>('list');
  const [timeLapseData, setTimeLapseData] = useState<TimeLapseData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTimeLapseData();
  }, [conceptId]);

  const loadTimeLapseData = async () => {
    try {
      setLoading(true);
      const data = await ProgressSnapshotService.getTimeLapse(conceptId);
      setTimeLapseData(data);
    } catch (error) {
      console.error('Error loading time-lapse data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadPhoto = () => {
    setActiveView('uploader');
  };

  const handleSnapshotUploaded = (snapshot: ProgressSnapshot) => {
    // Refresh time-lapse data after upload
    loadTimeLapseData();
    setActiveView('list');
  };

  const handleDeleteSnapshot = async (snapshotId: string) => {
    Alert.alert(
      'Delete Snapshot',
      'Are you sure you want to delete this snapshot?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await ProgressSnapshotService.deleteSnapshot(snapshotId);
              loadTimeLapseData();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete snapshot');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text>Loading time-lapse data...</Text>
      </View>
    );
  }

  if (activeView === 'viewer') {
    return (
      <TimeLapseViewer
        conceptId={conceptId}
        onClose={() => setActiveView('list')}
      />
    );
  }

  if (activeView === 'uploader' && !isReadOnly) {
    return (
      <SnapshotUploader
        conceptId={conceptId}
        siteId={siteId}
        onUploadComplete={handleSnapshotUploaded}
        onClose={() => setActiveView('list')}
      />
    );
  }

  // Show empty state if no snapshots
  if (!timeLapseData || timeLapseData.snapshots.length === 0) {
    return (
      <View style={{ flex: 1 }}>
        <View style={{ padding: 20, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 5 }}>Time-Lapse: {conceptName}</Text>
          <Text style={{ fontSize: 14, color: '#666' }}>Track progress with photo evidence</Text>
        </View>
        <ConceptProgressEmptyState onUploadPhoto={handleUploadPhoto} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <View style={{ padding: 20, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 5 }}>Time-Lapse: {conceptName}</Text>
        <Text style={{ fontSize: 14, color: '#666' }}>
          {timeLapseData?.snapshots.length || 0} snapshots • {timeLapseData?.total_duration_days || 0} days
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={{ flexDirection: 'row', padding: 15, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' }}>
        {timeLapseData && timeLapseData.snapshots.length > 0 && (
          <TouchableOpacity
            onPress={() => setActiveView('viewer')}
            style={{ flex: 1, padding: 15, backgroundColor: '#007AFF', borderRadius: 10, marginRight: isReadOnly ? 0 : 10 }}
          >
            <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>View Time-Lapse</Text>
          </TouchableOpacity>
        )}
        
        {!isReadOnly && (
          <TouchableOpacity
            onPress={() => setActiveView('uploader')}
            style={{ flex: 1, padding: 15, backgroundColor: '#4CAF50', borderRadius: 10 }}
          >
            <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>Add Snapshot</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Snapshots List */}
      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 15 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 15 }}>Progress Snapshots</Text>
          {timeLapseData.snapshots.map((snapshot, index) => (
            <View key={snapshot.id} style={{ backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 10 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{snapshot.phase_label}</Text>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#007AFF' }}>{snapshot.progress_percentage}%</Text>
              </View>
              
              <Text style={{ fontSize: 14, color: '#666', marginBottom: 5 }}>
                {new Date(snapshot.timestamp).toLocaleDateString()} at {new Date(snapshot.timestamp).toLocaleTimeString()}
              </Text>
              
              {snapshot.notes && (
                <Text style={{ fontSize: 14, color: '#333', marginBottom: 10 }}>{snapshot.notes}</Text>
              )}
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 12, color: '#999' }}>Snapshot #{index + 1}</Text>
                {!isReadOnly && (
                  <TouchableOpacity
                    onPress={() => handleDeleteSnapshot(snapshot.id)}
                    style={{ padding: 8, backgroundColor: '#FF3B30', borderRadius: 5 }}
                  >
                    <Text style={{ color: 'white', fontSize: 12 }}>Delete</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};