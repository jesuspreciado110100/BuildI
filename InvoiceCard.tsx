import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Invoice } from '../types';

interface InvoiceCardProps {
  invoice: Invoice;
  onPaymentPress?: (invoiceId: string) => void;
  hasSmartContract?: boolean;
  rentalGuaranteeEnabled?: boolean;
}

const InvoiceCard: React.FC<InvoiceCardProps> = ({ 
  invoice, 
  onPaymentPress, 
  hasSmartContract = false,
  rentalGuaranteeEnabled = false 
}) => {
  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'paid': return '#4CAF50';
      case 'pending': return '#FF9800';
      case 'overdue': return '#F44336';
      case 'cancelled': return '#9E9E9E';
      default: return '#9E9E9E';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatAmount = (amount: number) => {
    return `$${amount.toLocaleString()}`;
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.invoiceId}>Invoice #{invoice.id.slice(-8)}</Text>
        <View style={styles.badgeContainer}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(invoice.status) }]}>
            <Text style={styles.statusText}>{invoice.status.toUpperCase()}</Text>
          </View>
          {hasSmartContract && (
            <View style={styles.smartContractBadge}>
              <Text style={styles.smartContractText}>🔗 SMART CONTRACT</Text>
            </View>
          )}
        </View>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.amount}>{formatAmount(invoice.amount)}</Text>
        
        <View style={styles.dateRow}>
          <Text style={styles.dateLabel}>Issued:</Text>
          <Text style={styles.dateValue}>{formatDate(invoice.issue_date)}</Text>
        </View>
        
        <View style={styles.dateRow}>
          <Text style={styles.dateLabel}>Due:</Text>
          <Text style={styles.dateValue}>{formatDate(invoice.due_date)}</Text>
        </View>
        
        {invoice.payment_date && (
          <View style={styles.dateRow}>
            <Text style={styles.dateLabel}>Paid:</Text>
            <Text style={styles.dateValue}>{formatDate(invoice.payment_date)}</Text>
          </View>
        )}
        
        {hasSmartContract && (
          <View style={styles.smartContractInfo}>
            <Text style={styles.smartContractLabel}>Secured by Smart Contract</Text>
            {rentalGuaranteeEnabled && (
              <Text style={styles.guaranteeText}>✓ Rental Guarantee Included</Text>
            )}
          </View>
        )}
      </View>
      
      {invoice.status === 'pending' && onPaymentPress && (
        <TouchableOpacity 
          style={[styles.payButton, hasSmartContract && styles.smartContractPayButton]}
          onPress={() => onPaymentPress(invoice.id)}
        >
          <Text style={styles.payButtonText}>
            {hasSmartContract ? 'Release Smart Contract Payment' : 'Process Payment'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  invoiceId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  badgeContainer: {
    alignItems: 'flex-end',
    gap: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  smartContractBadge: {
    backgroundColor: '#3498DB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  smartContractText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  content: {
    marginBottom: 12,
  },
  amount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 8,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  dateLabel: {
    fontSize: 14,
    color: '#666',
  },
  dateValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  smartContractInfo: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#E8F4FD',
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#3498DB',
  },
  smartContractLabel: {
    fontSize: 12,
    color: '#2980B9',
    fontWeight: 'bold',
  },
  guaranteeText: {
    fontSize: 11,
    color: '#27AE60',
    marginTop: 2,
  },
  payButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  smartContractPayButton: {
    backgroundColor: '#3498DB',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default InvoiceCard;