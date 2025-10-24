import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

interface TradeOfferBookingsTimelineProps {
  siteId: string;
}

interface Booking {
  id: string;
  type: 'labor' | 'machinery' | 'material';
  title: string;
  provider: string;
  startDate: string;
  endDate: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  cost: number;
}

export const TradeOfferBookingsTimeline: React.FC<TradeOfferBookingsTimelineProps> = ({ siteId }) => {
  // Mock data - in real app, fetch based on siteId
  const bookings: Booking[] = [
    {
      id: '1',
      type: 'labor',
      title: 'Concrete Workers',
      provider: 'BuildCrew Co.',
      startDate: '2024-01-15',
      endDate: '2024-01-20',
      status: 'confirmed',
      cost: 2500
    },
    {
      id: '2',
      type: 'machinery',
      title: 'Excavator Rental',
      provider: 'Heavy Equipment Inc.',
      startDate: '2024-01-18',
      endDate: '2024-01-25',
      status: 'confirmed',
      cost: 1800
    },
    {
      id: '3',
      type: 'material',
      title: 'Concrete Delivery',
      provider: 'ConcreteMax',
      startDate: '2024-01-22',
      endDate: '2024-01-22',
      status: 'pending',
      cost: 3200
    },
    {
      id: '4',
      type: 'labor',
      title: 'Electrical Team',
      provider: 'ElectricPro',
      startDate: '2024-01-25',
      endDate: '2024-02-05',
      status: 'pending',
      cost: 4500
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'labor': return '#3B82F6';
      case 'machinery': return '#F59E0B';
      case 'material': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return '#10B981';
      case 'pending': return '#F59E0B';
      case 'completed': return '#6B7280';
      case 'cancelled': return '#EF4444';
      default: return '#6B7280';
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bookings Timeline</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterButtonText}>Filter</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.timeline}>
          {bookings.map((booking, index) => (
            <View key={booking.id} style={styles.timelineItem}>
              <View style={styles.timelineMarker}>
                <View style={[
                  styles.markerDot,
                  { backgroundColor: getTypeColor(booking.type) }
                ]} />
                {index < bookings.length - 1 && <View style={styles.timelineLine} />}
              </View>
              
              <View style={styles.bookingCard}>
                <View style={styles.bookingHeader}>
                  <View style={styles.bookingTitleRow}>
                    <Text style={styles.typeIcon}>{getTypeIcon(booking.type)}</Text>
                    <Text style={styles.bookingTitle}>{booking.title}</Text>
                  </View>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(booking.status) }
                  ]}>
                    <Text style={styles.statusText}>{booking.status}</Text>
                  </View>
                </View>
                
                <Text style={styles.provider}>{booking.provider}</Text>
                
                <View style={styles.bookingDetails}>
                  <View style={styles.dateRange}>
                    <Text style={styles.dateText}>
                      {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                    </Text>
                  </View>
                  <Text style={styles.cost}>{formatCurrency(booking.cost)}</Text>
                </View>
                
                <View style={styles.bookingActions}>
                  <TouchableOpacity style={styles.actionButton}>
                    <Text style={styles.actionButtonText}>View Details</Text>
                  </TouchableOpacity>
                  
                  {booking.status === 'pending' && (
                    <TouchableOpacity style={[styles.actionButton, styles.primaryButton]}>
                      <Text style={[styles.actionButtonText, styles.primaryButtonText]}>Confirm</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  filterButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  content: {
    padding: 20,
  },
  timeline: {
    position: 'relative',
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timelineMarker: {
    alignItems: 'center',
    marginRight: 16,
  },
  markerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#e5e7eb',
    marginTop: 8,
  },
  bookingCard: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bookingTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  typeIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  bookingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
    textTransform: 'capitalize',
  },
  provider: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  bookingDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateRange: {
    flex: 1,
  },
  dateText: {
    fontSize: 14,
    color: '#374151',
  },
  cost: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  bookingActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  primaryButtonText: {
    color: '#ffffff',
  },
});