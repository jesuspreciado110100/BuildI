import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CostForecast } from '../types';

interface CostRiskCardProps {
  forecast: CostForecast;
  conceptName: string;
  onPress?: () => void;
}

const CostRiskCard: React.FC<CostRiskCardProps> = ({ forecast, conceptName, onPress }) => {
  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return '#ff4444';
      case 'medium': return '#ff8800';
      case 'low': return '#44aa44';
      default: return '#666';
    }
  };

  const isOverBudget = forecast.variance_percentage > 0;
  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.conceptName}>{conceptName}</Text>
        <View style={[styles.riskBadge, { backgroundColor: getRiskColor(forecast.risk_level) }]}>
          <Text style={styles.riskText}>{forecast.risk_level.toUpperCase()}</Text>
        </View>
      </View>
      
      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={styles.label}>Forecasted Cost:</Text>
          <Text style={styles.value}>{formatCurrency(forecast.forecast_total_cost)}</Text>
        </View>
        
        <View style={styles.row}>
          <Text style={styles.label}>Budgeted Cost:</Text>
          <Text style={styles.value}>{formatCurrency(forecast.budgeted_cost)}</Text>
        </View>
        
        <View style={styles.row}>
          <Text style={styles.label}>Confidence:</Text>
          <Text style={styles.value}>{forecast.confidence_score}%</Text>
        </View>
        
        {isOverBudget && (
          <View style={styles.warningContainer}>
            <Text style={styles.warningText}>
              ⚠️ Over budget by {Math.abs(forecast.variance_percentage)}%
            </Text>
          </View>
        )}
        
        <View style={styles.varianceRow}>
          <Text style={styles.label}>Variance:</Text>
          <Text style={[
            styles.varianceText,
            { color: forecast.variance_percentage > 0 ? '#ff4444' : '#44aa44' }
          ]}>
            {forecast.variance_percentage > 0 ? '+' : ''}{forecast.variance_percentage}%
          </Text>
        </View>
      </View>
    </TouchableOpacity>
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
  conceptName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  riskText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  warningContainer: {
    backgroundColor: '#fff3cd',
    padding: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  warningText: {
    color: '#856404',
    fontSize: 12,
    fontWeight: '600',
  },
  varianceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  varianceText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default CostRiskCard;