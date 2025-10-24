import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert, Modal } from 'react-native';
import { MicroJobRequest } from '../types';
import { MicroJobService } from '../services/MicroJobService';
import { NotificationService } from '../services/NotificationService';

interface CompletionModalProps {
  visible: boolean;
  onClose: () => void;
  job: MicroJobRequest;
  workerId: string;
  onComplete: () => void;
}

export const CompletionModal: React.FC<CompletionModalProps> = ({
  visible,
  onClose,
  job,
  workerId,
  onComplete
}) => {
  const [photo, setPhoto] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  const handlePhotoUpload = () => {
    // Mock photo upload - in real app would use ImagePicker
    const mockPhotoUrl = `https://example.com/completion-photos/${Date.now()}.jpg`;
    setPhoto(mockPhotoUrl);
  };

  const handleSubmit = async () => {
    if (!photo) {
      Alert.alert('Error', 'Please upload a completion photo');
      return;
    }

    setUploading(true);
    try {
      await MicroJobService.completeJob(job.id, {
        completion_photo_url: photo,
        completion_notes: notes,
        completed_at: new Date().toISOString()
      });

      // Notify contractor
      await NotificationService.sendNotification({
        user_id: job.contractor_id,
        title: 'Job Completed',
        message: `Worker has completed: ${job.job_description}`,
        type: 'micro_job',
        related_id: job.id
      });

      onComplete();
      onClose();
      Alert.alert('Success', 'Job marked as completed!');
    } catch (error) {
      Alert.alert('Error', 'Failed to complete job');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={{ flex: 1, padding: 20, backgroundColor: '#fff' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Complete Job</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={{ color: '#007AFF', fontSize: 16 }}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <Text style={{ fontSize: 16, marginBottom: 10 }}>{job.job_description}</Text>
        <Text style={{ color: '#666', marginBottom: 20 }}>
          {job.volume} {job.unit} • ${job.total_price}
        </Text>

        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 10 }}>Completion Photo *</Text>
        <TouchableOpacity
          onPress={handlePhotoUpload}
          style={{
            height: 200,
            backgroundColor: photo ? 'transparent' : '#f5f5f5',
            borderRadius: 8,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 20,
            borderWidth: 1,
            borderColor: '#ddd',
            borderStyle: 'dashed'
          }}
        >
          {photo ? (
            <Image source={{ uri: photo }} style={{ width: '100%', height: '100%', borderRadius: 8 }} />
          ) : (
            <Text style={{ color: '#666' }}>Tap to upload photo</Text>
          )}
        </TouchableOpacity>

        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 10 }}>Completion Notes</Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Add any notes about the completed work..."
          multiline
          numberOfLines={4}
          style={{
            borderWidth: 1,
            borderColor: '#ddd',
            borderRadius: 8,
            padding: 12,
            marginBottom: 30,
            textAlignVertical: 'top'
          }}
        />

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={uploading}
          style={{
            backgroundColor: uploading ? '#ccc' : '#007AFF',
            padding: 16,
            borderRadius: 8,
            alignItems: 'center'
          }}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
            {uploading ? 'Submitting...' : 'Mark as Complete'}
          </Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};