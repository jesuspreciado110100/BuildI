import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { WorkerProfile, AssignedWorker, LaborRequest } from '../types';
import { WorkerService } from '../services/WorkerService';
import { WorkerCard } from './WorkerCard';

interface WorkerAssignmentModalProps {
  visible: boolean;
  onClose: () => void;
  laborRequest: LaborRequest;
  onAssignWorkers: (assignedWorkers: AssignedWorker[]) => void;
}

export const WorkerAssignmentModal: React.FC<WorkerAssignmentModalProps> = ({
  visible,
  onClose,
  laborRequest,
  onAssignWorkers
}) => {
  const [availableWorkers, setAvailableWorkers] = useState<WorkerProfile[]>([]);
  const [selectedWorkers, setSelectedWorkers] = useState<string[]>([]);
  const [workerNotes, setWorkerNotes] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (visible) {
      loadAvailableWorkers();
    }
  }, [visible, laborRequest]);

  const loadAvailableWorkers = async () => {
    try {
      const workers = await WorkerService.getAvailableWorkers(
        laborRequest.trade_type,
        laborRequest.start_date,
        laborRequest.duration_days
      );
      setAvailableWorkers(workers);
    } catch (error) {
      console.error('Error loading workers:', error);
    }
  };

  const toggleWorkerSelection = (workerId: string) => {
    setSelectedWorkers(prev => 
      prev.includes(workerId) 
        ? prev.filter(id => id !== workerId)
        : [...prev, workerId]
    );
  };

  const handleAssign = () => {
    if (selectedWorkers.length === 0) {
      Alert.alert('Error', 'Please select at least one worker');
      return;
    }

    const assignedWorkers: AssignedWorker[] = selectedWorkers.map(workerId => ({
      id: `assigned_${Date.now()}_${workerId}`,
      request_id: laborRequest.id,
      worker_id: workerId,
      assigned_by: 'current_user_id', // Replace with actual user ID
      assigned_at: new Date().toISOString(),
      notes: workerNotes[workerId] || undefined
    }));

    onAssignWorkers(assignedWorkers);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
        <View style={{ padding: 20, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Assign Workers</Text>
          <Text style={{ color: '#666', marginTop: 5 }}>
            {laborRequest.trade_type} • {laborRequest.workers_needed} workers needed
          </Text>
        </View>

        <ScrollView style={{ flex: 1, padding: 20 }}>
          {availableWorkers.map(worker => (
            <TouchableOpacity
              key={worker.id}
              onPress={() => toggleWorkerSelection(worker.id)}
              style={{
                backgroundColor: selectedWorkers.includes(worker.id) ? '#e3f2fd' : 'white',
                borderRadius: 8,
                padding: 15,
                marginBottom: 10,
                borderWidth: selectedWorkers.includes(worker.id) ? 2 : 1,
                borderColor: selectedWorkers.includes(worker.id) ? '#2196f3' : '#e0e0e0'
              }}
            >
              <WorkerCard worker={worker} onPress={() => {}} compact />
              
              {selectedWorkers.includes(worker.id) && (
                <View style={{ marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#e0e0e0' }}>
                  <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 5 }}>Notes (optional):</Text>
                  <TextInput
                    style={{
                      borderWidth: 1,
                      borderColor: '#ddd',
                      borderRadius: 4,
                      padding: 8,
                      fontSize: 14
                    }}
                    placeholder="e.g., Team lead, Specialist role..."
                    value={workerNotes[worker.id] || ''}
                    onChangeText={(text) => setWorkerNotes(prev => ({ ...prev, [worker.id]: text }))}
                  />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={{ padding: 20, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#e0e0e0' }}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity
              onPress={onClose}
              style={{
                flex: 1,
                padding: 15,
                backgroundColor: '#f5f5f5',
                borderRadius: 8,
                alignItems: 'center'
              }}
            >
              <Text style={{ fontSize: 16, color: '#666' }}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleAssign}
              style={{
                flex: 1,
                padding: 15,
                backgroundColor: '#2196f3',
                borderRadius: 8,
                alignItems: 'center'
              }}
            >
              <Text style={{ fontSize: 16, color: 'white', fontWeight: '600' }}>
                Assign {selectedWorkers.length} Worker{selectedWorkers.length !== 1 ? 's' : ''}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};