import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { WorkerProfile } from '../types';

interface WorkerProfileModalProps {
  worker: WorkerProfile | null;
  visible: boolean;
  onClose: () => void;
  onRequestHire: (worker: WorkerProfile) => void;
  contractorId: string;
  conceptId: string;
}

export const WorkerProfileModal: React.FC<WorkerProfileModalProps> = ({
  worker,
  visible,
  onClose,
  onRequestHire,
}) => {
  if (!worker) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{worker.name}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.content}>
          <Text style={styles.trade}>{worker.trade_type}</Text>
          <Text style={styles.price}>${worker.unit_price}/{worker.preferred_unit_type || 'm²'}</Text>
          <Text style={styles.rating}>Rating: {worker.rating}/5</Text>
          <Text style={styles.availability}>Status: {worker.availability_status}</Text>
          
          {worker.skills && worker.skills.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Skills:</Text>
              <Text style={styles.skills}>{worker.skills.join(', ')}</Text>
            </View>
          )}
        </ScrollView>
        
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.hireButton} 
            onPress={() => onRequestHire(worker)}
          >
            <Text style={styles.hireButtonText}>Request Hire</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  title: { fontSize: 20, fontWeight: 'bold' },
  closeButton: { padding: 8 },
  closeText: { fontSize: 18, color: '#666' },
  content: { flex: 1, padding: 16 },
  trade: { fontSize: 16, color: '#666', marginBottom: 8 },
  price: { fontSize: 18, fontWeight: 'bold', color: '#2E7D32', marginBottom: 8 },
  rating: { fontSize: 16, marginBottom: 8 },
  availability: { fontSize: 16, marginBottom: 16 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  skills: { fontSize: 14, color: '#666' },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: '#e0e0e0' },
  hireButton: { backgroundColor: '#007AFF', padding: 16, borderRadius: 8, alignItems: 'center' },
  hireButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});