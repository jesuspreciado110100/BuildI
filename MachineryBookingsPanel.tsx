import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { ChatModal } from './ChatModal';
import { MachineryRequestForm } from './MachineryRequestForm';
import { RentalSummaryCard } from './RentalSummaryCard';

interface MachineryBooking {
  id: string;
  machineryName: string;
  type: string;
  operatorName?: string;
  operatorPhone?: string;
  status: 'pending' | 'confirmed' | 'in_use' | 'completed' | 'issue';
  dailyRate: number;
  daysBooked: number;
  startDate: string;
  endDate: string;
  canChat: boolean;
}

interface MachineryBookingsPanelProps {
  conceptId: string;
  siteId: string;
  machineryBookings: MachineryBooking[];
  onRefresh?: () => void;
}

export const MachineryBookingsPanel: React.FC<MachineryBookingsPanelProps> = ({
  conceptId,
  siteId,
  machineryBookings,
  onRefresh
}) => {
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [selectedMachinery, setSelectedMachinery] = useState<MachineryBooking | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [showRentalSummary, setShowRentalSummary] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'in_use': return '#FF9800';
      case 'confirmed': return '#2196F3';
      case 'pending': return '#FFC107';
      case 'issue': return '#F44336';
      default: return '#666';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅';
      case 'in_use': return '🔧';
      case 'confirmed': return '📋';
      case 'pending': return '⏳';
      case 'issue': return '⚠️';
      default: return '❓';
    }
  };

  const handleChatPress = (machinery: MachineryBooking) => {
    setSelectedMachinery(machinery);
    setShowChat(true);
  };

  const handleViewSummary = (machinery: MachineryBooking) => {
    setSelectedMachinery(machinery);
    setShowRentalSummary(true);
  };

  const renderMachineryItem = ({ item }: { item: MachineryBooking }) => (
    <View style={styles.machineryItem}>
      <View style={styles.machineryHeader}>
        <View style={styles.machineryInfo}>
          <View style={styles.titleRow}>
            <Text style={styles.statusIcon}>{getStatusIcon(item.status)}</Text>
            <Text style={styles.machineryName}>{item.machineryName}</Text>
          </View>
          <Text style={styles.machineryType}>{item.type}</Text>
          {item.operatorName && (
            <Text style={styles.operatorInfo}>
              Operator: {item.operatorName}
            </Text>
          )}
          <Text style={styles.rentalDetails}>
            ${item.dailyRate}/day • {item.daysBooked} days
          </Text>
          <Text style={styles.dateRange}>
            {item.startDate} - {item.endDate}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      
      <View style={styles.itemActions}>
        {item.canChat && (
          <TouchableOpacity 
            style={styles.itemActionButton}
            onPress={() => handleChatPress(item)}
          >
            <Text style={styles.itemActionText}>💬 Chat</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={styles.itemActionButton}
          onPress={() => handleViewSummary(item)}
        >
          <Text style={styles.itemActionText}>📊 Summary</Text>
        </TouchableOpacity>
        
        {item.status === 'issue' && (
          <TouchableOpacity 
            style={[styles.itemActionButton, styles.issueButton]}
            onPress={() => {}}
          >
            <Text style={[styles.itemActionText, styles.issueButtonText]}>⚠️ Issue</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Machinery Bookings</Text>
        <Text style={styles.count}>{machineryBookings.length} rentals</Text>
      </View>
      
      <FlatList
        data={machineryBookings}
        renderItem={renderMachineryItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No machinery booked yet</Text>
          </View>
        }
      />
      
      <TouchableOpacity 
        style={styles.requestButton}
        onPress={() => setShowRequestForm(true)}
      >
        <Text style={styles.requestButtonText}>Request Machinery</Text>
      </TouchableOpacity>
      
      <MachineryRequestForm
        visible={showRequestForm}
        onClose={() => setShowRequestForm(false)}
        conceptId={conceptId}
        siteId={siteId}
        onSuccess={onRefresh}
      />
      
      {selectedMachinery && (
        <>
          <ChatModal
            visible={showChat}
            onClose={() => setShowChat(false)}
            recipientId={selectedMachinery.id}
            recipientName={selectedMachinery.operatorName || 'Operator'}
          />
          
          <RentalSummaryCard
            visible={showRentalSummary}
            onClose={() => setShowRentalSummary(false)}
            rentalId={selectedMachinery.id}
          />
        </>
      )}
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
  machineryItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingVertical: 12
  },
  machineryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  machineryInfo: {
    flex: 1
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  statusIcon: {
    fontSize: 16,
    marginRight: 8
  },
  machineryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },
  machineryType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2
  },
  operatorInfo: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2
  },
  rentalDetails: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2
  },
  dateRange: {
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
  itemActions: {
    flexDirection: 'row',
    gap: 8
  },
  itemActionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 16
  },
  issueButton: {
    backgroundColor: '#ffebee'
  },
  itemActionText: {
    fontSize: 12,
    color: '#333'
  },
  issueButtonText: {
    color: '#F44336'
  },
  requestButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16
  },
  requestButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600'
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