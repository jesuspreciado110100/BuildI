import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { CostPrediction, DelaySimulation } from '../types';
import CostForecastService from '../services/CostForecastService';

interface CostRiskPanelProps {
  siteId: string;
}

const CostRiskPanel: React.FC<CostRiskPanelProps> = ({ siteId }) => {
  const [predictions, setPredictions] = useState<CostPrediction[]>([]);
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null);
  const [delaySimulation, setDelaySimulation] = useState<DelaySimulation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPredictions();
  }, [siteId]);

  const loadPredictions = async () => {
    try {
      const data = await CostForecastService.getPredictedCost(siteId);
      setPredictions(data);
    } catch (error) {
      console.error('Error loading predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  const simulateDelay = async (conceptId: string, days: number) => {
    try {
      const simulation = await CostForecastService.simulateTradeDelay(conceptId, days);
      setDelaySimulation(simulation);
      setSelectedConcept(conceptId);
    } catch (error) {
      console.error('Error simulating delay:', error);
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return '#ff4444';
      case 'medium': return '#ffaa00';
      case 'low': return '#00aa00';
      default: return '#666666';
    }
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString()}`;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading cost predictions...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Cost Risk Analysis</Text>
      
      {predictions.map((prediction) => (
        <View key={prediction.concept_id} style={styles.conceptCard}>
          <View style={styles.conceptHeader}>
            <Text style={styles.conceptName}>Concept {prediction.concept_id}</Text>
            <View style={[styles.riskBadge, { backgroundColor: getRiskColor(prediction.risk_level) }]}>
              <Text style={styles.riskText}>{prediction.risk_level.toUpperCase()}</Text>
            </View>
          </View>
          
          <View style={styles.costComparison}>
            <View style={styles.costItem}>
              <Text style={styles.costLabel}>Forecasted Cost</Text>
              <Text style={styles.costValue}>{formatCurrency(prediction.predicted_cost)}</Text>
            </View>
            <View style={styles.costItem}>
              <Text style={styles.costLabel}>Variance</Text>
              <Text style={[styles.costValue, { color: prediction.overrun_percentage > 0 ? '#ff4444' : '#00aa00' }]}>
                {prediction.overrun_percentage > 0 ? '+' : ''}{prediction.overrun_percentage}%
              </Text>
            </View>
          </View>

          <Text style={styles.riskReason}>{prediction.risk_reason}</Text>

          <View style={styles.delaySimulationSection}>
            <Text style={styles.sectionTitle}>Delay Impact Simulation</Text>
            <View style={styles.delayButtons}>
              <TouchableOpacity 
                style={styles.delayButton}
                onPress={() => simulateDelay(prediction.concept_id, 2)}
              >
                <Text style={styles.delayButtonText}>+2 days</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.delayButton}
                onPress={() => simulateDelay(prediction.concept_id, 5)}
              >
                <Text style={styles.delayButtonText}>+5 days</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.delayButton}
                onPress={() => simulateDelay(prediction.concept_id, 10)}
              >
                <Text style={styles.delayButtonText}>+10 days</Text>
              </TouchableOpacity>
            </View>
          </View>

          {selectedConcept === prediction.concept_id && delaySimulation && (
            <View style={styles.simulationResult}>
              <Text style={styles.simulationTitle}>Delay Impact: +{delaySimulation.delay_days} days</Text>
              <Text style={styles.simulationCost}>Cost Delta: {formatCurrency(delaySimulation.cost_delta)}</Text>
              <Text style={styles.simulationTimeline}>Timeline Impact: +{delaySimulation.timeline_impact} days</Text>
              
              {delaySimulation.cascade_effects.length > 0 && (
                <View style={styles.cascadeSection}>
                  <Text style={styles.cascadeTitle}>Cascade Effects:</Text>
                  {delaySimulation.cascade_effects.map((effect, index) => (
                    <Text key={index} style={styles.cascadeItem}>
                      {effect.trade}: +{effect.additional_delay} days, {formatCurrency(effect.cost_impact)}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>
      ))}
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
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
    color: '#666'
  },
  conceptCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  conceptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  conceptName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4
  },
  riskText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold'
  },
  costComparison: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  costItem: {
    flex: 1
  },
  costLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4
  },
  costValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },
  riskReason: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    fontStyle: 'italic'
  },
  delaySimulationSection: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 16
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333'
  },
  delayButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  delayButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4
  },
  delayButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold'
  },
  simulationResult: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 4
  },
  simulationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4
  },
  simulationCost: {
    fontSize: 14,
    color: '#ff4444',
    marginBottom: 2
  },
  simulationTimeline: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8
  },
  cascadeSection: {
    marginTop: 8
  },
  cascadeTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4
  },
  cascadeItem: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8
  }
});

export default CostRiskPanel;