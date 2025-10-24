import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput, Modal } from 'react-native';
import { MaterialQuoteRequest } from '../types';
import { DeliveryService } from '../services/DeliveryService';

interface DeliveryStatusPanelProps {
  order: MaterialQuoteRequest;
  userRole: 'contractor' | 'material_supplier';
  onStatusUpdate?: () => void;
}

export const DeliveryStatusPanel: React.FC<DeliveryStatusPanelProps> = ({
  order,
  userRole,
  onStatusUpdate,
}) => {
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueDescription, setIssueDescription] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FF9800';
      case 'en_route': return '#2196F3';
      case 'delivered': return '#4CAF50';
      case 'delayed': return '#F44336';
      case 'cancelled': return '#757575';
      default: return '#757575';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending Shipment';
      case 'en_route': return 'En Route';
      case 'delivered': return 'Delivered';
      case 'delayed': return 'Delayed';
      case 'cancelled': return 'Cancelled';
      default: return 'Unknown';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'en_route': return '🚛';
      case 'delivered': return '✅';
      case 'delayed': return '⚠️';
      case 'cancelled': return '❌';
      default: return '❓';
    }
  };

  const handleFlagIssue = async () => {
    if (!issueDescription.trim()) {
      Alert.alert('Error', 'Please describe the issue');
      return;
    }

    try {
      await DeliveryService.flagDeliveryIssue(order.id, issueDescription);
      setIssueDescription('');
      setShowIssueModal(false);
      onStatusUpdate?.();
      Alert.alert('Success', 'Issue reported successfully');
    } catch (error) {
      console.error('Error flagging issue:', error);
      Alert.alert('Error', 'Failed to report issue');
    }
  };

  const canFlagIssue = userRole === 'contractor' && 
    order.delivery_status && 
    ['en_route', 'delayed'].includes(order.delivery_status);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Delivery Status</Text>
      
      <View style={styles.statusSection}>
        <View style={styles.statusHeader}>
          <Text style={styles.statusIcon}>
            {getStatusIcon(order.delivery_status || 'pending')}
          </Text>
          <View style={styles.statusInfo}>
            <Text style={[styles.statusText, { color: getStatusColor(order.delivery_status || 'pending') }]}>
              {getStatusText(order.delivery_status || 'pending')}
            </Text>
            {order.delivery_eta && (
              <Text style={styles.etaText}>ETA: {order.delivery_eta}</Text>
            )}
          </View>
        </View>
      </View>

      {order.delivery_notes && (
        <View style={styles.notesSection}>
          <Text style={styles.notesLabel}>Delivery Notes:</Text>
          <Text style={styles.notesText}>{order.delivery_notes}</Text>
        </View>
      )}

      <View style={styles.orderInfo}>
        <Text style={styles.orderLabel}>Order Details:</Text>
        <Text style={styles.orderText}>{order.material_name}</Text>
        <Text style={styles.orderQuantity}>Quantity: {order.quantity}</Text>
      </View>

      {canFlagIssue && (
        <TouchableOpacity 
          style={styles.issueButton}
          onPress={() => setShowIssueModal(true)}
        >
          <Text style={styles.issueButtonText}>🚨 Flag Delivery Issue</Text>
        </TouchableOpacity>
      )}

      <Modal visible={showIssueModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Report Delivery Issue</Text>
            
            <TextInput
              style={styles.issueInput}
              value={issueDescription}
              onChangeText={setIssueDescription}
              placeholder="Describe the issue (e.g., delayed, damaged, wrong quantity)"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowIssueModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.submitButton}
                onPress={handleFlagIssue}
              >
                <Text style={styles.submitButtonText}>Report Issue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  statusSection: {
    marginBottom: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  statusInfo: {
    flex: 1,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  etaText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  notesSection: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  orderInfo: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 12,
    marginBottom: 16,
  },
  orderLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  orderText: {
    fontSize: 16,
    color: '#333',
  },
  orderQuantity: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  issueButton: {
    backgroundColor: '#FF5722',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  issueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
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
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  issueInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    height: 100,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  submitButton: {
    flex: 1,
    marginLeft: 8,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#FF5722',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});