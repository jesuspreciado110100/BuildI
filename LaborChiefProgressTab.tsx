import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal, Alert } from 'react-native';
import { VisualProgressLog, BIMObject } from '../types';
import { visualProgressService } from '../services/VisualProgressService';
import BIMProgressViewer from './BIMProgressViewer';
import VisualProgressForm from './VisualProgressForm';
import VisualProgressLogCard from './VisualProgressLogCard';

interface LaborChiefProgressTabProps {
  laborChiefId: string;
  laborChiefName: string;
  siteId: string;
}

export default function LaborChiefProgressTab({
  laborChiefId,
  laborChiefName,
  siteId
}: LaborChiefProgressTabProps) {
  const [visualProgressLogs, setVisualProgressLogs] = useState<VisualProgressLog[]>([]);
  const [selectedBIMObject, setSelectedBIMObject] = useState<BIMObject | null>(null);
  const [showProgressForm, setShowProgressForm] = useState(false);
  const [editingLog, setEditingLog] = useState<VisualProgressLog | null>(null);

  useEffect(() => {
    loadProgressLogs();
  }, []);

  const loadProgressLogs = () => {
    const logs = visualProgressService.getAllVisualProgressLogs()
      .filter(log => log.submitted_by === laborChiefId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    setVisualProgressLogs(logs);
  };

  const handleBIMObjectSelect = (object: BIMObject) => {
    setSelectedBIMObject(object);
    setShowProgressForm(true);
  };

  const handleProgressSubmit = (logData: Omit<VisualProgressLog, 'id' | 'created_at' | 'contractor_approved'>) => {
    if (editingLog) {
      // Update existing log
      const updatedLog = visualProgressService.updateVisualProgressLog(editingLog.id, logData);
      if (updatedLog) {
        setVisualProgressLogs(prev => prev.map(log => log.id === editingLog.id ? updatedLog : log));
        Alert.alert('Success', 'Progress log updated successfully!');
      }
      setEditingLog(null);
    } else {
      // Create new log
      const newLog = visualProgressService.createVisualProgressLog(logData);
      setVisualProgressLogs(prev => [newLog, ...prev]);
      Alert.alert('Success', 'Progress log submitted successfully!');
    }
    
    setShowProgressForm(false);
    setSelectedBIMObject(null);
  };

  const handleEditLog = (log: VisualProgressLog) => {
    setEditingLog(log);
    const bimObject = visualProgressService.getBIMObjectById(log.bim_object_id);
    setSelectedBIMObject(bimObject);
    setShowProgressForm(true);
  };

  const handleDeleteLog = (logId: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this progress log?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const success = visualProgressService.deleteVisualProgressLog(logId);
            if (success) {
              setVisualProgressLogs(prev => prev.filter(log => log.id !== logId));
              Alert.alert('Success', 'Progress log deleted successfully!');
            }
          }
        }
      ]
    );
  };

  const handleCancelForm = () => {
    setShowProgressForm(false);
    setSelectedBIMObject(null);
    setEditingLog(null);
  };

  const getApprovalStats = () => {
    const total = visualProgressLogs.length;
    const approved = visualProgressLogs.filter(log => log.contractor_approved === true).length;
    const pending = visualProgressLogs.filter(log => log.contractor_approved === null).length;
    const rejected = visualProgressLogs.filter(log => log.contractor_approved === false).length;
    
    return { total, approved, pending, rejected };
  };

  const stats = getApprovalStats();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Visual Progress Logging</Text>
        <Text style={styles.subtitle}>Select BIM objects to log progress</Text>
      </View>

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total Logs</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#10b981' }]}>{stats.approved}</Text>
          <Text style={styles.statLabel}>Approved</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#f59e0b' }]}>{stats.pending}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#ef4444' }]}>{stats.rejected}</Text>
          <Text style={styles.statLabel}>Rejected</Text>
        </View>
      </View>

      <View style={styles.bimViewerContainer}>
        <BIMProgressViewer 
          onObjectSelect={handleBIMObjectSelect}
          selectedObjectId={selectedBIMObject?.id}
        />
      </View>

      <View style={styles.logsSection}>
        <Text style={styles.logsTitle}>My Progress Logs</Text>
        <ScrollView style={styles.logsList}>
          {visualProgressLogs.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No progress logs yet</Text>
              <Text style={styles.emptySubtext}>Select a BIM object above to start logging</Text>
            </View>
          ) : (
            visualProgressLogs.map(log => (
              <VisualProgressLogCard
                key={log.id}
                log={log}
                onEdit={handleEditLog}
                onDelete={handleDeleteLog}
                showActions={true}
                isContractor={false}
              />
            ))
          )}
        </ScrollView>
      </View>

      <Modal 
        visible={showProgressForm} 
        animationType="slide" 
        presentationStyle="pageSheet"
      >
        <VisualProgressForm
          selectedBIMObject={selectedBIMObject}
          onSubmit={handleProgressSubmit}
          onCancel={handleCancelForm}
          laborChiefId={laborChiefId}
          laborChiefName={laborChiefName}
          siteId={siteId}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { padding: 20, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1f2937', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#6b7280' },
  stats: { flexDirection: 'row', backgroundColor: 'white', paddingVertical: 15, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  statItem: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginBottom: 2 },
  statLabel: { fontSize: 12, color: '#6b7280' },
  bimViewerContainer: { height: 300, backgroundColor: 'white', marginBottom: 1 },
  logsSection: { flex: 1, backgroundColor: 'white' },
  logsTitle: { fontSize: 16, fontWeight: 'bold', color: '#1f2937', padding: 20, paddingBottom: 10 },
  logsList: { flex: 1, paddingHorizontal: 20 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#6b7280', marginBottom: 4 },
  emptySubtext: { fontSize: 14, color: '#9ca3af' }
});