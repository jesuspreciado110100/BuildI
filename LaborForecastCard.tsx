import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LaborDemandForecast } from '../types';

interface LaborForecastCardProps {
  forecast: LaborDemandForecast;
  onPlanHiring: (forecast: LaborDemandForecast) => void;
}

export const LaborForecastCard: React.FC<LaborForecastCardProps> = ({ forecast, onPlanHiring }) => {
  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return '#4CAF50';
    if (score >= 0.6) return '#FF9800';
    return '#F44336';
  };

  const formatTradeType = (trade: string) => {
    return trade.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.tradeType}>{formatTradeType(forecast.trade_type)}</Text>
        <View style={[styles.confidenceBadge, { backgroundColor: getConfidenceColor(forecast.confidence_score) }]}>
          <Text style={styles.confidenceText}>{Math.round(forecast.confidence_score * 100)}%</Text>
        </View>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.workersText}>
          Predicted Workers: <Text style={styles.workersCount}>{forecast.predicted_workers}</Text>
        </Text>
        <Text style={styles.dateText}>
          Forecast Date: {new Date(forecast.forecast_date).toLocaleDateString()}
        </Text>
      </View>
      
      <TouchableOpacity 
        style={styles.planButton}
        onPress={() => onPlanHiring(forecast)}
      >
        <Text style={styles.planButtonText}>Plan Hiring</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
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
    marginBottom: 12,
  },
  tradeType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidenceText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    marginBottom: 16,
  },
  workersText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  workersCount: {
    fontWeight: '600',
    color: '#333',
  },
  dateText: {
    fontSize: 12,
    color: '#999',
  },
  planButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  planButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});