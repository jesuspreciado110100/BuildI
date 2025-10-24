import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { CurrencyService } from '../services/CurrencyService';

interface ReportData {
  id: string;
  category: string;
  amount: number;
  currency: string;
  description: string;
  date: string;
}

interface CurrencyReportPanelProps {
  reportData: ReportData[];
  baseCurrency: string;
  reportTitle: string;
  showDualColumns?: boolean;
}

export const CurrencyReportPanel: React.FC<CurrencyReportPanelProps> = ({
  reportData,
  baseCurrency,
  reportTitle,
  showDualColumns = true
}) => {
  const [selectedCurrency, setSelectedCurrency] = useState(baseCurrency);
  const alternateCurrency = baseCurrency === 'USD' ? 'MXN' : 'USD';
  
  const generateReportTimestamp = () => {
    return new Date().toLocaleString();
  };

  const calculateTotals = () => {
    const totalBase = reportData.reduce((sum, item) => {
      return sum + CurrencyService.convert(item.amount, item.currency, baseCurrency);
    }, 0);
    
    const totalAlternate = reportData.reduce((sum, item) => {
      return sum + CurrencyService.convert(item.amount, item.currency, alternateCurrency);
    }, 0);
    
    return { totalBase, totalAlternate };
  };

  const { totalBase, totalAlternate } = calculateTotals();

  const renderReportHeader = () => (
    <View style={styles.reportHeader}>
      <Text style={styles.reportTitle}>{reportTitle}</Text>
      <Text style={styles.reportTimestamp}>Generated: {generateReportTimestamp()}</Text>
      {showDualColumns && (
        <Text style={styles.currencyNote}>
          All prices shown in {baseCurrency} unless otherwise stated
        </Text>
      )}
    </View>
  );

  const renderTableHeader = () => (
    <View style={styles.tableHeader}>
      <Text style={[styles.headerCell, styles.descriptionColumn]}>Description</Text>
      <Text style={[styles.headerCell, styles.dateColumn]}>Date</Text>
      {showDualColumns ? (
        <>
          <Text style={[styles.headerCell, styles.amountColumn]}>Amount ({baseCurrency})</Text>
          <Text style={[styles.headerCell, styles.amountColumn]}>Est. {alternateCurrency}</Text>
        </>
      ) : (
        <Text style={[styles.headerCell, styles.amountColumn]}>Amount</Text>
      )}
    </View>
  );

  const renderTableRow = (item: ReportData) => {
    const baseAmount = CurrencyService.convert(item.amount, item.currency, baseCurrency);
    const alternateAmount = CurrencyService.convert(item.amount, item.currency, alternateCurrency);
    
    return (
      <View key={item.id} style={styles.tableRow}>
        <View style={[styles.cell, styles.descriptionColumn]}>
          <Text style={styles.cellText}>{item.description}</Text>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
        <Text style={[styles.cell, styles.dateColumn, styles.cellText]}>
          {new Date(item.date).toLocaleDateString()}
        </Text>
        {showDualColumns ? (
          <>
            <Text style={[styles.cell, styles.amountColumn, styles.cellText]}>
              {CurrencyService.formatCurrency(baseAmount, baseCurrency)}
            </Text>
            <Text style={[styles.cell, styles.amountColumn, styles.cellTextSecondary]}>
              {CurrencyService.formatCurrency(alternateAmount, alternateCurrency)}
            </Text>
          </>
        ) : (
          <Text style={[styles.cell, styles.amountColumn, styles.cellText]}>
            {CurrencyService.formatCurrency(
              CurrencyService.convert(item.amount, item.currency, selectedCurrency),
              selectedCurrency
            )}
          </Text>
        )}
      </View>
    );
  };

  const renderTotalRow = () => (
    <View style={styles.totalRow}>
      <Text style={[styles.cell, styles.descriptionColumn, styles.totalText]}>TOTAL</Text>
      <Text style={[styles.cell, styles.dateColumn]}></Text>
      {showDualColumns ? (
        <>
          <Text style={[styles.cell, styles.amountColumn, styles.totalText]}>
            {CurrencyService.formatCurrency(totalBase, baseCurrency)}
          </Text>
          <Text style={[styles.cell, styles.amountColumn, styles.totalTextSecondary]}>
            {CurrencyService.formatCurrency(totalAlternate, alternateCurrency)}
          </Text>
        </>
      ) : (
        <Text style={[styles.cell, styles.amountColumn, styles.totalText]}>
          {CurrencyService.formatCurrency(
            selectedCurrency === baseCurrency ? totalBase : totalAlternate,
            selectedCurrency
          )}
        </Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {renderReportHeader()}
      
      {!showDualColumns && (
        <View style={styles.currencySelector}>
          <Text style={styles.selectorLabel}>Display currency:</Text>
          <View style={styles.currencyButtons}>
            {[baseCurrency, alternateCurrency].map(currency => (
              <TouchableOpacity
                key={currency}
                style={[
                  styles.currencyButton,
                  selectedCurrency === currency && styles.selectedCurrencyButton
                ]}
                onPress={() => setSelectedCurrency(currency)}
              >
                <Text style={[
                  styles.currencyButtonText,
                  selectedCurrency === currency && styles.selectedCurrencyButtonText
                ]}>
                  {currency}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <ScrollView style={styles.tableContainer}>
        {renderTableHeader()}
        {reportData.map(renderTableRow)}
        {renderTotalRow()}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Exchange rates as of {generateReportTimestamp()}
        </Text>
        <Text style={styles.footerText}>
          1 {baseCurrency} = {CurrencyService.getExchangeRate(baseCurrency, alternateCurrency).toFixed(2)} {alternateCurrency}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16
  },
  reportHeader: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#333'
  },
  reportTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4
  },
  reportTimestamp: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8
  },
  currencyNote: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic'
  },
  currencySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  selectorLabel: {
    fontSize: 14,
    color: '#333',
    marginRight: 12
  },
  currencyButtons: {
    flexDirection: 'row',
    gap: 8
  },
  currencyButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9'
  },
  selectedCurrencyButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF'
  },
  currencyButtonText: {
    fontSize: 12,
    color: '#333'
  },
  selectedCurrencyButtonText: {
    color: '#fff'
  },
  tableContainer: {
    flex: 1
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd'
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  totalRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#f8f9fa',
    borderTopWidth: 2,
    borderTopColor: '#333'
  },
  headerCell: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center'
  },
  cell: {
    justifyContent: 'center'
  },
  cellText: {
    fontSize: 14,
    color: '#333'
  },
  cellTextSecondary: {
    fontSize: 14,
    color: '#666'
  },
  categoryText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2
  },
  totalText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333'
  },
  totalTextSecondary: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666'
  },
  descriptionColumn: {
    flex: 2
  },
  dateColumn: {
    flex: 1,
    textAlign: 'center'
  },
  amountColumn: {
    flex: 1,
    textAlign: 'right'
  },
  footer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee'
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 4
  }
});