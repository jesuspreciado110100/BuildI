import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LaborPerformanceMetrics } from '../types';
import { LaborPerformanceService } from '../services/LaborPerformanceService';

interface TeamPerformanceTabProps {
  laborChiefId: string;
}

export const TeamPerformanceTab: React.FC<TeamPerformanceTabProps> = ({ laborChiefId }) => {
  const [teamMembers, setTeamMembers] = useState<LaborPerformanceMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'rating' | 'output' | 'jobs'>('rating');

  // Mock team members for demonstration
  const mockTeamMembers = [
    { id: '1', name: 'José Martinez', trade: 'Masonry' },
    { id: '2', name: 'Mike Johnson', trade: 'Electrical' },
    { id: '3', name: 'Carlos Rodriguez', trade: 'Plumbing' },
  ];

  useEffect(() => {
    loadTeamPerformance();
  }, [laborChiefId]);

  const loadTeamPerformance = async () => {
    try {
      setLoading(true);
      // In a real app, this would fetch team members for the labor chief
      const teamMetrics = await Promise.all(
        mockTeamMembers.map(member => 
          LaborPerformanceService.calculateWorkerMetrics(member.id)
        )
      );
      setTeamMembers(teamMetrics);
    } catch (error) {
      console.error('Error loading team performance:', error);
    } finally {
      setLoading(false);
    }
  };

  const sortedMembers = [...teamMembers].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.avg_rating - a.avg_rating;
      case 'output':
        return b.avg_output_per_day - a.avg_output_per_day;
      case 'jobs':
        return b.completed_jobs_count - a.completed_jobs_count;
      default:
        return 0;
    }
  });

  const getTeamAverage = (metric: keyof LaborPerformanceMetrics) => {
    if (teamMembers.length === 0) return 0;
    const sum = teamMembers.reduce((acc, member) => acc + (member[metric] as number), 0);
    return sum / teamMembers.length;
  };

  const renderMemberCard = (member: LaborPerformanceMetrics, index: number) => {
    const memberName = mockTeamMembers.find(m => m.id === member.worker_id)?.name || `Worker ${member.worker_id}`;
    
    return (
      <View key={member.worker_id} style={styles.memberCard}>
        <View style={styles.memberHeader}>
          <View>
            <Text style={styles.memberName}>{memberName}</Text>
            <Text style={styles.memberTrade}>{member.trade}</Text>
          </View>
          <View style={styles.rankContainer}>
            <Text style={styles.rank}>#{index + 1}</Text>
          </View>
        </View>
        
        <View style={styles.metricsGrid}>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{member.avg_output_per_day.toFixed(1)}</Text>
            <Text style={styles.metricLabel}>Units/Day</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>⭐ {member.avg_rating.toFixed(1)}</Text>
            <Text style={styles.metricLabel}>Rating</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{member.completed_jobs_count}</Text>
            <Text style={styles.metricLabel}>Jobs</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{member.lateness_rate.toFixed(1)}%</Text>
            <Text style={styles.metricLabel}>Lateness</Text>
          </View>
        </View>
        
        {member.badges.length > 0 && (
          <View style={styles.badgeContainer}>
            {member.badges.map((badge, i) => (
              <Text key={i} style={styles.badge}>{badge}</Text>
            ))}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading team performance...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Team Performance</Text>
      
      {/* Team Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Team Averages</Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{getTeamAverage('avg_output_per_day').toFixed(1)}</Text>
            <Text style={styles.summaryLabel}>Avg Output/Day</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>⭐ {getTeamAverage('avg_rating').toFixed(1)}</Text>
            <Text style={styles.summaryLabel}>Avg Rating</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{getTeamAverage('completed_jobs_count').toFixed(0)}</Text>
            <Text style={styles.summaryLabel}>Avg Jobs</Text>
          </View>
        </View>
      </View>
      
      {/* Sort Options */}
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        {[{key: 'rating', label: 'Rating'}, {key: 'output', label: 'Output'}, {key: 'jobs', label: 'Jobs'}].map(option => (
          <TouchableOpacity
            key={option.key}
            style={[styles.sortButton, sortBy === option.key && styles.activeSortButton]}
            onPress={() => setSortBy(option.key as any)}
          >
            <Text style={[styles.sortText, sortBy === option.key && styles.activeSortText]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Team Members */}
      <ScrollView style={styles.membersList}>
        {sortedMembers.map((member, index) => renderMemberCard(member, index))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sortLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 12,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 16,
  },
  activeSortButton: {
    backgroundColor: '#007AFF',
  },
  sortText: {
    fontSize: 14,
    color: '#333',
  },
  activeSortText: {
    color: 'white',
  },
  membersList: {
    flex: 1,
  },
  memberCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  memberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  memberName: {
    fontSize: 18,
    fontWeight: '600',
  },
  memberTrade: {
    fontSize: 14,
    color: '#666',
  },
  rankContainer: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rank: {
    color: 'white',
    fontWeight: 'bold',
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  badge: {
    fontSize: 12,
    marginRight: 8,
    marginBottom: 4,
  },
});