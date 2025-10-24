import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ScrollView, Alert } from 'react-native';
import { ConstructionConcept } from '../types';
import ConceptPhaseManager from './ConceptPhaseManager';

interface ConceptEditorProps {
  concept: ConstructionConcept;
  onSave: (concept: ConstructionConcept) => void;
  onCancel: () => void;
}

export default function ConceptEditor({ concept, onSave, onCancel }: ConceptEditorProps) {
  const [editedConcept, setEditedConcept] = useState<ConstructionConcept>({ ...concept });
  const [showPhaseManager, setShowPhaseManager] = useState(false);

  const handleSave = () => {
    if (!editedConcept.name.trim()) {
      Alert.alert('Error', 'Concept name is required');
      return;
    }
    onSave(editedConcept);
  };

  const updateField = (field: keyof ConstructionConcept, value: any) => {
    setEditedConcept(prev => ({ ...prev, [field]: value }));
  };

  const handleUpdateConcept = (updatedConcept: ConstructionConcept) => {
    setEditedConcept(updatedConcept);
  };

  if (showPhaseManager) {
    return (
      <Modal visible={true} animationType="slide" presentationStyle="fullScreen">
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Phase Management - {concept.name}</Text>
            <TouchableOpacity onPress={() => setShowPhaseManager(false)}>
              <Text style={styles.cancelButton}>✕</Text>
            </TouchableOpacity>
          </View>
          <ConceptPhaseManager 
            concept={editedConcept} 
            onUpdateConcept={handleUpdateConcept}
          />
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={true} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Edit Concept</Text>
          <TouchableOpacity onPress={onCancel}>
            <Text style={styles.cancelButton}>✕</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Concept Name *</Text>
            <TextInput
              style={styles.input}
              value={editedConcept.name}
              onChangeText={(text) => updateField('name', text)}
              placeholder="Enter concept name"
            />
          </View>
          
          <View style={styles.field}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={styles.textArea}
              value={editedConcept.description}
              onChangeText={(text) => updateField('description', text)}
              placeholder="Detailed description of the work"
              multiline
              numberOfLines={4}
            />
          </View>
          
          <View style={styles.row}>
            <View style={[styles.field, styles.halfField]}>
              <Text style={styles.label}>Unit</Text>
              <TextInput
                style={styles.input}
                value={editedConcept.unit}
                onChangeText={(text) => updateField('unit', text)}
                placeholder="m³, kg, etc."
              />
            </View>
            
            <View style={[styles.field, styles.halfField]}>
              <Text style={styles.label}>Total Volume</Text>
              <TextInput
                style={styles.input}
                value={editedConcept.total_volume.toString()}
                onChangeText={(text) => updateField('total_volume', parseFloat(text) || 0)}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>
          </View>
          
          <View style={styles.field}>
            <Text style={styles.label}>Estimated Duration (days)</Text>
            <TextInput
              style={styles.input}
              value={editedConcept.estimated_duration.toString()}
              onChangeText={(text) => updateField('estimated_duration', parseInt(text) || 0)}
              placeholder="0"
              keyboardType="numeric"
            />
          </View>
          
          <TouchableOpacity 
            style={styles.phaseButton} 
            onPress={() => setShowPhaseManager(true)}
          >
            <Text style={styles.phaseButtonText}>Manage Phases ({editedConcept.phases?.length || 0})</Text>
          </TouchableOpacity>
        </ScrollView>
        
        <View style={styles.actions}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },
  cancelButton: { fontSize: 24, color: '#6b7280' },
  form: { flex: 1, padding: 20 },
  field: { marginBottom: 16 },
  halfField: { flex: 1 },
  row: { flexDirection: 'row', gap: 12 },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 },
  input: { backgroundColor: 'white', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, fontSize: 16 },
  textArea: { backgroundColor: 'white', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, fontSize: 16, minHeight: 80, textAlignVertical: 'top' },
  phaseButton: { backgroundColor: '#3b82f6', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 16 },
  phaseButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  actions: { padding: 20, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  saveButton: { backgroundColor: '#2563eb', padding: 16, borderRadius: 12, alignItems: 'center' },
  saveButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});