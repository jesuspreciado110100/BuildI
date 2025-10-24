import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { VisualProgressLog, Concept, BIMObject } from '../types';
import { bimConceptMapService } from '../services/BIMConceptMapService';

interface VisualProgressFormProps {
  selectedBIMObject: BIMObject | null;
  onSubmit: (log: Omit<VisualProgressLog, 'id' | 'created_at' | 'contractor_approved'>) => void;
  onCancel: () => void;
  laborChiefId: string;
  laborChiefName: string;
  siteId: string;
}

export default function VisualProgressForm({
  selectedBIMObject,
  onSubmit,
  onCancel,
  laborChiefId,
  laborChiefName,
  siteId
}: VisualProgressFormProps) {
  const [conceptId, setConceptId] = useState('');
  const [progressPercentage, setProgressPercentage] = useState('');
  const [notes, setNotes] = useState('');
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [linkedConcept, setLinkedConcept] = useState<Concept | null>(null);

  useEffect(() => {
    if (selectedBIMObject) {
      // Auto-fill concept from BIM object mapping
      const mapping = bimConceptMapService.getObjectMapping(selectedBIMObject.id);
      if (mapping) {
        setConceptId(mapping.concept_id);
        // Mock concept lookup
        const mockConcept = {
          id: mapping.concept_id,
          name: 'Foundation Work',
          description: 'Foundation work',
          planned_quantity: 100,
          unit_price: 50,
          progress: 0,
          status: 'pending' as const,
          contractor_id: '1',
          created_at: '2024-01-01T00:00:00Z'
        };
        setLinkedConcept(mockConcept);
      }
    }
  }, [selectedBIMObject]);

  const handleSubmit = () => {
    if (!selectedBIMObject || !conceptId || !progressPercentage) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const progress = parseFloat(progressPercentage);
    if (isNaN(progress) || progress < 0 || progress > 100) {
      Alert.alert('Error', 'Progress percentage must be between 0 and 100');
      return;
    }

    onSubmit({
      concept_id: conceptId,
      bim_object_id: selectedBIMObject.id,
      progress_percentage: progress,
      photo_urls: photoUrls,
      notes,
      submitted_by: laborChiefId,
      submitted_by_name: laborChiefName
    });
  };

  const addPhotoUrl = () => {
    const mockPhotoUrl = `https://example.com/photo_${Date.now()}.jpg`;
    setPhotoUrls(prev => [...prev, mockPhotoUrl]);
  };

  const removePhotoUrl = (index: number) => {
    setPhotoUrls(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Visual Progress Log</Text>
      
      {selectedBIMObject && (
        <View style={styles.bimObjectInfo}>
          <Text style={styles.label}>Selected BIM Object:</Text>
          <Text style={styles.bimObjectName}>{selectedBIMObject.name}</Text>
          <Text style={styles.bimObjectType}>Type: {selectedBIMObject.type}</Text>
        </View>
      )}

      {linkedConcept && (
        <View style={styles.conceptInfo}>
          <Text style={styles.label}>Linked Concept:</Text>
          <Text style={styles.conceptName}>{linkedConcept.name}</Text>
        </View>
      )}

      <ScrollView style={styles.form}>
        <Text style={styles.label}>Progress Percentage *</Text>
        <TextInput
          style={styles.input}
          value={progressPercentage}
          onChangeText={setProgressPercentage}
          placeholder="Enter percentage (0-100)"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Add progress notes..."
          multiline
          numberOfLines={4}
        />

        <View style={styles.photoSection}>
          <Text style={styles.label}>Photos</Text>
          <TouchableOpacity style={styles.addPhotoButton} onPress={addPhotoUrl}>
            <Text style={styles.addPhotoText}>📷 Add Photo</Text>
          </TouchableOpacity>
          
          {photoUrls.map((url, index) => (
            <View key={index} style={styles.photoItem}>
              <Text style={styles.photoUrl}>Photo {index + 1}</Text>
              <TouchableOpacity onPress={() => removePhotoUrl(index)}>
                <Text style={styles.removePhoto}>❌</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Submit Progress</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#2563eb', marginBottom: 20 },
  bimObjectInfo: { backgroundColor: '#e0f2fe', padding: 15, borderRadius: 10, marginBottom: 15 },
  conceptInfo: { backgroundColor: '#e8f5e8', padding: 15, borderRadius: 10, marginBottom: 15 },
  label: { fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 8 },
  bimObjectName: { fontSize: 18, fontWeight: 'bold', color: '#0369a1' },
  bimObjectType: { fontSize: 14, color: '#6b7280' },
  conceptName: { fontSize: 18, fontWeight: 'bold', color: '#059669' },
  form: { flex: 1 },
  input: { backgroundColor: 'white', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 15 },
  textArea: { height: 100, textAlignVertical: 'top' },
  photoSection: { marginBottom: 20 },
  addPhotoButton: { backgroundColor: '#3b82f6', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  addPhotoText: { color: 'white', fontSize: 16, fontWeight: '600' },
  photoItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: 10, borderRadius: 6, marginBottom: 5 },
  photoUrl: { fontSize: 14, color: '#6b7280' },
  removePhoto: { fontSize: 16 },
  buttonContainer: { flexDirection: 'row', gap: 10, marginTop: 20 },
  cancelButton: { flex: 1, backgroundColor: '#6b7280', padding: 15, borderRadius: 8, alignItems: 'center' },
  cancelButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  submitButton: { flex: 1, backgroundColor: '#059669', padding: 15, borderRadius: 8, alignItems: 'center' },
  submitButtonText: { color: 'white', fontSize: 16, fontWeight: '600' }
});