import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SmartContractData } from '../types';
import { SmartContractService } from '../services/SmartContractService';

interface SmartContractViewerProps {
  contractId: string;
  onConfirmDelivery?: () => void;
  onRaiseDispute?: () => void;
  showActions?: boolean;
  userId?: string;
}

export const SmartContractViewer: React.FC<SmartContractViewerProps> = ({
  contractId,
  onConfirmDelivery,
  onRaiseDispute,
  showActions = true,
  userId
}) => {
  const [contract, setContract] = useState<SmartContractData | null>(null);
  const [loading, setLoading] = useState(true);
  const contractService = SmartContractService.getInstance();

  useEffect(() => {
    loadContract();
  }, [contractId]);

  const loadContract = async () => {
    try {
      const contractData = contractService.getContract(contractId);
      setContract(contractData || null);
    } catch (error) {
      console.error('Error loading contract:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelivery = async () => {
    if (!contract || !userId) return;
    
    try {
      await contractService.confirmDelivery(contract.id, userId);
      await loadContract();
      onConfirmDelivery?.();
      Alert.alert('Success', 'Delivery confirmed successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to confirm delivery');
    }
  };

  const handleRaiseDispute = () => {
    Alert.prompt(
      'Raise Dispute',
      'Please provide a reason for the dispute:',
      async (reason) => {
        if (reason && contract) {
          try {
            await contractService.markDisputed(contract.id, reason);
            await loadContract();
            onRaiseDispute?.();
            Alert.alert('Dispute Raised', 'Admin has been notified');
          } catch (error) {
            Alert.alert('Error', 'Failed to raise dispute');
          }
        }
      }
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FFA500';
      case 'locked': return '#FF6B6B';
      case 'released': return '#4ECDC4';
      case 'confirmed': return '#45B7D1';
      case 'disputed': return '#FF4757';
      default: return '#95A5A6';
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading contract...</Text>
      </View>
    );
  }

  if (!contract) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Contract not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Smart Contract</Text>
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(contract.escrow_status) }]}>
            <Text style={styles.statusText}>{contract.escrow_status.toUpperCase()}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(contract.confirmation_status) }]}>
            <Text style={styles.statusText}>{contract.confirmation_status.toUpperCase()}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contract Details</Text>
        <Text style={styles.detail}>Hash: {contract.contract_hash.substring(0, 16)}...</Text>
        <Text style={styles.detail}>TX ID: {contract.blockchain_tx_id}</Text>
        <Text style={styles.detail}>Amount: {contract.amount} {contract.currency}</Text>
        <Text style={styles.detail}>Created: {new Date(contract.created_at).toLocaleString()}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contract Preview</Text>
        <View style={styles.contractPreview}>
          <Text style={styles.contractText}>{contract.contract_content}</Text>
        </View>
      </View>

      {contract.delivery_confirmed_by && contract.delivery_confirmed_by.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Confirmations</Text>
          <Text style={styles.detail}>Confirmed by: {contract.delivery_confirmed_by.length} parties</Text>
        </View>
      )}

      {contract.dispute_reason && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dispute Reason</Text>
          <Text style={styles.detail}>{contract.dispute_reason}</Text>
        </View>
      )}

      {showActions && contract.confirmation_status !== 'disputed' && contract.escrow_status !== 'released' && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmDelivery}>
            <Text style={styles.buttonText}>Confirm Delivery</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.disputeButton} onPress={handleRaiseDispute}>
            <Text style={styles.buttonText}>Raise Dispute</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  detail: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 8,
  },
  contractPreview: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#3498DB',
  },
  contractText: {
    fontSize: 12,
    color: '#2C3E50',
    fontFamily: 'monospace',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#27AE60',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  disputeButton: {
    flex: 1,
    backgroundColor: '#E74C3C',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#7F8C8D',
    marginTop: 50,
  },
  errorText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#E74C3C',
    marginTop: 50,
  },
});