import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import MaterialForecastService from '../services/MaterialForecastService';
import MaterialNotificationService from '../services/MaterialNotificationService';
import { MaterialForecast } from '../types';
import MaterialForecastPanel from './MaterialForecastPanel';
import AnimatedButton from './AnimatedButton';

interface MaterialForecastIntegrationProps {
  siteId: string;
  contractorId: string;
  supplierId?: string;
  onReorderRequest?: (materialId: string, quantity: number) => void;
}

const MaterialForecastIntegration: React.FC<MaterialForecastIntegrationProps> = ({
  siteId,
  contractorId,
  supplierId,
  onReorderRequest
}) => {
  const [forecasts, setForecasts] = useState<MaterialForecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastNotificationCheck, setLastNotificationCheck] = useState<Date | null>(null);

  useEffect(() => {
    loadForecastsAndCheckNotifications();
    
    // Set up periodic checks every 30 minutes
    const interval = setInterval(loadForecastsAndCheckNotifications, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [siteId, contractorId]);

  const loadForecastsAndCheckNotifications = async () => {
    try {
      setLoading(true);
      
      // Load forecasts
      const forecastData = await MaterialForecastService.analyzeUsage(siteId);
      setForecasts(forecastData);
      
      // Check if we need to send notifications
      const now = new Date();
      const shouldSendNotifications = !lastNotificationCheck || 
        (now.getTime() - lastNotificationCheck.getTime()) > 60 * 60 * 1000; // 1 hour
      
      if (shouldSendNotifications && forecastData.length > 0) {
        await MaterialNotificationService.sendBulkForecastNotifications(
          forecastData,
          contractorId,
          supplierId
        );
        setLastNotificationCheck(now);
      }
    } catch (error) {
      console.error('Error loading forecasts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReorderRequest = async (materialId: string, quantity: number) => {
    try {
      // Call the parent callback if provided
      if (onReorderRequest) {
        onReorderRequest(materialId, quantity);
      }
      
      // Find the material forecast
      const forecast = forecasts.find(f => f.material_id === materialId);
      if (forecast) {
        // Send reorder suggestion notification
        await MaterialNotificationService.sendReorderSuggestion(
          contractorId,
          forecast.material_name,
          quantity,
          forecast.days_until_depletion
        );
        
        Alert.alert(
          'Reorder Requested',
          `Reorder request sent for ${quantity} units of ${forecast.material_name}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error handling reorder request:', error);
      Alert.alert('Error', 'Failed to process reorder request');
    }
  };

  const handleScheduleNotifications = async () => {
    try {
      await MaterialNotificationService.scheduleDailyForecastCheck(
        siteId,
        contractorId,
        supplierId
      );
      
      Alert.alert(
        'Notifications Scheduled',
        'Daily material forecast notifications have been enabled',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error scheduling notifications:', error);
      Alert.alert('Error', 'Failed to schedule notifications');
    }
  };

  const criticalMaterials = forecasts.filter(f => f.alert_level === 'critical' || f.alert_level === 'high');

  return (
    <View style={styles.container}>
      {criticalMaterials.length > 0 && (
        <View style={styles.alertBanner}>
          <Text style={styles.alertTitle}>⚠️ Material Alerts</Text>
          <Text style={styles.alertText}>
            {criticalMaterials.length} material{criticalMaterials.length > 1 ? 's' : ''} require attention
          </Text>
        </View>
      )}
      
      <MaterialForecastPanel
        siteId={siteId}
        onReorderRequest={handleReorderRequest}
      />
      
      <View style={styles.actionSection}>
        <AnimatedButton
          title="📅 Schedule Daily Alerts"
          onPress={handleScheduleNotifications}
          style={styles.scheduleButton}
        />
        
        <AnimatedButton
          title="🔄 Refresh Forecasts"
          onPress={loadForecastsAndCheckNotifications}
          style={styles.refreshButton}
        />
      </View>
      
      {lastNotificationCheck && (
        <Text style={styles.lastCheckText}>
          Last notification check: {lastNotificationCheck.toLocaleTimeString()}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  alertBanner: {
    backgroundColor: '#FFF3CD',
    borderColor: '#FFEAA7',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    margin: 16,
    marginBottom: 0
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 4
  },
  alertText: {
    fontSize: 14,
    color: '#856404'
  },
  actionSection: {
    padding: 16,
    flexDirection: 'row',
    gap: 12
  },
  scheduleButton: {
    flex: 1,
    backgroundColor: '#28A745'
  },
  refreshButton: {
    flex: 1,
    backgroundColor: '#007AFF'
  },
  lastCheckText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#666',
    paddingBottom: 16
  }
});

export default MaterialForecastIntegration;