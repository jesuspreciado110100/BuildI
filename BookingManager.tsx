import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, TouchableOpacity, Modal } from 'react-native';
import { BookingRequest } from '../types';
import ChatService from '../services/ChatService';
import { ChatModal } from './ChatModal';

interface BookingManagerProps {
  userRole: string;
  userId: string;
}

export default function BookingManager({ userRole, userId }: BookingManagerProps) {
  const [bookings, setBookings] = useState<BookingRequest[]>([
    {
      id: '1',
      requester_id: 'contractor1',
      provider_id: 'renter1',
      renter_id: 'renter1',
      resource_type: 'machinery',
      resource_id: 'machine1',
      status: 'accepted',
      start_date: '2024-02-01',
      end_date: '2024-02-05',
      price: 4000,
      final_price: 4400,
      net_to_renter: 3600,
      platform_fee_total: 400,
      location: 'Downtown',
      created_at: '2024-01-15T10:00:00Z',
      cancellation_status: 'none'
    },
    {
      id: '2',
      requester_id: 'contractor2',
      provider_id: 'renter1',
      renter_id: 'renter1',
      resource_type: 'machinery',
      resource_id: 'machine2',
      status: 'completed',
      start_date: '2024-01-10',
      end_date: '2024-01-12',
      price: 1800,
      final_price: 1980,
      net_to_renter: 1620,
      platform_fee_total: 180,
      location: 'Suburbs',
      created_at: '2024-01-05T10:00:00Z',
      cancellation_status: 'cancelled',
      cancelled_by: 'contractor2',
      cancellation_time: '2024-01-10T06:00:00Z',
      is_penalized: true
    }
  ]);
  
  const [chatModal, setChatModal] = useState({ visible: false, bookingId: '', partnerName: '', partnerId: '' });

  const handleOpenChat = async (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;
    
    const hasMessages = await ChatService.hasMessages(bookingId);
    if (!hasMessages) {
      await ChatService.createChatRoom(bookingId, booking.requester_id, booking.renter_id || booking.provider_id);
    }
    
    const partnerName = userRole === 'contractor' ? 'Renter' : 'Contractor';
    const partnerId = userRole === 'contractor' ? (booking.renter_id || booking.provider_id) : booking.requester_id;
    setChatModal({ visible: true, bookingId, partnerName, partnerId });
  };

  const handleCancelBooking = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;
    
    const startTime = new Date(booking.start_date).getTime();
    const now = new Date().getTime();
    const hoursUntilStart = (startTime - now) / (1000 * 60 * 60);
    
    const isPenalized = hoursUntilStart < 2;
    
    setBookings(prev => prev.map(b => 
      b.id === bookingId ? {
        ...b,
        status: 'cancelled',
        cancellation_status: 'cancelled',
        cancelled_by: userId,
        cancellation_time: new Date().toISOString(),
        is_penalized: isPenalized
      } : b
    ));
    
    Alert.alert(
      'Booking Cancelled',
      isPenalized ? 'Penalty applied for cancelling within 2 hours of start time.' : 'Booking cancelled successfully.'
    );
  };

  const renderBooking = ({ item }: { item: BookingRequest }) => {
    const canCancel = item.status === 'accepted' || item.status === 'pending';
    const showPenalty = item.is_penalized && userRole === 'machinery_renter';
    
    return (
      <View style={styles.bookingCard}>
        <View style={styles.bookingHeader}>
          <Text style={styles.bookingTitle}>{item.resource_type} Booking</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
          </View>
        </View>
        
        {showPenalty && (
          <View style={styles.penaltyBadge}>
            <Text style={styles.penaltyText}>⚠️ Penalty Applied</Text>
          </View>
        )}
        
        <Text style={styles.bookingDates}>
          {item.start_date} to {item.end_date}
        </Text>
        
        <Text style={styles.bookingPrice}>
          ${item.final_price.toLocaleString()}
        </Text>
        
        <View style={styles.bookingActions}>
          {(item.status === 'accepted' || item.status === 'completed') && (
            <TouchableOpacity
              style={styles.chatButton}
              onPress={() => handleOpenChat(item.id)}
            >
              <Text style={styles.chatButtonText}>💬 Open Chat</Text>
            </TouchableOpacity>
          )}
          
          {canCancel && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => handleCancelBooking(item.id)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#eab308';
      case 'accepted': return '#16a34a';
      case 'completed': return '#059669';
      case 'cancelled': return '#dc2626';
      default: return '#6b7280';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Bookings</Text>
      
      <View style={styles.penaltyPolicy}>
        <Text style={styles.policyTitle}>📋 Penalty Policy</Text>
        <Text style={styles.policyText}>
          Cancelling within 2 hours of start time results in a penalty.
        </Text>
      </View>
      
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        renderItem={renderBooking}
        contentContainerStyle={styles.listContainer}
      />
      
      <ChatModal
        visible={chatModal.visible}
        onClose={() => setChatModal({ visible: false, bookingId: '', partnerName: '', partnerId: '' })}
        requestId={chatModal.bookingId}
        currentUserId={userId}
        otherUserId={chatModal.partnerId}
        otherUserName={chatModal.partnerName}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  title: { fontSize: 24, fontWeight: 'bold', padding: 20, color: '#111827' },
  penaltyPolicy: { backgroundColor: '#fef3c7', margin: 16, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#f59e0b' },
  policyTitle: { fontSize: 14, fontWeight: 'bold', color: '#92400e', marginBottom: 4 },
  policyText: { fontSize: 12, color: '#92400e' },
  listContainer: { padding: 16 },
  bookingCard: { backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 12, elevation: 2 },
  bookingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  bookingTitle: { fontSize: 16, fontWeight: 'bold', color: '#374151' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  penaltyBadge: { backgroundColor: '#fef2f2', padding: 8, borderRadius: 6, marginBottom: 8, borderWidth: 1, borderColor: '#fca5a5' },
  penaltyText: { color: '#dc2626', fontSize: 12, fontWeight: 'bold' },
  bookingDates: { fontSize: 14, color: '#6b7280', marginBottom: 4 },
  bookingPrice: { fontSize: 16, fontWeight: 'bold', color: '#059669', marginBottom: 12 },
  bookingActions: { flexDirection: 'row', justifyContent: 'space-between' },
  chatButton: { backgroundColor: '#3b82f6', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, flex: 1, marginRight: 8 },
  chatButtonText: { color: 'white', fontSize: 14, fontWeight: '500', textAlign: 'center' },
  cancelButton: { backgroundColor: '#dc2626', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  cancelButtonText: { color: 'white', fontSize: 14, fontWeight: '500' }
});