import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal, ScrollView } from 'react-native';
import { SmartContractService } from '../services/SmartContractService';
import { SmartContractViewer } from './SmartContractViewer';
import { notificationService } from '../services/NotificationService';
import { BookingRequest, LaborProposal, MaterialQuoteRequest, SmartContractData } from '../types';

interface SmartContractIntegrationProps {
  bookingId?: string;
  proposalId?: string;
  quoteId?: string;
  userId: string;
  onContractCreated?: (contractId: string) => void;
}

export const SmartContractIntegration: React.FC<SmartContractIntegrationProps> = ({
  bookingId,
  proposalId,
  quoteId,
  userId,
  onContractCreated
}) => {
  const [contract, setContract] = useState<SmartContractData | null>(null);
  const [showViewer, setShowViewer] = useState(false);
  const [loading, setLoading] = useState(false);
  const contractService = SmartContractService.getInstance();

  useEffect(() => {
    if (bookingId || proposalId || quoteId) {
      checkExistingContract();
    }
  }, [bookingId, proposalId, quoteId]);

  const checkExistingContract = async () => {
    // Mock check for existing contract
    const contracts = contractService.getAllContracts();
    const existingContract = contracts.find(c => 
      c.contract_content.includes(bookingId || proposalId || quoteId || '')
    );
    if (existingContract) {
      setContract(existingContract);
    }
  };

  const createSmartContract = async () => {
    setLoading(true);
    try {
      const contractData = {
        id: bookingId || proposalId || quoteId || 'unknown',
        parties: [userId, 'contractor_123'],
        amount: 5000,
        currency: 'USD',
        service: 'Construction Services',
        deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        terms: 'Standard construction terms and conditions apply'
      };

      const newContract = await contractService.generateSmartContract(contractData);
      await contractService.lockEscrow(newContract.id);
      setContract(newContract);
      onContractCreated?.(newContract.id);

      // Send notification
      await notificationService.sendSmartContractSecuredNotification(
        userId,
        newContract.id,
        newContract.blockchain_tx_id,
        newContract.amount
      );

      Alert.alert('Success', 'Smart contract created and funds locked in escrow');
    } catch (error) {
      Alert.alert('Error', 'Failed to create smart contract');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelivery = async () => {
    if (!contract) return;
    
    try {
      await contractService.confirmDelivery(contract.id, userId);
      const updatedContract = contractService.getContract(contract.id);
      setContract(updatedContract || null);
      
      if (updatedContract?.escrow_status === 'released') {
        await notificationService.sendContractConfirmedNotification(
          userId,
          contract.id,
          contract.amount
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to confirm delivery');
    }
  };

  const handleRaiseDispute = async () => {
    if (!contract) return;
    
    Alert.prompt(
      'Raise Dispute',
      'Please provide a reason:',
      async (reason) => {
        if (reason) {
          try {
            await contractService.markDisputed(contract.id, reason);
            const updatedContract = contractService.getContract(contract.id);
            setContract(updatedContract || null);
            
            await notificationService.sendDisputeRaisedNotification(
              userId,
              contract.id,
              reason
            );
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

  if (!contract) {
    return (
      <View style={styles.container}>
        <View style={styles.createContainer}>
          <Text style={styles.title}>🔗 Smart Contract</Text>
          <Text style={styles.subtitle}>Secure this transaction with blockchain technology</Text>
          <TouchableOpacity 
            style={styles.createButton} 
            onPress={createSmartContract}
            disabled={loading}
          >
            <Text style={styles.createButtonText}>
              {loading ? 'Creating...' : 'Create Smart Contract'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.contractSummary}>
        <View style={styles.summaryHeader}>
          <Text style={styles.contractTitle}>🔗 Smart Contract Active</Text>
          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(contract.escrow_status) }]}>
              <Text style={styles.statusText}>{contract.escrow_status.toUpperCase()}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(contract.confirmation_status) }]}>
              <Text style={styles.statusText}>{contract.confirmation_status.toUpperCase()}</Text>
            </View>
          </View>
        </View>
        
        <Text style={styles.contractInfo}>Amount: ${contract.amount.toLocaleString()}</Text>
        <Text style={styles.contractInfo}>TX: {contract.blockchain_tx_id.substring(0, 16)}...</Text>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.viewButton} onPress={() => setShowViewer(true)}>
            <Text style={styles.viewButtonText}>View Contract</Text>
          </TouchableOpacity>
          
          {contract.confirmation_status !== 'disputed' && contract.escrow_status !== 'released' && (
            <>
              <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmDelivery}>
                <Text style={styles.confirmButtonText}>Confirm Delivery</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.disputeButton} onPress={handleRaiseDispute}>
                <Text style={styles.disputeButtonText}>Raise Dispute</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <Modal visible={showViewer} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Smart Contract Details</Text>
            <TouchableOpacity onPress={() => setShowViewer(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          <SmartContractViewer 
            contractId={contract.id}
            onConfirmDelivery={handleConfirmDelivery}
            onRaiseDispute={handleRaiseDispute}
            userId={userId}
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  createContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 16,
  },
  createButton: {
    backgroundColor: '#3498DB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  contractSummary: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3498DB',
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  contractTitle: {
    fontSize: 16,
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
  contractInfo: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    flexWrap: 'wrap',
  },
  viewButton: {
    backgroundColor: '#95A5A6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  viewButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  confirmButton: {
    backgroundColor: '#27AE60',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  disputeButton: {
    backgroundColor: '#E74C3C',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  disputeButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  closeButton: {
    fontSize: 24,
    color: '#7F8C8D',
  },
});