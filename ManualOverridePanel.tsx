import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';

export const ManualOverridePanel: React.FC = () => {
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [newProviderId, setNewProviderId] = useState('');
  const [overrideReason, setOverrideReason] = useState('');

  const handleCloseBooking = () => {
    if (!selectedBookingId.trim()) {
      Alert.alert('Error', 'Please enter a booking ID');
      return;
    }
    Alert.alert('Success', `Booking ${selectedBookingId} has been manually closed`);
    setSelectedBookingId('');
  };

  const handleReassignJob = () => {
    if (!selectedBookingId.trim() || !newProviderId.trim()) {
      Alert.alert('Error', 'Please enter both booking ID and new provider ID');
      return;
    }
    Alert.alert('Success', `Job ${selectedBookingId} reassigned to provider ${newProviderId}`);
    setSelectedBookingId('');
    setNewProviderId('');
  };

  const handleOverridePayment = () => {
    if (!selectedBookingId.trim() || !overrideReason.trim()) {
      Alert.alert('Error', 'Please enter booking ID and reason');
      return;
    }
    Alert.alert('Success', `Payment override applied to booking ${selectedBookingId}`);
    setSelectedBookingId('');
    setOverrideReason('');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Manual Override Controls</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔒 Close Booking</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter booking ID"
          value={selectedBookingId}
          onChangeText={setSelectedBookingId}
        />
        <TouchableOpacity style={[styles.button, styles.closeButton]} onPress={handleCloseBooking}>
          <Text style={styles.buttonText}>Force Close Booking</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔄 Reassign Job</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter booking ID"
          value={selectedBookingId}
          onChangeText={setSelectedBookingId}
        />
        <TextInput
          style={styles.input}
          placeholder="Enter new provider ID"
          value={newProviderId}
          onChangeText={setNewProviderId}
        />
        <TouchableOpacity style={[styles.button, styles.reassignButton]} onPress={handleReassignJob}>
          <Text style={styles.buttonText}>Reassign Job</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💰 Override Payment</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter booking ID"
          value={selectedBookingId}
          onChangeText={setSelectedBookingId}
        />
        <TextInput
          style={styles.input}
          placeholder="Override reason"
          value={overrideReason}
          onChangeText={setOverrideReason}
          multiline
        />
        <TouchableOpacity style={[styles.button, styles.paymentButton]} onPress={handleOverridePayment}>
          <Text style={styles.buttonText}>Override Payment Release</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.warningSection}>
        <Text style={styles.warningTitle}>⚠️ Warning</Text>
        <Text style={styles.warningText}>
          Manual overrides should only be used in exceptional circumstances. 
          All actions are logged and audited.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: '#333' },
  section: { backgroundColor: 'white', padding: 16, borderRadius: 8, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12, color: '#333' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 16 },
  button: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center' },
  closeButton: { backgroundColor: '#DC3545' },
  reassignButton: { backgroundColor: '#FFC107' },
  paymentButton: { backgroundColor: '#28A745' },
  buttonText: { fontSize: 16, color: 'white', fontWeight: '600' },
  warningSection: { backgroundColor: '#FFF3CD', padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#FFEAA7' },
  warningTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 8, color: '#856404' },
  warningText: { fontSize: 12, color: '#856404', lineHeight: 18 }
});