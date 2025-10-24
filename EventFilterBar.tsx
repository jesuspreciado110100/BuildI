import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

interface EventFilterBarProps {
  onFilterChange: (filters: { type?: string; date?: string }) => void;
}

export default function EventFilterBar({ onFilterChange }: EventFilterBarProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const eventTypes = [
    { id: 'job_fair', label: 'Job Fairs', color: '#AF52DE' },
    { id: 'safety_training', label: 'Safety Training', color: '#FF3B30' },
    { id: 'certification', label: 'Certification', color: '#34C759' },
    { id: 'conference', label: 'Conferences', color: '#007AFF' },
    { id: 'workshop', label: 'Workshops', color: '#FF9500' },
    { id: 'networking', label: 'Networking', color: '#5856D6' }
  ];

  const dateFilters = [
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'upcoming', label: 'Upcoming' }
  ];

  const handleTypeFilter = (typeId: string) => {
    const newType = selectedType === typeId ? null : typeId;
    setSelectedType(newType);
    onFilterChange({ type: newType || undefined, date: selectedDate || undefined });
  };

  const handleDateFilter = (dateId: string) => {
    const newDate = selectedDate === dateId ? null : dateId;
    setSelectedDate(newDate);
    onFilterChange({ type: selectedType || undefined, date: newDate || undefined });
  };

  const clearFilters = () => {
    setSelectedType(null);
    setSelectedDate(null);
    onFilterChange({});
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Filter Events</Text>
        {(selectedType || selectedDate) && (
          <TouchableOpacity onPress={clearFilters}>
            <Text style={styles.clearButton}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <Text style={styles.sectionTitle}>Event Type</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
        {eventTypes.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.filterButton,
              selectedType === type.id && { backgroundColor: type.color + '20' }
            ]}
            onPress={() => handleTypeFilter(type.id)}
          >
            <Text style={[
              styles.filterText,
              selectedType === type.id && { color: type.color, fontWeight: 'bold' }
            ]}>
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <Text style={styles.sectionTitle}>Date Range</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
        {dateFilters.map((date) => (
          <TouchableOpacity
            key={date.id}
            style={[
              styles.filterButton,
              selectedDate === date.id && styles.selectedDateFilter
            ]}
            onPress={() => handleDateFilter(date.id)}
          >
            <Text style={[
              styles.filterText,
              selectedDate === date.id && styles.selectedDateText
            ]}>
              {date.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },
  clearButton: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: 'bold'
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    marginTop: 8
  },
  filterRow: {
    marginBottom: 12
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: 'transparent'
  },
  selectedDateFilter: {
    backgroundColor: '#007AFF20',
    borderColor: '#007AFF'
  },
  filterText: {
    fontSize: 12,
    color: '#666'
  },
  selectedDateText: {
    color: '#007AFF',
    fontWeight: 'bold'
  }
});