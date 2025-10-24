import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CommissionManagerService } from '../services/CommissionManagerService';

interface PlatformFeeBreakdownProps {
  baseAmount: number;
  module: 'labor' | 'machinery' | 'material';
  payerRole: string;
  region: string;
  isAdminView?: boolean;
}

export const PlatformFeeBreakdown: React.FC<PlatformFeeBreakdownProps> = ({
  baseAmount,
  module,
  payerRole,
  region,
  isAdminView = false
}) => {
  const feePercentage = CommissionManagerService.getCurrentFee(module, payerRole, region);
  const platformFee = CommissionManagerService.calculatePlatformCut(baseAmount, module, payerRole, region);
  const userPayout = baseAmount - platformFee;

  if (!isAdminView) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Platform Fee Breakdown</Text>
      
      <View style={styles.row}>
        <Text style={styles.label}>Base Amount:</Text>
        <Text style={styles.value}>${baseAmount.toFixed(2)}</Text>
      </View>
      
      <View style={styles.row}>
        <Text style={styles.label}>Fee Rate ({module}):</Text>
        <Text style={styles.feeRate}>{feePercentage}%</Text>
      </View>
      
      <View style={styles.row}>
        <Text style={styles.label}>Platform Share:</Text>
        <Text style={[styles.value, styles.platformShare]}>${platformFee.toFixed(2)}</Text>
      </View>
      
      <View style={[styles.row, styles.totalRow]}>
        <Text style={styles.totalLabel}>Payout to User:</Text>
        <Text style={[styles.value, styles.userPayout]}>${userPayout.toFixed(2)}</Text>
      </View>
      
      <View style={styles.moduleInfo}>
        <Text style={styles.moduleText}>Module: {module.toUpperCase()}</Text>
        <Text style={styles.regionText}>Region: {region}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e9ecef'
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#dee2e6',
    paddingTop: 8,
    marginTop: 4
  },
  label: {
    fontSize: 12,
    color: '#6c757d'
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#495057'
  },
  value: {
    fontSize: 12,
    fontWeight: '500',
    color: '#495057'
  },
  feeRate: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF'
  },
  platformShare: {
    color: '#dc3545',
    fontWeight: '600'
  },
  userPayout: {
    color: '#28a745',
    fontWeight: '600',
    fontSize: 14
  },
  moduleInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#dee2e6'
  },
  moduleText: {
    fontSize: 10,
    color: '#6c757d',
    fontWeight: '500'
  },
  regionText: {
    fontSize: 10,
    color: '#6c757d'
  }
});