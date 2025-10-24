import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LaborProposal } from '../types';

interface ProposalCardProps {
  proposal: LaborProposal;
  onApprove: (proposalId: string) => void;
  onReject: (proposalId: string) => void;
}

const ProposalCard: React.FC<ProposalCardProps> = ({
  proposal,
  onApprove,
  onReject
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return '#28a745';
      case 'rejected': return '#dc3545';
      case 'pending': return '#ffc107';
      default: return '#6c757d';
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.price}>${proposal.proposed_price}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(proposal.status) }]}>
          <Text style={styles.statusText}>{proposal.status.toUpperCase()}</Text>
        </View>
      </View>
      
      <Text style={styles.startDate}>Available: {proposal.available_start_date}</Text>
      <Text style={styles.message}>{proposal.message}</Text>
      <Text style={styles.timestamp}>Submitted: {new Date(proposal.created_at).toLocaleDateString()}</Text>
      
      {proposal.status === 'pending' && (
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={styles.rejectButton}
            onPress={() => onReject(proposal.id)}
          >
            <Text style={styles.rejectText}>Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.approveButton}
            onPress={() => onApprove(proposal.id)}
          >
            <Text style={styles.approveText}>Approve</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF'
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold'
  },
  startDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4
  },
  message: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#dc3545',
    padding: 8,
    borderRadius: 4,
    marginRight: 8,
    alignItems: 'center'
  },
  approveButton: {
    flex: 1,
    backgroundColor: '#28a745',
    padding: 8,
    borderRadius: 4,
    marginLeft: 8,
    alignItems: 'center'
  },
  rejectText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600'
  },
  approveText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600'
  }
});

export default ProposalCard;