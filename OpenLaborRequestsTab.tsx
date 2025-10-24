import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { LaborRequest } from '../types';
import LaborRequestService from '../services/LaborRequestService';
import LaborProposalService from '../services/LaborProposalService';
import ProposalSubmissionModal from './ProposalSubmissionModal';

interface OpenLaborRequestsTabProps {
  laborChiefId: string;
}

const OpenLaborRequestsTab: React.FC<OpenLaborRequestsTabProps> = ({ laborChiefId }) => {
  const [requests, setRequests] = useState<LaborRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<LaborRequest | null>(null);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOpenRequests();
  }, []);

  const loadOpenRequests = async () => {
    try {
      const allRequests = await LaborRequestService.getAllRequests();
      const openRequests = allRequests.filter(r => 
        r.open_to_all && 
        r.status === 'pending' && 
        !r.labor_chief_id
      );
      setRequests(openRequests);
    } catch (error) {
      console.error('Error loading open requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitProposal = (request: LaborRequest) => {
    setSelectedRequest(request);
    setShowProposalModal(true);
  };

  const onProposalSubmitted = () => {
    setShowProposalModal(false);
    setSelectedRequest(null);
    loadOpenRequests();
  };

  const renderRequestItem = ({ item }: { item: LaborRequest }) => (
    <View style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <Text style={styles.tradeType}>{item.trade_type}</Text>
        <Text style={styles.price}>${item.offered_price}</Text>
      </View>
      
      <Text style={styles.workers}>{item.workers_needed} workers needed</Text>
      <Text style={styles.duration}>Duration: {item.duration_days} days</Text>
      <Text style={styles.startDate}>Start: {item.start_date}</Text>
      
      <TouchableOpacity 
        style={styles.proposalButton}
        onPress={() => handleSubmitProposal(item)}
      >
        <Text style={styles.proposalButtonText}>Submit Proposal</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading open requests...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Open Labor Requests</Text>
      
      {requests.length === 0 ? (
        <Text style={styles.emptyText}>No open requests available</Text>
      ) : (
        <FlatList
          data={requests}
          renderItem={renderRequestItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
        />
      )}
      
      {selectedRequest && (
        <ProposalSubmissionModal
          visible={showProposalModal}
          onClose={() => setShowProposalModal(false)}
          request={selectedRequest}
          laborChiefId={laborChiefId}
          onSubmitted={onProposalSubmitted}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333'
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 50
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 50
  },
  requestCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  tradeType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF'
  },
  workers: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4
  },
  duration: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4
  },
  startDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12
  },
  proposalButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center'
  },
  proposalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  }
});

export default OpenLaborRequestsTab;