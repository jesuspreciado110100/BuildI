import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { ProgressLog } from '../types';

interface ProgressReviewPanelProps {
  contractorId: string;
}

export default function ProgressReviewPanel({ contractorId }: ProgressReviewPanelProps) {
  const [progressLogs, setProgressLogs] = useState<ProgressLog[]>([
    {
      id: '1',
      site_id: '1',
      concept_id: '1',
      concept_name: 'Foundation Excavation',
      submitted_by: 'chief1',
      submitted_by_name: 'John Smith',
      quantity_done: 75,
      photo_urls: ['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg'],
      notes: 'Excavation is 75% complete. Hit some rocky soil but made good progress. Need to bring in heavier equipment for the remaining section.',
      contractor_approved: null,
      created_at: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      site_id: '1',
      concept_id: '2',
      concept_name: 'Concrete Pouring',
      submitted_by: 'chief2',
      submitted_by_name: 'Maria Garcia',
      quantity_done: 40,
      photo_urls: ['https://example.com/photo3.jpg'],
      notes: 'Started concrete pouring for the east wing. Weather conditions are good. Expecting to complete 60% by end of week.',
      contractor_approved: true,
      created_at: '2024-01-14T14:20:00Z'
    },
    {
      id: '3',
      site_id: '2',
      concept_id: '3',
      concept_name: 'Steel Framework',
      submitted_by: 'chief1',
      submitted_by_name: 'John Smith',
      quantity_done: 25,
      photo_urls: ['https://example.com/photo4.jpg', 'https://example.com/photo5.jpg', 'https://example.com/photo6.jpg'],
      notes: 'Steel framework installation started. First floor beams are in place. Crane operator is very skilled.',
      contractor_approved: false,
      created_at: '2024-01-13T09:15:00Z'
    }
  ]);

  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const handleApprove = (logId: string) => {
    setProgressLogs(prev => prev.map(log => 
      log.id === logId ? { ...log, contractor_approved: true } : log
    ));
    Alert.alert('Approved', 'Progress log has been approved');
  };

  const handleReject = (logId: string) => {
    setProgressLogs(prev => prev.map(log => 
      log.id === logId ? { ...log, contractor_approved: false } : log
    ));
    Alert.alert('Rejected', 'Progress log has been rejected');
  };

  const getFilteredLogs = () => {
    switch (filter) {
      case 'pending':
        return progressLogs.filter(log => log.contractor_approved === null);
      case 'approved':
        return progressLogs.filter(log => log.contractor_approved === true);
      case 'rejected':
        return progressLogs.filter(log => log.contractor_approved === false);
      default:
        return progressLogs;
    }
  };

  const getStatusColor = (approved: boolean | null) => {
    if (approved === null) return '#f59e0b';
    if (approved) return '#10b981';
    return '#ef4444';
  };

  const getStatusText = (approved: boolean | null) => {
    if (approved === null) return 'Pending Review';
    if (approved) return 'Approved';
    return 'Rejected';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Progress Review</Text>

      <View style={styles.filterContainer}>
        {[{ key: 'all', label: 'All' }, { key: 'pending', label: 'Pending' }, { key: 'approved', label: 'Approved' }, { key: 'rejected', label: 'Rejected' }].map((filterOption) => (
          <TouchableOpacity
            key={filterOption.key}
            style={[styles.filterButton, filter === filterOption.key && styles.activeFilter]}
            onPress={() => setFilter(filterOption.key as any)}
          >
            <Text style={[styles.filterText, filter === filterOption.key && styles.activeFilterText]}>
              {filterOption.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.logsList}>
        {getFilteredLogs().map((log) => (
          <View key={log.id} style={styles.logCard}>
            <View style={styles.logHeader}>
              <View style={styles.logInfo}>
                <Text style={styles.conceptName}>{log.concept_name}</Text>
                <Text style={styles.submittedBy}>by {log.submitted_by_name}</Text>
                <Text style={styles.timestamp}>{formatDate(log.created_at)}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(log.contractor_approved) }]}>
                <Text style={styles.statusText}>{getStatusText(log.contractor_approved)}</Text>
              </View>
            </View>

            <View style={styles.quantitySection}>
              <Text style={styles.quantityLabel}>Quantity Completed:</Text>
              <Text style={styles.quantityValue}>{log.quantity_done}%</Text>
            </View>

            <View style={styles.photosSection}>
              <Text style={styles.photosLabel}>Photos ({log.photo_urls.length}):</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photosScroll}>
                {log.photo_urls.map((url, index) => (
                  <View key={index} style={styles.photoPlaceholder}>
                    <Text style={styles.photoText}>📷 {index + 1}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>

            <View style={styles.notesSection}>
              <Text style={styles.notesLabel}>Notes:</Text>
              <Text style={styles.notesText}>{log.notes}</Text>
            </View>

            {log.contractor_approved === null && (
              <View style={styles.actionsSection}>
                <TouchableOpacity
                  style={styles.approveButton}
                  onPress={() => handleApprove(log.id)}
                >
                  <Text style={styles.approveButtonText}>✅ Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.rejectButton}
                  onPress={() => handleReject(log.id)}
                >
                  <Text style={styles.rejectButtonText}>❌ Reject</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1e293b', marginBottom: 20 },
  filterContainer: { flexDirection: 'row', marginBottom: 20, gap: 8 },
  filterButton: { backgroundColor: '#e2e8f0', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  activeFilter: { backgroundColor: '#3b82f6' },
  filterText: { fontSize: 14, color: '#64748b', fontWeight: '500' },
  activeFilterText: { color: 'white' },
  logsList: { flex: 1 },
  logCard: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  logHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  logInfo: { flex: 1 },
  conceptName: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginBottom: 4 },
  submittedBy: { fontSize: 14, color: '#64748b', marginBottom: 2 },
  timestamp: { fontSize: 12, color: '#94a3b8' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  quantitySection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, backgroundColor: '#f1f5f9', padding: 12, borderRadius: 8 },
  quantityLabel: { fontSize: 14, color: '#475569', fontWeight: '500' },
  quantityValue: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  photosSection: { marginBottom: 12 },
  photosLabel: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  photosScroll: { flexDirection: 'row' },
  photoPlaceholder: { width: 60, height: 60, backgroundColor: '#e5e7eb', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  photoText: { fontSize: 12, color: '#6b7280' },
  notesSection: { marginBottom: 16 },
  notesLabel: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  notesText: { fontSize: 14, color: '#4b5563', lineHeight: 20 },
  actionsSection: { flexDirection: 'row', gap: 12 },
  approveButton: { flex: 1, backgroundColor: '#10b981', padding: 12, borderRadius: 8, alignItems: 'center' },
  approveButtonText: { color: 'white', fontSize: 14, fontWeight: 'bold' },
  rejectButton: { flex: 1, backgroundColor: '#ef4444', padding: 12, borderRadius: 8, alignItems: 'center' },
  rejectButtonText: { color: 'white', fontSize: 14, fontWeight: 'bold' },
});