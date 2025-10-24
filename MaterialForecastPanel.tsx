import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { MaterialForecast } from '../types';
import MaterialForecastService from '../services/MaterialForecastService';
import AnimatedProgressBar from './AnimatedProgressBar';
import AnimatedButton from './AnimatedButton';

interface MaterialForecastPanelProps {
  siteId: string;
  onReorderRequest?: (materialId: string, quantity: number) => void;
}

const MaterialForecastPanel: React.FC<MaterialForecastPanelProps> = ({ siteId, onReorderRequest }) => {
  const [forecasts, setForecasts] = useState<MaterialForecast[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadForecasts();
  }, [siteId]);

  const loadForecasts = async () => {
    try {
      setLoading(true);
      const data = await MaterialForecastService.analyzeUsage(siteId);
      setForecasts(data);
    } catch (error) {
      console.error('Error loading forecasts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAlertColor = (level: string) => {
    switch (level) {
      case 'critical': return '#FF4444';
      case 'high': return '#FF8800';
      case 'medium': return '#FFBB00';
      default: return '#00AA00';
    }
  };

  const handleReorder = (forecast: MaterialForecast) => {
    Alert.alert(
      'Reorder Material',
      `Reorder ${forecast.suggested_reorder_quantity} ${forecast.material_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reorder',
          onPress: () => onReorderRequest?.(forecast.material_id, forecast.suggested_reorder_quantity)
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading forecasts...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Material Forecast</Text>
      
      {forecasts.map((forecast) => (
        <View key={forecast.material_id} style={styles.forecastCard}>
          <View style={styles.header}>
            <Text style={styles.materialName}>{forecast.material_name}</Text>
            <View style={[styles.alertBadge, { backgroundColor: getAlertColor(forecast.alert_level) }]}>
              <Text style={styles.alertText}>{forecast.alert_level.toUpperCase()}</Text>
            </View>
          </View>
          
          <View style={styles.stockInfo}>
            <Text style={styles.stockText}>Current Stock: {forecast.current_stock}</Text>
            <AnimatedProgressBar 
              progress={Math.min(1, forecast.current_stock / 100)} 
              color={getAlertColor(forecast.alert_level)}
            />
          </View>
          
          <View style={styles.metrics}>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Usage Rate</Text>
              <Text style={styles.metricValue}>{forecast.daily_usage_rate.toFixed(1)}/day</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Depletion</Text>
              <Text style={styles.metricValue}>{forecast.days_until_depletion} days</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Confidence</Text>
              <Text style={styles.metricValue}>{Math.round(forecast.forecast_confidence * 100)}%</Text>
            </View>
          </View>
          
          {forecast.related_concepts.length > 0 && (
            <View style={styles.concepts}>
              <Text style={styles.conceptsLabel}>Related Concepts:</Text>
              <Text style={styles.conceptsText}>{forecast.related_concepts.join(', ')}</Text>
            </View>
          )}
          
          {forecast.reorder_suggestion && (
            <View style={styles.reorderSection}>
              <Text style={styles.reorderText}>⚠️ Reorder recommended</Text>
              <AnimatedButton
                title={`Reorder ${forecast.suggested_reorder_quantity} units`}
                onPress={() => handleReorder(forecast)}
                style={styles.reorderButton}
              />
            </View>
          )}
        </View>
      ))}
      
      {forecasts.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No materials to forecast</Text>
        </View>
      )}
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333'
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 50
  },
  forecastCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
    marginBottom: 12
  },
  materialName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1
  },
  alertBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  alertText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold'
  },
  stockInfo: {
    marginBottom: 16
  },
  stockText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8
  },
  metrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  metric: {
    flex: 1,
    alignItems: 'center'
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },
  concepts: {
    marginBottom: 12
  },
  conceptsLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4
  },
  conceptsText: {
    fontSize: 14,
    color: '#333'
  },
  reorderSection: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12
  },
  reorderText: {
    fontSize: 14,
    color: '#FF8800',
    fontWeight: 'bold',
    marginBottom: 8
  },
  reorderButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 50
  },
  emptyText: {
    fontSize: 16,
    color: '#666'
  }
});

export default MaterialForecastPanel;