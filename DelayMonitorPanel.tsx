import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { ConstructionConcept } from '../types';
import { DelayTrackerService } from '../services/DelayTrackerService';

interface DelayMonitorPanelProps {
  concepts: ConstructionConcept[];
}

const { width } = Dimensions.get('window');

export const DelayMonitorPanel: React.FC<DelayMonitorPanelProps> = ({ concepts }) => {
  const [delayTrends, setDelayTrends] = useState<Record<string, number>>({});
  const [reasonDistribution, setReasonDistribution] = useState<Record<string, number>>({});
  const [timelineData, setTimelineData] = useState<any[]>([]);

  useEffect(() => {
    const trends = DelayTrackerService.getDelayTrendsByTrade(concepts);
    const reasons = DelayTrackerService.getDelayReasonDistribution(concepts);
    const timeline = generateTimelineData(concepts);
    
    setDelayTrends(trends);
    setReasonDistribution(reasons);
    setTimelineData(timeline);
  }, [concepts]);

  const generateTimelineData = (concepts: ConstructionConcept[]) => {
    return concepts.map(concept => {
      const delayInfo = DelayTrackerService.calculateDelayStatus(concept);
      const plannedStart = concept.planned_start_date ? new Date(concept.planned_start_date) : new Date();
      const plannedEnd = concept.planned_end_date ? new Date(concept.planned_end_date) : 
        new Date(plannedStart.getTime() + delayInfo.planned_duration_days * 24 * 60 * 60 * 1000);
      
      return {
        id: concept.id,
        name: concept.name,
        plannedStart: plannedStart.toISOString().split('T')[0],
        plannedEnd: plannedEnd.toISOString().split('T')[0],
        actualEnd: delayInfo.forecasted_completion,
        isDelayed: delayInfo.is_delayed,
        delayDays: delayInfo.delay_days || 0
      };
    });
  };

  const renderTimelineView = () => {
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Timeline: Planned vs Actual</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.timelineContainer}>
            {timelineData.map((item, index) => (
              <View key={item.id} style={styles.timelineItem}>
                <Text style={styles.timelineLabel}>{item.name}</Text>
                <View style={styles.timelineBar}>
                  <View style={[styles.plannedBar, { width: 100 }]} />
                  {item.isDelayed && (
                    <View style={[styles.delayBar, { width: (item.delayDays / 30) * 50 }]} />
                  )}
                </View>
                <Text style={styles.timelineText}>
                  {item.plannedStart} - {item.plannedEnd}
                  {item.isDelayed && ` (+${item.delayDays}d)`}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderDelayTrendsChart = () => {
    const maxPercentage = Math.max(...Object.values(delayTrends));
    
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Delay Trends by Trade</Text>
        <View style={styles.barChartContainer}>
          {Object.entries(delayTrends).map(([trade, percentage]) => (
            <View key={trade} style={styles.barItem}>
              <View style={styles.barContainer}>
                <View 
                  style={[
                    styles.bar, 
                    { 
                      height: maxPercentage > 0 ? (percentage / maxPercentage) * 100 : 0,
                      backgroundColor: percentage > 50 ? '#ff4444' : percentage > 25 ? '#ffaa00' : '#44aa44'
                    }
                  ]} 
                />
              </View>
              <Text style={styles.barLabel}>{trade}</Text>
              <Text style={styles.barValue}>{percentage.toFixed(1)}%</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderReasonPieChart = () => {
    const total = Object.values(reasonDistribution).reduce((sum, count) => sum + count, 0);
    
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Delay Causes Distribution</Text>
        <View style={styles.pieContainer}>
          {Object.entries(reasonDistribution).map(([reason, count]) => {
            const percentage = total > 0 ? (count / total) * 100 : 0;
            return (
              <View key={reason} style={styles.pieItem}>
                <View style={[styles.pieIndicator, { backgroundColor: getReasonColor(reason) }]} />
                <Text style={styles.pieLabel}>{reason}</Text>
                <Text style={styles.pieValue}>{percentage.toFixed(1)}%</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const getReasonColor = (reason: string): string => {
    const colors: Record<string, string> = {
      'Labor shortage': '#ff4444',
      'Material delay': '#ffaa00', 
      'Weather': '#4444ff',
      'Crew absenteeism': '#aa44ff',
      'Design change': '#44ffaa'
    };
    return colors[reason] || '#888888';
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Delay Monitor Dashboard</Text>
      
      {renderTimelineView()}
      {renderDelayTrendsChart()}
      {renderReasonPieChart()}
      
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Summary</Text>
        <Text style={styles.summaryText}>
          Total Concepts: {concepts.length}
        </Text>
        <Text style={styles.summaryText}>
          Delayed Concepts: {DelayTrackerService.getDelayedConcepts(concepts).length}
        </Text>
        <Text style={styles.summaryText}>
          Delay Rate: {concepts.length > 0 ? 
            ((DelayTrackerService.getDelayedConcepts(concepts).length / concepts.length) * 100).toFixed(1) : 0}%
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  timelineContainer: {
    flexDirection: 'column',
    minWidth: width - 64,
  },
  timelineItem: {
    marginBottom: 12,
  },
  timelineLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  timelineBar: {
    flexDirection: 'row',
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  plannedBar: {
    backgroundColor: '#4CAF50',
    height: '100%',
  },
  delayBar: {
    backgroundColor: '#f44336',
    height: '100%',
  },
  timelineText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  barChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 120,
  },
  barItem: {
    alignItems: 'center',
    flex: 1,
  },
  barContainer: {
    height: 80,
    width: 30,
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderRadius: 4,
  },
  barLabel: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 4,
  },
  barValue: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  pieContainer: {
    paddingVertical: 8,
  },
  pieItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pieIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  pieLabel: {
    flex: 1,
    fontSize: 14,
  },
  pieValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  summaryContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    marginBottom: 4,
  },
});