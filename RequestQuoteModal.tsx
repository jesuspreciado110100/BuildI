import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';

interface QuoteRequest {
  machineId: string;
  machineName: string;
  startDate: string;
  endDate: string;
  budget: number;
  operatorPreference: 'Required' | 'Optional' | 'Not Needed';
  projectDescription: string;
  urgency: 'Low' | 'Medium' | 'High';
  requestedBy: string;
  requestedAt: Date;
}

interface RequestQuoteModalProps {
  visible: boolean;
  onClose: () => void;
  machineId: string;
  machineName: string;
  onSubmit: (request: QuoteRequest) => void;
}

export const RequestQuoteModal: React.FC<RequestQuoteModalProps> = ({ 
  visible, 
  onClose, 
  machineId,
  machineName,
  onSubmit 
}) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('');
  const [operatorPreference, setOperatorPreference] = useState<'Required' | 'Optional' | 'Not Needed'>('Optional');
  const [projectDescription, setProjectDescription] = useState('');
  const [urgency, setUrgency] = useState<'Low' | 'Medium' | 'High'>('Medium');

  const handleSubmit = () => {
    if (!startDate || !endDate || !budget || !projectDescription) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const request: QuoteRequest = {
      machineId,
      machineName,
      startDate,
      endDate,
      budget: parseFloat(budget),
      operatorPreference,
      projectDescription,
      urgency,
      requestedBy: 'Current User',
      requestedAt: new Date()
    };

    onSubmit(request);
    onClose();
    
    // Reset form
    setStartDate('');
    setEndDate('');
    setBudget('');
    setOperatorPreference('Optional');
    setProjectDescription('');
    setUrgency('Medium');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Request Quote</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>×</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.content}>
            <Text style={styles.machineTitle}>{machineName}</Text>
            
            <Text style={styles.label}>Start Date *</Text>
            <TextInput
              style={styles.input}
              value={startDate}
              onChangeText={setStartDate}
              placeholder="MM/DD/YYYY"
            />

            <Text style={styles.label}>End Date *</Text>
            <TextInput
              style={styles.input}
              value={endDate}
              onChangeText={setEndDate}
              placeholder="MM/DD/YYYY"
            />

            <Text style={styles.label}>Budget Range *</Text>
            <TextInput
              style={styles.input}
              value={budget}
              onChangeText={setBudget}
              placeholder="$0.00"
              keyboardType="numeric"
            />

            <Text style={styles.label}>Operator Preference *</Text>
            <View style={styles.optionGroup}>
              {(['Required', 'Optional', 'Not Needed'] as const).map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionButton,
                    operatorPreference === option && styles.selectedOption
                  ]}
                  onPress={() => setOperatorPreference(option)}
                >
                  <Text style={[
                    styles.optionText,
                    operatorPreference === option && styles.selectedOptionText
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Urgency Level *</Text>
            <View style={styles.optionGroup}>
              {(['Low', 'Medium', 'High'] as const).map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.optionButton,
                    urgency === level && styles.selectedOption,
                    level === 'High' && styles.highUrgency
                  ]}
                  onPress={() => setUrgency(level)}
                >
                  <Text style={[
                    styles.optionText,
                    urgency === level && styles.selectedOptionText
                  ]}>
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Project Description *</Text>
            <TextInput
              style={styles.textArea}
              value={projectDescription}
              onChangeText={setProjectDescription}
              placeholder="Describe your project and specific requirements..."
              multiline
              numberOfLines={4}
            />

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitText}>Submit Quote Request</Text>
            </TouchableOpacity>
          </ScrollView>
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
    width: '95%',
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  closeText: {
    fontSize: 24,
    color: '#666',
  },
  content: {
    padding: 16,
  },
  machineTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  optionGroup: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: '#007AFF',
  },
  highUrgency: {
    backgroundColor: '#ff4444',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  selectedOptionText: {
    color: 'white',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  submitText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});