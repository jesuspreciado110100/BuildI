import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { StarRating } from './StarRating';
import { SimpleAICrewOptimizer } from './SimpleAICrewOptimizer';

interface PerformanceStats {
  totalJobs: number;
  completedJobs: number;
  avgRating: number;
  totalSpent: number;
  mostUsedTrades: { trade: string; count: number }[];
  ratingBreakdown: { rating: number; count: number }[];
}

export default function LaborPerformanceTab() {
  const { theme } = useTheme();
  const [stats, setStats] = useState<PerformanceStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const mockStats: PerformanceStats = {
        totalJobs: 47,
        completedJobs: 43,
        avgRating: 4.6,
        totalSpent: 28500,
        mostUsedTrades: [
          { trade: 'Carpenter', count: 18 },
          { trade: 'Electrician', count: 12 },
          { trade: 'Plumber', count: 8 },
          { trade: 'Painter', count: 6 },
          { trade: 'Mason', count: 3 }
        ],
        ratingBreakdown: [
          { rating: 5, count: 28 },
          { rating: 4, count: 12 },
          { rating: 3, count: 3 },
          { rating: 2, count: 0 },
          { rating: 1, count: 0 }
        ]
      };
      setStats(mockStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>Loading performance data...</Text>
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.text }]}>Failed to load performance data</Text>
      </View>
    );
  }

  const completionRate = ((stats.completedJobs / stats.totalJobs) * 100).toFixed(1);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.content}>
        {/* Overview Stats */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>📊 Overview</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.primary }]}>{stats.totalJobs}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Total Jobs</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.primary }]}>{stats.completedJobs}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Completed</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.primary }]}>{completionRate}%</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Success Rate</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.primary }]}>${stats.totalSpent.toLocaleString()}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Total Spent</Text>
            </View>
          </View>
        </View>

        {/* Rating */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>⭐ Average Rating</Text>
          <View style={styles.ratingDisplay}>
            <StarRating rating={stats.avgRating} size={24} />
            <Text style={[styles.ratingText, { color: theme.colors.text }]}>{stats.avgRating.toFixed(1)}</Text>
          </View>
        </View>

        {/* Most Used Trades */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>🔨 Most Used Trades</Text>
          {stats.mostUsedTrades.map((trade, index) => (
            <View key={trade.trade} style={styles.tradeItem}>
              <Text style={[styles.tradeName, { color: theme.colors.text }]}>{trade.trade}</Text>
              <View style={styles.tradeStats}>
                <Text style={[styles.tradeCount, { color: theme.colors.textSecondary }]}>{trade.count} jobs</Text>
                <View style={[styles.tradeBar, { backgroundColor: theme.colors.border }]}>
                  <View 
                    style={[styles.tradeBarFill, { 
                      backgroundColor: theme.colors.primary,
                      width: `${(trade.count / stats.mostUsedTrades[0].count) * 100}%`
                    }]} 
                  />
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Rating Breakdown */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>📈 Rating Breakdown</Text>
          {stats.ratingBreakdown.map((item) => (
            <View key={item.rating} style={styles.ratingItem}>
              <View style={styles.ratingStars}>
                <StarRating rating={item.rating} size={16} />
              </View>
              <View style={styles.ratingStats}>
                <Text style={[styles.ratingCount, { color: theme.colors.textSecondary }]}>{item.count}</Text>
                <View style={[styles.ratingBar, { backgroundColor: theme.colors.border }]}>
                  <View 
                    style={[styles.ratingBarFill, { 
                      backgroundColor: theme.colors.primary,
                      width: `${(item.count / stats.completedJobs) * 100}%`
                    }]} 
                  />
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* AI Crew Optimizer Preview */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>🤖 AI Crew Optimizer</Text>
          <SimpleAICrewOptimizer />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 16 },
  section: { borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statItem: { width: '48%', alignItems: 'center', marginBottom: 16 },
  statValue: { fontSize: 24, fontWeight: 'bold' },
  statLabel: { fontSize: 12, marginTop: 4 },
  ratingDisplay: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  ratingText: { fontSize: 20, fontWeight: 'bold', marginLeft: 8 },
  tradeItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  tradeName: { fontSize: 16, fontWeight: '500', flex: 1 },
  tradeStats: { flex: 1, alignItems: 'flex-end' },
  tradeCount: { fontSize: 12, marginBottom: 4 },
  tradeBar: { width: 80, height: 4, borderRadius: 2 },
  tradeBarFill: { height: '100%', borderRadius: 2 },
  ratingItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  ratingStars: { width: 100 },
  ratingStats: { flex: 1, alignItems: 'flex-end' },
  ratingCount: { fontSize: 12, marginBottom: 4 },
  ratingBar: { width: 60, height: 4, borderRadius: 2 },
  ratingBarFill: { height: '100%', borderRadius: 2 },
  loadingText: { textAlign: 'center', fontSize: 16, marginTop: 40 },
  errorText: { textAlign: 'center', fontSize: 16, marginTop: 40 }
});