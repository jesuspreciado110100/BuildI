import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { JobBoardPost, WalkInApplication } from '../types';
import { WalkInWorkerForm } from './WalkInWorkerForm';

interface JobBoardPanelProps {
  isOfflineMode: boolean;
  onCreateJobPost: (post: Omit<JobBoardPost, 'id' | 'created_at'>) => void;
  onSubmitApplication: (application: Omit<WalkInApplication, 'id' | 'created_at'>) => void;
}

export const JobBoardPanel: React.FC<JobBoardPanelProps> = ({
  isOfflineMode,
  onCreateJobPost,
  onSubmitApplication
}) => {
  const [jobPosts, setJobPosts] = useState<JobBoardPost[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    const mockPosts: JobBoardPost[] = [
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
        applications: []
      },
      {
        id: '2',
        site_id: 'site-2',
        trade_type: 'electrical',
        volume: 20,
        unit: 'hours',
        price_per_unit: 75,
        deadline: '2024-01-20',
        contact_name: 'Mike Johnson',
        status: 'open',
        is_offline_post: true,
        created_at: '2024-01-02T09:00:00Z',
        applications: []
      }
    ];
    setJobPosts(mockPosts);
  }, []);

  const generateQRCode = (jobId: string) => {
    const qrUrl = `https://app.example.com/job/${jobId}`;
    Alert.alert('QR Code Generated', `Share this link: ${qrUrl}`);
  };

  const handleApplyToJob = (jobId: string) => {
    setSelectedJobId(jobId);
    setShowApplicationForm(true);
  };

  const handleSubmitApplication = (application: Omit<WalkInApplication, 'id' | 'created_at'>) => {
    onSubmitApplication(application);
    setShowApplicationForm(false);
    setSelectedJobId(null);
    Alert.alert('Success', 'Application submitted successfully!');
  };

  const handleCancelApplication = () => {
    setShowApplicationForm(false);
    setSelectedJobId(null);
  };

  if (showApplicationForm && selectedJobId) {
    return (
      <WalkInWorkerForm
        jobPostId={selectedJobId}
        onSubmit={handleSubmitApplication}
        onCancel={handleCancelApplication}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Job Board</Text>
      
      {!isOfflineMode && (
        <View style={styles.offlineNotice}>
          <Text style={styles.offlineNoticeText}>Enable Offline Mode to see walk-in jobs</Text>
        </View>
      )}

      <ScrollView style={styles.jobList}>
        {jobPosts.filter(post => !isOfflineMode || post.is_offline_post).map((post) => (
          <View key={post.id} style={styles.jobCard}>
            <View style={styles.jobHeader}>
              <Text style={styles.jobTitle}>{post.trade_type.toUpperCase()}</Text>
              <Text style={styles.jobStatus}>{post.status}</Text>
            </View>
            
            <Text style={styles.jobDetails}>
              {post.volume} {post.unit} @ ${post.price_per_unit}/{post.unit}
            </Text>
            
            <Text style={styles.jobDeadline}>Deadline: {post.deadline}</Text>
            <Text style={styles.jobContact}>Contact: {post.contact_name}</Text>
            
            {post.applications && post.applications.length > 0 && (
              <Text style={styles.applicationsCount}>
                {post.applications.length} application(s) received
              </Text>
            )}
            
            <View style={styles.jobActions}>
              <TouchableOpacity 
                style={styles.qrButton}
                onPress={() => generateQRCode(post.id)}
              >
                <Text style={styles.qrButtonText}>Generate QR</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.applyButton}
                onPress={() => handleApplyToJob(post.id)}
              >
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  offlineNotice: {
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  offlineNoticeText: {
    color: '#856404',
    textAlign: 'center',
  },
  jobList: {
    flex: 1,
  },
  jobCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
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
  jobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  jobStatus: {
    fontSize: 12,
    fontWeight: '600',
    color: '#28a745',
    backgroundColor: '#d4edda',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  jobDetails: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  jobDeadline: {
    fontSize: 14,
    color: '#dc3545',
    marginBottom: 4,
  },
  jobContact: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  applicationsCount: {
    fontSize: 12,
    color: '#007bff',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  jobActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  qrButton: {
    backgroundColor: '#6c757d',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  qrButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  applyButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});