import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { WorkerAnalytics, WorkerProfile } from '../types';
import AnalyticsService from '../services/AnalyticsService';

interface WorkerAnalyticsCardProps {
  analytics: WorkerAnalytics;
}

const WorkerAnalyticsCard: React.FC<WorkerAnalyticsCardProps> = ({ analytics }) => {
  const [showFeedback, setShowFeedback] = useState(false);
  const [workerProfile, setWorkerProfile] = useState<WorkerProfile | null>(null);

  const handleViewFeedback = async () => {
    try {
      const profile = await AnalyticsService.getWorkerProfile(analytics.worker_id);
      setWorkerProfile(profile);
      setShowFeedback(true);
    } catch (error) {
      console.error('Error loading worker profile:', error);
    }
  };

  const getMostUsedConcept = () => {
    const concepts = Object.entries(analytics.jobs_by_concept);
    if (concepts.length === 0) return 'None';
    return concepts.reduce((max, current) => 
      current[1] > max[1] ? current : max
    )[0];
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Text key={i} style={[styles.star, { color: i <= rating ? '#FFD700' : '#ddd' }]}>
          ★
        </Text>
      );
    }
    return stars;
  };

  return (
    <>
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.workerInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {workerProfile?.name?.charAt(0) || analytics.worker_id.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.nameSection}>
              <Text style={styles.workerName}>
                {workerProfile?.name || `Worker ${analytics.worker_id}`}
              </Text>
              <Text style={styles.tradeType}>{analytics.trade_type}</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.feedbackButton}
            onPress={handleViewFeedback}
          >
            <Text style={styles.feedbackButtonText}>View Feedback</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{analytics.avg_rating.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Avg Rating</Text>
            <View style={styles.starsContainer}>
              {renderStars(Math.round(analytics.avg_rating))}
            </View>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{analytics.completed_jobs}</Text>
            <Text style={styles.statLabel}>Total Jobs</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{analytics.feedback_stats.total_reviews}</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Most Used Concept:</Text>
            <Text style={styles.detailValue}>{getMostUsedConcept()}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Last Active:</Text>
            <Text style={styles.detailValue}>{analytics.last_active}</Text>
          </View>
        </View>

        {analytics.top_review_comment && (
          <View style={styles.reviewContainer}>
            <Text style={styles.reviewLabel}>Top Review:</Text>
            <Text style={styles.reviewText}>"{analytics.top_review_comment}"</Text>
          </View>
        )}
      </View>

      <Modal
        visible={showFeedback}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFeedback(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Feedback Details</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowFeedback(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <Text style={styles.modalWorkerName}>
              {workerProfile?.name || `Worker ${analytics.worker_id}`}
            </Text>
            <Text style={styles.modalTradeType}>{analytics.trade_type}</Text>
            
            <View style={styles.modalStats}>
              <Text style={styles.modalStatText}>
                Average Rating: {analytics.avg_rating.toFixed(1)}/5.0
              </Text>
              <Text style={styles.modalStatText}>
                Total Reviews: {analytics.feedback_stats.total_reviews}
              </Text>
              <Text style={styles.modalStatText}>
                Completed Jobs: {analytics.completed_jobs}
              </Text>
            </View>

            {analytics.top_review_comment && (
              <View style={styles.modalReviewSection}>
                <Text style={styles.modalReviewTitle}>Top Review:</Text>
                <Text style={styles.modalReviewText}>
                  "{analytics.top_review_comment}"
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  workerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  nameSection: {
    flex: 1,
  },
  workerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  tradeType: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  feedbackButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  feedbackButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  starsContainer: {
    flexDirection: 'row',
    marginTop: 4,
  },
  star: {
    fontSize: 12,
  },
  detailsContainer: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  reviewContainer: {
    backgroundColor: '#f0f8ff',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  reviewLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 4,
  },
  reviewText: {
    fontSize: 14,
    color: '#333',
    fontStyle: 'italic',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    padding: 20,
  },
  modalWorkerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  modalTradeType: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  modalStats: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  modalStatText: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  modalReviewSection: {
    backgroundColor: '#f0f8ff',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  modalReviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 8,
  },
  modalReviewText: {
    fontSize: 16,
    color: '#333',
    fontStyle: 'italic',
  },
});

export default WorkerAnalyticsCard;