import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Alert } from 'react-native';
import { BookingRequest } from '../types';
import MachineryMapView from './MachineryMapView';
import MachineryBookingForm from './MachineryBookingForm';

interface MachineryBookingScreenProps {
  onBookingSubmit: (request: Omit<BookingRequest, 'id' | 'created_at'>) => void;
}

export default function MachineryBookingScreen({ onBookingSubmit }: MachineryBookingScreenProps) {
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedMachineId, setSelectedMachineId] = useState<string | null>(null);
  const [selectedMachineType, setSelectedMachineType] = useState<string>('');

  const handleMachineSelect = (machineId: string) => {
    setSelectedMachineId(machineId);
    Alert.alert(
      'Machine Selected',
      'This machine is available in your area. Create a booking request to get full details after confirmation.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Book Now', onPress: () => setShowBookingForm(true) }
      ]
    );
  };

  const handleBookingSubmit = (request: Omit<BookingRequest, 'id' | 'created_at'>) => {
    // Add selected machine info to request
    const enhancedRequest = {
      ...request,
      resource_id: selectedMachineId || request.resource_id,
    };
    
    onBookingSubmit(enhancedRequest);
    setShowBookingForm(false);
    setSelectedMachineId(null);
    
    Alert.alert(
      'Request Sent!',
      'Your booking ping has been sent to nearby machinery owners. You\'ll be notified when someone accepts.',
      [{ text: 'OK' }]
    );
  };

  const machineTypes = [
    { id: 'excavator', name: 'Excavator', icon: '🚜' },
    { id: 'crane', name: 'Crane', icon: '🏗️' },
    { id: 'bulldozer', name: 'Bulldozer', icon: '🚧' },
    { id: 'loader', name: 'Loader', icon: '🚛' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Find Machinery</Text>
        <Text style={styles.subtitle}>Tap on map pulses to see available machines</Text>
      </View>

      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filter by type:</Text>
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterChip, !selectedMachineType && styles.activeFilter]}
            onPress={() => setSelectedMachineType('')}
          >
            <Text style={[styles.filterText, !selectedMachineType && styles.activeFilterText]}>All</Text>
          </TouchableOpacity>
          {machineTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[styles.filterChip, selectedMachineType === type.id && styles.activeFilter]}
              onPress={() => setSelectedMachineType(type.id)}
            >
              <Text style={styles.filterIcon}>{type.icon}</Text>
              <Text style={[styles.filterText, selectedMachineType === type.id && styles.activeFilterText]}>
                {type.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <MachineryMapView
        onMachineSelect={handleMachineSelect}
        selectedMachineType={selectedMachineType}
      />

      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={styles.quickBookButton}
          onPress={() => setShowBookingForm(true)}
        >
          <Text style={styles.quickBookText}>📋 Create Custom Request</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showBookingForm}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <MachineryBookingForm
          onSubmit={handleBookingSubmit}
          onCancel={() => setShowBookingForm(false)}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 20, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1e293b', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#64748b' },
  filterContainer: { backgroundColor: 'white', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  filterLabel: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filterChip: { backgroundColor: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 4 },
  activeFilter: { backgroundColor: '#3b82f6' },
  filterIcon: { fontSize: 14 },
  filterText: { fontSize: 12, color: '#64748b', fontWeight: '500' },
  activeFilterText: { color: 'white' },
  bottomActions: { padding: 16, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  quickBookButton: { backgroundColor: '#059669', padding: 16, borderRadius: 12, alignItems: 'center' },
  quickBookText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});