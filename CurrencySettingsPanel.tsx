import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { CurrencyService } from '../services/CurrencyService';

interface CurrencySettingsPanelProps {
  siteId?: string;
  defaultCurrency?: string;
  onSettingsChange?: (settings: any) => void;
}

export const CurrencySettingsPanel: React.FC<CurrencySettingsPanelProps> = ({
  siteId,
  defaultCurrency = 'USD',
  onSettingsChange
}) => {
  const [selectedCurrency, setSelectedCurrency] = useState(defaultCurrency);
  const [customRates, setCustomRates] = useState<{[key: string]: string}>({});
  const [showRateOverride, setShowRateOverride] = useState(false);

  const supportedCurrencies = CurrencyService.getSupportedCurrencies();

  const handleCurrencySelect = (currency: string) => {
    setSelectedCurrency(currency);
    onSettingsChange?.({
      default_currency: currency,
      custom_rates: customRates
    });
  };

  const handleRateUpdate = (fromCurrency: string, toCurrency: string, rate: string) => {
    const numericRate = parseFloat(rate);
    if (isNaN(numericRate) || numericRate <= 0) {
      Alert.alert('Invalid Rate', 'Please enter a valid exchange rate');
      return;
    }

    const rateKey = `${fromCurrency}_${toCurrency}`;
    setCustomRates(prev => ({ ...prev, [rateKey]: rate }));
    CurrencyService.updateExchangeRate(fromCurrency, toCurrency, numericRate);
  };

  const getCurrentRate = (from: string, to: string) => {
    return CurrencyService.getExchangeRate(from, to).toFixed(4);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Currency Settings</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Default Currency</Text>
        <View style={styles.currencyGrid}>
          {supportedCurrencies.map(currency => (
            <TouchableOpacity
              key={currency}
              style={[
                styles.currencyButton,
                selectedCurrency === currency && styles.selectedCurrency
              ]}
              onPress={() => handleCurrencySelect(currency)}
            >
              <Text style={[
                styles.currencyText,
                selectedCurrency === currency && styles.selectedCurrencyText
              ]}>
                {currency}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => setShowRateOverride(!showRateOverride)}
        >
          <Text style={styles.toggleButtonText}>
            {showRateOverride ? 'Hide' : 'Show'} Exchange Rate Override
          </Text>
        </TouchableOpacity>

        {showRateOverride && (
          <View style={styles.rateOverride}>
            <Text style={styles.rateTitle}>Manual Exchange Rates</Text>
            
            <View style={styles.rateRow}>
              <Text style={styles.rateLabel}>USD → MXN:</Text>
              <TextInput
                style={styles.rateInput}
                value={customRates['USD_MXN'] || getCurrentRate('USD', 'MXN')}
                onChangeText={(text) => handleRateUpdate('USD', 'MXN', text)}
                keyboardType="numeric"
                placeholder="18.50"
              />
            </View>

            <View style={styles.rateRow}>
              <Text style={styles.rateLabel}>MXN → USD:</Text>
              <TextInput
                style={styles.rateInput}
                value={customRates['MXN_USD'] || getCurrentRate('MXN', 'USD')}
                onChangeText={(text) => handleRateUpdate('MXN', 'USD', text)}
                keyboardType="numeric"
                placeholder="0.054"
              />
            </View>
          </View>
        )}
      </View>

      <View style={styles.preview}>
        <Text style={styles.previewTitle}>Preview</Text>
        <Text style={styles.previewText}>
          {CurrencyService.formatDualCurrency(58000, selectedCurrency, selectedCurrency === 'MXN' ? 'USD' : 'MXN')}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333'
  },
  section: {
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333'
  },
  currencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  currencyButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9'
  },
  selectedCurrency: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF'
  },
  currencyText: {
    fontSize: 14,
    color: '#333'
  },
  selectedCurrencyText: {
    color: '#fff'
  },
  toggleButton: {
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center'
  },
  toggleButtonText: {
    fontSize: 14,
    color: '#007AFF'
  },
  rateOverride: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8
  },
  rateTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333'
  },
  rateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  rateLabel: {
    fontSize: 14,
    color: '#333',
    width: 80
  },
  rateInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#fff'
  },
  preview: {
    padding: 12,
    backgroundColor: '#e8f4f8',
    borderRadius: 8
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333'
  },
  previewText: {
    fontSize: 16,
    color: '#007AFF'
  }
});