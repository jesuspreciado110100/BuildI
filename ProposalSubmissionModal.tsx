import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { LaborRequest } from '../types';
import LaborProposalService from '../services/LaborProposalService';

interface ProposalSubmissionModalProps {
  visible: boolean;
  onClose: () => void;
  request: LaborRequest;
  laborChiefId: string;
  onSubmitted: () => void;
}

const ProposalSubmissionModal: React.FC<ProposalSubmissionModalProps> = ({
  visible,
  onClose,
  request,
  laborChiefId,
  onSubmitted
}) => {
  const [proposedPrice, setProposedPrice] = useState('');
  const [availableStartDate, setAvailableStartDate] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!proposedPrice || !availableStartDate || !message) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await LaborProposalService.createProposal({
        request_id: request.id,
        labor_chief_id: laborChiefId,
        proposed_price: parseFloat(proposedPrice),
        available_start_date: availableStartDate,
        message: message,
        status: 'pending'
      });
      
      Alert.alert('Success', 'Proposal submitted successfully');
      resetForm();
      onSubmitted();
    } catch (error) {
      Alert.alert('Error', 'Failed to submit proposal');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setProposedPrice('');
    setAvailableStartDate('');
    setMessage('');
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <Text style={styles.title}>Submit Proposal</Text>
        
        <View style={styles.requestInfo}>
          <Text style={styles.requestTitle}>{request.trade_type}</Text>
          <Text style={styles.requestDetail}>Workers: {request.workers_needed}</Text>
          <Text style={styles.requestDetail}>Duration: {request.duration_days} days</Text>
          <Text style={styles.requestDetail}>Offered: ${request.offered_price}</Text>
        </View>
        
        <Text style={styles.label}>Your Proposed Price ($)</Text>
        <TextInput
          style={styles.input}
          value={proposedPrice}
          onChangeText={setProposedPrice}
          placeholder="Enter your price"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Available Start Date</Text>
        <TextInput
          style={styles.input}
          value={availableStartDate}
          onChangeText={setAvailableStartDate}
          placeholder="YYYY-MM-DD"
        />

        <Text style={styles.label}>Crew Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={message}
          onChangeText={setMessage}
          placeholder="Describe your crew experience and capabilities"
          multiline
          numberOfLines={4}
        />

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.submitButton, loading && styles.disabled]} 
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitText}>
              {loading ? 'Submitting...' : 'Submit Proposal'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxHeight: '80%'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center'
  },
  requestInfo: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4
  },
  requestDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    marginTop: 10
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    fontSize: 16
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top'
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    marginRight: 10
  },
  submitButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#007AFF',
    borderRadius: 5,
    marginLeft: 10
  },
  disabled: {
    opacity: 0.6
  },
  cancelText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#333'
  },
  submitText: {
    textAlign: 'center',
    fontSize: 16,
    color: 'white',
    fontWeight: '600'
  }
});

export default ProposalSubmissionModal;