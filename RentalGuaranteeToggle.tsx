import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { RentalGuaranteeService } from '../services/RentalGuaranteeService';

interface RentalGuaranteeToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  budget: number;
}

export default function RentalGuaranteeToggle({ enabled, onToggle, budget }: RentalGuaranteeToggleProps) {
  const guaranteeInfo = RentalGuaranteeService.calculateGuaranteeFee(budget);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Rental Guarantee</Text>
        <TouchableOpacity
          style={[styles.toggle, enabled && styles.toggleEnabled]}
          onPress={() => onToggle(!enabled)}
        >
          <View style={[styles.toggleThumb, enabled && styles.toggleThumbEnabled]} />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.description}>
        Optional 2% insurance coverage for equipment damage or theft
      </Text>
      
      <View style={styles.feeInfo}>
        <Text style={styles.feeText}>
          Fee: ${guaranteeInfo.fee.toFixed(2)} • Coverage: ${guaranteeInfo.coverage.toLocaleString()}
        </Text>
        <Text style={styles.capText}>
          Maximum coverage: $5,000
        </Text>
      </View>
      
      {enabled && (
        <View style={styles.enabledInfo}>
          <Text style={styles.enabledText}>✓ Rental guarantee enabled</Text>
          <Text style={styles.benefitText}>
            • Protection against equipment damage
          </Text>
          <Text style={styles.benefitText}>
            • Theft and vandalism coverage
          </Text>
          <Text style={styles.benefitText}>
            • 24/7 claim support
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151'
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#d1d5db',
    justifyContent: 'center',
    paddingHorizontal: 2
  },
  toggleEnabled: {
    backgroundColor: '#10b981'
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
    alignSelf: 'flex-start'
  },
  toggleThumbEnabled: {
    alignSelf: 'flex-end'
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12
  },
  feeInfo: {
    backgroundColor: '#f1f5f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12
  },
  feeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
    marginBottom: 4
  },
  capText: {
    fontSize: 12,
    color: '#64748b'
  },
  enabledInfo: {
    backgroundColor: '#ecfdf5',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#10b981'
  },
  enabledText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
    marginBottom: 8
  },
  benefitText: {
    fontSize: 12,
    color: '#047857',
    marginBottom: 2
  }
});