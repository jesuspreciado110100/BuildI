import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CurrencyService } from '../services/CurrencyService';

interface BudgetItem {
  id: string;
  category: string;
  amount: number;
  currency: string;
  timestamp: string;
}

interface CurrencyBudgetPanelProps {
  siteId: string;
  baseCurrency: string;
  budgetItems: BudgetItem[];
  totalBudget: number;
}

export const CurrencyBudgetPanel: React.FC<CurrencyBudgetPanelProps> = ({
  siteId,
  baseCurrency,
  budgetItems,
  totalBudget
}) => {
  const [showDualCurrency, setShowDualCurrency] = useState(true);
  const [displayCurrency, setDisplayCurrency] = useState('USD');

  const alternateCurrency = baseCurrency === 'USD' ? 'MXN' : 'USD';
  const conversionTimestamp = new Date().toLocaleString();

  const calculateTotalInCurrency = (currency: string) => {
    return budgetItems.reduce((total, item) => {
      const convertedAmount = CurrencyService.convert(item.amount, item.currency, currency);
      return total + convertedAmount;
    }, 0);
  };

  const totalNative = calculateTotalInCurrency(baseCurrency);
  const totalUSD = calculateTotalInCurrency('USD');

  const formatBudgetSummary = () => {
    if (showDualCurrency) {
      return {
        native: CurrencyService.formatCurrency(totalNative, baseCurrency),
        usd: CurrencyService.formatCurrency(totalUSD, 'USD')
      };
    }
    return {
      single: CurrencyService.formatCurrency(
        calculateTotalInCurrency(displayCurrency), 
        displayCurrency
      )
    };
  };

  const summary = formatBudgetSummary();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Budget Summary</Text>
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => setShowDualCurrency(!showDualCurrency)}
        >
          <Text style={styles.toggleText}>
            {showDualCurrency ? 'Single' : 'Dual'} Currency
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.summaryCard}>
        {showDualCurrency ? (
          <>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total ({baseCurrency}):</Text>
              <Text style={styles.summaryAmount}>{summary.native}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total (USD):</Text>
              <Text style={styles.summaryAmountSecondary}>{summary.usd}</Text>
            </View>
            <Text style={styles.conversionNote}>
              Conversion as of {conversionTimestamp}
            </Text>
          </>
        ) : (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total:</Text>
            <Text style={styles.summaryAmount}>{summary.single}</Text>
          </View>
        )}
      </View>

      <View style={styles.itemsList}>
        <Text style={styles.itemsTitle}>Budget Breakdown</Text>
        {budgetItems.map(item => (
          <View key={item.id} style={styles.budgetItem}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemCategory}>{item.category}</Text>
              <Text style={styles.itemAmount}>
                {showDualCurrency 
                  ? CurrencyService.formatDualCurrency(item.amount, item.currency, alternateCurrency)
                  : CurrencyService.formatCurrency(
                      CurrencyService.convert(item.amount, item.currency, displayCurrency),
                      displayCurrency
                    )
                }
              </Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.roiSection}>
        <Text style={styles.roiTitle}>ROI Analysis</Text>
        <View style={styles.roiRow}>
          <Text style={styles.roiLabel}>Budget vs Actual:</Text>
          <Text style={styles.roiValue}>
            {showDualCurrency 
              ? `${CurrencyService.formatCurrency(totalBudget, baseCurrency)} / ${summary.native}`
              : `${CurrencyService.formatCurrency(totalBudget, displayCurrency)} / ${summary.single}`
            }
          </Text>
        </View>
        <View style={styles.roiRow}>
          <Text style={styles.roiLabel}>Variance:</Text>
          <Text style={[styles.roiValue, totalNative > totalBudget ? styles.overBudget : styles.underBudget]}>
            {CurrencyService.formatCurrency(Math.abs(totalNative - totalBudget), baseCurrency)}
            {totalNative > totalBudget ? ' over' : ' under'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333'
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#007AFF',
    borderRadius: 6
  },
  toggleText: {
    color: '#fff',
    fontSize: 12
  },
  summaryCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  summaryLabel: {
    fontSize: 16,
    color: '#333'
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF'
  },
  summaryAmountSecondary: {
    fontSize: 16,
    color: '#666'
  },
  conversionNote: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
    marginTop: 4
  },
  itemsList: {
    marginBottom: 16
  },
  itemsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333'
  },
  budgetItem: {
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 6,
    marginBottom: 8
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  itemCategory: {
    fontSize: 14,
    color: '#333'
  },
  itemAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF'
  },
  roiSection: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 16
  },
  roiTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333'
  },
  roiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  roiLabel: {
    fontSize: 14,
    color: '#333'
  },
  roiValue: {
    fontSize: 14,
    fontWeight: '600'
  },
  overBudget: {
    color: '#dc3545'
  },
  underBudget: {
    color: '#28a745'
  }
});