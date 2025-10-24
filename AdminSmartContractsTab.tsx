import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SmartContractData } from '../types';
import { SmartContractService } from '../services/SmartContractService';

export const AdminSmartContractsTab: React.FC = () => {
  const [contracts, setContracts] = useState<SmartContractData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'locked' | 'disputed'>('all');
  const contractService = SmartContractService.getInstance();

  useEffect(() => {
    loadContracts();
  }, [filter]);

  const loadContracts = async () => {
    try {
      let contractData: SmartContractData[];
      if (filter === 'all') {
        contractData = contractService.getAllContracts();
      } else {
        contractData = contractService.getContractsByStatus(filter);
      }
      setContracts(contractData);
    } catch (error) {
      console.error('Error loading contracts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleForceRelease = async (contractId: string) => {
    Alert.alert(
      'Force Release',
      'Are you sure you want to force release this contract?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Release',
          style: 'destructive',
          onPress: async () => {
            try {
              await contractService.adminOverride(contractId, 'release');
              await loadContracts();
              Alert.alert('Success', 'Contract released successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to release contract');
            }
          }
        }
      ]
    );
  };

  const handleForceRefund = async (contractId: string) => {
    Alert.alert(
      'Force Refund',
      'Are you sure you want to force refund this contract?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Refund',
          style: 'destructive',
          onPress: async () => {
            try {
              await contractService.adminOverride(contractId, 'refund');
              await loadContracts();
              Alert.alert('Success', 'Contract refunded successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to refund contract');
            }
          }
        }
      ]
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

  const renderContract = ({ item }: { item: SmartContractData }) => (
    <View style={styles.contractCard}>
      <View style={styles.contractHeader}>
        <Text style={styles.contractId}>Contract #{item.id.substring(0, 8)}</Text>
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.escrow_status) }]}>
            <Text style={styles.statusText}>{item.escrow_status.toUpperCase()}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.confirmation_status) }]}>
            <Text style={styles.statusText}>{item.confirmation_status.toUpperCase()}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.contractDetails}>
        <Text style={styles.detail}>Hash: {item.contract_hash.substring(0, 16)}...</Text>
        <Text style={styles.detail}>TX ID: {item.blockchain_tx_id}</Text>
        <Text style={styles.detail}>Amount: {item.amount} {item.currency}</Text>
        <Text style={styles.detail}>Created: {new Date(item.created_at).toLocaleDateString()}</Text>
        {item.delivery_confirmed_by && (
          <Text style={styles.detail}>Confirmations: {item.delivery_confirmed_by.length}</Text>
        )}
        {item.dispute_reason && (
          <Text style={styles.disputeReason}>Dispute: {item.dispute_reason}</Text>
        )}
      </View>

      {(item.escrow_status === 'locked' || item.confirmation_status === 'disputed') && (
        <View style={styles.adminActions}>
          <TouchableOpacity 
            style={styles.releaseButton} 
            onPress={() => handleForceRelease(item.id)}
          >
            <Text style={styles.buttonText}>Force Release</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.refundButton} 
            onPress={() => handleForceRefund(item.id)}
          >
            <Text style={styles.buttonText}>Force Refund</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const filterButtons = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'locked', label: 'Locked' },
    { key: 'disputed', label: 'Disputed' }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Smart Contracts</Text>
        <Text style={styles.subtitle}>Manage blockchain contracts and escrow</Text>
      </View>

      <View style={styles.filterContainer}>
        {filterButtons.map((button) => (
          <TouchableOpacity
            key={button.key}
            style={[
              styles.filterButton,
              filter === button.key && styles.activeFilterButton
            ]}
            onPress={() => setFilter(button.key as any)}
          >
            <Text style={[
              styles.filterButtonText,
              filter === button.key && styles.activeFilterButtonText
            ]}>
              {button.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={contracts}
        renderItem={renderContract}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No contracts found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E9ECEF',
  },
  activeFilterButton: {
    backgroundColor: '#3498DB',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  activeFilterButtonText: {
    color: 'white',
  },
  listContainer: {
    padding: 16,
  },
  contractCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contractHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  contractId: {
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
  contractDetails: {
    marginBottom: 16,
  },
  detail: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  disputeReason: {
    fontSize: 14,
    color: '#E74C3C',
    fontStyle: 'italic',
    marginTop: 8,
  },
  adminActions: {
    flexDirection: 'row',
    gap: 12,
  },
  releaseButton: {
    flex: 1,
    backgroundColor: '#27AE60',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  refundButton: {
    flex: 1,
    backgroundColor: '#E74C3C',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#7F8C8D',
  },
});