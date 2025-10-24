import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { WorkerAnalytics } from '../types';

interface WorkerAnalyticsModalProps {
  analytics: WorkerAnalytics | null;
  visible: boolean;
  onClose: () => void;
}

const WorkerAnalyticsModal: React.FC<WorkerAnalyticsModalProps> = ({ analytics, visible, onClose }) => {
  if (!analytics) return null;

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

  const topConcepts = Object.entries(analytics.jobs_by_concept)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Worker Analytics</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Performance Overview</Text>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{analytics.avg_rating.toFixed(1)}</Text>
                <Text style={styles.statLabel}>Average Rating</Text>
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
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top 3 Concepts</Text>
            {topConcepts.length > 0 ? (
              topConcepts.map(([concept, count], index) => (
                <View key={concept} style={styles.conceptRow}>
                  <View style={styles.conceptRank}>
                    <Text style={styles.conceptRankText}>{index + 1}</Text>
                  </View>
                  <View style={styles.conceptInfo}>
                    <Text style={styles.conceptName}>{concept}</Text>
                    <Text style={styles.conceptCount}>{count} jobs completed</Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.noConceptsText}>No concept data available</Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rating Breakdown</Text>
            <View style={styles.ratingBreakdown}>
              <Text style={styles.ratingText}>Average Stars: {analytics.feedback_stats.avg_stars.toFixed(1)}/5.0</Text>
              <Text style={styles.ratingText}>Total Reviews: {analytics.feedback_stats.total_reviews}</Text>
              <Text style={styles.ratingText}>Last Active: {analytics.last_active}</Text>
            </View>
          </View>

          {analytics.top_review_comment && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Top Review</Text>
              <View style={styles.topReview}>
                <Text style={styles.topReviewText}>"{analytics.top_review_comment}"</Text>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  closeButton: { width: 30, height: 30, justifyContent: 'center', alignItems: 'center' },
  closeText: { fontSize: 18, color: '#666' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  placeholder: { width: 30 },
  content: { flex: 1, padding: 20 },
  section: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#333' },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#007AFF' },
  statLabel: { fontSize: 12, color: '#666', marginTop: 4 },
  starsContainer: { flexDirection: 'row', marginTop: 4 },
  star: { fontSize: 12 },
  conceptRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  conceptRank: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  conceptRankText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  conceptInfo: { flex: 1 },
  conceptName: { fontSize: 16, fontWeight: '600', color: '#333' },
  conceptCount: { fontSize: 14, color: '#666' },
  noConceptsText: { fontSize: 14, color: '#666', textAlign: 'center', padding: 20 },
  ratingBreakdown: { backgroundColor: '#f8f9fa', padding: 12, borderRadius: 8 },
  ratingText: { fontSize: 14, marginBottom: 4, color: '#333' },
  topReview: { backgroundColor: '#f0f8ff', padding: 12, borderRadius: 8, borderLeftWidth: 4, borderLeftColor: '#007AFF' },
  topReviewText: { fontSize: 14, color: '#333', fontStyle: 'italic' }
});

export default WorkerAnalyticsModal;