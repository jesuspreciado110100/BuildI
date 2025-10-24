import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { realtimeService } from '../services/RealtimeService';
import { ProjectService } from '../services/ProjectService';

interface ProjectStatusUpdaterProps {
  projectId: string;
  currentStatus: string;
  currentProgress: number;
  onUpdate?: () => void;
}

export const ProjectStatusUpdater: React.FC<ProjectStatusUpdaterProps> = ({
  projectId,
  currentStatus,
  currentProgress,
  onUpdate
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [progress, setProgress] = useState(currentProgress.toString());
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const statusOptions = [
    { value: 'planning', label: 'Planning', color: '#FF9800' },
    { value: 'active', label: 'Active', color: '#4CAF50' },
    { value: 'on_hold', label: 'On Hold', color: '#F44336' },
    { value: 'completed', label: 'Completed', color: '#2196F3' },
  ];

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const progressNum = parseFloat(progress);
      if (isNaN(progressNum) || progressNum < 0 || progressNum > 100) {
        Alert.alert('Error', 'Progress must be between 0 and 100');
        return;
      }

      // Update project in database
      await ProjectService.updateProject(projectId, {
        status: selectedStatus,
        progress: progressNum,
        updated_at: new Date().toISOString()
      });

      // Send real-time notification
      await realtimeService.sendProjectUpdate({
        project_id: projectId,
        type: 'status',
        title: 'Project Status Updated',
        message: `Project status changed to ${selectedStatus} with ${progressNum}% progress`,
        data: {
          status: selectedStatus,
          progress: progressNum,
          notes
        }
      });

      setModalVisible(false);
      onUpdate?.();
      Alert.alert('Success', 'Project status updated successfully');
    } catch (error) {
      console.error('Error updating project:', error);
      Alert.alert('Error', 'Failed to update project status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TouchableOpacity
        style={styles.updateButton}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="refresh" size={20} color="#2196F3" />
        <Text style={styles.updateButtonText}>Update Status</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Update Project Status</Text>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <Text style={styles.sectionTitle}>Status</Text>
            <View style={styles.statusOptions}>
              {statusOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.statusOption,
                    selectedStatus === option.value && styles.selectedStatus,
                    { borderColor: option.color }
                  ]}
                  onPress={() => setSelectedStatus(option.value)}
                >
                  <View style={[styles.statusDot, { backgroundColor: option.color }]} />
                  <Text style={styles.statusLabel}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Progress (%)</Text>
            <TextInput
              style={styles.input}
              value={progress}
              onChangeText={setProgress}
              keyboardType="numeric"
              placeholder="0-100"
            />

            <Text style={styles.sectionTitle}>Notes (Optional)</Text>
            <TextInput
              style={[styles.input, styles.notesInput]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add any notes about this update..."
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.disabledButton]}
              onPress={handleUpdate}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>
                {loading ? 'Updating...' : 'Update Project'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  updateButtonText: {
    marginLeft: 8,
    color: '#2196F3',
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 8,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    marginTop: 16,
  },
  statusOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  selectedStatus: {
    backgroundColor: '#F0F8FF',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 32,
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProjectStatusUpdater;