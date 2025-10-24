import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { PayoutLedger, InvestorPayout } from '../types';
import { payoutService } from '../services/PayoutService';
import { PayoutModal } from './PayoutModal';

interface InvestorLedgerTabProps {
  investorId: string;
}

export const InvestorLedgerTab: React.FC<InvestorLedgerTabProps> = ({ investorId }) => {
  const [ledger, setLedger] = useState<PayoutLedger | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState<InvestorPayout | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadLedger();
  }, [investorId]);

  const loadLedger = async () => {
    try {
      setLoading(true);
      const ledgerData = await payoutService.getPayoutLedger(investorId);
      setLedger(ledgerData);
    } catch (error) {
      console.error('Error loading ledger:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadLedger();
    setRefreshing(false);
  };

  const handlePayoutPress = (payout: InvestorPayout) => {
    setSelectedPayout(payout);
    setModalVisible(true);
  };

  const handlePaymentProcess = async (payoutId: string) => {
    try {
      await payoutService.processPayment(payoutId);
      setModalVisible(false);
      await loadLedger(); // Refresh ledger
    } catch (error) {
      console.error('Error processing payment:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return '#4CAF50';
      case 'pending': return '#FF9800';
      case 'late': return '#F44336';
      default: return '#757575';
    }
  };

  const renderPayoutItem = ({ item }: { item: InvestorPayout }) => (
    <TouchableOpacity
      style={styles.payoutItem}
      onPress={() => handlePayoutPress(item)}
    >
      <View style={styles.payoutHeader}>
        <Text style={styles.milestoneName}>{item.milestone_name}</Text>
        <Text style={styles.statusIcon}>
          {payoutService.getStatusIcon(item.payout_status)}
        </Text>
      </View>
      <View style={styles.payoutDetails}>
        <Text style={styles.payoutDate}>{formatDate(item.payout_due_date)}</Text>
        <Text style={styles.payoutAmount}>
          {payoutService.formatCurrency(item.amount_paid)}
        </Text>
      </View>
      <View style={styles.statusRow}>
        <Text style={[styles.status, { color: getStatusColor(item.payout_status) }]}>
          {item.payout_status.toUpperCase()}
        </Text>
        <Text style={styles.viewDetails}>View Details →</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading ledger...</Text>
      </View>
    );
  }

  if (!ledger) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No ledger data available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Summary Section */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Received</Text>
            <Text style={styles.summaryValue}>
              {payoutService.formatCurrency(ledger.total_received)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Next Due</Text>
            <Text style={styles.summaryValue}>
              {ledger.next_due_amount > 0 
                ? payoutService.formatCurrency(ledger.next_due_amount)
                : 'N/A'
              }
            </Text>
          </View>
        </View>
        <View style={styles.progressContainer}>
          <Text style={styles.progressLabel}>Completion Progress</Text>
          <View style={styles.progressBar}>
            <View 
              style={[styles.progressFill, { width: `${ledger.completion_percentage}%` }]}
            />
          </View>
          <Text style={styles.progressText}>{ledger.completion_percentage.toFixed(1)}%</Text>
        </View>
      </View>

      {/* Payouts List */}
      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>Payout History</Text>
        <FlatList
          data={ledger.payouts}
          renderItem={renderPayoutItem}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      </View>

      <PayoutModal
        visible={modalVisible}
        payout={selectedPayout}
        onClose={() => setModalVisible(false)}
        onPaymentProcess={handlePaymentProcess}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    fontSize: 16,
    color: '#666'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyText: {
    fontSize: 16,
    color: '#666'
  },
  summaryContainer: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 16
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center'
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  progressContainer: {
    alignItems: 'center'
  },
  progressLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 4
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4
  },
  progressText: {
    fontSize: 12,
    color: '#666'
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12
  },
  payoutItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12
  },
  payoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  milestoneName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1
  },
  statusIcon: {
    fontSize: 20
  },
  payoutDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  payoutDate: {
    fontSize: 14,
    color: '#666'
  },
  payoutAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50'
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  status: {
    fontSize: 12,
    fontWeight: 'bold'
  },
  viewDetails: {
    fontSize: 12,
    color: '#2196F3'
  }
});