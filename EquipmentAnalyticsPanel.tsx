import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { EquipmentAnalytics } from '../types';
import { EquipmentAnalyticsService } from '../services/EquipmentAnalyticsService';

interface EquipmentAnalyticsPanelProps {
  machineryId?: string;
  showAll?: boolean;
}

export const EquipmentAnalyticsPanel: React.FC<EquipmentAnalyticsPanelProps> = ({ 
  machineryId, 
  showAll = false 
}) => {
  const [analytics, setAnalytics] = useState<EquipmentAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMachine, setSelectedMachine] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, [machineryId, showAll]);

  const loadAnalytics = async () => {
    try {
      const service = EquipmentAnalyticsService.getInstance();
      if (showAll) {
        const allAnalytics = await service.getAllEquipmentAnalytics();
        setAnalytics(allAnalytics);
      } else if (machineryId) {
        const singleAnalytics = await service.getUtilizationStats(machineryId);
        setAnalytics([singleAnalytics]);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUtilizationColor = (level: string) => {
    switch (level) {
      case 'high': return '#4CAF50';
      case 'normal': return '#FF9800';
      case 'low': return '#f44336';
      default: return '#9E9E9E';
    }
  };

  const getAlertColor = (level: string) => {
    switch (level) {
      case 'critical': return '#f44336';
      case 'warning': return '#FF9800';
      default: return '#4CAF50';
    }
  };

  const renderUsageChart = (analytics: EquipmentAnalytics) => {
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Last 7 Days Usage</Text>
        <View style={styles.chartBars}>
          {analytics.usage_history.map((day, index) => {
            const maxHeight = 60;
            const activeHeight = (day.active_hours / 12) * maxHeight;
            const idleHeight = (day.idle_hours / 12) * maxHeight;
            
            return (
              <View key={index} style={styles.barContainer}>
                <View style={styles.barStack}>
                  <View style={[styles.barActive, { height: activeHeight }]} />
                  <View style={[styles.barIdle, { height: idleHeight }]} />
                </View>
                <Text style={styles.barLabel}>
                  {new Date(day.date).getDate()}
                </Text>
              </View>
            );
          })}
        </View>
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#4CAF50' }]} />
            <Text style={styles.legendText}>Active</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#FF9800' }]} />
            <Text style={styles.legendText}>Idle</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderMachineCard = (equipment: EquipmentAnalytics) => {
    const isExpanded = selectedMachine === equipment.machinery_id;
    
    return (
      <View key={equipment.machinery_id} style={styles.machineCard}>
        <TouchableOpacity 
          style={styles.machineHeader}
          onPress={() => setSelectedMachine(isExpanded ? null : equipment.machinery_id)}
        >
          <View style={styles.machineInfo}>
            <Text style={styles.machineName}>{equipment.machinery_name}</Text>
            <View style={styles.badgeContainer}>
              <View style={[
                styles.utilizationBadge, 
                { backgroundColor: getUtilizationColor(equipment.utilization_level) }
              ]}>
                <Text style={styles.badgeText}>
                  {equipment.utilization_level.toUpperCase()}
                </Text>
              </View>
              {equipment.alert_level !== 'none' && (
                <View style={[
                  styles.alertBadge,
                  { backgroundColor: getAlertColor(equipment.alert_level) }
                ]}>
                  <Text style={styles.badgeText}>
                    {equipment.alert_level.toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
          </View>
          <Text style={styles.utilizationScore}>
            {equipment.utilization_score}%
          </Text>
        </TouchableOpacity>
        
        {isExpanded && (
          <View style={styles.expandedContent}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Daily Usage</Text>
                <Text style={styles.statValue}>{equipment.daily_usage_hours}h</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Avg Idle Time</Text>
                <Text style={styles.statValue}>{equipment.avg_idle_time}h</Text>
              </View>
            </View>
            
            {equipment.predicted_downtime_date && (
              <View style={styles.warningContainer}>
                <Text style={styles.warningText}>
                  ⚠️ Predicted downtime: {equipment.predicted_downtime_date}
                </Text>
              </View>
            )}
            
            {equipment.maintenance_suggestion && (
              <View style={styles.suggestionContainer}>
                <Text style={styles.suggestionText}>
                  🔧 Maintenance suggested (utilization > 80%)
                </Text>
              </View>
            )}
            
            {renderUsageChart(equipment)}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading analytics...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Equipment Analytics</Text>
        <Text style={styles.subtitle}>
          {showAll ? 'All Equipment' : 'Single Machine'} Performance
        </Text>
      </View>
      
      {analytics.map(renderMachineCard)}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  loadingText: {
    textAlign: 'center',
    padding: 20,
    color: '#666',
  },
  machineCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  machineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  machineInfo: {
    flex: 1,
  },
  machineName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  utilizationBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  alertBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  utilizationScore: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  expandedContent: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  warningContainer: {
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
  },
  warningText: {
    color: '#856404',
    fontSize: 14,
  },
  suggestionContainer: {
    backgroundColor: '#d4edda',
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
  },
  suggestionText: {
    color: '#155724',
    fontSize: 14,
  },
  chartContainer: {
    marginTop: 16,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 80,
    marginBottom: 8,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  barStack: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 60,
  },
  barActive: {
    width: 20,
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  barIdle: {
    width: 20,
    backgroundColor: '#FF9800',
    borderRadius: 2,
  },
  barLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
});