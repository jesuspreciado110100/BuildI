import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PriceRangeSelectorProps {
  price: number;
  onPriceChange: (price: number) => void;
  unitRate: 'hourly' | 'daily' | 'weekly' | 'monthly';
  onUnitRateChange: (rate: 'hourly' | 'daily' | 'weekly' | 'monthly') => void;
  defaultRate?: number;
}

export const PriceRangeSelector: React.FC<PriceRangeSelectorProps> = ({
  price,
  onPriceChange,
  unitRate,
  onUnitRateChange,
  defaultRate = 100
}) => {
  const increment = unitRate === 'hourly' ? 10 : unitRate === 'daily' ? 50 : unitRate === 'weekly' ? 200 : 500;

  const handleIncrement = () => {
    onPriceChange(price + increment);
  };

  const handleDecrement = () => {
    const newPrice = price - increment;
    onPriceChange(newPrice < 0 ? 0 : newPrice);
  };

  const handleTextChange = (text: string) => {
    const numValue = parseInt(text.replace(/[^0-9]/g, '')) || 0;
    onPriceChange(numValue);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tarifa de Alquiler</Text>
      
      <View style={styles.unitRateContainer}>
        {(['hourly', 'daily', 'weekly', 'monthly'] as const).map((rate) => (
          <TouchableOpacity
            key={rate}
            style={[styles.unitButton, unitRate === rate && styles.unitButtonActive]}
            onPress={() => onUnitRateChange(rate)}
          >
            <Text style={[styles.unitText, unitRate === rate && styles.unitTextActive]}>
              {rate === 'hourly' ? 'Por Hora' : rate === 'daily' ? 'Por Día' : rate === 'weekly' ? 'Por Semana' : 'Por Mes'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.priceControlContainer}>
        <TouchableOpacity style={styles.controlButton} onPress={handleDecrement}>
          <Ionicons name="remove" size={24} color="#0EA5E9" />
        </TouchableOpacity>
        
        <View style={styles.priceInputContainer}>
          <Text style={styles.currencySymbol}>$</Text>
          <TextInput
            style={styles.priceInput}
            value={price.toString()}
            onChangeText={handleTextChange}
            keyboardType="numeric"
            placeholder="0"
          />
        </View>

        <TouchableOpacity style={styles.controlButton} onPress={handleIncrement}>
          <Ionicons name="add" size={24} color="#0EA5E9" />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.helperText}>
        Tarifa predeterminada: ${defaultRate} / {unitRate === 'hourly' ? 'hora' : unitRate === 'daily' ? 'día' : unitRate === 'weekly' ? 'semana' : 'mes'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  unitRateContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  unitButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  unitButtonActive: {
    backgroundColor: '#0EA5E9',
    borderColor: '#0EA5E9',
  },
  unitText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  unitTextActive: {
    color: '#FFFFFF',
  },
  priceControlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#0EA5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minWidth: 150,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0EA5E9',
    marginRight: 4,
  },
  priceInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    padding: 0,
  },
  helperText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
  },
});
