import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { MicroJobRequest } from '../types';
import { MicroJobService } from '../services/MicroJobService';
import { NotificationService } from '../services/NotificationService';
import { ChatService } from '../services/ChatService';
import { CompletionModal } from './CompletionModal';

interface IncomingMicroJobsTabProps {
  workerId: string;
}

export const IncomingMicroJobsTab: React.FC<IncomingMicroJobsTabProps> = ({ workerId }) => {
  const [microJobs, setMicroJobs] = useState<MicroJobRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [completionModal, setCompletionModal] = useState<{ visible: boolean; job: MicroJobRequest | null }>({ visible: false, job: null });

  useEffect(() => {
    loadMicroJobs();
  }, [workerId]);

  const loadMicroJobs = async () => {
    try {
      const jobs = await MicroJobService.getMicroJobsByWorker(workerId);
      setMicroJobs(jobs);
    } catch (error) {
      console.error('Failed to load micro jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptJob = async (job: MicroJobRequest) => {
    try {
      const updatedJob = await MicroJobService.acceptMicroJob(job.id, workerId);
      
      // Create chat room for the job
      await ChatService.createChatRoom({
        request_id: job.id,
        participants: [job.contractor_id, workerId]
      });
      
      // Send notification to contractor
      await NotificationService.sendNotification({
        user_id: job.contractor_id,
        title: 'Micro Job Accepted',
        message: `Your task "${job.job_description}" has been accepted`,
        type: 'micro_job',
        related_id: job.id
      });
      
      setMicroJobs(prev => prev.map(j => j.id === job.id ? updatedJob : j));
      Alert.alert('Success', 'Job accepted successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to accept job');
    }
  };

  const handleDeclineJob = async (job: MicroJobRequest) => {
    try {
      await MicroJobService.declineMicroJob(job.id);
      setMicroJobs(prev => prev.filter(j => j.id !== job.id));
      Alert.alert('Success', 'Job declined');
    } catch (error) {
      Alert.alert('Error', 'Failed to decline job');
    }
  };

  const handleMarkComplete = (job: MicroJobRequest) => {
    setCompletionModal({ visible: true, job });
  };

  const handleCompletionSuccess = () => {
    loadMicroJobs(); // Refresh the list
  };

  const renderJobCard = (job: MicroJobRequest) => {
    const isPending = job.status === 'pending' && !job.selected_worker_id;
    const isConfirmed = job.status === 'confirmed' && job.selected_worker_id === workerId;
    const isCompleted = job.status === 'completed';
    
    return (
      <View key={job.id} style={styles.jobCard}>
        <View style={styles.jobHeader}>
          <Text style={styles.jobTitle}>{job.job_description}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(job.status) }]}>
            <Text style={styles.statusText}>{job.status.toUpperCase()}</Text>
          </View>
        </View>
        
        <View style={styles.jobDetails}>
          <Text style={styles.tradeType}>{job.trade_type}</Text>
          <Text style={styles.jobInfo}>
            {job.volume} {job.unit} × ${job.unit_price} = ${job.total_price}
          </Text>
          <Text style={styles.location}>📍 {job.location}</Text>
          <Text style={styles.scheduledDate}>📅 {new Date(job.scheduled_date).toLocaleDateString()}</Text>
        </View>
        
        {isPending && (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.declineButton}
              onPress={() => handleDeclineJob(job)}
            >
              <Text style={styles.declineButtonText}>Decline</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.acceptButton}
              onPress={() => handleAcceptJob(job)}
            >
              <Text style={styles.acceptButtonText}>Accept</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {isConfirmed && (
          <View style={styles.actionButtons}>
            <Text style={styles.acceptedText}>✅ Job Confirmed</Text>
            <TouchableOpacity 
              style={styles.completeButton}
              onPress={() => handleMarkComplete(job)}
            >
              <Text style={styles.completeButtonText}>Mark as Complete</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {isCompleted && (
          <View style={styles.completedInfo}>
            <Text style={styles.completedText}>✅ Completed</Text>
            {job.completed_at && (
              <Text style={styles.completedDate}>
                Completed on {new Date(job.completed_at).toLocaleDateString()}
              </Text>
            )}
          </View>
        )}
      </View>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FF9800';
      case 'confirmed': return '#4CAF50';
      case 'completed': return '#2196F3';
      case 'cancelled': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading micro jobs...</Text>
      </View>
    );
  }

  if (microJobs.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No micro job requests</Text>
        <Text style={styles.emptySubtext}>New task requests will appear here</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.container}>
        <Text style={styles.headerText}>Incoming Micro Jobs</Text>
        {microJobs.map(renderJobCard)}
      </ScrollView>
      
      {completionModal.job && (
        <CompletionModal
          visible={completionModal.visible}
          onClose={() => setCompletionModal({ visible: false, job: null })}
          job={completionModal.job}
          workerId={workerId}
          onComplete={handleCompletionSuccess}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center'
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333'
  },
  jobCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 12
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white'
  },
  jobDetails: {
    marginBottom: 16
  },
  tradeType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2196F3',
    marginBottom: 4
  },
  jobInfo: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4CAF50',
    marginBottom: 8
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4
  },
  scheduledDate: {
    fontSize: 14,
    color: '#666'
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  declineButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginRight: 8
  },
  declineButtonText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#666'
  },
  acceptButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    marginLeft: 8
  },
  acceptButtonText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: 'white'
  },
  acceptedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50'
  },
  completeButton: {
    padding: 12,
    backgroundColor: '#2196F3',
    borderRadius: 8
  },
  completeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white'
  },
  completedInfo: {
    padding: 12,
    backgroundColor: '#E3F2FD',
    borderRadius: 8
  },
  completedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2196F3',
    marginBottom: 4
  },
  completedDate: {
    fontSize: 12,
    color: '#666'
  }
});