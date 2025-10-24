import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { AdminKPI } from '../types';
import { AdminService } from '../services/AdminService';

const { width } = Dimensions.get('window');

export const AdminKPIsTab: React.FC = () => {
  const [kpis, setKpis] = useState<AdminKPI | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadKPIs();
  }, [timeRange]);

  const loadKPIs = async () => {
    try {
      const data = await AdminService.getKPIs(timeRange);
      setKpis(data);
    } catch (error) {
      console.error('Error loading KPIs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const KPICard = ({ title, value, color = '#007AFF' }: { title: string; value: string | number; color?: string }) => (
    <View style={[styles.kpiCard, { borderLeftColor: color }]}>
      <Text style={styles.kpiTitle}>{title}</Text>
      <Text style={[styles.kpiValue, { color }]}>{value}</Text>
    </View>
  );

  const BookingChart = ({ data }: { data: { labor: number; machinery: number; material: number } }) => {
    const total = data.labor + data.machinery + data.material;
    const laborPercent = total > 0 ? (data.labor / total) * 100 : 0;
    const machineryPercent = total > 0 ? (data.machinery / total) * 100 : 0;
    const materialPercent = total > 0 ? (data.material / total) * 100 : 0;

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Bookings by Vertical</Text>
        <View style={styles.chartBar}>
          <View style={[styles.chartSegment, { width: `${laborPercent}%`, backgroundColor: '#FF6B6B' }]} />
          <View style={[styles.chartSegment, { width: `${machineryPercent}%`, backgroundColor: '#4ECDC4' }]} />
          <View style={[styles.chartSegment, { width: `${materialPercent}%`, backgroundColor: '#45B7D1' }]} />
        </View>
        <View style={styles.chartLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#FF6B6B' }]} />
            <Text style={styles.legendText}>Labor ({data.labor})</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#4ECDC4' }]} />
            <Text style={styles.legendText}>Machinery ({data.machinery})</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#45B7D1' }]} />
            <Text style={styles.legendText}>Material ({data.material})</Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading || !kpis) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading KPIs...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Platform KPIs</Text>
        <View style={styles.timeRangeSelector}>
          {(['week', 'month', 'quarter'] as const).map(range => (
            <TouchableOpacity
              key={range}
              style={[styles.timeRangeButton, timeRange === range && styles.activeTimeRange]}
              onPress={() => setTimeRange(range)}
            >
              <Text style={[styles.timeRangeText, timeRange === range && styles.activeTimeRangeText]}>
                {range}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.kpiGrid}>
        <KPICard 
          title="Daily Active Users" 
          value={kpis.daily_active_users.toLocaleString()} 
          color="#28A745"
        />
        <KPICard 
          title="Total Revenue" 
          value={formatCurrency(kpis.revenue.total)} 
          color="#007AFF"
        />
        <KPICard 
          title="Active Contractors" 
          value={kpis.user_counts.contractors.toLocaleString()} 
          color="#FF6B6B"
        />
        <KPICard 
          title="Active Suppliers" 
          value={kpis.user_counts.suppliers.toLocaleString()} 
          color="#4ECDC4"
        />
        <KPICard 
          title="Labor Crews" 
          value={kpis.user_counts.labor_crews.toLocaleString()} 
          color="#FFA500"
        />
        <KPICard 
          title="Total Bookings" 
          value={(kpis.total_bookings.labor + kpis.total_bookings.machinery + kpis.total_bookings.material).toLocaleString()} 
          color="#9C27B0"
        />
      </View>

      <BookingChart data={kpis.total_bookings} />

      <View style={styles.revenueBreakdown}>
        <Text style={styles.sectionTitle}>Revenue Breakdown</Text>
        <View style={styles.revenueGrid}>
          <View style={styles.revenueItem}>
            <Text style={styles.revenueLabel}>Labor</Text>
            <Text style={[styles.revenueValue, { color: '#FF6B6B' }]}>
              {formatCurrency(kpis.revenue.by_vertical.labor)}
            </Text>
          </View>
          <View style={styles.revenueItem}>
            <Text style={styles.revenueLabel}>Machinery</Text>
            <Text style={[styles.revenueValue, { color: '#4ECDC4' }]}>
              {formatCurrency(kpis.revenue.by_vertical.machinery)}
            </Text>
          </View>
          <View style={styles.revenueItem}>
            <Text style={styles.revenueLabel}>Material</Text>
            <Text style={[styles.revenueValue, { color: '#45B7D1' }]}>
              {formatCurrency(kpis.revenue.by_vertical.material)}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  timeRangeSelector: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 2,
  },
  timeRangeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  activeTimeRange: {
    backgroundColor: '#007AFF',
  },
  timeRangeText: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  activeTimeRangeText: {
    color: 'white',
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  kpiCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    width: (width - 44) / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  kpiTitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  chartContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  chartBar: {
    flexDirection: 'row',
    height: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 12,
  },
  chartSegment: {
    height: '100%',
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  revenueBreakdown: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  revenueGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  revenueItem: {
    alignItems: 'center',
  },
  revenueLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  revenueValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});