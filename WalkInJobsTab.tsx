import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { JobBoardPost, WalkInApplication } from '../types';
import { WalkInMatchingService } from '../services/WalkInMatchingService';

interface WalkInJobsTabProps {
  onApproveApplication: (applicationId: string) => void;
  onRejectApplication: (applicationId: string) => void;
  onAssignToCrew: (applicationId: string, crewId: string) => void;
}

export const WalkInJobsTab: React.FC<WalkInJobsTabProps> = ({
  onApproveApplication,
  onRejectApplication,
  onAssignToCrew
}) => {
  const [jobPosts, setJobPosts] = useState<JobBoardPost[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobBoardPost | null>(null);
  const [matchingSuggestions, setMatchingSuggestions] = useState<any>(null);

  useEffect(() => {
    loadOfflineJobs();
  }, []);

  const loadOfflineJobs = () => {
    // Mock data - in real app, fetch from database
    const mockJobs: JobBoardPost[] = [
      {
        id: '1',
        site_id: 'site-1',
        trade_type: 'concrete',
        volume: 50,
        unit: 'cubic_yards',
        price_per_unit: 150,
        deadline: '2024-01-15',
        contact_name: 'John Smith',
        status: 'open',
        is_offline_post: true,
        created_at: '2024-01-01T10:00:00Z',
        applications: [
          {
            id: 'app-1',
            job_post_id: '1',
            worker_name: 'Mike Rodriguez',
            phone: '555-0123',
            trade_type: 'concrete',
            skill_level: 'intermediate',
            referred_by: 'Carlos M.',
            status: 'pending',
            created_at: '2024-01-01T11:00:00Z'
          },
          {
            id: 'app-2',
            job_post_id: '1',
            worker_name: 'David Johnson',
            trade_type: 'general',
            skill_level: 'beginner',
            status: 'pending',
            created_at: '2024-01-01T12:00:00Z'
          }
        ]
      }
    ];
    setJobPosts(mockJobs);
  };

  const handleViewApplications = async (job: JobBoardPost) => {
    setSelectedJob(job);
    const suggestions = await WalkInMatchingService.getMatchingSuggestions(job);
    setMatchingSuggestions(suggestions);
  };

  const handleApprove = (applicationId: string) => {
    Alert.alert(
      'Approve Application',
      'Are you sure you want to approve this application?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: () => {
            onApproveApplication(applicationId);
            loadOfflineJobs(); // Refresh data
          }
        }
      ]
    );
  };

  const handleReject = (applicationId: string) => {
    Alert.alert(
      'Reject Application',
      'Are you sure you want to reject this application?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: () => {
            onRejectApplication(applicationId);
            loadOfflineJobs(); // Refresh data
          }
        }
      ]
    );
  };

  const handleAssignToCrew = (applicationId: string) => {
    // In a real app, this would show a crew selection modal
    const crewId = 'crew-1'; // Mock crew ID
    onAssignToCrew(applicationId, crewId);
    loadOfflineJobs(); // Refresh data
  };

  if (selectedJob) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSelectedJob(null)}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Applications for {selectedJob.trade_type}</Text>
        </View>

        {matchingSuggestions && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Application Summary</Text>
            <Text style={styles.summaryText}>
              {matchingSuggestions.totalApplicants} total applicants
            </Text>
            <Text style={styles.summaryText}>
              Average skill level: {matchingSuggestions.averageSkillLevel}
            </Text>
          </View>
        )}

        <ScrollView style={styles.applicationsList}>
          {selectedJob.applications?.map((app) => (
            <View key={app.id} style={styles.applicationCard}>
              <View style={styles.applicationHeader}>
                <Text style={styles.workerName}>{app.worker_name}</Text>
                <Text style={[styles.status, 
                  app.status === 'pending' ? styles.statusPending :
                  app.status === 'approved' ? styles.statusApproved : styles.statusRejected
                ]}>
                  {app.status}
                </Text>
              </View>
              
              <Text style={styles.applicationDetail}>Trade: {app.trade_type}</Text>
              <Text style={styles.applicationDetail}>Skill: {app.skill_level}</Text>
              {app.phone && (
                <Text style={styles.applicationDetail}>Phone: {app.phone}</Text>
              )}
              {app.referred_by && (
                <Text style={styles.applicationDetail}>Referred by: {app.referred_by}</Text>
              )}
              
              {app.status === 'pending' && (
                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={styles.rejectButton}
                    onPress={() => handleReject(app.id)}
                  >
                    <Text style={styles.rejectButtonText}>Reject</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.approveButton}
                    onPress={() => handleApprove(app.id)}
                  >
                    <Text style={styles.approveButtonText}>Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.assignButton}
                    onPress={() => handleAssignToCrew(app.id)}
                  >
                    <Text style={styles.assignButtonText}>Assign</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Walk-In Jobs</Text>
      
      <ScrollView style={styles.jobsList}>
        {jobPosts.filter(job => job.is_offline_post).map((job) => (
          <View key={job.id} style={styles.jobCard}>
            <View style={styles.jobHeader}>
              <Text style={styles.jobTitle}>{job.trade_type.toUpperCase()}</Text>
              <Text style={styles.jobStatus}>{job.status}</Text>
            </View>
            
            <Text style={styles.jobDetails}>
              {job.volume} {job.unit} @ ${job.price_per_unit}/{job.unit}
            </Text>
            <Text style={styles.jobDeadline}>Deadline: {job.deadline}</Text>
            
            <View style={styles.applicationsSummary}>
              <Text style={styles.applicationsCount}>
                {job.applications?.length || 0} applications
              </Text>
              <Text style={styles.pendingCount}>
                {job.applications?.filter(app => app.status === 'pending').length || 0} pending
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.viewButton}
              onPress={() => handleViewApplications(job)}
            >
              <Text style={styles.viewButtonText}>View Applications</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    fontSize: 16,
    color: '#007bff',
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  summaryCard: {
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#666',
  },
  jobsList: {
    flex: 1,
  },
  applicationsList: {
    flex: 1,
  },
  jobCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  applicationCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  applicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  workerName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  jobStatus: {
    fontSize: 12,
    color: '#28a745',
    backgroundColor: '#d4edda',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  status: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontWeight: '600',
  },
  statusPending: {
    color: '#856404',
    backgroundColor: '#fff3cd',
  },
  statusApproved: {
    color: '#155724',
    backgroundColor: '#d4edda',
  },
  statusRejected: {
    color: '#721c24',
    backgroundColor: '#f8d7da',
  },
  jobDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  applicationDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  jobDeadline: {
    fontSize: 14,
    color: '#dc3545',
    marginBottom: 8,
  },
  applicationsSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  applicationsCount: {
    fontSize: 14,
    color: '#007bff',
  },
  pendingCount: {
    fontSize: 14,
    color: '#ffc107',
  },
  viewButton: {
    backgroundColor: '#007bff',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  viewButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  rejectButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  rejectButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  approveButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  approveButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  assignButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  assignButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});