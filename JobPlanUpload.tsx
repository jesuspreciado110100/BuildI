import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { Concept } from '../types';
import ConceptCard from './ConceptCard';
import ConceptEditor from './ConceptEditor';

interface JobPlanUploadProps {
  siteId: string;
  onConceptsUploaded: (concepts: Concept[]) => void;
}

export default function JobPlanUpload({ siteId, onConceptsUploaded }: JobPlanUploadProps) {
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [editingConcept, setEditingConcept] = useState<Concept | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  const handleFileUpload = () => {
    // Mock CSV parsing - in real app would use file picker and CSV parser
    const mockCsvData = [
      {
        'Concept Name': 'Foundation Excavation',
        'Unit': 'm³',
        'Planned Quantity': '150',
        'Unit Price': '25',
        'Material Needed': 'Concrete, Rebar',
        'Labor Type': 'Heavy Equipment Operator',
        'Description': 'Excavate foundation to 2m depth'
      },
      {
        'Concept Name': 'Concrete Pouring',
        'Unit': 'm³',
        'Planned Quantity': '120',
        'Unit Price': '85',
        'Material Needed': 'Ready-mix Concrete',
        'Labor Type': 'Concrete Finisher',
        'Description': 'Pour foundation concrete'
      },
      {
        'Concept Name': 'Steel Framework',
        'Unit': 'kg',
        'Planned Quantity': '2500',
        'Unit Price': '3.2',
        'Material Needed': 'Steel Beams, Bolts',
        'Labor Type': 'Welder',
        'Description': 'Install main structural framework'
      }
    ];

    const parsedConcepts: Concept[] = mockCsvData.map((row, index) => {
      const plannedQty = parseFloat(row['Planned Quantity']);
      const unitPrice = parseFloat(row['Unit Price']);
      return {
        id: `concept-${Date.now()}-${index}`,
        site_id: siteId,
        name: row['Concept Name'],
        unit: row['Unit'],
        planned_quantity: plannedQty,
        unit_price: unitPrice,
        total_cost: plannedQty * unitPrice,
        progress: 0,
        required_materials: row['Material Needed'],
        required_labor_type: row['Labor Type'],
        description: row['Description']
      };
    });

    setConcepts(parsedConcepts);
    Alert.alert('Success', `Uploaded ${parsedConcepts.length} concepts from job plan`);
  };

  const handleEditConcept = (concept: Concept) => {
    setEditingConcept(concept);
    setShowEditor(true);
  };

  const handleSaveConcept = (updatedConcept: Concept) => {
    setConcepts(prev => prev.map(c => c.id === updatedConcept.id ? updatedConcept : c));
    setShowEditor(false);
    setEditingConcept(null);
  };

  const handleDeleteConcept = (conceptId: string) => {
    Alert.alert(
      'Delete Concept',
      'Are you sure you want to delete this concept?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => {
          setConcepts(prev => prev.filter(c => c.id !== conceptId));
        }}
      ]
    );
  };

  const handleFinalize = () => {
    if (concepts.length === 0) {
      Alert.alert('Error', 'No concepts to finalize');
      return;
    }
    
    Alert.alert(
      'Finalize Job Plan',
      `Add ${concepts.length} concepts to site?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: () => {
          onConceptsUploaded(concepts);
          setConcepts([]);
        }}
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Job Plan Upload</Text>
      
      <TouchableOpacity style={styles.uploadButton} onPress={handleFileUpload}>
        <Text style={styles.uploadButtonText}>📄 Upload Job Plan (CSV/XLSX)</Text>
      </TouchableOpacity>

      {concepts.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Concepts ({concepts.length})</Text>
          <ScrollView style={styles.conceptsList}>
            {concepts.map((concept) => (
              <ConceptCard
                key={concept.id}
                concept={concept}
                onEdit={() => handleEditConcept(concept)}
                onDelete={() => handleDeleteConcept(concept.id)}
              />
            ))}
          </ScrollView>
          
          <TouchableOpacity style={styles.finalizeButton} onPress={handleFinalize}>
            <Text style={styles.finalizeButtonText}>✅ Finalize & Add to Site</Text>
          </TouchableOpacity>
        </>
      )}

      {showEditor && editingConcept && (
        <ConceptEditor
          concept={editingConcept}
          onSave={handleSaveConcept}
          onCancel={() => {
            setShowEditor(false);
            setEditingConcept(null);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8fafc' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#1e293b' },
  uploadButton: { backgroundColor: '#2563eb', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 20 },
  uploadButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#374151' },
  conceptsList: { flex: 1, marginBottom: 20 },
  finalizeButton: { backgroundColor: '#16a34a', padding: 16, borderRadius: 12, alignItems: 'center' },
  finalizeButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});