import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { AnalyticsService } from '../services/AnalyticsService';
import { ProgressHeatmapService } from '../services/ProgressHeatmapService';

interface AnalyticsDashboardPanelProps {
  siteId: string;
}

interface KPICardProps {
  title: string;
  value: string | number;
  trend?: 'up' | 'down' | 'stable';
  color?: string;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, trend, color = '#007AFF' }) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      case 'stable': return '→';
      default: return '';
    }
  };

  return (
    <View style={[styles.kpiCard, { borderLeftColor: color }]}>
      <Text style={styles.kpiTitle}>{title}</Text>
      <View style={styles.kpiValueRow}>
        <Text style={[styles.kpiValue, { color }]}>{value}</Text>
        {trend && <Text style={styles.trendIcon}>{getTrendIcon()}</Text>}
      </View>
    </View>
  );
};

const AnalyticsDashboardPanel: React.FC<AnalyticsDashboardPanelProps> = ({ siteId }) => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [heatmapData, setHeatmapData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [siteId]);

  const loadAnalytics = async () => {
    try {
      const [analyticsData, heatmap] = await Promise.all([
        AnalyticsService.getSiteAnalytics(siteId),
        ProgressHeatmapService.getHeatmapData(siteId)
      ]);
      setAnalytics(analyticsData);
      setHeatmapData(heatmap);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading analytics...</Text>
      </View>
    );
  }

  const kpis = [
    { title: 'Total Bookings', value: analytics?.totalBookings || 0, trend: 'up' as const, color: '#28a745' },
    { title: 'Total Cost', value: `$${analytics?.totalCost || 0}K`, trend: 'up' as const, color: '#dc3545' },
    { title: 'Avg Variance', value: `±${analytics?.avgVariance || 0}%`, trend: 'stable' as const, color: '#ffc107' },
    { title: 'ROI', value: `${analytics?.roi || 0}%`, trend: 'up' as const, color: '#17a2b8' },
    { title: 'Active Trades', value: analytics?.activeTrades || 0, trend: 'down' as const, color: '#6f42c1' },
    { title: 'Delayed Concepts', value: analytics?.delayedConcepts || 0, trend: 'down' as const, color: '#fd7e14' }
  ];

  const overruns = analytics?.budgetOverruns || [];
  const chartData = analytics?.progressTrends || [];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Analytics Dashboard</Text>
      
      <View style={styles.kpiGrid}>
        {kpis.map((kpi, index) => (
          <KPICard key={index} {...kpi} />
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cost & Progress Trends</Text>
        <View style={styles.chartContainer}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartLabel}>Monthly Cost</Text>
            <Text style={styles.chartLabel}>Progress %</Text>
          </View>
          {chartData.map((data: any, index: number) => (
            <View key={index} style={styles.chartRow}>
              <Text style={styles.monthLabel}>{data.month}</Text>
              <View style={styles.barContainer}>
                <View style={[styles.costBar, { width: `${Math.min((data.cost / 70000) * 100, 100)}%` }]} />
                <Text style={styles.barValue}>${(data.cost / 1000).toFixed(0)}K</Text>
              </View>
              <View style={styles.barContainer}>
                <View style={[styles.progressBar, { width: `${Math.min(data.progress, 100)}%` }]} />
                <Text style={styles.barValue}>{data.progress}%</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top Budget Overruns</Text>
        <View style={styles.overrunsList}>
          {overruns.map((overrun: any, index: number) => (
            <View key={index} style={styles.overrunItem}>
              <View style={styles.overrunInfo}>
                <Text style={styles.overrunConcept}>{overrun.concept}</Text>
                <Text style={styles.overrunVariance}>{overrun.budgetVariance}</Text>
              </View>
              <Text style={styles.overrunPercent}>{overrun.percent}</Text>
            </View>
          ))}
        </View>
      </View>

      {heatmapData && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>BIM Progress Heatmap</Text>
          <View style={styles.heatmapContainer}>
            <Text style={styles.heatmapDescription}>
              Visual progress mapping shows {heatmapData.completedAreas} completed areas
              out of {heatmapData.totalAreas} total areas.
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333'
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24
  },
  kpiCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    flex: 1,
    minWidth: '45%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  kpiTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8
  },
  kpiValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  trendIcon: {
    fontSize: 16
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333'
  },
  chartContainer: {
    gap: 8
  },
  chartHeader: {
    flexDirection: 'row',
    paddingLeft: 40,
    gap: 100
  },
  chartLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600'
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4
  },
  monthLabel: {
    width: 30,
    fontSize: 12,
    color: '#666'
  },
  barContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  costBar: {
    height: 16,
    backgroundColor: '#dc3545',
    borderRadius: 2
  },
  progressBar: {
    height: 16,
    backgroundColor: '#28a745',
    borderRadius: 2
  },
  barValue: {
    fontSize: 11,
    color: '#666',
    minWidth: 40
  },
  overrunsList: {
    gap: 12
  },
  overrunItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff5f5',
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#dc3545'
  },
  overrunInfo: {
    flex: 1
  },
  overrunConcept: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333'
  },
  overrunVariance: {
    fontSize: 12,
    color: '#dc3545',
    marginTop: 2
  },
  overrunPercent: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#dc3545'
  },
  heatmapContainer: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8
  },
  heatmapDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center'
  }
});

export default AnalyticsDashboardPanel;