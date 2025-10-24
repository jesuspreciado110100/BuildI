import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, Alert } from 'react-native';
import { DeliveryVehicle, MaterialQuoteRequest } from '../types';

interface AssignVehicleModalProps {
  visible: boolean;
  onClose: () => void;
  vehicle: DeliveryVehicle | null;
  order: MaterialQuoteRequest | null;
  onAssign: (vehicleId: string, eta: string, notes: string) => void;
}

export const AssignVehicleModal: React.FC<AssignVehicleModalProps> = ({
  visible,
  onClose,
  vehicle,
  order,
  onAssign,
}) => {
  const [eta, setEta] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');

  const handleAssign = () => {
    if (!vehicle || !order) return;
    
    if (!eta.trim()) {
      Alert.alert('Error', 'Please provide an estimated delivery time');
      return;
    }

    onAssign(vehicle.id, eta, deliveryNotes);
    setEta('');
    setDeliveryNotes('');
    onClose();
  };

  if (!vehicle || !order) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Assign Vehicle</Text>
          
          <View style={styles.section}>
            <Text style={styles.label}>Vehicle:</Text>
            <Text style={styles.value}>{vehicle.driver_name}</Text>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.label}>Order:</Text>
            <Text style={styles.value}>{order.material_name}</Text>
            <Text style={styles.subValue}>Quantity: {order.quantity}</Text>
          </View>
          
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Estimated Delivery Time *</Text>
            <TextInput
              style={styles.input}
              value={eta}
              onChangeText={setEta}
              placeholder="e.g., 2 hours, Tomorrow 3 PM"
              multiline
            />
          </View>
          
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Delivery Notes (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={deliveryNotes}
              onChangeText={setDeliveryNotes}
              placeholder="Special instructions, contact info, etc."
              multiline
              numberOfLines={3}
            />
          </View>
          
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.assignButton} onPress={handleAssign}>
              <Text style={styles.assignButtonText}>Assign Vehicle</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#666',
  },
  subValue: {
    fontSize: 14,
    color: '#999',
    marginTop: 2,
  },
  inputSection: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  assignButton: {
    flex: 1,
    marginLeft: 8,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#2196F3',
    alignItems: 'center',
  },
  assignButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});