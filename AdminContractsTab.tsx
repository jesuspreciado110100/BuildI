import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { LaborProposal } from '../types';
import LaborProposalService from '../services/LaborProposalService';
import ContractViewerModal from './ContractViewerModal';

const AdminContractsTab: React.FC = () => {
  const [contracts, setContracts] = useState<LaborProposal[]>([]);
  const [filteredContracts, setFilteredContracts] = useState<LaborProposal[]>([]);
  const [selectedContract, setSelectedContract] = useState<LaborProposal | null>(null);
  const [contractModalVisible, setContractModalVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    loadContracts();
  }, []);

  useEffect(() => {
    filterContracts();
  }, [contracts, activeFilter]);

  const loadContracts = async () => {
    try {
      const allProposals = await LaborProposalService.getApprovedProposals();
      const contractProposals = allProposals.filter(p => p.contract_url);
      setContracts(contractProposals);
    } catch (error) {
      console.error('Failed to load contracts:', error);
    }
  };

  const filterContracts = () => {
    let filtered = contracts;
    switch (activeFilter) {
      case 'signed':
        filtered = contracts.filter(c => c.is_signed);
        break;
      case 'unsigned':
        filtered = contracts.filter(c => !c.is_signed);
        break;
      case 'all':
      default:
        filtered = contracts;
        break;
    }
    setFilteredContracts(filtered);
  };

  const handleViewContract = (contract: LaborProposal) => {
    setSelectedContract(contract);
    setContractModalVisible(true);
  };

  const renderContract = ({ item }: { item: LaborProposal }) => (
    <View style={styles.contractCard}>
      <View style={styles.contractHeader}>
        <Text style={styles.contractId}>Contract #{item.id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: item.is_signed ? '#28a745' : '#ffc107' }]}>
          <Text style={styles.statusText}>{item.is_signed ? 'SIGNED' : 'UNSIGNED'}</Text>
        </View>
      </View>
      <Text style={styles.contractAmount}>Amount: ${item.proposed_price}</Text>
      <Text style={styles.contractDate}>Start: {item.available_start_date}</Text>
      {item.signed_at && (
        <Text style={styles.signedDate}>Signed: {new Date(item.signed_at).toLocaleDateString()}</Text>
      )}
      <TouchableOpacity 
        style={styles.viewButton}
        onPress={() => handleViewContract(item)}
      >
        <Text style={styles.viewButtonText}>View Contract</Text>
      </TouchableOpacity>
    </View>
  );

  const filters = [
    { id: 'all', label: 'All Contracts' },
    { id: 'signed', label: 'Signed' },
    { id: 'unsigned', label: 'Unsigned' }
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Labor Contracts</Text>
      
      <View style={styles.filterContainer}>
        {filters.map(filter => (
          <TouchableOpacity
            key={filter.id}
            style={[styles.filterButton, activeFilter === filter.id && styles.activeFilterButton]}
            onPress={() => setActiveFilter(filter.id)}
          >
            <Text style={[styles.filterText, activeFilter === filter.id && styles.activeFilterText]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <FlatList
        data={filteredContracts}
        renderItem={renderContract}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No contracts found</Text>
          </View>
        }
      />
      
      <ContractViewerModal
        visible={contractModalVisible}
        onClose={() => {
          setContractModalVisible(false);
          setSelectedContract(null);
        }}
        proposal={selectedContract}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  filterContainer: { flexDirection: 'row', marginBottom: 16 },
  filterButton: { backgroundColor: '#e5e7eb', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 4, marginRight: 8 },
  activeFilterButton: { backgroundColor: '#2563eb' },
  filterText: { color: '#6b7280', fontSize: 14, fontWeight: '500' },
  activeFilterText: { color: 'white' },
  contractCard: { backgroundColor: 'white', padding: 16, borderRadius: 8, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  contractHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  contractId: { fontSize: 16, fontWeight: 'bold', color: '#007AFF' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  statusText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  contractAmount: { fontSize: 16, fontWeight: '600', color: '#28a745', marginBottom: 4 },
  contractDate: { fontSize: 14, color: '#666', marginBottom: 4 },
  signedDate: { fontSize: 12, color: '#666', fontStyle: 'italic', marginBottom: 8 },
  viewButton: { backgroundColor: '#007AFF', padding: 8, borderRadius: 4, alignItems: 'center' },
  viewButtonText: { color: 'white', fontSize: 14, fontWeight: '600' },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 16, color: '#666' }
});

export default AdminContractsTab;