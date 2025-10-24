import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LaborPerformanceMetrics } from '../types';
import { LaborPerformanceService } from '../services/LaborPerformanceService';

interface WorkerLeaderboardPanelProps {
  onWorkerSelect?: (workerId: string) => void;
}

export const WorkerLeaderboardPanel: React.FC<WorkerLeaderboardPanelProps> = ({ onWorkerSelect }) => {
  const [metrics, setMetrics] = useState<LaborPerformanceMetrics[]>([]);
  const [sortBy, setSortBy] = useState<'rating' | 'output' | 'jobs'>('rating');
  const [filterTrade, setFilterTrade] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const trades = ['all', 'Masonry', 'Electrical', 'Plumbing', 'Carpentry'];

  useEffect(() => {
    loadMetrics();
  }, [filterTrade]);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const data = await LaborPerformanceService.getAllWorkerMetrics(
        filterTrade === 'all' ? undefined : filterTrade
      );
      setMetrics(data);
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const sortedMetrics = [...metrics].sort((a, b) => {
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

  const renderWorkerRow = (worker: LaborPerformanceMetrics, index: number) => (
    <TouchableOpacity
      key={worker.worker_id}
      style={styles.workerRow}
      onPress={() => onWorkerSelect?.(worker.worker_id)}
    >
      <View style={styles.rankContainer}>
        <Text style={styles.rank}>#{index + 1}</Text>
      </View>
      
      <View style={styles.workerInfo}>
        <Text style={styles.workerName}>Worker {worker.worker_id}</Text>
        <Text style={styles.trade}>{worker.trade}</Text>
        <View style={styles.badgeContainer}>
          {worker.badges.map((badge, i) => (
            <Text key={i} style={styles.badge}>{badge}</Text>
          ))}
        </View>
      </View>
      
      <View style={styles.metricsContainer}>
        <Text style={styles.metric}>{worker.avg_output_per_day.toFixed(1)} units/day</Text>
        <Text style={styles.metric}>⭐ {worker.avg_rating.toFixed(1)}</Text>
        <Text style={styles.metric}>{worker.completed_jobs_count} jobs</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading leaderboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Worker Leaderboard</Text>
      
      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {trades.map(trade => (
            <TouchableOpacity
              key={trade}
              style={[styles.filterButton, filterTrade === trade && styles.activeFilter]}
              onPress={() => setFilterTrade(trade)}
            >
              <Text style={[styles.filterText, filterTrade === trade && styles.activeFilterText]}>
                {trade === 'all' ? 'All Trades' : trade}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
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
      
      {/* Leaderboard */}
      <ScrollView style={styles.leaderboard}>
        {sortedMetrics.map((worker, index) => renderWorkerRow(worker, index))}
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
  filtersContainer: {
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 20,
  },
  activeFilter: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    fontSize: 14,
    color: '#333',
  },
  activeFilterText: {
    color: 'white',
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
  leaderboard: {
    flex: 1,
  },
  workerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
  },
  rank: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  workerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  workerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  trade: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  badge: {
    fontSize: 12,
    marginRight: 8,
    marginBottom: 2,
  },
  metricsContainer: {
    alignItems: 'flex-end',
  },
  metric: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
});