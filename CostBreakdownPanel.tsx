import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface CostBreakdown {
  category: string;
  amount: number;
  percentage: number;
}

interface CostData {
  total_budget: number;
  spent_amount: number;
  remaining_budget: number;
  roi_estimate: number;
  cost_breakdown: CostBreakdown[];
}

interface CostBreakdownPanelProps {
  costs: CostData;
}

export const CostBreakdownPanel: React.FC<CostBreakdownPanelProps> = ({ costs }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage < 50) return '#4caf50';
    if (percentage < 80) return '#ff9800';
    return '#f44336';
  };

  const budgetUsedPercentage = (costs.spent_amount / costs.total_budget) * 100;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cost Breakdown</Text>
      
      {/* Budget Overview */}
      <View style={styles.budgetOverview}>
        <View style={styles.budgetItem}>
          <Text style={styles.budgetLabel}>Total Budget</Text>
          <Text style={styles.budgetValue}>{formatCurrency(costs.total_budget)}</Text>
        </View>
        <View style={styles.budgetItem}>
          <Text style={styles.budgetLabel}>Spent</Text>
          <Text style={[styles.budgetValue, { color: '#f44336' }]}>
            {formatCurrency(costs.spent_amount)}
          </Text>
        </View>
        <View style={styles.budgetItem}>
          <Text style={styles.budgetLabel}>Remaining</Text>
          <Text style={[styles.budgetValue, { color: '#4caf50' }]}>
            {formatCurrency(costs.remaining_budget)}
          </Text>
        </View>
      </View>

      {/* Budget Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill,
              { 
                width: `${Math.min(budgetUsedPercentage, 100)}%`,
                backgroundColor: getProgressColor(budgetUsedPercentage)
              }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {budgetUsedPercentage.toFixed(1)}% of budget used
        </Text>
      </View>

      {/* ROI Estimate */}
      <View style={styles.roiContainer}>
        <Text style={styles.roiLabel}>Estimated ROI</Text>
        <Text style={styles.roiValue}>{costs.roi_estimate.toFixed(1)}%</Text>
      </View>

      {/* Cost Breakdown */}
      <View style={styles.breakdownContainer}>
        <Text style={styles.breakdownTitle}>Expense Categories</Text>
        {costs.cost_breakdown.map((item, index) => (
          <View key={index} style={styles.breakdownItem}>
            <View style={styles.breakdownHeader}>
              <Text style={styles.categoryName}>{item.category}</Text>
              <Text style={styles.categoryAmount}>{formatCurrency(item.amount)}</Text>
            </View>
            <View style={styles.categoryProgressBar}>
              <View 
                style={[
                  styles.categoryProgressFill,
                  { width: `${item.percentage}%` }
                ]} 
              />
            </View>
            <Text style={styles.categoryPercentage}>{item.percentage.toFixed(1)}%</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  budgetOverview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  budgetItem: {
    alignItems: 'center',
  },
  budgetLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  budgetValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  roiContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    marginBottom: 16,
  },
  roiLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  roiValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4caf50',
  },
  breakdownContainer: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 16,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  breakdownItem: {
    marginBottom: 12,
  },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  categoryProgressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 2,
  },
  categoryProgressFill: {
    height: '100%',
    backgroundColor: '#2196f3',
    borderRadius: 2,
  },
  categoryPercentage: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
});