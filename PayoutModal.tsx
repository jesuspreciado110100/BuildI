import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { InvestorPayout } from '../types';
import { payoutService } from '../services/PayoutService';

interface PayoutModalProps {
  visible: boolean;
  payout: InvestorPayout | null;
  onClose: () => void;
  onPaymentProcess?: (payoutId: string) => void;
}

export const PayoutModal: React.FC<PayoutModalProps> = ({
  visible,
  payout,
  onClose,
  onPaymentProcess
}) => {
  if (!payout) return null;

  const handleProcessPayment = async () => {
    if (onPaymentProcess && payout.payout_status === 'pending') {
      onPaymentProcess(payout.id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Payout Details</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Milestone Information</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Milestone:</Text>
              <Text style={styles.value}>{payout.milestone_name}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Site ID:</Text>
              <Text style={styles.value}>{payout.site_id}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Details</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Amount:</Text>
              <Text style={[styles.value, styles.amount]}>
                {payoutService.formatCurrency(payout.amount_paid)}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Due Date:</Text>
              <Text style={styles.value}>{formatDate(payout.payout_due_date)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Status:</Text>
              <View style={styles.statusContainer}>
                <Text style={styles.statusIcon}>
                  {payoutService.getStatusIcon(payout.payout_status)}
                </Text>
                <Text style={[styles.status, { color: getStatusColor(payout.payout_status) }]}>
                  {payout.payout_status.toUpperCase()}
                </Text>
              </View>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Payment Method:</Text>
              <Text style={styles.value}>{payout.payment_method}</Text>
            </View>
            {payout.transaction_id && (
              <View style={styles.row}>
                <Text style={styles.label}>Transaction ID:</Text>
                <Text style={[styles.value, styles.transactionId]}>
                  {payout.transaction_id}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Timeline</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Created:</Text>
              <Text style={styles.value}>{formatDate(payout.timestamp)}</Text>
            </View>
          </View>

          {payout.payout_status === 'pending' && onPaymentProcess && (
            <TouchableOpacity
              style={styles.processButton}
              onPress={handleProcessPayment}
            >
              <Text style={styles.processButtonText}>Process Payment</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333'
  },
  closeButton: {
    padding: 8
  },
  closeText: {
    fontSize: 18,
    color: '#666'
  },
  content: {
    flex: 1,
    padding: 20
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  label: {
    fontSize: 14,
    color: '#666',
    flex: 1
  },
  value: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    textAlign: 'right'
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50'
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end'
  },
  statusIcon: {
    fontSize: 16,
    marginRight: 4
  },
  status: {
    fontSize: 14,
    fontWeight: 'bold'
  },
  transactionId: {
    fontSize: 12,
    fontFamily: 'monospace'
  },
  processButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16
  },
  processButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  }
});