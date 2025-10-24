import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ScoreMetric {
  label: string;
  value: number;
  unit: string;
}

interface ContractorScoreCardProps {
  metrics?: ScoreMetric[];
}

function getBadgeInfo(overallScore: number) {
  if (overallScore >= 90) return { badge: '🥇', level: 'Gold', color: '#FFD700' };
  if (overallScore >= 75) return { badge: '🥈', level: 'Silver', color: '#C0C0C0' };
  return { badge: '🥉', level: 'Bronze', color: '#CD7F32' };
}

export function ContractorScoreCard({ metrics }: ContractorScoreCardProps) {
  const defaultMetrics: ScoreMetric[] = [
    { label: 'On-time Bookings', value: 92, unit: '%' },
    { label: 'Progress Rate', value: 88, unit: '%' },
    { label: 'Budget Adherence', value: 95, unit: '%' },
    { label: 'Crew Rating Avg', value: 4.6, unit: '/5' }
  ];

  const displayMetrics = metrics || defaultMetrics;
  const overallScore = displayMetrics.reduce((sum, m) => sum + (m.unit === '%' ? m.value : m.value * 20), 0) / displayMetrics.length;
  const badgeInfo = getBadgeInfo(overallScore);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Performance Score</Text>
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeIcon}>{badgeInfo.badge}</Text>
          <Text style={[styles.badgeText, { color: badgeInfo.color }]}>{badgeInfo.level}</Text>
        </View>
      </View>
      
      <View style={styles.scoreContainer}>
        <Text style={styles.overallScore}>{Math.round(overallScore)}</Text>
        <Text style={styles.scoreLabel}>Overall Score</Text>
      </View>

      <View style={styles.metricsContainer}>
        {displayMetrics.map((metric, index) => (
          <View key={index} style={styles.metricRow}>
            <Text style={styles.metricLabel}>{metric.label}</Text>
            <Text style={styles.metricValue}>{metric.value}{metric.unit}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  badgeIcon: {
    fontSize: 24,
    marginRight: 8
  },
  badgeText: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 20
  },
  overallScore: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2563eb'
  },
  scoreLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4
  },
  metricsContainer: {
    gap: 12
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  metricLabel: {
    fontSize: 14,
    color: '#666'
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  }
});