import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';

interface Worker {
  id: string;
  name: string;
  skill: string;
  hourlyRate: number;
  available: boolean;
}

interface CrewAssignmentModalProps {
  visible: boolean;
  onClose: () => void;
}

export const CrewAssignmentModal: React.FC<CrewAssignmentModalProps> = ({
  visible,
  onClose,
}) => {
  const [selectedWorkers, setSelectedWorkers] = useState<string[]>([]);

  const availableWorkers: Worker[] = [
    { id: '1', name: 'John Smith', skill: 'Electrician', hourlyRate: 45, available: true },
    { id: '2', name: 'Mike Johnson', skill: 'Plumber', hourlyRate: 42, available: true },
    { id: '3', name: 'Sarah Davis', skill: 'Carpenter', hourlyRate: 38, available: true },
    { id: '4', name: 'Tom Wilson', skill: 'General Labor', hourlyRate: 25, available: true },
    { id: '5', name: 'Lisa Brown', skill: 'Welder', hourlyRate: 48, available: true },
  ];

  const toggleWorker = (workerId: string) => {
    setSelectedWorkers(prev => 
      prev.includes(workerId)
        ? prev.filter(id => id !== workerId)
        : [...prev, workerId]
    );
  };

  const handleAssign = () => {
    console.log('Assigning workers:', selectedWorkers);
    setSelectedWorkers([]);
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
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Assign Crew</Text>
          <TouchableOpacity onPress={handleAssign}>
            <Text style={styles.assignButton}>Assign</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <Text style={styles.sectionTitle}>Available Workers ({availableWorkers.length})</Text>
          
          {availableWorkers.map((worker) => (
            <TouchableOpacity
              key={worker.id}
              style={[
                styles.workerCard,
                selectedWorkers.includes(worker.id) && styles.workerCardSelected
              ]}
              onPress={() => toggleWorker(worker.id)}
            >
              <View style={styles.workerInfo}>
                <Text style={styles.workerName}>{worker.name}</Text>
                <Text style={styles.workerSkill}>{worker.skill}</Text>
                <Text style={styles.workerRate}>${worker.hourlyRate}/hour</Text>
              </View>
              <View style={styles.checkbox}>
                {selectedWorkers.includes(worker.id) && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </View>
            </TouchableOpacity>
          ))}

          {selectedWorkers.length > 0 && (
            <View style={styles.summary}>
              <Text style={styles.summaryTitle}>Selected: {selectedWorkers.length} workers</Text>
              <Text style={styles.summaryText}>
                Total estimated cost: $
                {availableWorkers
                  .filter(w => selectedWorkers.includes(w.id))
                  .reduce((sum, w) => sum + w.hourlyRate, 0)}/hour
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  cancelButton: {
    fontSize: 16,
    color: '#6b7280',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  assignButton: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  workerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  workerCardSelected: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  workerInfo: {
    flex: 1,
  },
  workerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  workerSkill: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  workerRate: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '500',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: 'bold',
  },
  summary: {
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 14,
    color: '#6b7280',
  },
});