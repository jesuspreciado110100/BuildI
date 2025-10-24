import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { LaborProposal } from '../types';
import LaborProposalService from '../services/LaborProposalService';
import ContractViewerModal from './ContractViewerModal';
import { LaborEmptyState } from './LaborEmptyState';

interface ProposalsTabProps {
  laborChiefId: string;
}

const ProposalsTab: React.FC<ProposalsTabProps> = ({ laborChiefId }) => {
  const [proposals, setProposals] = useState<LaborProposal[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<LaborProposal | null>(null);
  const [contractModalVisible, setContractModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProposals();
  }, [laborChiefId]);

  const loadProposals = async () => {
    try {
      const userProposals = await LaborProposalService.getProposalsByLaborChief(laborChiefId);
      setProposals(userProposals);
    } catch (error) {
      console.error('Failed to load proposals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = () => {
    console.log('Send open request to crews');
    // Navigate to labor request form
  };

  const handleViewContract = (proposal: LaborProposal) => {
    setSelectedProposal(proposal);
    setContractModalVisible(true);
  };

  const renderProposal = ({ item }: { item: LaborProposal }) => (
    <View style={styles.proposalCard}>
      <View style={styles.proposalHeader}>
        <Text style={styles.proposalPrice}>${item.proposed_price}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
      <Text style={styles.proposalDate}>Start: {item.available_start_date}</Text>
      <Text style={styles.proposalMessage}>{item.message}</Text>
      
      {item.contract_url && (
        <View style={styles.contractSection}>
          <TouchableOpacity 
            style={styles.viewContractButton}
            onPress={() => handleViewContract(item)}
          >
            <Text style={styles.buttonText}>View Contract</Text>
          </TouchableOpacity>
          {item.is_signed && (
            <View style={styles.signedBadge}>
              <Text style={styles.signedText}>✓ Signed Contract</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return '#28a745';
      case 'pending': return '#ffc107';
      case 'rejected': return '#dc3545';
      default: return '#6c757d';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading proposals...</Text>
      </View>
    );
  }

  if (proposals.length === 0) {
    return (
      <View style={styles.container}>
        <LaborEmptyState onSendRequest={handleSendRequest} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Proposals</Text>
      
      <FlatList
        data={proposals}
        renderItem={renderProposal}
        keyExtractor={(item) => item.id}
      />
      
      <ContractViewerModal
        visible={contractModalVisible}
        onClose={() => {
          setContractModalVisible(false);
          setSelectedProposal(null);
        }}
        proposal={selectedProposal}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16, color: '#666' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  proposalCard: { backgroundColor: 'white', padding: 16, borderRadius: 8, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  proposalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  proposalPrice: { fontSize: 18, fontWeight: 'bold', color: '#007AFF' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  statusText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  proposalDate: { fontSize: 14, color: '#666', marginBottom: 4 },
  proposalMessage: { fontSize: 14, marginBottom: 8 },
  contractSection: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#eee' },
  viewContractButton: { backgroundColor: '#007AFF', padding: 8, borderRadius: 4, alignItems: 'center', marginBottom: 8 },
  buttonText: { color: 'white', fontSize: 14, fontWeight: '600' },
  signedBadge: { backgroundColor: '#e8f5e8', padding: 8, borderRadius: 4, alignItems: 'center' },
  signedText: { color: '#28a745', fontWeight: 'bold' }
});

export default ProposalsTab;