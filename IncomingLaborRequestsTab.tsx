import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { LaborRequest } from '../types';
import LaborRequestService from '../services/LaborRequestService';

interface IncomingLaborRequestsTabProps {
  laborChiefId: string;
}

const IncomingLaborRequestsTab: React.FC<IncomingLaborRequestsTabProps> = ({
  laborChiefId
}) => {
  const [requests, setRequests] = useState<LaborRequest[]>([]);
  const [tradeFilter, setTradeFilter] = useState('');
  const [loading, setLoading] = useState(false);

  const tradeTypes = ['', ...LaborRequestService.getTradeTypes()];

  useEffect(() => {
    loadRequests();
  }, [tradeFilter]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const incomingRequests = await LaborRequestService.getIncomingRequests(
        laborChiefId,
        tradeFilter || undefined
      );
      setRequests(incomingRequests);
    } catch (error) {
      Alert.alert('Error', 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId: string) => {
    try {
      await LaborRequestService.acceptRequest(requestId, laborChiefId);
      Alert.alert('Success', 'Request accepted successfully');
      loadRequests();
    } catch (error) {
      Alert.alert('Error', 'Failed to accept request');
    }
  };

  const handleDecline = async (requestId: string) => {
    try {
      await LaborRequestService.declineRequest(requestId);
      Alert.alert('Success', 'Request declined');
      loadRequests();
    } catch (error) {
      Alert.alert('Error', 'Failed to decline request');
    }
  };

  const renderRequest = ({ item }: { item: LaborRequest }) => (
    <View style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <Text style={styles.tradeType}>{item.trade_type}</Text>
        <Text style={styles.price}>${item.offered_price}</Text>
      </View>
      
      <Text style={styles.workers}>{item.workers_needed} workers needed</Text>
      <Text style={styles.duration}>Duration: {item.duration_days} days</Text>
      <Text style={styles.startDate}>Start: {item.start_date}</Text>
      
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.declineButton}
          onPress={() => handleDecline(item.id)}
        >
          <Text style={styles.declineText}>Decline</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.acceptButton}
          onPress={() => handleAccept(item.id)}
        >
          <Text style={styles.acceptText}>Accept</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Filter by Trade:</Text>
        <View style={styles.pickerContainer}>
          {tradeTypes.map(trade => (
            <TouchableOpacity
              key={trade || 'all'}
              style={[
                styles.tradeOption,
                tradeFilter === trade && styles.selectedTrade
              ]}
              onPress={() => setTradeFilter(trade)}
            >
              <Text style={[
                styles.tradeOptionText,
                tradeFilter === trade && styles.selectedTradeText
              ]}>
                {trade || 'All Trades'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={requests}
        renderItem={renderRequest}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={loadRequests}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No incoming requests</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16
  },
  filterSection: {
    marginBottom: 16
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  tradeOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  selectedTrade: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF'
  },
  tradeOptionText: {
    fontSize: 14,
    color: '#333'
  },
  selectedTradeText: {
    color: 'white',
    fontWeight: '600'
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
    color: '#007AFF'
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28a745'
  },
  workers: {
    fontSize: 14,
    marginBottom: 4
  },
  duration: {
    fontSize: 14,
    marginBottom: 4
  },
  startDate: {
    fontSize: 14,
    marginBottom: 12
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  declineButton: {
    flex: 1,
    padding: 10,
    backgroundColor: '#dc3545',
    borderRadius: 6,
    marginRight: 8
  },
  acceptButton: {
    flex: 1,
    padding: 10,
    backgroundColor: '#28a745',
    borderRadius: 6,
    marginLeft: 8
  },
  declineText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600'
  },
  acceptText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600'
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40
  },
  emptyText: {
    fontSize: 16,
    color: '#666'
  }
});