import React, { useState } from 'react';
import { View, Modal, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { SafetyIncidentForm } from './SafetyIncidentForm';
import { SafetyIncident } from '../types';

interface SafetyIncidentModalProps {
  visible: boolean;
  onClose: () => void;
  siteId: string;
  reporterId: string;
  onIncidentCreated?: (incident: SafetyIncident) => void;
}

export const SafetyIncidentModal: React.FC<SafetyIncidentModalProps> = ({
  visible,
  onClose,
  siteId,
  reporterId,
  onIncidentCreated
}) => {
  const handleSubmit = (incident: SafetyIncident) => {
    onIncidentCreated?.(incident);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>
        <SafetyIncidentForm
          siteId={siteId}
          reporterId={reporterId}
          onSubmit={handleSubmit}
          onCancel={onClose}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
  },
});