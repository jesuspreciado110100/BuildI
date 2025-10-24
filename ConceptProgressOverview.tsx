import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AnimatedProgressBar } from './AnimatedProgressBar';

interface ConceptProgressOverviewProps {
  conceptName: string;
  volumeCompleted: number;
  totalVolume: number;
  quantityPlanned: number;
  quantityExecuted: number;
  unit: string;
  unitPrice: number;
  totalCost: number;
  progress: number;
}

export const ConceptProgressOverview: React.FC<ConceptProgressOverviewProps> = ({
  conceptName,
  volumeCompleted,
  totalVolume,
  quantityPlanned,
  quantityExecuted,
  unit,
  unitPrice,
  totalCost,
  progress
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{conceptName}</Text>
      
      <View style={styles.progressSection}>
        <Text style={styles.progressLabel}>Progress Overview</Text>
        <AnimatedProgressBar 
          progress={progress} 
          height={24}
          showPercentage={true}
          color="#4CAF50"
        />
        <Text style={styles.progressText}>
          {volumeCompleted.toFixed(1)} / {totalVolume.toFixed(1)} {unit} completed
        </Text>
      </View>

      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Planned</Text>
          <Text style={styles.metricValue}>{quantityPlanned} {unit}</Text>
        </View>
        
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Executed</Text>
          <Text style={styles.metricValue}>{quantityExecuted} {unit}</Text>
        </View>
        
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Unit Price</Text>
          <Text style={styles.metricValue}>${unitPrice.toFixed(2)}</Text>
        </View>
        
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Total Cost</Text>
          <Text style={styles.metricValue}>${totalCost.toLocaleString()}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16
  },
  progressSection: {
    marginBottom: 20
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  }
});