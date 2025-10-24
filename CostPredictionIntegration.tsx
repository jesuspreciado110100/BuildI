import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import CostForecastService from '../services/CostForecastService';
import CostNotificationService from '../services/CostNotificationService';
import MarginWarningModal from './MarginWarningModal';
import { CostPrediction } from '../types';

interface CostPredictionIntegrationProps {
  userId: string;
  siteId: string;
  onQuoteSubmission?: (quoteData: any) => void;
}

const CostPredictionIntegration: React.FC<CostPredictionIntegrationProps> = ({
  userId,
  siteId,
  onQuoteSubmission
}) => {
  const [predictions, setPredictions] = useState<CostPrediction[]>([]);
  const [showMarginWarning, setShowMarginWarning] = useState(false);
  const [marginWarningData, setMarginWarningData] = useState({
    message: '',
    marginDrop: 0,
    delayDays: 0
  });
  const [pendingQuoteData, setPendingQuoteData] = useState<any>(null);

  useEffect(() => {
    initializeCostMonitoring();
  }, [userId, siteId]);

  const initializeCostMonitoring = async () => {
    try {
      // Load initial predictions
      const initialPredictions = await CostForecastService.getPredictedCost(siteId);
      setPredictions(initialPredictions);
      
      // Start monitoring for notifications
      await CostNotificationService.monitorCostPredictions(userId, siteId);
      
      // Schedule periodic reviews
      await CostNotificationService.schedulePeriodicCostReview(userId, siteId);
    } catch (error) {
      console.error('Error initializing cost monitoring:', error);
    }
  };

  const checkMarginRisk = async (quoteData: any) => {
    try {
      // Simulate potential delays and margin impact
      const delayDays = Math.floor(Math.random() * 5) + 1; // 1-5 days
      const marginDrop = Math.floor(Math.random() * 15) + 3; // 3-18%
      
      if (marginDrop > 8) {
        setMarginWarningData({
          message: `If trade delays ${delayDays} days, margin drops ${marginDrop}%`,
          marginDrop,
          delayDays
        });
        setPendingQuoteData(quoteData);
        setShowMarginWarning(true);
        
        // Send margin risk notification
        await CostNotificationService.sendMarginRiskWarning(userId, marginDrop, delayDays);
        return false; // Don't proceed with quote yet
      }
      
      return true; // Safe to proceed
    } catch (error) {
      console.error('Error checking margin risk:', error);
      return true; // Proceed if error
    }
  };

  const handleQuoteSubmission = async (quoteData: any) => {
    const canProceed = await checkMarginRisk(quoteData);
    
    if (canProceed && onQuoteSubmission) {
      onQuoteSubmission(quoteData);
    }
  };

  const handleMarginWarningProceed = () => {
    setShowMarginWarning(false);
    if (pendingQuoteData && onQuoteSubmission) {
      onQuoteSubmission(pendingQuoteData);
    }
    setPendingQuoteData(null);
  };

  const handleMarginWarningClose = () => {
    setShowMarginWarning(false);
    setPendingQuoteData(null);
  };

  const simulateDelayImpact = async (conceptId: string, delayDays: number) => {
    try {
      const simulation = await CostForecastService.simulateTradeDelay(conceptId, delayDays);
      
      Alert.alert(
        'Delay Impact Simulation',
        `${delayDays} day delay would cost $${simulation.cost_delta.toLocaleString()} with ${simulation.timeline_impact} day timeline impact`,
        [{ text: 'OK' }]
      );
      
      // Send simulation alert
      await CostNotificationService.sendDelaySimulationAlert(userId, simulation);
    } catch (error) {
      console.error('Error simulating delay impact:', error);
    }
  };

  // Expose methods for parent components
  React.useImperativeHandle(React.useRef(), () => ({
    checkMarginRisk,
    handleQuoteSubmission,
    simulateDelayImpact
  }));

  return (
    <View style={styles.container}>
      <MarginWarningModal
        visible={showMarginWarning}
        onClose={handleMarginWarningClose}
        onProceed={handleMarginWarningProceed}
        warningMessage={marginWarningData.message}
        marginDrop={marginWarningData.marginDrop}
        delayDays={marginWarningData.delayDays}
      />
      
      {predictions.length > 0 && (
        <View style={styles.predictionSummary}>
          <Text style={styles.summaryText}>
            AI Cost Monitoring Active: {predictions.filter(p => p.risk_level === 'high').length} high-risk concepts
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000
  },
  predictionSummary: {
    backgroundColor: '#fff3cd',
    padding: 8,
    borderRadius: 4,
    margin: 8
  },
  summaryText: {
    fontSize: 12,
    color: '#856404',
    textAlign: 'center'
  }
});

export default CostPredictionIntegration;