import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Alert } from 'react-native';
import { JobBoardPost } from '../types';

interface JobPostingModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (job: Omit<JobBoardPost, 'id' | 'created_at'>) => void;
}

export const JobPostingModal: React.FC<JobPostingModalProps> = ({
  visible,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    site_id: '',
    trade_type: '',
    volume: '',
    unit: '',
    price_per_unit: '',
    deadline: '',
    contact_name: '',
    description: ''
  });

  const handleSubmit = () => {
    if (!formData.trade_type || !formData.volume || !formData.price_per_unit) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const jobPost: Omit<JobBoardPost, 'id' | 'created_at'> = {
      site_id: formData.site_id || 'default-site',
      trade_type: formData.trade_type,
      volume: parseInt(formData.volume),
      unit: formData.unit || 'hours',
      price_per_unit: parseFloat(formData.price_per_unit),
      deadline: formData.deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      contact_name: formData.contact_name || 'Anonymous',
      status: 'open',
      is_offline_post: true,
      applications: []
    };

    onSubmit(jobPost);
    setFormData({
      site_id: '',
      trade_type: '',
      volume: '',
      unit: '',
      price_per_unit: '',
      deadline: '',
      contact_name: '',
      description: ''
    });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Post New Job</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Trade Type *</Text>
          <TextInput
            style={styles.input}
            value={formData.trade_type}
            onChangeText={(text) => setFormData({...formData, trade_type: text})}
            placeholder="e.g., concrete, electrical, plumbing"
          />

          <Text style={styles.label}>Volume *</Text>
          <TextInput
            style={styles.input}
            value={formData.volume}
            onChangeText={(text) => setFormData({...formData, volume: text})}
            placeholder="e.g., 50"
            keyboardType="numeric"
          />

          <Text style={styles.label}>Unit</Text>
          <TextInput
            style={styles.input}
            value={formData.unit}
            onChangeText={(text) => setFormData({...formData, unit: text})}
            placeholder="e.g., cubic_yards, hours"
          />

          <Text style={styles.label}>Price per Unit *</Text>
          <TextInput
            style={styles.input}
            value={formData.price_per_unit}
            onChangeText={(text) => setFormData({...formData, price_per_unit: text})}
            placeholder="e.g., 150"
            keyboardType="numeric"
          />

          <Text style={styles.label}>Contact Name</Text>
          <TextInput
            style={styles.input}
            value={formData.contact_name}
            onChangeText={(text) => setFormData({...formData, contact_name: text})}
            placeholder="Your name"
          />

          <Text style={styles.label}>Deadline</Text>
          <TextInput
            style={styles.input}
            value={formData.deadline}
            onChangeText={(text) => setFormData({...formData, deadline: text})}
            placeholder="YYYY-MM-DD"
          />

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Post Job</Text>
          </TouchableOpacity>
        </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
