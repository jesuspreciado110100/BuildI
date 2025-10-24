import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SiteCalendarPanelProps {
  contractorId?: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'meeting' | 'deadline' | 'inspection' | 'delivery';
}

export default function SiteCalendarPanel({ contractorId }: SiteCalendarPanelProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const mockEvents: CalendarEvent[] = [
    {
      id: '1',
      title: 'Foundation Inspection',
      date: '2024-01-15',
      time: '09:00',
      type: 'inspection'
    },
    {
      id: '2',
      title: 'Material Delivery',
      date: '2024-01-16',
      time: '14:00',
      type: 'delivery'
    },
    {
      id: '3',
      title: 'Project Meeting',
      date: '2024-01-17',
      time: '10:30',
      type: 'meeting'
    }
  ];

  const getEventIcon = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'meeting': return 'people';
      case 'deadline': return 'time';
      case 'inspection': return 'search';
      case 'delivery': return 'car';
      default: return 'calendar';
    }
  };

  const getEventColor = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'meeting': return '#007aff';
      case 'deadline': return '#ff3b30';
      case 'inspection': return '#ff9500';
      case 'delivery': return '#34c759';
      default: return '#666';
    }
  };

  const renderEvent = ({ item }: { item: CalendarEvent }) => (
    <TouchableOpacity style={styles.eventItem}>
      <View style={[styles.eventIcon, { backgroundColor: getEventColor(item.type) }]}>
        <Ionicons name={getEventIcon(item.type)} size={16} color="white" />
      </View>
      <View style={styles.eventContent}>
        <Text style={styles.eventTitle}>{item.title}</Text>
        <Text style={styles.eventTime}>{item.time} • {item.date}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Site Calendar</Text>
      </View>

      <View style={styles.eventsSection}>
        <Text style={styles.sectionTitle}>Upcoming Events</Text>
        <FlatList
          data={mockEvents}
          renderItem={renderEvent}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  eventsSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#374151',
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  eventIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  eventTime: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
});