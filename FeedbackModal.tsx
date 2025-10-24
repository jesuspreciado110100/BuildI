import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { WorkerFeedbackService } from '../services/WorkerFeedbackService';

interface FeedbackModalProps {
  visible: boolean;
  onClose: () => void;
  workerId: string;
  contractorId: string;
  requestId: string;
  conceptId?: string;
  onSubmit: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  visible,
  onClose,
  workerId,
  contractorId,
  requestId,
  conceptId,
  onSubmit
}) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await WorkerFeedbackService.submitFeedback({
        request_id: requestId,
        concept_id: conceptId,
        contractor_id: contractorId,
        worker_id: workerId,
        rating,
        comment
      });
      
      onSubmit();
      onClose();
      Alert.alert('Success', 'Feedback submitted successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => (
      <TouchableOpacity
        key={index}
        onPress={() => setRating(index + 1)}
        style={{ padding: 4 }}
      >
        <Text style={{ fontSize: 30, color: index < rating ? '#FFD700' : '#DDD' }}>
          ⭐
        </Text>
      </TouchableOpacity>
    ));
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={{ flex: 1, padding: 20, backgroundColor: '#fff' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Rate Worker</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={{ color: '#007AFF', fontSize: 16 }}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <Text style={{ fontSize: 16, marginBottom: 20, textAlign: 'center' }}>How would you rate this worker's performance?</Text>

        <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 30 }}>
          {renderStars()}
        </View>

        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 10 }}>Comments (Optional)</Text>
        <TextInput
          value={comment}
          onChangeText={setComment}
          placeholder="Share your feedback about the worker's performance..."
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
          disabled={submitting}
          style={{
            backgroundColor: submitting ? '#ccc' : '#007AFF',
            padding: 16,
            borderRadius: 8,
            alignItems: 'center'
          }}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
            {submitting ? 'Submitting...' : 'Submit Feedback'}
          </Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};