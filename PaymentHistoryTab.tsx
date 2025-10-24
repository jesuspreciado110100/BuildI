import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  type: 'payment' | 'payout' | 'refund';
  description: string;
  date: string;
  projectName?: string;
  clientName?: string;
  method: string;
  transactionId: string;
}

interface PaymentHistoryTabProps {
  payments: Payment[];
  userId: string;
}

export default function PaymentHistoryTab({ payments, userId }: PaymentHistoryTabProps) {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'payment', label: 'Payments' },
    { id: 'payout', label: 'Payouts' },
    { id: 'refund', label: 'Refunds' },
  ];

  const periods = [
    { id: 'all', label: 'All Time' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'year', label: 'This Year' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#28a745';
      case 'pending': return '#ffc107';
      case 'failed': return '#dc3545';
      case 'refunded': return '#6c757d';
      default: return '#6c757d';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✓';
      case 'pending': return '⏳';
      case 'failed': return '✗';
      case 'refunded': return '↩️';
      default: return '•';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'payment': return '💳';
      case 'payout': return '💰';
      case 'refund': return '↩️';
      default: return '💳';
    }
  };

  const filteredPayments = payments.filter(payment => {
    if (selectedFilter !== 'all' && payment.type !== selectedFilter) {
      return false;
    }
    // Add period filtering logic here
    return true;
  });

  const totalAmount = filteredPayments.reduce((sum, payment) => {
    if (payment.status === 'completed') {
      return payment.type === 'payout' ? sum + payment.amount : sum - payment.amount;
    }
    return sum;
  }, 0);

  const renderPaymentItem = ({ item }: { item: Payment }) => (
    <View style={styles.paymentCard}>
      <View style={styles.paymentHeader}>
        <View style={styles.paymentInfo}>
          <Text style={styles.paymentIcon}>{getTypeIcon(item.type)}</Text>
          <View style={styles.paymentDetails}>
            <Text style={styles.paymentDescription}>{item.description}</Text>
            {item.projectName && (
              <Text style={styles.projectName}>{item.projectName}</Text>
            )}
            {item.clientName && (
              <Text style={styles.clientName}>Client: {item.clientName}</Text>
            )}
          </View>
        </View>
        
        <View style={styles.paymentAmount}>
          <Text style={[styles.amount, { color: item.type === 'payout' ? '#28a745' : '#333' }]}>
            {item.type === 'payout' ? '+' : '-'}{item.currency}{item.amount.toFixed(2)}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusIcon}>{getStatusIcon(item.status)}</Text>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.paymentFooter}>
        <Text style={styles.paymentDate}>{item.date}</Text>
        <Text style={styles.paymentMethod}>{item.method}</Text>
        <Text style={styles.transactionId}>ID: {item.transactionId}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Balance Summary</Text>
        <Text style={[styles.totalAmount, { color: totalAmount >= 0 ? '#28a745' : '#dc3545' }]}>
          ${totalAmount.toFixed(2)}
        </Text>
        <Text style={styles.summarySubtitle}>Total from {filteredPayments.length} transactions</Text>
      </View>

      <View style={styles.filtersContainer}>
        <Text style={styles.filterLabel}>Type:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterButton,
                selectedFilter === filter.id && styles.activeFilterButton
              ]}
              onPress={() => setSelectedFilter(filter.id)}
            >
              <Text style={[
                styles.filterButtonText,
                selectedFilter === filter.id && styles.activeFilterButtonText
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.filtersContainer}>
        <Text style={styles.filterLabel}>Period:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {periods.map((period) => (
            <TouchableOpacity
              key={period.id}
              style={[
                styles.filterButton,
                selectedPeriod === period.id && styles.activeFilterButton
              ]}
              onPress={() => setSelectedPeriod(period.id)}
            >
              <Text style={[
                styles.filterButtonText,
                selectedPeriod === period.id && styles.activeFilterButtonText
              ]}>
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredPayments}
        renderItem={renderPaymentItem}
        keyExtractor={(item) => item.id}
        style={styles.paymentsList}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  summaryCard: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  summarySubtitle: {
    fontSize: 14,
    color: '#999',
  },
  filtersContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'white',
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  activeFilterButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
  },
  activeFilterButtonText: {
    color: 'white',
  },
  paymentsList: {
    paddingHorizontal: 16,
  },
  paymentCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  paymentInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  paymentIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  paymentDetails: {
    flex: 1,
  },
  paymentDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  projectName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  clientName: {
    fontSize: 12,
    color: '#999',
  },
  paymentAmount: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusIcon: {
    fontSize: 12,
    color: 'white',
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  paymentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  paymentDate: {
    fontSize: 12,
    color: '#666',
  },
  paymentMethod: {
    fontSize: 12,
    color: '#666',
  },
  transactionId: {
    fontSize: 10,
    color: '#999',
  },
});
