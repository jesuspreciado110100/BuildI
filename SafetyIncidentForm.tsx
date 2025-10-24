import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { SafetyLogService } from '../services/SafetyLogService';
import { SafetyIncident } from '../types';

interface SafetyIncidentFormProps {
  siteId: string;
  reporterId: string;
  onSubmit: (incident: SafetyIncident) => void;
  onCancel: () => void;
}

export const SafetyIncidentForm: React.FC<SafetyIncidentFormProps> = ({
  siteId,
  reporterId,
  onSubmit,
  onCancel
}) => {
  const [category, setCategory] = useState<SafetyIncident['category']>('other');
  const [severity, setSeverity] = useState<SafetyIncident['severity']>('low');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const categories: SafetyIncident['category'][] = ['fall', 'fire', 'electrical', 'machinery', 'chemical', 'other'];
  const severities: SafetyIncident['severity'][] = ['low', 'medium', 'high', 'critical'];

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert('Error', 'Please provide a description');
      return;
    }

    setLoading(true);
    try {
      const incident = await SafetyLogService.createIncident({
        site_id: siteId,
        reporter_id: reporterId,
        category,
        severity,
        timestamp: new Date().toISOString(),
        resolution_status: 'open',
        description: description.trim(),
        location: location.trim() || undefined,
        photo_url: photoUrl.trim() || undefined,
        iot_triggered: false
      });
      onSubmit(incident);
    } catch (error) {
      Alert.alert('Error', 'Failed to create incident');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Report Safety Incident</Text>
      
      <Text style={styles.label}>Category</Text>
      <View style={styles.buttonRow}>
        {categories.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[styles.categoryButton, category === cat && styles.selectedButton]}
            onPress={() => setCategory(cat)}
          >
            <Text style={[styles.buttonText, category === cat && styles.selectedText]}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Severity</Text>
      <View style={styles.buttonRow}>
        {severities.map(sev => (
          <TouchableOpacity
            key={sev}
            style={[styles.severityButton, severity === sev && styles.selectedButton]}
            onPress={() => setSeverity(sev)}
          >
            <Text style={[styles.buttonText, severity === sev && styles.selectedText]}>
              {sev.charAt(0).toUpperCase() + sev.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Description *</Text>
      <TextInput
        style={styles.textArea}
        value={description}
        onChangeText={setDescription}
        placeholder="Describe the incident..."
        multiline
        numberOfLines={4}
      />

      <Text style={styles.label}>Location</Text>
      <TextInput
        style={styles.input}
        value={location}
        onChangeText={setLocation}
        placeholder="Building A, Floor 2, etc."
      />

      <Text style={styles.label}>Photo URL</Text>
      <TextInput
        style={styles.input}
        value={photoUrl}
        onChangeText={setPhotoUrl}
        placeholder="https://..."
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.submitButton, loading && styles.disabledButton]} 
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitText}>{loading ? 'Submitting...' : 'Submit'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  severityButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  buttonText: {
    fontSize: 14,
    color: '#333',
  },
  selectedText: {
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    height: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  cancelText: {
    fontSize: 16,
    color: '#333',
  },
  submitText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});