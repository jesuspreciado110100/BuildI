import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CurrencyService } from '../services/CurrencyService';

interface CurrencyToggleProps {
  amount: number;
  baseCurrency: string;
  alternateCurrency?: string;
  onCurrencyChange?: (currency: string) => void;
}

export const CurrencyToggle: React.FC<CurrencyToggleProps> = ({
  amount,
  baseCurrency,
  alternateCurrency = 'USD',
  onCurrencyChange
}) => {
  const [showAlternate, setShowAlternate] = useState(false);

  const toggleCurrency = () => {
    const newCurrency = showAlternate ? baseCurrency : alternateCurrency;
    setShowAlternate(!showAlternate);
    onCurrencyChange?.(newCurrency);
  };

  const displayCurrency = showAlternate ? alternateCurrency : baseCurrency;
  const displayAmount = showAlternate 
    ? CurrencyService.convert(amount, baseCurrency, alternateCurrency)
    : amount;

  return (
    <TouchableOpacity onPress={toggleCurrency} style={styles.container}>
      <Text style={styles.amount}>
        {CurrencyService.formatCurrency(displayAmount, displayCurrency)}
      </Text>
      {baseCurrency !== alternateCurrency && (
        <Text style={styles.toggleHint}>Tap to switch</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },
  toggleHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 2
  }
});