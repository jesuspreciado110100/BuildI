import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { WorkerProfile } from '../types';
import { StarRating } from './StarRating';
import { ChatModal } from './ChatModal';
import { LaborRequestForm } from './LaborRequestForm';
import { MicroJobRequestForm } from './MicroJobRequestForm';
import { WorkerProfileModal } from './WorkerProfileModal';

interface LaborBooking {
  id: string;
  type: 'labor_request' | 'micro_job' | 'full_trade';
  workerName: string;
  trade: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed';
  rating?: number;
  hourlyRate: number;
  hoursWorked: number;
  canChat: boolean;
  worker?: WorkerProfile;
}

interface LaborBookingsPanelProps {
  conceptId: string;
  siteId: string;
  laborBookings: LaborBooking[];
  onRefresh?: () => void;
}

export const LaborBookingsPanel: React.FC<LaborBookingsPanelProps> = ({
  conceptId,
  siteId,
  laborBookings,
  onRefresh
}) => {
  const [showLaborForm, setShowLaborForm] = useState(false);
  const [showMicroJobForm, setShowMicroJobForm] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<LaborBooking | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [showWorkerProfile, setShowWorkerProfile] = useState(false);
  const [selectedWorkerProfile, setSelectedWorkerProfile] = useState<WorkerProfile | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'in_progress': return '#FF9800';
      case 'accepted': return '#2196F3';
      case 'pending': return '#FFC107';
      default: return '#666';
    }
  };

  const handleChatPress = (worker: LaborBooking) => {
    setSelectedWorker(worker);
    setShowChat(true);
  };

  const handleWorkerPress = (booking: LaborBooking) => {
    const workerProfile: WorkerProfile = booking.worker || {
      id: booking.id,
      name: booking.workerName,
      trade_type: booking.trade,
      rating: booking.rating || 4.0,
      hourly_rate: booking.hourlyRate,
      experience_years: 5,
      availability: booking.status !== 'completed',
      skills: [booking.trade],
      completed_jobs_count: 50,
      skill_certifications: ['OSHA 10']
    };
    setSelectedWorkerProfile(workerProfile);
    setShowWorkerProfile(true);
  };

  const handleRequestHire = (worker: WorkerProfile) => {
    console.log('Requesting hire for:', worker.name);
    setShowWorkerProfile(false);
  };

  const renderLaborItem = ({ item }: { item: LaborBooking }) => (
    <View style={styles.laborItem}>
      <View style={styles.laborHeader}>
        <TouchableOpacity 
          style={styles.laborInfo}
          onPress={() => handleWorkerPress(item)}
        >
          <Text style={styles.workerName}>{item.workerName}</Text>
          <Text style={styles.trade}>{item.trade}</Text>
          <Text style={styles.workDetails}>
            ${item.hourlyRate}/hr • {item.hoursWorked}h worked
          </Text>
        </TouchableOpacity>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      
      {item.rating && (
        <View style={styles.ratingSection}>
          <StarRating rating={item.rating} size={16} />
          <Text style={styles.ratingText}>({item.rating}/5)</Text>
        </View>
      )}
      
      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => handleWorkerPress(item)}
        >
          <Text style={styles.profileButtonText}>View Profile</Text>
        </TouchableOpacity>
        {item.canChat && (
          <TouchableOpacity 
            style={styles.chatButton}
            onPress={() => handleChatPress(item)}
          >
            <Text style={styles.chatButtonText}>💬 Chat</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Labor Bookings</Text>
        <Text style={styles.count}>{laborBookings.length} workers</Text>
      </View>
      
      <FlatList
        data={laborBookings}
        renderItem={renderLaborItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No labor assigned yet</Text>
          </View>
        }
      />
      
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => setShowLaborForm(true)}
        >
          <Text style={styles.actionButtonText}>Request More Labor</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={() => setShowMicroJobForm(true)}
        >
          <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>Send Micro Job</Text>
        </TouchableOpacity>
      </View>
      
      <LaborRequestForm
        visible={showLaborForm}
        onClose={() => setShowLaborForm(false)}
        conceptId={conceptId}
        siteId={siteId}
        onSuccess={onRefresh}
      />
      
      <MicroJobRequestForm
        visible={showMicroJobForm}
        onClose={() => setShowMicroJobForm(false)}
        conceptId={conceptId}
        siteId={siteId}
        onSuccess={onRefresh}
      />
      
      {selectedWorker && (
        <ChatModal
          visible={showChat}
          onClose={() => setShowChat(false)}
          recipientId={selectedWorker.id}
          recipientName={selectedWorker.workerName}
        />
      )}

      <WorkerProfileModal
        worker={selectedWorkerProfile}
        visible={showWorkerProfile}
        onClose={() => setShowWorkerProfile(false)}
        onRequestHire={handleRequestHire}
        contractorId="contractor-1"
        conceptId={conceptId}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333'
  },
  count: {
    fontSize: 14,
    color: '#666'
  },
  laborItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingVertical: 12
  },
  laborHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8
  },
  laborInfo: {
    flex: 1
  },
  workerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2
  },
  trade: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2
  },
  workDetails: {
    fontSize: 12,
    color: '#999'
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
    textTransform: 'uppercase'
  },
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8
  },
  profileButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#2196F3',
    borderRadius: 16
  },
  profileButtonText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600'
  },
  chatButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 16
  },
  chatButtonText: {
    fontSize: 12,
    color: '#333'
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 8
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF'
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600'
  },
  secondaryButtonText: {
    color: '#007AFF'
  },
  emptyState: {
    padding: 20,
    alignItems: 'center'
  },
  emptyText: {
    fontSize: 14,
    color: '#666'
  }
});