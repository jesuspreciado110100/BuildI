import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ResponseTimeLeaderboard } from '../types';
import { ResponseTimeService } from '../services/ResponseTimeService';

interface LeaderboardPanelProps {
  region?: string;
  onClose?: () => void;
}

export const LeaderboardPanel: React.FC<LeaderboardPanelProps> = ({ region, onClose }) => {
  const [leaderboard, setLeaderboard] = useState<ResponseTimeLeaderboard[]>([]);
  const [loading, setLoading] = useState(true);
  const responseTimeService = ResponseTimeService.getInstance();

  useEffect(() => {
    loadLeaderboard();
  }, [region]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const data = await responseTimeService.getLeaderboard(region);
      setLeaderboard(data);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMovementIcon = (movement: 'up' | 'down' | 'same') => {
    switch (movement) {
      case 'up': return '⬆️';
      case 'down': return '⬇️';
      case 'same': return '➡️';
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getScoreColor = (score: 'excellent' | 'good' | 'slow') => {
    switch (score) {
      case 'excellent': return '#10B981';
      case 'good': return '#F59E0B';
      case 'slow': return '#EF4444';
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading leaderboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>⚡ Response Time Leaderboard</Text>
        {region && <Text style={styles.region}>Region: {region}</Text>}
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.scrollView}>
        {leaderboard.map((entry, index) => (
          <View key={entry.renter_id} style={[
            styles.leaderboardItem,
            index < 3 && styles.topThree
          ]}>
            <View style={styles.rankSection}>
              <Text style={styles.rankBadge}>{getRankBadge(entry.rank)}</Text>
              <Text style={styles.movement}>{getMovementIcon(entry.weekly_movement)}</Text>
            </View>

            <View style={styles.renterInfo}>
              <Text style={styles.renterName}>{entry.renter_name}</Text>
              <Text style={styles.company}>{entry.company}</Text>
              <Text style={styles.responseCount}>{entry.total_responses} responses</Text>
            </View>

            <View style={styles.metricsSection}>
              <Text style={styles.responseTime}>
                {responseTimeService.formatResponseTime(entry.avg_response_time)}
              </Text>
              <View style={[
                styles.scoreBadge,
                { backgroundColor: getScoreColor(entry.response_score) }
              ]}>
                <Text style={styles.scoreText}>{entry.response_score}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Updated weekly • Top 10 fastest responders</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    margin: 16,
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
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  region: {
    fontSize: 14,
    color: '#6B7280',
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 18,
    color: '#6B7280',
  },
  scrollView: {
    flex: 1,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  topThree: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  rankSection: {
    alignItems: 'center',
    marginRight: 12,
    minWidth: 50,
  },
  rankBadge: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  movement: {
    fontSize: 12,
    marginTop: 2,
  },
  renterInfo: {
    flex: 1,
    marginRight: 12,
  },
  renterName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  company: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  responseCount: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  metricsSection: {
    alignItems: 'flex-end',
  },
  responseTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  scoreBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scoreText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  footer: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
  },
  loadingText: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 16,
    marginTop: 20,
  },
});