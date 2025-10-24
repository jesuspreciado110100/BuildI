import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  type: 'conference' | 'workshop' | 'networking' | 'job_fair';
  attendees: number;
  description: string;
}

export default function EventListTab() {
  const [events] = useState<Event[]>([
    {
      id: '1',
      title: 'Construction Safety Workshop',
      date: '2024-02-15',
      time: '9:00 AM - 4:00 PM',
      location: 'Downtown Convention Center',
      type: 'workshop',
      attendees: 45,
      description: 'Learn about latest safety protocols and regulations'
    },
    {
      id: '2',
      title: 'Building Tech Conference 2024',
      date: '2024-02-20',
      time: '8:00 AM - 6:00 PM',
      location: 'Tech Hub Auditorium',
      type: 'conference',
      attendees: 200,
      description: 'Explore new construction technologies and innovations'
    },
    {
      id: '3',
      title: 'Contractor Networking Mixer',
      date: '2024-02-25',
      time: '6:00 PM - 9:00 PM',
      location: 'Riverside Hotel',
      type: 'networking',
      attendees: 80,
      description: 'Connect with fellow contractors and industry professionals'
    },
    {
      id: '4',
      title: 'Construction Job Fair',
      date: '2024-03-01',
      time: '10:00 AM - 4:00 PM',
      location: 'City Convention Center',
      type: 'job_fair',
      attendees: 150,
      description: 'Find skilled workers and showcase your projects'
    }
  ]);

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'conference': return '#007AFF';
      case 'workshop': return '#34C759';
      case 'networking': return '#FF9500';
      case 'job_fair': return '#AF52DE';
      default: return '#666';
    }
  };

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'conference': return 'Conference';
      case 'workshop': return 'Workshop';
      case 'networking': return 'Networking';
      case 'job_fair': return 'Job Fair';
      default: return 'Event';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {events.map((event) => (
          <TouchableOpacity key={event.id} style={styles.eventCard}>
            <View style={styles.eventHeader}>
              <Text style={[styles.eventType, { color: getEventTypeColor(event.type) }]}>
                {getEventTypeLabel(event.type)}
              </Text>
              <Text style={styles.attendeeCount}>👥 {event.attendees}</Text>
            </View>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <Text style={styles.eventDescription}>{event.description}</Text>
            <View style={styles.eventDetails}>
              <Text style={styles.eventDate}>📅 {event.date}</Text>
              <Text style={styles.eventTime}>🕐 {event.time}</Text>
            </View>
            <Text style={styles.eventLocation}>📍 {event.location}</Text>
            <TouchableOpacity style={styles.registerButton}>
              <Text style={styles.registerText}>Register</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 16 },
  eventCard: { backgroundColor: 'white', padding: 16, borderRadius: 8, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  eventHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  eventType: { fontSize: 12, fontWeight: 'bold', backgroundColor: '#f0f8ff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  attendeeCount: { fontSize: 12, color: '#666' },
  eventTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  eventDescription: { fontSize: 14, color: '#666', marginBottom: 12, lineHeight: 20 },
  eventDetails: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  eventDate: { fontSize: 12, color: '#666' },
  eventTime: { fontSize: 12, color: '#666' },
  eventLocation: { fontSize: 12, color: '#666', marginBottom: 12 },
  registerButton: { backgroundColor: '#007AFF', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 6, alignSelf: 'flex-start' },
  registerText: { color: 'white', fontSize: 14, fontWeight: 'bold' }
});