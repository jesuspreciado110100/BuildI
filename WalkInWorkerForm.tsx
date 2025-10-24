import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { WalkInApplication } from '../types';

interface WalkInWorkerFormProps {
  jobPostId: string;
  onSubmit: (application: Omit<WalkInApplication, 'id' | 'created_at'>) => void;
  onCancel: () => void;
}

export const WalkInWorkerForm: React.FC<WalkInWorkerFormProps> = ({
  jobPostId,
  onSubmit,
  onCancel
}) => {
  const [workerName, setWorkerName] = useState('');
  const [phone, setPhone] = useState('');
  const [tradeType, setTradeType] = useState('general');
  const [skillLevel, setSkillLevel] = useState<'beginner' | 'intermediate' | 'advanced' | 'expert'>('beginner');
  const [referredBy, setReferredBy] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  const handleSubmit = () => {
    if (!workerName.trim()) {
      Alert.alert('Error', 'Worker name is required');
      return;
    }

    const application: Omit<WalkInApplication, 'id' | 'created_at'> = {
      job_post_id: jobPostId,
      worker_name: workerName.trim(),
      phone: phone.trim() || undefined,
      trade_type: tradeType,
      skill_level: skillLevel,
      photo_url: photoUrl.trim() || undefined,
      referred_by: referredBy.trim() || undefined,
      status: 'pending'
    };

    onSubmit(application);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Walk-In Worker Application</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Worker Name *</Text>
        <TextInput
          style={styles.input}
          value={workerName}
          onChangeText={setWorkerName}
          placeholder="Enter full name"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Phone (Optional)</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="Enter phone number"
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Trade Type</Text>
        <Picker
          selectedValue={tradeType}
          onValueChange={setTradeType}
          style={styles.picker}
        >
          <Picker.Item label="General Labor" value="general" />
          <Picker.Item label="Concrete" value="concrete" />
          <Picker.Item label="Electrical" value="electrical" />
          <Picker.Item label="Plumbing" value="plumbing" />
          <Picker.Item label="Carpentry" value="carpentry" />
          <Picker.Item label="Welding" value="welding" />
          <Picker.Item label="Roofing" value="roofing" />
          <Picker.Item label="Painting" value="painting" />
        </Picker>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Skill Level</Text>
        <Picker
          selectedValue={skillLevel}
          onValueChange={setSkillLevel}
          style={styles.picker}
        >
          <Picker.Item label="Beginner" value="beginner" />
          <Picker.Item label="Intermediate" value="intermediate" />
          <Picker.Item label="Advanced" value="advanced" />
          <Picker.Item label="Expert" value="expert" />
        </Picker>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Referred By (Optional)</Text>
        <TextInput
          style={styles.input}
          value={referredBy}
          onChangeText={setReferredBy}
          placeholder="Who referred you?"
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Submit Application</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  cancelButtonText: {
    textAlign: 'center',
    color: '#666',
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  submitButtonText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: '600',
  },
});