import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal, TextInput } from 'react-native';

interface FlaggedJob {
  id: string;
  jobId: string;
  conceptId?: string;
  reason: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  contractor: string;
  provider: string;
  site: string;
  description: string;
  assignedReviewer?: string;
  status: 'open' | 'under_review' | 'resolved';
}

export const FlaggedJobsTab: React.FC = () => {
  const [flaggedJobs, setFlaggedJobs] = useState<FlaggedJob[]>([
    {
      id: 'flag_001',
      jobId: 'job_123',
      conceptId: 'concept_456',
      reason: 'Payment Dispute',
      severity: 'high',
      timestamp: '2024-01-20T10:30:00Z',
      contractor: 'Smith Construction',
      provider: 'Johnson Crew',
      site: 'Downtown Plaza',
      description: 'Contractor claims work quality below standards, requesting partial refund',
      status: 'open'
    },
    {
      id: 'flag_002',
      jobId: 'job_124',
      reason: 'Cancelled Job',
      severity: 'medium',
      timestamp: '2024-01-20T09:15:00Z',
      contractor: 'ABC Builders',
      provider: 'Heavy Equipment Co',
      site: 'Industrial Park',
      description: 'Job cancelled after equipment breakdown, rescheduling needed',
      assignedReviewer: 'Admin Sarah',
      status: 'under_review'
    },
    {
      id: 'flag_003',
      jobId: 'job_125',
      reason: 'Incomplete Evidence',
      severity: 'low',
      timestamp: '2024-01-20T08:45:00Z',
      contractor: 'Metro Construction',
      provider: 'Steel Supply Inc',
      site: 'Bridge Project',
      description: 'Missing completion photos and documentation',
      status: 'open'
    }
  ]);

  const [selectedJob, setSelectedJob] = useState<FlaggedJob | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [reviewerName, setReviewerName] = useState('');

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#8B0000';
      case 'high': return '#DC3545';
      case 'medium': return '#FFC107';
      case 'low': return '#28A745';
      default: return '#6C757D';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return '#DC3545';
      case 'under_review': return '#FFC107';
      case 'resolved': return '#28A745';
      default: return '#6C757D';
    }
  };

  const handleAssignReviewer = (jobId: string) => {
    setSelectedJob(flaggedJobs.find(job => job.id === jobId) || null);
    setShowAssignModal(true);
  };

  const confirmAssignment = () => {
    if (selectedJob && reviewerName.trim()) {
      setFlaggedJobs(prev => prev.map(job => 
        job.id === selectedJob.id 
          ? { ...job, assignedReviewer: reviewerName.trim(), status: 'under_review' }
          : job
      ));
      setShowAssignModal(false);
      setReviewerName('');
      setSelectedJob(null);
    }
  };

  const handleStatusChange = (jobId: string, newStatus: 'under_review' | 'resolved') => {
    setFlaggedJobs(prev => prev.map(job => 
      job.id === jobId ? { ...job, status: newStatus } : job
    ));
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Flagged Jobs ({flaggedJobs.length})</Text>
      
      <ScrollView style={styles.jobsList}>
        {flaggedJobs.map(job => (
          <View key={job.id} style={styles.jobCard}>
            <View style={styles.jobHeader}>
              <View style={styles.jobInfo}>
                <Text style={styles.jobTitle}>{job.reason}</Text>
                <Text style={styles.jobSubtitle}>{job.contractor} → {job.provider}</Text>
                <Text style={styles.jobSite}>📍 {job.site}</Text>
              </View>
              <View style={styles.badges}>
                <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(job.severity) }]}>
                  <Text style={styles.badgeText}>{job.severity}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(job.status) }]}>
                  <Text style={styles.badgeText}>{job.status.replace('_', ' ')}</Text>
                </View>
              </View>
            </View>
            
            <Text style={styles.jobDescription}>{job.description}</Text>
            
            <View style={styles.jobMeta}>
              <Text style={styles.metaText}>Job ID: {job.jobId}</Text>
              {job.conceptId && <Text style={styles.metaText}>Concept: {job.conceptId}</Text>}
              <Text style={styles.metaText}>Flagged: {formatTimestamp(job.timestamp)}</Text>
              {job.assignedReviewer && (
                <Text style={styles.metaText}>Reviewer: {job.assignedReviewer}</Text>
              )}
            </View>
            
            <View style={styles.actionButtons}>
              {!job.assignedReviewer && (
                <TouchableOpacity 
                  style={[styles.actionButton, styles.assignButton]}
                  onPress={() => handleAssignReviewer(job.id)}
                >
                  <Text style={styles.actionButtonText}>Assign Reviewer</Text>
                </TouchableOpacity>
              )}
              
              {job.status === 'open' && job.assignedReviewer && (
                <TouchableOpacity 
                  style={[styles.actionButton, styles.reviewButton]}
                  onPress={() => handleStatusChange(job.id, 'under_review')}
                >
                  <Text style={styles.actionButtonText}>Start Review</Text>
                </TouchableOpacity>
              )}
              
              {job.status === 'under_review' && (
                <TouchableOpacity 
                  style={[styles.actionButton, styles.resolveButton]}
                  onPress={() => handleStatusChange(job.id, 'resolved')}
                >
                  <Text style={styles.actionButtonText}>Mark Resolved</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.detailsButton]}
                onPress={() => console.log('View details:', job.id)}
              >
                <Text style={styles.actionButtonText}>View Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal
        visible={showAssignModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAssignModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Assign Reviewer</Text>
            <Text style={styles.modalSubtitle}>Job: {selectedJob?.reason}</Text>
            
            <TextInput
              style={styles.reviewerInput}
              placeholder="Enter reviewer name"
              value={reviewerName}
              onChangeText={setReviewerName}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAssignModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmAssignment}
              >
                <Text style={styles.confirmButtonText}>Assign</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  jobsList: {
    flex: 1,
  },
  jobCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  jobInfo: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  jobSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  jobSite: {
    fontSize: 12,
    color: '#999',
  },
  badges: {
    alignItems: 'flex-end',
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  jobDescription: {
    fontSize: 14,
    color: '#555',
    marginBottom: 12,
    lineHeight: 20,
  },
  jobMeta: {
    marginBottom: 12,
  },
  metaText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  assignButton: {
    backgroundColor: '#007AFF',
  },
  reviewButton: {
    backgroundColor: '#FFC107',
  },
  resolveButton: {
    backgroundColor: '#28A745',
  },
  detailsButton: {
    backgroundColor: '#6C757D',
  },
  actionButtonText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 12,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  reviewerInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
  },
  confirmButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
});