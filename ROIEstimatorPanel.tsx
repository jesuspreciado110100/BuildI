import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { ROIEstimate } from '../types';
import { CostAnalysisService } from '../services/CostAnalysisService';

interface ROIEstimatorPanelProps {
  siteId: string;
}

export const ROIEstimatorPanel: React.FC<ROIEstimatorPanelProps> = ({ siteId }) => {
  const [expectedRevenue, setExpectedRevenue] = useState('');
  const [roiEstimate, setRoiEstimate] = useState<ROIEstimate | null>(null);
  const [siteSummary, setSiteSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSiteSummary();
  }, [siteId]);

  const loadSiteSummary = async () => {
    try {
      const summary = await CostAnalysisService.getSiteSummary(siteId);
      setSiteSummary(summary);
    } catch (error) {
      console.error('Error loading site summary:', error);
    }
  };

  const calculateROI = async () => {
    if (!expectedRevenue || isNaN(Number(expectedRevenue))) {
      return;
    }

    setLoading(true);
    try {
      const roi = await CostAnalysisService.calculateROI(siteId, Number(expectedRevenue));
      setRoiEstimate(roi);
    } catch (error) {
      console.error('Error calculating ROI:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString()}`;
  };

  const formatPercent = (percent: number) => {
    return `${percent.toFixed(1)}%`;
  };

  const getROIColor = (roi: number) => {
    if (roi > 20) return '#22c55e'; // Green for high ROI
    if (roi > 10) return '#f59e0b'; // Yellow for medium ROI
    if (roi > 0) return '#ef4444'; // Red for low ROI
    return '#dc2626'; // Dark red for negative ROI
  };

  const profitMargin = roiEstimate ? 
    ((roiEstimate.expected_return - roiEstimate.total_cost) / roiEstimate.expected_return) * 100 : 0;

  const totalSavings = siteSummary ? siteSummary.totalForecasted - siteSummary.totalActual : 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ROI Estimator</Text>
      
      <View style={styles.inputSection}>
        <Text style={styles.label}>Expected Revenue ($)</Text>
        <TextInput
          style={styles.input}
          value={expectedRevenue}
          onChangeText={setExpectedRevenue}
          placeholder="Enter expected revenue"
          keyboardType="numeric"
          onBlur={calculateROI}
        />
        <TouchableOpacity style={styles.calculateButton} onPress={calculateROI}>
          <Text style={styles.calculateButtonText}>Calculate ROI</Text>
        </TouchableOpacity>
      </View>

      {siteSummary && (
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Site Cost Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Actual Cost:</Text>
            <Text style={styles.summaryValue}>{formatCurrency(siteSummary.totalActual)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Forecasted:</Text>
            <Text style={styles.summaryValue}>{formatCurrency(siteSummary.totalForecasted)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Concepts Over Budget:</Text>
            <Text style={[styles.summaryValue, { color: '#ef4444' }]}>
              {siteSummary.overBudgetCount}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Concepts Under Budget:</Text>
            <Text style={[styles.summaryValue, { color: '#22c55e' }]}>
              {siteSummary.underBudgetCount}
            </Text>
          </View>
        </View>
      )}

      {roiEstimate && (
        <View style={styles.roiSection}>
          <Text style={styles.sectionTitle}>ROI Analysis</Text>
          
          <View style={styles.roiCard}>
            <Text style={styles.roiLabel}>Return on Investment</Text>
            <Text style={[styles.roiValue, { color: getROIColor(roiEstimate.roi_percent) }]}>
              {formatPercent(roiEstimate.roi_percent)}
            </Text>
          </View>

          <View style={styles.metricsRow}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Profit Margin</Text>
              <Text style={styles.metricValue}>{formatPercent(profitMargin)}</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Total Savings</Text>
              <Text style={[styles.metricValue, { color: totalSavings >= 0 ? '#22c55e' : '#ef4444' }]}>
                {formatCurrency(Math.abs(totalSavings))}
              </Text>
            </View>
          </View>

          <View style={styles.breakdownSection}>
            <Text style={styles.breakdownTitle}>Financial Breakdown</Text>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Expected Revenue:</Text>
              <Text style={styles.breakdownValue}>{formatCurrency(roiEstimate.expected_return)}</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Total Costs:</Text>
              <Text style={styles.breakdownValue}>{formatCurrency(roiEstimate.total_cost)}</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Net Profit:</Text>
              <Text style={[styles.breakdownValue, { fontWeight: 'bold' }]}>
                {formatCurrency(roiEstimate.expected_return - roiEstimate.total_cost)}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5'
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333'
  },
  inputSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
    marginBottom: 12
  },
  calculateButton: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center'
  },
  calculateButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  },
  summarySection: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333'
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666'
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333'
  },
  roiSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8
  },
  roiCard: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 16
  },
  roiLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4
  },
  roiValue: {
    fontSize: 32,
    fontWeight: 'bold'
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  metricCard: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginHorizontal: 4
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  breakdownSection: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 16
  },
  breakdownTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333'
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4
  },
  breakdownLabel: {
    fontSize: 14,
    color: '#666'
  },
  breakdownValue: {
    fontSize: 14,
    color: '#333'
  }
});