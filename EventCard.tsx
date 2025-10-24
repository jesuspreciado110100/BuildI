import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface EventCardProps {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  type: 'job_fair' | 'safety_training' | 'certification' | 'conference' | 'workshop' | 'networking';
  attendees: number;
  description: string;
  isRegistered?: boolean;
  onRegister: (id: string) => void;
  onPress: (id: string) => void;
}

export default function EventCard({
  id,
  title,
  date,
  time,
  location,
  type,
  attendees,
  description,
  isRegistered = false,
  onRegister,
  onPress
}: EventCardProps) {
  const getEventTypeColor = (eventType: string) => {
    switch (eventType) {
      case 'job_fair': return '#AF52DE';
      case 'safety_training': return '#FF3B30';
      case 'certification': return '#34C759';
      case 'conference': return '#007AFF';
      case 'workshop': return '#FF9500';
      case 'networking': return '#5856D6';
      default: return '#666';
    }
  };

  const getEventTypeLabel = (eventType: string) => {
    switch (eventType) {
      case 'job_fair': return 'Job Fair';
      case 'safety_training': return 'Safety Training';
      case 'certification': return 'Certification Course';
      case 'conference': return 'Conference';
      case 'workshop': return 'Workshop';
      case 'networking': return 'Networking';
      default: return 'Event';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(id)}>
      <View style={styles.header}>
        <Text style={[styles.eventType, { backgroundColor: getEventTypeColor(type) + '20', color: getEventTypeColor(type) }]}>
          {getEventTypeLabel(type)}
        </Text>
        <Text style={styles.attendeeCount}>👥 {attendees}</Text>
      </View>
      
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description} numberOfLines={2}>{description}</Text>
      
      <View style={styles.detailsContainer}>
        <View style={styles.dateTimeContainer}>
          <Text style={styles.date}>📅 {formatDate(date)}</Text>
          <Text style={styles.time}>🕐 {time}</Text>
        </View>
        <Text style={styles.location}>📍 {location}</Text>
      </View>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.registerButton, isRegistered && styles.registeredButton]}
          onPress={() => onRegister(id)}
          disabled={isRegistered}
        >
          <Text style={[styles.registerText, isRegistered && styles.registeredText]}>
            {isRegistered ? '✓ Registered' : 'Register'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.shareButton}>
          <Text style={styles.shareButtonText}>📤 Share</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  eventType: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4
  },
  attendeeCount: {
    fontSize: 12,
    color: '#666'
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20
  },
  detailsContainer: {
    marginBottom: 16
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  date: {
    fontSize: 12,
    color: '#666'
  },
  time: {
    fontSize: 12,
    color: '#666'
  },
  location: {
    fontSize: 12,
    color: '#666'
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12
  },
  registerButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    flex: 1,
    marginRight: 8
  },
  registeredButton: {
    backgroundColor: '#34C759'
  },
  registerText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  registeredText: {
    color: 'white'
  },
  shareButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6
  },
  shareButtonText: {
    color: '#666',
    fontSize: 12
  }
});