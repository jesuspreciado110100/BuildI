import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { CommissionManagerService } from '../services/CommissionManagerService';
import { EarningsData } from '../types';

const { width } = Dimensions.get('window');

export const EarningsAnalyticsPanel: React.FC = () => {
  const [earningsData, setEarningsData] = useState<EarningsData | null>(null);

  useEffect(() => {
    loadEarningsData();
  }, []);

  const loadEarningsData = () => {
    const data = CommissionManagerService.getEarningsData();
    setEarningsData(data);
  };

  const renderRevenueBreakdown = () => {
    if (!earningsData) return null;

    const platformPercentage = (earningsData.platform_fees / earningsData.total_revenue) * 100;
    const userPercentage = 100 - platformPercentage;

    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Revenue Breakdown</Text>
        <View style={styles.breakdownRow}>
          <View style={styles.breakdownItem}>
            <Text style={styles.breakdownLabel}>Total Revenue</Text>
            <Text style={styles.breakdownValue}>${earningsData.total_revenue.toLocaleString()}</Text>
          </View>
          <View style={styles.breakdownItem}>
            <Text style={styles.breakdownLabel}>Platform Fees</Text>
            <Text style={[styles.breakdownValue, { color: '#007AFF' }]}>
              ${earningsData.platform_fees.toLocaleString()} ({platformPercentage.toFixed(1)}%)
            </Text>
          </View>
          <View style={styles.breakdownItem}>
            <Text style={styles.breakdownLabel}>User Payouts</Text>
            <Text style={[styles.breakdownValue, { color: '#28a745' }]}>
              ${(earningsData.total_revenue - earningsData.platform_fees).toLocaleString()} ({userPercentage.toFixed(1)}%)
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderModuleBreakdown = () => {
    if (!earningsData) return null;

    const modules = Object.entries(earningsData.module_breakdown);
    const total = Object.values(earningsData.module_breakdown).reduce((sum, val) => sum + val, 0);

    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Income by Module</Text>
        {modules.map(([module, amount]) => {
          const percentage = (amount / total) * 100;
          const barWidth = (percentage / 100) * (width - 80);
          
          return (
            <View key={module} style={styles.moduleRow}>
              <View style={styles.moduleInfo}>
                <Text style={styles.moduleLabel}>{module.toUpperCase()}</Text>
                <Text style={styles.moduleAmount}>${amount.toLocaleString()}</Text>
              </View>
              <View style={styles.barContainer}>
                <View style={[styles.bar, { width: barWidth }]} />
                <Text style={styles.percentageLabel}>{percentage.toFixed(1)}%</Text>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const renderTopEarners = () => {
    if (!earningsData) return null;

    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Top Earning Partners</Text>
        {earningsData.top_earners.map((earner, index) => (
          <View key={earner.id} style={styles.earnerRow}>
            <View style={styles.rankBadge}>
              <Text style={styles.rankText}>#{index + 1}</Text>
            </View>
            <View style={styles.earnerInfo}>
              <Text style={styles.earnerName}>{earner.name}</Text>
              <Text style={styles.earnerAmount}>${earner.earnings.toLocaleString()}</Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderMonthlyTrend = () => {
    if (!earningsData) return null;

    const maxRevenue = Math.max(...earningsData.monthly_trend.map(m => m.revenue));

    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Monthly Revenue Trend</Text>
        <View style={styles.chartContainer}>
          {earningsData.monthly_trend.map((month) => {
            const barHeight = (month.revenue / maxRevenue) * 100;
            
            return (
              <View key={month.month} style={styles.monthColumn}>
                <View style={styles.barWrapper}>
                  <View style={[styles.monthBar, { height: barHeight }]} />
                </View>
                <Text style={styles.monthLabel}>{month.month}</Text>
                <Text style={styles.monthValue}>${(month.revenue / 1000).toFixed(0)}k</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  if (!earningsData) {
    return (
      <View style={styles.loading}>
        <Text>Loading earnings data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderRevenueBreakdown()}
      {renderModuleBreakdown()}
      {renderTopEarners()}
      {renderMonthlyTrend()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333'
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  breakdownItem: {
    flex: 1,
    alignItems: 'center'
  },
  breakdownLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4
  },
  breakdownValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },
  moduleRow: {
    marginBottom: 12
  },
  moduleInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  moduleLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333'
  },
  moduleAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF'
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  bar: {
    height: 8,
    backgroundColor: '#007AFF',
    borderRadius: 4,
    marginRight: 8
  },
  percentageLabel: {
    fontSize: 12,
    color: '#666'
  },
  earnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  rankBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  rankText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600'
  },
  earnerInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  earnerName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333'
  },
  earnerAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#28a745'
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120
  },
  monthColumn: {
    flex: 1,
    alignItems: 'center'
  },
  barWrapper: {
    height: 80,
    justifyContent: 'flex-end',
    marginBottom: 8
  },
  monthBar: {
    width: 20,
    backgroundColor: '#007AFF',
    borderRadius: 2
  },
  monthLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2
  },
  monthValue: {
    fontSize: 10,
    color: '#999'
  }
});