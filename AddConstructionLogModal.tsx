import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Modal } from 'react-native';


interface AddConstructionLogModalProps {
  visible: boolean;
  onClose: () => void;
  siteId: string;
  onLogAdded: () => void;
}

export default function AddConstructionLogModal({ visible, onClose, siteId, onLogAdded }: AddConstructionLogModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    text: '',
    log_type: 'progress',
    weather_conditions: '',
    temperature: '',
    crew_size: '',
    hours_worked: '',
    safety_incidents: '0',
    quality_score: '5',
    notes: ''
  });
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    // Placeholder for image picker - would use expo-image-picker in full implementation
    Alert.alert('Photo Upload', 'Photo upload feature would be implemented with expo-image-picker');
    setPhotoUri('https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400');
  };

  const submitLog = async () => {
    if (!formData.title || !formData.text) {
      Alert.alert('Error', 'Title and description are required');
      return;
    }

    setLoading(true);
    try {
      const logData = {
        site_id: siteId,
        title: formData.title,
        description: formData.description,
        text: formData.text,
        log_type: formData.log_type,
        weather_conditions: formData.weather_conditions || null,
        temperature: formData.temperature ? parseInt(formData.temperature) : null,
        crew_size: formData.crew_size ? parseInt(formData.crew_size) : null,
        hours_worked: formData.hours_worked ? parseFloat(formData.hours_worked) : null,
        safety_incidents: parseInt(formData.safety_incidents),
        quality_score: parseInt(formData.quality_score),
        notes: formData.notes || null,
        photo_url: photoUri,
        logged_by: 'Current User',
        created_at: new Date().toISOString()
      };

      // Mock database save - replace with actual implementation
      console.log('Saving log data:', logData);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

      Alert.alert('Success', 'Construction log added successfully');
      onLogAdded();
      onClose();
      resetForm();
    } catch (error) {
      Alert.alert('Error', 'Failed to add construction log');
      console.error('Error adding log:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      text: '',
      log_type: 'progress',
      weather_conditions: '',
      temperature: '',
      crew_size: '',
      hours_worked: '',
      safety_incidents: '0',
      quality_score: '5',
      notes: ''
    });
    setPhotoUri(null);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e9ecef' }}>
          <TouchableOpacity onPress={onClose}>
            <Text style={{ color: '#6c757d', fontSize: 16 }}>Cancel</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Add Construction Log</Text>
          <TouchableOpacity onPress={submitLog} disabled={loading}>
            <Text style={{ color: '#007bff', fontSize: 16, fontWeight: '600' }}>
              {loading ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1, padding: 16 }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 8, padding: 16, marginBottom: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>Basic Information</Text>
            
            <TextInput
              style={{ borderWidth: 1, borderColor: '#dee2e6', borderRadius: 6, padding: 12, marginBottom: 12 }}
              placeholder="Log Title"
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
            />

            <TextInput
              style={{ borderWidth: 1, borderColor: '#dee2e6', borderRadius: 6, padding: 12, marginBottom: 12, height: 80 }}
              placeholder="Description"
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              multiline
            />

            <TextInput
              style={{ borderWidth: 1, borderColor: '#dee2e6', borderRadius: 6, padding: 12, marginBottom: 12, height: 100 }}
              placeholder="Detailed Log Entry"
              value={formData.text}
              onChangeText={(text) => setFormData({ ...formData, text: text })}
              multiline
            />
          </View>

          <View style={{ backgroundColor: '#fff', borderRadius: 8, padding: 16, marginBottom: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>Site Conditions</Text>
            
            <TextInput
              style={{ borderWidth: 1, borderColor: '#dee2e6', borderRadius: 6, padding: 12, marginBottom: 12 }}
              placeholder="Weather Conditions"
              value={formData.weather_conditions}
              onChangeText={(text) => setFormData({ ...formData, weather_conditions: text })}
            />

            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
              <TextInput
                style={{ flex: 1, borderWidth: 1, borderColor: '#dee2e6', borderRadius: 6, padding: 12 }}
                placeholder="Temperature (°F)"
                value={formData.temperature}
                onChangeText={(text) => setFormData({ ...formData, temperature: text })}
                keyboardType="numeric"
              />
              <TextInput
                style={{ flex: 1, borderWidth: 1, borderColor: '#dee2e6', borderRadius: 6, padding: 12 }}
                placeholder="Crew Size"
                value={formData.crew_size}
                onChangeText={(text) => setFormData({ ...formData, crew_size: text })}
                keyboardType="numeric"
              />
            </View>

            <TextInput
              style={{ borderWidth: 1, borderColor: '#dee2e6', borderRadius: 6, padding: 12, marginBottom: 12 }}
              placeholder="Hours Worked"
              value={formData.hours_worked}
              onChangeText={(text) => setFormData({ ...formData, hours_worked: text })}
              keyboardType="numeric"
            />
          </View>

          <View style={{ backgroundColor: '#fff', borderRadius: 8, padding: 16, marginBottom: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>Quality & Safety</Text>
            
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
              <TextInput
                style={{ flex: 1, borderWidth: 1, borderColor: '#dee2e6', borderRadius: 6, padding: 12 }}
                placeholder="Safety Incidents"
                value={formData.safety_incidents}
                onChangeText={(text) => setFormData({ ...formData, safety_incidents: text })}
                keyboardType="numeric"
              />
              <TextInput
                style={{ flex: 1, borderWidth: 1, borderColor: '#dee2e6', borderRadius: 6, padding: 12 }}
                placeholder="Quality Score (1-10)"
                value={formData.quality_score}
                onChangeText={(text) => setFormData({ ...formData, quality_score: text })}
                keyboardType="numeric"
              />
            </View>

            <TextInput
              style={{ borderWidth: 1, borderColor: '#dee2e6', borderRadius: 6, padding: 12, marginBottom: 12, height: 80 }}
              placeholder="Additional Notes"
              value={formData.notes}
              onChangeText={(text) => setFormData({ ...formData, notes: text })}
              multiline
            />
          </View>

          <TouchableOpacity
            style={{ backgroundColor: '#28a745', padding: 16, borderRadius: 8, alignItems: 'center', marginBottom: 16 }}
            onPress={pickImage}
          >
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
              {photoUri ? 'Photo Selected ✓' : 'Add Photo Evidence'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}