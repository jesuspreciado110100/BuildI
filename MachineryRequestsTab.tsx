import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import MachineryRequestForm from './MachineryRequestForm';
import ResponseTimeBadge from './ResponseTimeBadge';
import { ResponseTimeService } from '../services/ResponseTimeService';

interface MachineryRequest {
  id: string;
  category: string;
  startDate: string;
  endDate: string;
  budget: number;
  finalPrice: number;
  region: string;
  status: 'pending' | 'accepted' | 'declined' | 'operator_en_route' | 'in_progress' | 'completed';
  createdAt: string;
  acceptedBy?: string;
  renterId?: string;
}

interface MachineryRequestsTabProps {
  contractorId: string;
  renterMetrics?: {[key: string]: any};
  showResponseTimes?: boolean;
}

const STATUS_LABELS = {
  pending: 'Request Sent',
  accepted: 'Request Accepted',
  declined: 'Request Declined',
  operator_en_route: 'Operator En Route',
  in_progress: 'In Progress',
  completed: 'Completed'
};

const STATUS_COLORS = {
  pending: '#eab308',
  accepted: '#16a34a',
  declined: '#dc2626',
  operator_en_route: '#3b82f6',
  in_progress: '#8b5cf6',
  completed: '#059669'
};

export default function MachineryRequestsTab({ contractorId, renterMetrics = {}, showResponseTimes = false }: MachineryRequestsTabProps) {
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requests, setRequests] = useState<MachineryRequest[]>([
    {
      id: '1',
      category: 'excavator',
      startDate: '2024-02-01',
      endDate: '2024-02-05',
      budget: 4000,
      finalPrice: 4400,
      region: 'Downtown',
      status: 'accepted',
      createdAt: '2024-01-15T10:00:00Z',
      acceptedBy: 'Heavy Equipment Co.',
      renterId: 'rent1'
    }
  ]);

  const handleSubmitRequest = (request: any) => {
    setRequests(prev => [...prev, request]);
    setShowRequestForm(false);
    // Here you would normally broadcast to nearby renters
  };

  const getStatusColor = (status: string) => {
    return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || '#6b7280';
  };

  const getStatusLabel = (status: string) => {
    return STATUS_LABELS[status as keyof typeof STATUS_LABELS] || status;
  };

  const getRenterMetrics = (renterId: string) => {
    return renterMetrics[renterId];
  };

  const shouldShowBoostBadge = (renterId: string) => {
    const metrics = getRenterMetrics(renterId);
    if (!metrics) return false;
    return ResponseTimeService.getInstance().isBoostEligible(metrics.boost_score);
  };

  if (showRequestForm) {
    return (
      <MachineryRequestForm
        onSubmit={handleSubmitRequest}
        onCancel={() => setShowRequestForm(false)}
        renterMetrics={renterMetrics}
        showBoostBadges={true}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Machinery Requests</Text>
        <TouchableOpacity
          style={styles.requestButton}
          onPress={() => setShowRequestForm(true)}
        >
          <Text style={styles.requestButtonText}>Request Machinery</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.requestsList}>
        {requests.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No machinery requests yet</Text>
            <Text style={styles.emptySubtext}>Tap "Request Machinery" to get started</Text>
          </View>
        ) : (
          requests.map((request) => {
            const metrics = request.renterId ? getRenterMetrics(request.renterId) : null;
            
            return (
              <View key={request.id} style={styles.requestCard}>
                <View style={styles.requestHeader}>
                  <Text style={styles.requestCategory}>
                    {request.category.charAt(0).toUpperCase() + request.category.slice(1)}
                  </Text>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(request.status) }
                  ]}>
                    <Text style={styles.statusText}>
                      {getStatusLabel(request.status)}
                    </Text>
                  </View>
                </View>
                
                <Text style={styles.requestDates}>
                  {request.startDate} to {request.endDate}
                </Text>
                
                <Text style={styles.requestRegion}>
                  Region: {request.region}
                </Text>
                
                <Text style={styles.requestPrice}>
                  Final Price: ${request.finalPrice.toLocaleString()}
                </Text>
                
                {request.acceptedBy && (
                  <Text style={styles.acceptedBy}>
                    Accepted by: {request.acceptedBy}
                  </Text>
                )}
                
                {showResponseTimes && metrics && request.status === 'accepted' && (
                  <ResponseTimeBadge 
                    avgResponseTime={metrics.avg_response_time}
                    boostScore={metrics.boost_score}
                    showBoostBadge={false}
                  />
                )}
                
                <Text style={styles.requestDate}>
                  Requested: {new Date(request.createdAt).toLocaleDateString()}
                </Text>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingBottom: 10 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#374151' },
  requestButton: { backgroundColor: '#dc2626', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  requestButtonText: { color: 'white', fontSize: 14, fontWeight: '600' },
  requestsList: { flex: 1, paddingHorizontal: 20 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 18, fontWeight: '500', color: '#6b7280', marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: '#9ca3af' },
  requestCard: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 10, elevation: 2 },
  requestHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  requestCategory: { fontSize: 18, fontWeight: 'bold', color: '#374151' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  requestDates: { fontSize: 14, color: '#6b7280', marginBottom: 5 },
  requestRegion: { fontSize: 14, color: '#6b7280', marginBottom: 5 },
  requestPrice: { fontSize: 16, fontWeight: '600', color: '#059669', marginBottom: 5 },
  acceptedBy: { fontSize: 14, color: '#16a34a', fontWeight: '500', marginBottom: 5 },
  requestDate: { fontSize: 12, color: '#9ca3af' }
});