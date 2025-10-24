import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ResponseTimeService } from '../services/ResponseTimeService';
import { AdminPerformanceMetrics } from '../types';

interface AdminPerformanceTabProps {
  adminId: string;
}

export default function AdminPerformanceTab({ adminId }: AdminPerformanceTabProps) {
  const [metrics, setMetrics] = useState<AdminPerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPerformanceMetrics();
  }, []);

  const loadPerformanceMetrics = async () => {
    try {
      const responseTimeService = ResponseTimeService.getInstance();
      const leaderboard = await responseTimeService.getWeeklyLeaderboard();
      
      const performanceMetrics: AdminPerformanceMetrics = {
        response_time_leaderboard: leaderboard.map(metric => ({
          renter_id: metric.renter_id,
          renter_name: `Renter ${metric.renter_id}`,
          avg_response_time: metric.avg_response_time,
          total_requests: metric.total_requests,
          rank: metric.rank
        })),
        weekly_stats: {
          total_requests: leaderboard.reduce((sum, m) => sum + m.total_requests, 0),
          avg_platform_response_time: leaderboard.length > 0 ? 
            leaderboard.reduce((sum, m) => sum + m.avg_response_time, 0) / leaderboard.length : 0,
          fastest_responder: leaderboard.length > 0 ? `Renter ${leaderboard[0].renter_id}` : 'N/A'
        }
      };
      
      setMetrics(performanceMetrics);
    } catch (error) {
      console.error('Failed to load performance metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading performance metrics...</Text>
      </View>
    );
  }

  if (!metrics) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Failed to load performance metrics</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Response Time Performance</Text>
      
      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>Weekly Platform Stats</Text>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Total Requests:</Text>
          <Text style={styles.statValue}>{metrics.weekly_stats.total_requests}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Avg Response Time:</Text>
          <Text style={styles.statValue}>
            {ResponseTimeService.getInstance().formatResponseTime(metrics.weekly_stats.avg_platform_response_time)}
          </Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Fastest Responder:</Text>
          <Text style={styles.statValue}>{metrics.weekly_stats.fastest_responder}</Text>
        </View>
      </View>

      <View style={styles.leaderboardCard}>
        <Text style={styles.leaderboardTitle}>Response Time Leaderboard</Text>
        <Text style={styles.leaderboardSubtitle}>This Week's Top Performers</Text>
        
        {metrics.response_time_leaderboard.slice(0, 10).map((renter, index) => (
          <View key={renter.renter_id} style={styles.leaderboardRow}>
            <View style={styles.rankBadge}>
              <Text style={styles.rankText}>#{renter.rank}</Text>
            </View>
            <View style={styles.renterInfo}>
              <Text style={styles.renterName}>{renter.renter_name}</Text>
              <Text style={styles.renterStats}>
                {renter.total_requests} requests • avg {ResponseTimeService.getInstance().formatResponseTime(renter.avg_response_time)}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.refreshButton} onPress={loadPerformanceMetrics}>
        <Text style={styles.refreshButtonText}>Refresh Data</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#374151', marginBottom: 20 },
  loadingText: { fontSize: 16, color: '#6b7280', textAlign: 'center', marginTop: 40 },
  errorText: { fontSize: 16, color: '#dc2626', textAlign: 'center', marginTop: 40 },
  statsCard: { backgroundColor: 'white', padding: 20, borderRadius: 12, marginBottom: 20, elevation: 2 },
  statsTitle: { fontSize: 18, fontWeight: 'bold', color: '#374151', marginBottom: 15 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  statLabel: { fontSize: 14, color: '#6b7280' },
  statValue: { fontSize: 14, fontWeight: '600', color: '#374151' },
  leaderboardCard: { backgroundColor: 'white', padding: 20, borderRadius: 12, marginBottom: 20, elevation: 2 },
  leaderboardTitle: { fontSize: 18, fontWeight: 'bold', color: '#374151', marginBottom: 5 },
  leaderboardSubtitle: { fontSize: 14, color: '#6b7280', marginBottom: 15 },
  leaderboardRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  rankBadge: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#3b82f6', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  rankText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  renterInfo: { flex: 1 },
  renterName: { fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 2 },
  renterStats: { fontSize: 12, color: '#6b7280' },
  refreshButton: { backgroundColor: '#3b82f6', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  refreshButtonText: { color: 'white', fontSize: 16, fontWeight: '600' }
});