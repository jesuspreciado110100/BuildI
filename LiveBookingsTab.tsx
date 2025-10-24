import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput } from 'react-native';

interface LiveBooking {
  id: string;
  type: 'labor' | 'machinery' | 'material';
  contractor: string;
  provider: string;
  site: string;
  status: 'in_progress' | 'paused' | 'escalated';
  startTime: string;
  progress: number;
  role: string;
}

export const LiveBookingsTab: React.FC = () => {
  const [bookings, setBookings] = useState<LiveBooking[]>([
    {
      id: 'book_001',
      type: 'labor',
      contractor: 'Smith Construction',
      provider: 'Johnson Crew',
      site: 'Downtown Plaza',
      status: 'in_progress',
      startTime: '08:00',
      progress: 65,
      role: 'Concrete Work'
    },
    {
      id: 'book_002',
      type: 'machinery',
      contractor: 'ABC Builders',
      provider: 'Heavy Equipment Co',
      site: 'Industrial Park',
      status: 'paused',
      startTime: '09:30',
      progress: 30,
      role: 'Excavator Rental'
    },
    {
      id: 'book_003',
      type: 'material',
      contractor: 'Metro Construction',
      provider: 'Steel Supply Inc',
      site: 'Bridge Project',
      status: 'escalated',
      startTime: '07:00',
      progress: 85,
      role: 'Steel Delivery'
    }
  ]);

  const [filters, setFilters] = useState({
    type: 'all',
    role: 'all',
    site: 'all'
  });

  const [searchTerm, setSearchTerm] = useState('');

  const filteredBookings = bookings.filter(booking => {
    const matchesType = filters.type === 'all' || booking.type === filters.type;
    const matchesRole = filters.role === 'all' || booking.role.toLowerCase().includes(filters.role.toLowerCase());
    const matchesSite = filters.site === 'all' || booking.site.toLowerCase().includes(filters.site.toLowerCase());
    const matchesSearch = searchTerm === '' || 
      booking.contractor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.site.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesType && matchesRole && matchesSite && matchesSearch;
  });

  const handleQuickAction = (bookingId: string, action: 'pause' | 'escalate' | 'reassign' | 'chat') => {
    switch (action) {
      case 'pause':
        setBookings(prev => prev.map(b => 
          b.id === bookingId ? { ...b, status: 'paused' } : b
        ));
        break;
      case 'escalate':
        setBookings(prev => prev.map(b => 
          b.id === bookingId ? { ...b, status: 'escalated' } : b
        ));
        break;
      case 'reassign':
        // Mock reassignment
        console.log('Reassigning booking:', bookingId);
        break;
      case 'chat':
        // Mock chat opening
        console.log('Opening chat for booking:', bookingId);
        break;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress': return '#28A745';
      case 'paused': return '#FFC107';
      case 'escalated': return '#DC3545';
      default: return '#6C757D';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'labor': return '👷';
      case 'machinery': return '🚜';
      case 'material': return '📦';
      default: return '📋';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Live Bookings ({filteredBookings.length})</Text>
      
      <View style={styles.filtersContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search bookings..."
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Type:</Text>
          <View style={styles.filterButtons}>
            {['all', 'labor', 'machinery', 'material'].map(type => (
              <TouchableOpacity
                key={type}
                style={[styles.filterButton, filters.type === type && styles.activeFilter]}
                onPress={() => setFilters(prev => ({ ...prev, type }))}
              >
                <Text style={[styles.filterText, filters.type === type && styles.activeFilterText]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <ScrollView style={styles.bookingsList}>
        {filteredBookings.map(booking => (
          <View key={booking.id} style={styles.bookingCard}>
            <View style={styles.bookingHeader}>
              <View style={styles.bookingInfo}>
                <Text style={styles.bookingIcon}>{getTypeIcon(booking.type)}</Text>
                <View style={styles.bookingDetails}>
                  <Text style={styles.bookingTitle}>{booking.role}</Text>
                  <Text style={styles.bookingSubtitle}>{booking.contractor} → {booking.provider}</Text>
                  <Text style={styles.bookingSite}>📍 {booking.site}</Text>
                </View>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
                <Text style={styles.statusText}>{booking.status.replace('_', ' ')}</Text>
              </View>
            </View>
            
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>Progress: {booking.progress}%</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${booking.progress}%` }]} />
              </View>
            </View>
            
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.pauseButton]}
                onPress={() => handleQuickAction(booking.id, 'pause')}
              >
                <Text style={styles.actionButtonText}>Pause</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.escalateButton]}
                onPress={() => handleQuickAction(booking.id, 'escalate')}
              >
                <Text style={styles.actionButtonText}>Escalate</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.reassignButton]}
                onPress={() => handleQuickAction(booking.id, 'reassign')}
              >
                <Text style={styles.actionButtonText}>Reassign</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.chatButton]}
                onPress={() => handleQuickAction(booking.id, 'chat')}
              >
                <Text style={styles.actionButtonText}>💬 Chat</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  filtersContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 12,
    color: '#333',
  },
  filterButtons: {
    flexDirection: 'row',
    flex: 1,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  activeFilter: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  activeFilterText: {
    color: 'white',
  },
  bookingsList: {
    flex: 1,
  },
  bookingCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bookingInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  bookingIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  bookingDetails: {
    flex: 1,
  },
  bookingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  bookingSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  bookingSite: {
    fontSize: 12,
    color: '#999',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  pauseButton: {
    backgroundColor: '#FFC107',
  },
  escalateButton: {
    backgroundColor: '#DC3545',
  },
  reassignButton: {
    backgroundColor: '#6C757D',
  },
  chatButton: {
    backgroundColor: '#007AFF',
  },
  actionButtonText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
});