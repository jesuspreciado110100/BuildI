import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ConstructionConcept, BenchmarkingMetrics } from '../types';
import { ConceptBenchmarkService } from '../services/ConceptBenchmarkService';

interface ConceptPerformancePanelProps {
  concept: ConstructionConcept;
  industryAverages?: BenchmarkingMetrics;
}

export const ConceptPerformancePanel: React.FC<ConceptPerformancePanelProps> = ({
  concept,
  industryAverages
}) => {
  const metrics = concept.benchmarking_metrics;
  const badges = ConceptBenchmarkService.getBenchmarkBadges(concept);

  if (!metrics) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Performance Metrics</Text>
        <Text style={styles.noData}>No benchmarking data available</Text>
      </View>
    );
  }

  const renderMetricCard = (title: string, value: number, unit: string, avgValue?: number) => {
    const isAboveAverage = avgValue ? value > avgValue : false;
    const percentDiff = avgValue ? ((value - avgValue) / avgValue * 100) : 0;

    return (
      <View style={styles.metricCard}>
        <Text style={styles.metricTitle}>{title}</Text>
        <Text style={styles.metricValue}>{value.toFixed(1)} {unit}</Text>
        {avgValue && (
          <View style={styles.comparisonRow}>
            <Text style={styles.avgText}>Avg: {avgValue.toFixed(1)} {unit}</Text>
            <Text style={[styles.diffText, isAboveAverage ? styles.positive : styles.negative]}>
              {percentDiff > 0 ? '+' : ''}{percentDiff.toFixed(1)}%
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Performance Metrics</Text>
      
      {/* Performance Badges */}
      {badges.length > 0 && (
        <View style={styles.badgesContainer}>
          {badges.map((badge, index) => (
            <View key={index} style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Metrics Grid */}
      <View style={styles.metricsGrid}>
        {renderMetricCard(
          'Output Rate',
          metrics.unit_output_rate,
          `${concept.unit}/day`,
          industryAverages?.unit_output_rate
        )}
        
        {renderMetricCard(
          'Avg Workers',
          metrics.avg_worker_count,
          'workers',
          industryAverages?.avg_worker_count
        )}
        
        {renderMetricCard(
          'Cost per Unit',
          metrics.cost_per_unit,
          '$',
          industryAverages?.cost_per_unit
        )}
        
        {renderMetricCard(
          'Material Waste',
          metrics.material_waste_pct,
          '%',
          industryAverages?.material_waste_pct
        )}
        
        {renderMetricCard(
          'Duration',
          metrics.completion_duration,
          'days',
          industryAverages?.completion_duration
        )}
        
        {renderMetricCard(
          'Satisfaction',
          metrics.satisfaction_score,
          '/5',
          industryAverages?.satisfaction_score
        )}
      </View>

      {/* Timeline Efficiency */}
      <View style={styles.timelineSection}>
        <Text style={styles.sectionTitle}>Timeline Efficiency</Text>
        <View style={styles.timelineBar}>
          <View 
            style={[
              styles.timelineProgress,
              { width: `${Math.min(100, (concept.estimated_duration / metrics.completion_duration) * 100)}%` }
            ]}
          />
        </View>
        <Text style={styles.timelineText}>
          {metrics.completion_duration} days (Est: {concept.estimated_duration} days)
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333'
  },
  noData: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 50
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16
  },
  badge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8
  },
  badgeText: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: '600'
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  metricCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  metricTitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  avgText: {
    fontSize: 10,
    color: '#999'
  },
  diffText: {
    fontSize: 10,
    fontWeight: '600'
  },
  positive: {
    color: '#4caf50'
  },
  negative: {
    color: '#f44336'
  },
  timelineSection: {
    marginTop: 20,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333'
  },
  timelineBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 8
  },
  timelineProgress: {
    height: '100%',
    backgroundColor: '#4caf50',
    borderRadius: 4
  },
  timelineText: {
    fontSize: 12,
    color: '#666'
  }
});