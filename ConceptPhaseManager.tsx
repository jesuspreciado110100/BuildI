import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { ConstructionConcept, Phase, LaborChiefProfile } from '../types';
import { LaborRequestService } from '../services/LaborRequestService';

interface ConceptPhaseManagerProps {
  concept: ConstructionConcept;
  onUpdateConcept: (concept: ConstructionConcept) => void;
}

export default function ConceptPhaseManager({ concept, onUpdateConcept }: ConceptPhaseManagerProps) {
  const [phases, setPhases] = useState<Phase[]>(concept.phases || []);
  const [availableCrews, setAvailableCrews] = useState<LaborChiefProfile[]>([]);
  const [editingPhase, setEditingPhase] = useState<string | null>(null);
  const [newPhase, setNewPhase] = useState<Partial<Phase>>({});
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadAvailableCrews();
  }, []);

  const loadAvailableCrews = async () => {
    try {
      const crews = await LaborRequestService.getAvailableLaborChiefs();
      setAvailableCrews(crews);
    } catch (error) {
      console.error('Error loading crews:', error);
    }
  };

  const addPhase = () => {
    if (!newPhase.title || !newPhase.description) {
      Alert.alert('Error', 'Title and description are required');
      return;
    }

    const phase: Phase = {
      id: Date.now().toString(),
      title: newPhase.title,
      description: newPhase.description,
      required_skills: newPhase.required_skills || [],
      volume: newPhase.volume || 0,
      unit: newPhase.unit || concept.unit,
      start_trigger_type: newPhase.start_trigger_type || 'manual',
      trigger_value: newPhase.trigger_value || 0,
      status: 'pending',
      progress_percent: 0,
      order: phases.length + 1
    };

    const updatedPhases = [...phases, phase];
    setPhases(updatedPhases);
    updateConcept(updatedPhases);
    setNewPhase({});
    setShowAddForm(false);
  };

  const updatePhase = (phaseId: string, updates: Partial<Phase>) => {
    const updatedPhases = phases.map(phase => 
      phase.id === phaseId ? { ...phase, ...updates } : phase
    );
    setPhases(updatedPhases);
    updateConcept(updatedPhases);
  };

  const updateConcept = (updatedPhases: Phase[]) => {
    const updatedConcept = { ...concept, phases: updatedPhases };
    onUpdateConcept(updatedConcept);
  };

  const renderPhaseCard = (phase: Phase) => (
    <View key={phase.id} style={styles.phaseCard}>
      <View style={styles.phaseHeader}>
        <Text style={styles.phaseTitle}>{phase.title}</Text>
        <View style={styles.phaseStatus}>
          <Text style={[styles.statusText, { color: getStatusColor(phase.status) }]}>
            {phase.status.toUpperCase()}
          </Text>
        </View>
      </View>
      
      <Text style={styles.phaseDescription}>{phase.description}</Text>
      
      <View style={styles.phaseDetails}>
        <Text style={styles.detailText}>Volume: {phase.volume} {phase.unit}</Text>
        <Text style={styles.detailText}>Skills: {phase.required_skills.join(', ')}</Text>
        <Text style={styles.detailText}>Trigger: {phase.start_trigger_type} - {phase.trigger_value}</Text>
      </View>
      
      <View style={styles.crewAssignment}>
        <Text style={styles.assignmentLabel}>Assigned Crew:</Text>
        {phase.assigned_crew_id ? (
          <Text style={styles.assignedCrew}>Crew #{phase.assigned_crew_id}</Text>
        ) : (
          <TouchableOpacity 
            style={styles.assignButton}
            onPress={() => setEditingPhase(phase.id)}
          >
            <Text style={styles.assignButtonText}>Assign Crew</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {editingPhase === phase.id && (
        <View style={styles.crewSelector}>
          {availableCrews.map(crew => (
            <TouchableOpacity
              key={crew.id}
              style={styles.crewOption}
              onPress={() => {
                updatePhase(phase.id, { assigned_crew_id: crew.id });
                setEditingPhase(null);
              }}
            >
              <Text style={styles.crewName}>Crew Size: {crew.crew_size}</Text>
              <Text style={styles.crewSkills}>{crew.skills.join(', ')}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'ready': return '#10b981';
      case 'in_progress': return '#3b82f6';
      case 'completed': return '#059669';
      default: return '#6b7280';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Phase Management</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddForm(true)}
        >
          <Text style={styles.addButtonText}>+ Add Phase</Text>
        </TouchableOpacity>
      </View>

      {showAddForm && (
        <View style={styles.addForm}>
          <TextInput
            style={styles.input}
            placeholder="Phase Title"
            value={newPhase.title || ''}
            onChangeText={(text) => setNewPhase(prev => ({ ...prev, title: text }))}
          />
          <TextInput
            style={styles.textArea}
            placeholder="Phase Description"
            value={newPhase.description || ''}
            onChangeText={(text) => setNewPhase(prev => ({ ...prev, description: text }))}
            multiline
          />
          <View style={styles.formActions}>
            <TouchableOpacity style={styles.saveButton} onPress={addPhase}>
              <Text style={styles.saveButtonText}>Save Phase</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => setShowAddForm(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {phases.map(renderPhaseCard)}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },
  addButton: { backgroundColor: '#2563eb', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  addButtonText: { color: 'white', fontWeight: '600' },
  addForm: { backgroundColor: 'white', padding: 16, margin: 16, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 16 },
  textArea: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 16, minHeight: 80, textAlignVertical: 'top' },
  formActions: { flexDirection: 'row', gap: 12 },
  saveButton: { flex: 1, backgroundColor: '#10b981', padding: 12, borderRadius: 8, alignItems: 'center' },
  saveButtonText: { color: 'white', fontWeight: '600' },
  cancelButton: { flex: 1, backgroundColor: '#6b7280', padding: 12, borderRadius: 8, alignItems: 'center' },
  cancelButtonText: { color: 'white', fontWeight: '600' },
  phaseCard: { backgroundColor: 'white', margin: 16, padding: 16, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  phaseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  phaseTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', flex: 1 },
  phaseStatus: { backgroundColor: '#f3f4f6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 12, fontWeight: '600' },
  phaseDescription: { fontSize: 14, color: '#6b7280', marginBottom: 12 },
  phaseDetails: { marginBottom: 12 },
  detailText: { fontSize: 13, color: '#374151', marginBottom: 4 },
  crewAssignment: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  assignmentLabel: { fontSize: 14, fontWeight: '500', color: '#374151' },
  assignedCrew: { fontSize: 14, color: '#059669', fontWeight: '600' },
  assignButton: { backgroundColor: '#3b82f6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  assignButtonText: { color: 'white', fontSize: 12, fontWeight: '600' },
  crewSelector: { marginTop: 12, borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 12 },
  crewOption: { padding: 12, backgroundColor: '#f9fafb', borderRadius: 8, marginBottom: 8 },
  crewName: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
  crewSkills: { fontSize: 12, color: '#6b7280', marginTop: 4 }
});