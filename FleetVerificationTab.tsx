import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { FleetUploadService, FleetUploadData } from '../services/FleetUploadService';

export const FleetVerificationTab: React.FC = () => {
  const [uploads, setUploads] = useState<FleetUploadData[]>([]);
  const [filter, setFilter] = useState<'all' | 'unverified' | 'verified' | 'suspicious'>('all');
  const [stats, setStats] = useState({ total: 0, unverified: 0, verified: 0, suspicious: 0 });

  useEffect(() => {
    loadUploads();
    loadStats();
  }, [filter]);

  const loadUploads = async () => {
    try {
      let data: FleetUploadData[];
      if (filter === 'all') {
        data = await FleetUploadService.getUnverifiedUploads();
      } else {
        data = await FleetUploadService.getUnverifiedUploads();
        data = data.filter(upload => upload.status === filter);
      }
      setUploads(data);
    } catch (error) {
      console.error('Error loading uploads:', error);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await FleetUploadService.getFleetVerificationStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleVerify = async (uploadId: string, status: 'verified' | 'suspicious') => {
    Alert.prompt(
      'Verification Notes',
      'Add notes about this verification (optional)',
      async (notes) => {
        const success = await FleetUploadService.verifyUpload(uploadId, status, notes);
        if (success) {
          Alert.alert('Success', `Machine ${status === 'verified' ? 'verified' : 'marked as suspicious'}`);
          loadUploads();
          loadStats();
        } else {
          Alert.alert('Error', 'Failed to update verification status');
        }
      }
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return '#10b981';
      case 'suspicious': return '#ef4444';
      default: return '#f59e0b';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'verified': return 'Verified';
      case 'suspicious': return 'Suspicious';
      default: return 'Unverified';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Fleet Verification</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#f59e0b' }]}>{stats.unverified}</Text>
            <Text style={styles.statLabel}>Unverified</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#10b981' }]}>{stats.verified}</Text>
            <Text style={styles.statLabel}>Verified</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#ef4444' }]}>{stats.suspicious}</Text>
            <Text style={styles.statLabel}>Suspicious</Text>
          </View>
        </View>
      </View>

      <View style={styles.filterContainer}>
        {['all', 'unverified', 'verified', 'suspicious'].map((filterOption) => (
          <TouchableOpacity
            key={filterOption}
            style={[
              styles.filterButton,
              filter === filterOption && styles.activeFilterButton
            ]}
            onPress={() => setFilter(filterOption as any)}
          >
            <Text style={[
              styles.filterText,
              filter === filterOption && styles.activeFilterText
            ]}>
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.uploadsList}>
        {uploads.map((upload) => (
          <View key={upload.id} style={styles.uploadCard}>
            <View style={styles.uploadHeader}>
              <View>
                <Text style={styles.uploadTitle}>{upload.nickname}</Text>
                <Text style={styles.uploadSubtitle}>{upload.category} • {upload.brand}</Text>
              </View>
              <View style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(upload.status) }
              ]}>
                <Text style={styles.statusText}>{getStatusText(upload.status)}</Text>
              </View>
            </View>

            <View style={styles.uploadDetails}>
              <Text style={styles.detailText}>Daily Rate: ${upload.dailyRate}/day</Text>
              <Text style={styles.detailText}>Availability: {upload.availability}</Text>
              <Text style={styles.detailText}>Uploaded: {new Date(upload.createdAt).toLocaleDateString()}</Text>
              {upload.verificationNotes && (
                <Text style={styles.notesText}>Notes: {upload.verificationNotes}</Text>
              )}
            </View>

            <View style={styles.photoIndicators}>
              <Text style={styles.photoLabel}>Photos:</Text>
              <View style={styles.photoStatus}>
                <Text style={[styles.photoItem, upload.photos.front && styles.photoUploaded]}>Front</Text>
                <Text style={[styles.photoItem, upload.photos.side && styles.photoUploaded]}>Side</Text>
                <Text style={[styles.photoItem, upload.photos.control && styles.photoUploaded]}>Control</Text>
              </View>
            </View>

            {upload.status === 'unverified' && (
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.verifyButton}
                  onPress={() => handleVerify(upload.id!, 'verified')}
                >
                  <Text style={styles.verifyButtonText}>✓ Verify</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.suspiciousButton}
                  onPress={() => handleVerify(upload.id!, 'suspicious')}
                >
                  <Text style={styles.suspiciousButtonText}>⚠ Suspicious</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}

        {uploads.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No uploads found for the selected filter</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row' as const,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center' as const,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#1e293b',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  filterContainer: {
    flexDirection: 'row' as const,
    padding: 16,
    backgroundColor: 'white',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
  },
  activeFilterButton: {
    backgroundColor: '#0ea5e9',
  },
  filterText: {
    fontSize: 14,
    color: '#64748b',
  },
  activeFilterText: {
    color: 'white',
  },
  uploadsList: {
    flex: 1,
    padding: 16,
  },
  uploadCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  uploadHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    alignItems: 'flex-start' as const,
    marginBottom: 12,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#1e293b',
  },
  uploadSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500' as const,
  },
  uploadDetails: {
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: '#7c3aed',
    fontStyle: 'italic' as const,
    marginTop: 8,
  },
  photoIndicators: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 16,
  },
  photoLabel: {
    fontSize: 14,
    color: '#64748b',
    marginRight: 8,
  },
  photoStatus: {
    flexDirection: 'row' as const,
  },
  photoItem: {
    fontSize: 12,
    color: '#94a3b8',
    marginRight: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
  },
  photoUploaded: {
    color: '#10b981',
    backgroundColor: '#dcfce7',
  },
  actionButtons: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
  },
  verifyButton: {
    flex: 1,
    backgroundColor: '#10b981',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center' as const,
    marginRight: 8,
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500' as const,
  },
  suspiciousButton: {
    flex: 1,
    backgroundColor: '#ef4444',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center' as const,
    marginLeft: 8,
  },
  suspiciousButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500' as const,
  },
  emptyState: {
    alignItems: 'center' as const,
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
  },
};