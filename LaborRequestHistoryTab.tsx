import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface LaborRequest {
  id: string;
  title: string;
  trade: string;
  description: string;
  budget: number;
  status: 'Open' | 'Accepted' | 'Closed';
  createdAt: string;
  proposals: Proposal[];
}

interface Proposal {
  id: string;
  chiefName: string;
  chiefRating: number;
  price: number;
  timeline: string;
  message: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export default function LaborRequestHistoryTab() {
  const { theme } = useTheme();
  const [requests, setRequests] = useState<LaborRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      // Mock data
      const mockRequests: LaborRequest[] = [
        {
          id: '1',
          title: 'Need Framing Crew',
          trade: 'Carpenter',
          description: 'Looking for experienced framing crew for residential project',
          budget: 5000,
          status: 'Open',
          createdAt: '2024-01-15',
          proposals: [
            {
              id: '1',
              chiefName: 'Mike Johnson',
              chiefRating: 4.8,
              price: 4800,
              timeline: '5 days',
              message: 'Experienced crew available. Can start immediately.',
              status: 'Pending'
            },
            {
              id: '2',
              chiefName: 'Sarah Wilson',
              chiefRating: 4.9,
              price: 5200,
              timeline: '4 days',
              message: 'Premium quality work with certified crew.',
              status: 'Pending'
            }
          ]
        },
        {
          id: '2',
          title: 'Electrical Installation',
          trade: 'Electrician',
          description: 'Complete electrical installation for new construction',
          budget: 8000,
          status: 'Accepted',
          createdAt: '2024-01-10',
          proposals: [
            {
              id: '3',
              chiefName: 'Tom Rodriguez',
              chiefRating: 4.7,
              price: 7500,
              timeline: '7 days',
              message: 'Licensed electricians with 10+ years experience.',
              status: 'Approved'
            }
          ]
        }
      ];
      setRequests(mockRequests);
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return '#ff9800';
      case 'Accepted': return '#4caf50';
      case 'Closed': return '#9e9e9e';
      default: return theme.colors.text;
    }
  };

  const handleApproveProposal = (requestId: string, proposalId: string) => {
    console.log('Approving proposal:', proposalId, 'for request:', requestId);
    // Update request status and proposal status
    setRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        return {
          ...req,
          status: 'Accepted',
          proposals: req.proposals.map(prop => ({
            ...prop,
            status: prop.id === proposalId ? 'Approved' : 'Rejected'
          }))
        };
      }
      return req;
    }));
  };

  const toggleExpanded = (requestId: string) => {
    setExpandedRequest(expandedRequest === requestId ? null : requestId);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.requestsList}>
        {loading ? (
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>Loading requests...</Text>
        ) : requests.length === 0 ? (
          <Text style={[styles.emptyText, { color: theme.colors.text }]}>No labor requests found</Text>
        ) : (
          requests.map((request) => (
            <View key={request.id} style={[styles.requestCard, { backgroundColor: theme.colors.surface }]}>
              <TouchableOpacity onPress={() => toggleExpanded(request.id)}>
                <View style={styles.requestHeader}>
                  <View style={styles.requestInfo}>
                    <Text style={[styles.requestTitle, { color: theme.colors.text }]}>{request.title}</Text>
                    <Text style={[styles.requestTrade, { color: theme.colors.textSecondary }]}>{request.trade}</Text>
                    <Text style={[styles.requestDate, { color: theme.colors.textSecondary }]}>{request.createdAt}</Text>
                  </View>
                  <View style={styles.requestStatus}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request.status) }]}>
                      <Text style={styles.statusText}>{request.status}</Text>
                    </View>
                    <Text style={[styles.budgetText, { color: theme.colors.text }]}>${request.budget}</Text>
                  </View>
                </View>
              </TouchableOpacity>

              {expandedRequest === request.id && (
                <View style={styles.expandedContent}>
                  <Text style={[styles.description, { color: theme.colors.text }]}>{request.description}</Text>
                  
                  <Text style={[styles.proposalsTitle, { color: theme.colors.text }]}>Proposals ({request.proposals.length})</Text>
                  
                  {request.proposals.map((proposal) => (
                    <View key={proposal.id} style={[styles.proposalCard, { backgroundColor: theme.colors.background }]}>
                      <View style={styles.proposalHeader}>
                        <View>
                          <Text style={[styles.chiefName, { color: theme.colors.text }]}>{proposal.chiefName}</Text>
                          <Text style={[styles.chiefRating, { color: theme.colors.textSecondary }]}>⭐ {proposal.chiefRating}</Text>
                        </View>
                        <View style={styles.proposalDetails}>
                          <Text style={[styles.proposalPrice, { color: theme.colors.text }]}>${proposal.price}</Text>
                          <Text style={[styles.proposalTimeline, { color: theme.colors.textSecondary }]}>{proposal.timeline}</Text>
                        </View>
                      </View>
                      
                      <Text style={[styles.proposalMessage, { color: theme.colors.text }]}>{proposal.message}</Text>
                      
                      {proposal.status === 'Pending' && request.status === 'Open' && (
                        <TouchableOpacity 
                          style={[styles.approveButton, { backgroundColor: theme.colors.primary }]}
                          onPress={() => handleApproveProposal(request.id, proposal.id)}
                        >
                          <Text style={styles.approveButtonText}>Approve Proposal</Text>
                        </TouchableOpacity>
                      )}
                      
                      {proposal.status !== 'Pending' && (
                        <View style={[styles.proposalStatusBadge, { 
                          backgroundColor: proposal.status === 'Approved' ? '#4caf50' : '#f44336' 
                        }]}>
                          <Text style={styles.proposalStatusText}>{proposal.status}</Text>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  requestsList: {
    flex: 1,
    padding: 16,
  },
  requestCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  requestInfo: {
    flex: 1,
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  requestTrade: {
    fontSize: 14,
    marginBottom: 4,
  },
  requestDate: {
    fontSize: 12,
  },
  requestStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  budgetText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  expandedContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  description: {
    fontSize: 14,
    marginBottom: 16,
  },
  proposalsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  proposalCard: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  proposalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  chiefName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  chiefRating: {
    fontSize: 12,
  },
  proposalDetails: {
    alignItems: 'flex-end',
  },
  proposalPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  proposalTimeline: {
    fontSize: 12,
  },
  proposalMessage: {
    fontSize: 14,
    marginBottom: 12,
  },
  approveButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  approveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  proposalStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  proposalStatusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 40,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 40,
  },
});