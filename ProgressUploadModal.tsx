import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, Alert, Image } from 'react-native';
import { ProgressTrackingService } from '../services/ProgressTrackingService';

interface ProgressUploadModalProps {
  visible: boolean;
  onClose: () => void;
  requestId: string;
  workerId: string;
  workerName: string;
  onProgressSubmitted: () => void;
}

export const ProgressUploadModal: React.FC<ProgressUploadModalProps> = ({
  visible,
  onClose,
  requestId,
  workerId,
  workerName,
  onProgressSubmitted
}) => {
  const [quantityCompleted, setQuantityCompleted] = useState('');
  const [estimatedTotal, setEstimatedTotal] = useState('');
  const [notes, setNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!quantityCompleted || !estimatedTotal) {
      Alert.alert('Error', 'Please enter quantity completed and estimated total');
      return;
    }

    if (!photoUrl) {
      Alert.alert('Error', 'Please upload a photo');
      return;
    }

    setIsSubmitting(true);
    try {
      await ProgressTrackingService.createProgressEntry(
        requestId,
        workerId,
        workerId, // uploaded_by same as worker_id
        photoUrl,
        parseFloat(quantityCompleted),
        parseFloat(estimatedTotal),
        notes || undefined
      );

      Alert.alert('Success', 'Progress update submitted successfully');
      onProgressSubmitted();
      handleClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to submit progress update');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setQuantityCompleted('');
    setEstimatedTotal('');
    setNotes('');
    setPhotoUrl('');
    onClose();
  };

  const handlePhotoUpload = () => {
    // Simulate photo upload
    const mockPhotoUrl = `https://example.com/progress_${Date.now()}.jpg`;
    setPhotoUrl(mockPhotoUrl);
    Alert.alert('Success', 'Photo uploaded successfully');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Submit Progress - {workerName}</Text>
          
          <TouchableOpacity style={styles.uploadButton} onPress={handlePhotoUpload}>
            <Text style={styles.uploadButtonText}>
              {photoUrl ? '✓ Photo Uploaded' : '📷 Upload Photo'}
            </Text>
          </TouchableOpacity>

          {photoUrl && (
            <View style={styles.photoPreview}>
              <Text style={styles.photoText}>Photo ready for upload</Text>
            </View>
          )}

          <TextInput
            style={styles.input}
            placeholder="Quantity completed (e.g., 15)"
            value={quantityCompleted}
            onChangeText={setQuantityCompleted}
            keyboardType="numeric"
          />

          <TextInput
            style={styles.input}
            placeholder="Estimated total (e.g., 100)"
            value={estimatedTotal}
            onChangeText={setEstimatedTotal}
            keyboardType="numeric"
          />

          <TextInput
            style={[styles.input, styles.notesInput]}
            placeholder="Optional notes"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.submitButton, isSubmitting && styles.disabledButton]} 
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'Submitting...' : 'Submit Progress'}
              </Text>
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  uploadButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  uploadButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  photoPreview: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  photoText: {
    textAlign: 'center',
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: 'bold',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 10,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
});