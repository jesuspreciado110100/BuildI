import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { CommissionPricingService } from '../services/CommissionPricingService';
import { ResponseTimeService } from '../services/ResponseTimeService';
import ChatService from '../services/ChatService';

interface IncomingRequest {
  id: string;
  category: string;
  contractorRegion: string;
  startDate: string;
  endDate: string;
  budget: number;
  finalPrice: number;
  status: 'pending' | 'accepted' | 'declined' | 'countered';
  createdAt: string;
  contractorId?: string;
  renterId?: string;
  requestedAt: string;
}

interface IncomingRequestsTabProps {
  renterId: string;
  onAcceptRequest: (requestId: string) => void;
}

export default function IncomingRequestsTab({ renterId, onAcceptRequest }: IncomingRequestsTabProps) {
  const [requests, setRequests] = useState<IncomingRequest[]>([
    {
      id: '1',
      category: 'excavator',
      contractorRegion: 'Downtown',
      startDate: '2024-02-01',
      endDate: '2024-02-05',
      budget: 4000,
      finalPrice: 4400,
      status: 'pending',
      createdAt: '2024-01-15T10:00:00Z',
      requestedAt: '2024-01-15T10:00:00Z',
      contractorId: 'contractor1',
      renterId: renterId
    }
  ]);

  const [counterOffers, setCounterOffers] = useState<{[key: string]: string}>({});
  const [responseTimeConfirmation, setResponseTimeConfirmation] = useState<{[key: string]: number}>({});

  const handleAccept = async (requestId: string) => {
    const request = requests.find(req => req.id === requestId);
    if (!request) return;

    const respondedAt = new Date().toISOString();
    const responseTimeService = ResponseTimeService.getInstance();
    
    try {
      const responseTimeSeconds = await responseTimeService.recordResponse(requestId, respondedAt);
      
      setRequests(prev => prev.map(req => 
        req.id === requestId ? { ...req, status: 'accepted' } : req
      ));
      
      setResponseTimeConfirmation(prev => ({ ...prev, [requestId]: responseTimeSeconds }));
      
      if (request.contractorId && request.renterId) {
        await ChatService.createChatRoom(requestId, request.contractorId, request.renterId);
      }
      
      onAcceptRequest(requestId);
      
      setTimeout(() => {
        setResponseTimeConfirmation(prev => {
          const updated = { ...prev };
          delete updated[requestId];
          return updated;
        });
      }, 5000);
      
    } catch (error) {
      Alert.alert('Error', 'Failed to record response time');
    }
  };

  const handleDecline = async (requestId: string) => {
    const respondedAt = new Date().toISOString();
    const responseTimeService = ResponseTimeService.getInstance();
    
    try {
      const responseTimeSeconds = await responseTimeService.recordResponse(requestId, respondedAt);
      
      setRequests(prev => prev.map(req => 
        req.id === requestId ? { ...req, status: 'declined' } : req
      ));
      
      setResponseTimeConfirmation(prev => ({ ...prev, [requestId]: responseTimeSeconds }));
      
      setTimeout(() => {
        setResponseTimeConfirmation(prev => {
          const updated = { ...prev };
          delete updated[requestId];
          return updated;
        });
      }, 5000);
      
    } catch (error) {
      Alert.alert('Error', 'Failed to record response time');
    }
  };

  const getDurationDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const pendingRequests = requests.filter(req => req.status === 'pending');

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>Incoming Requests</Text>
      
      {pendingRequests.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No pending requests</Text>
        </View>
      ) : (
        pendingRequests.map((request) => {
          const duration = getDurationDays(request.startDate, request.endDate);
          const netPayout = CommissionPricingService.calculateNetPayout(request.budget);
          const responseTime = responseTimeConfirmation[request.id];
          
          return (
            <View key={request.id} style={styles.requestCard}>
              {responseTime && (
                <View style={styles.responseTimeConfirmation}>
                  <Text style={styles.responseTimeText}>
                    Response time: {ResponseTimeService.getInstance().formatResponseTime(responseTime)}
                  </Text>
                </View>
              )}
              
              <View style={styles.requestHeader}>
                <Text style={styles.requestCategory}>
                  {request.category.charAt(0).toUpperCase() + request.category.slice(1)}
                </Text>
                <Text style={styles.requestRegion}>
                  {request.contractorRegion}
                </Text>
              </View>
              
              <Text style={styles.requestDates}>
                {request.startDate} to {request.endDate} ({duration} days)
              </Text>
              
              <Text style={styles.requestPrice}>
                Offered: ${request.budget.toLocaleString()}
              </Text>
              
              <Text style={styles.netPayout}>
                Your net payout: ${netPayout.toFixed(2)}
              </Text>
              
              <View style={styles.requestActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.acceptButton]}
                  onPress={() => handleAccept(request.id)}
                >
                  <Text style={styles.actionButtonText}>Accept</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.actionButton, styles.declineButton]}
                  onPress={() => handleDecline(request.id)}
                >
                  <Text style={styles.actionButtonText}>Decline</Text>
                </TouchableOpacity>
              </View>
              
              <Text style={styles.requestDate}>
                Received: {new Date(request.createdAt).toLocaleDateString()}
              </Text>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginVertical: 15, color: '#374151' },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 16, fontWeight: '500', color: '#6b7280', marginBottom: 8 },
  requestCard: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 15, elevation: 2 },
  responseTimeConfirmation: { backgroundColor: '#dcfce7', padding: 8, borderRadius: 6, marginBottom: 10 },
  responseTimeText: { fontSize: 14, fontWeight: '600', color: '#16a34a', textAlign: 'center' },
  requestHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  requestCategory: { fontSize: 18, fontWeight: 'bold', color: '#374151' },
  requestRegion: { fontSize: 14, color: '#6b7280', fontWeight: '500' },
  requestDates: { fontSize: 14, color: '#6b7280', marginBottom: 8 },
  requestPrice: { fontSize: 16, fontWeight: '600', color: '#059669', marginBottom: 5 },
  netPayout: { fontSize: 14, color: '#16a34a', fontWeight: '500', marginBottom: 10 },
  requestActions: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  actionButton: { flex: 1, padding: 10, borderRadius: 8, alignItems: 'center', marginHorizontal: 2 },
  acceptButton: { backgroundColor: '#16a34a' },
  declineButton: { backgroundColor: '#dc2626' },
  actionButtonText: { color: 'white', fontSize: 12, fontWeight: '500' },
  requestDate: { fontSize: 12, color: '#9ca3af' }
});