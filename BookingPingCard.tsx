import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BookingRequest, BookingPing } from '../types';

interface BookingPingCardProps {
  booking: BookingRequest;
  ping: BookingPing;
  onAccept: (pingId: string) => void;
  onDecline: (pingId: string) => void;
}

export default function BookingPingCard({ booking, ping, onAccept, onDecline }: BookingPingCardProps) {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiresAt = new Date(ping.expires_at).getTime();
      const diff = Math.max(0, Math.floor((expiresAt - now) / 1000));
      setTimeLeft(diff);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [ping.expires_at]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isExpired = timeLeft <= 0 || ping.status === 'expired';
  const isResponded = ping.status === 'accepted' || ping.status === 'declined';

  return (
    <View style={[styles.container, isExpired && styles.expiredContainer]}>
      <View style={styles.header}>
        <Text style={styles.title}>New Booking Request</Text>
        <View style={[styles.timer, isExpired && styles.expiredTimer]}>
          <Text style={[styles.timerText, isExpired && styles.expiredTimerText]}>
            {isExpired ? 'EXPIRED' : formatTime(timeLeft)}
          </Text>
        </View>
      </View>
      
      <Text style={styles.resourceType}>{booking.resource_type.toUpperCase()}</Text>
      <Text style={styles.location}>📍 {booking.location}</Text>
      <Text style={styles.description}>{booking.description}</Text>
      <Text style={styles.budget}>Budget: ${booking.price.toLocaleString()}</Text>
      <Text style={styles.startDate}>Start: {booking.start_date}</Text>
      
      {!isExpired && !isResponded && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.declineButton} 
            onPress={() => onDecline(ping.id)}
          >
            <Text style={styles.declineButtonText}>Decline</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.acceptButton} 
            onPress={() => onAccept(ping.id)}
          >
            <Text style={styles.acceptButtonText}>Accept</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {isResponded && (
        <View style={styles.statusContainer}>
          <Text style={[styles.statusText, 
            ping.status === 'accepted' ? styles.acceptedText : styles.declinedText
          ]}>
            {ping.status === 'accepted' ? '✓ ACCEPTED' : '✗ DECLINED'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: 'white', margin: 10, borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, borderLeftWidth: 4, borderLeftColor: '#f59e0b' },
  expiredContainer: { backgroundColor: '#f9fafb', borderLeftColor: '#6b7280' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  timer: { backgroundColor: '#f59e0b', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  expiredTimer: { backgroundColor: '#6b7280' },
  timerText: { color: 'white', fontSize: 14, fontWeight: 'bold' },
  expiredTimerText: { color: 'white' },
  resourceType: { fontSize: 16, fontWeight: '600', color: '#2563eb', marginBottom: 8 },
  location: { fontSize: 14, color: '#6b7280', marginBottom: 4 },
  description: { fontSize: 14, color: '#374151', marginBottom: 8 },
  budget: { fontSize: 16, fontWeight: '600', color: '#059669', marginBottom: 4 },
  startDate: { fontSize: 14, color: '#6b7280', marginBottom: 16 },
  buttonContainer: { flexDirection: 'row', gap: 12 },
  acceptButton: { flex: 1, backgroundColor: '#059669', padding: 12, borderRadius: 8, alignItems: 'center' },
  declineButton: { flex: 1, backgroundColor: '#dc2626', padding: 12, borderRadius: 8, alignItems: 'center' },
  acceptButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  declineButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  statusContainer: { alignItems: 'center', paddingVertical: 8 },
  statusText: { fontSize: 16, fontWeight: 'bold' },
  acceptedText: { color: '#059669' },
  declinedText: { color: '#dc2626' },
});