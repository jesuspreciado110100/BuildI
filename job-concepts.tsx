import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ConceptProgressService } from './services/ConceptProgressService';

interface Concept {
  code: string;
  name: string;
  description: string;
  status: 'completed' | 'in-progress' | 'pending';
  progress: number;
  materials: Array<{ name: string; quantity: string; unit: string }>;
  labor: Array<{ type: string; hours: number; rate: string }>;
  machinery: Array<{ type: string; hours: number; cost: string }>;
}

const mockConcepts: Concept[] = [
  {
    code: '001.001',
    name: 'Excavación Manual',
    description: 'Excavación manual para cimentación',
    status: 'completed',
    progress: 100,
    materials: [{ name: 'Herramientas', quantity: '1', unit: 'set' }],
    labor: [{ type: 'Peón', hours: 8, rate: '$15/hr' }],
    machinery: []
  },
  {
    code: '002.001',
    name: 'Concreto Estructural',
    description: 'Vaciado de concreto f\'c=210 kg/cm²',
    status: 'in-progress',
    progress: 65,
    materials: [
      { name: 'Cemento', quantity: '50', unit: 'sacos' },
      { name: 'Arena', quantity: '2', unit: 'm³' }
    ],
    labor: [{ type: 'Oficial', hours: 16, rate: '$18/hr' }],
    machinery: [{ type: 'Mezcladora', hours: 4, cost: '$25/hr' }]
  }
];

export default function JobConceptsScreen() {
  const [selectedConcept, setSelectedConcept] = useState<Concept | null>(null);
  const [concepts, setConcepts] = useState(mockConcepts);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'in-progress': return '#FF9800';
      default: return '#9E9E9E';
    }
  };

  const handleUploadEvidence = async (conceptCode: string) => {
    try {
      const photoUrl = await ConceptProgressService.uploadEvidence(conceptCode);
      Alert.alert('Éxito', 'Evidencia subida correctamente');
    } catch (error) {
      Alert.alert('Error', 'No se pudo subir la evidencia');
    }
  };

  const updateProgress = async (conceptCode: string, newProgress: number) => {
    await ConceptProgressService.saveProgress(conceptCode, newProgress);
    setConcepts(prev => prev.map(c => 
      c.code === conceptCode ? { ...c, progress: newProgress } : c
    ));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Conceptos de Obra</Text>
      </View>

      <ScrollView style={styles.content}>
        {concepts.map((concept) => (
          <TouchableOpacity
            key={concept.code}
            style={styles.conceptCard}
            onPress={() => setSelectedConcept(concept)}
          >
            <View style={styles.conceptHeader}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor(concept.status) }]} />
              <Text style={styles.conceptCode}>{concept.code}</Text>
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={() => handleUploadEvidence(concept.code)}
              >
                <Ionicons name="camera" size={20} color="#007AFF" />
              </TouchableOpacity>
            </View>
            <Text style={styles.conceptName}>{concept.name}</Text>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${concept.progress}%` }]} />
              </View>
              <Text style={styles.progressText}>{concept.progress}%</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal
        visible={!!selectedConcept}
        animationType="slide"
        onRequestClose={() => setSelectedConcept(null)}
      >
        {selectedConcept && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setSelectedConcept(null)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{selectedConcept.code}</Text>
            </View>

            <ScrollView style={styles.modalContent}>
              <Text style={styles.sectionTitle}>Descripción</Text>
              <Text style={styles.description}>{selectedConcept.description}</Text>

              <Text style={styles.sectionTitle}>Materiales</Text>
              {selectedConcept.materials.map((material, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{material.name}</Text>
                  <Text style={styles.tableCell}>{material.quantity} {material.unit}</Text>
                </View>
              ))}

              <Text style={styles.sectionTitle}>Mano de Obra</Text>
              {selectedConcept.labor.map((labor, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{labor.type}</Text>
                  <Text style={styles.tableCell}>{labor.hours}h - {labor.rate}</Text>
                </View>
              ))}

              {selectedConcept.machinery.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>Maquinaria</Text>
                  {selectedConcept.machinery.map((machine, index) => (
                    <View key={index} style={styles.tableRow}>
                      <Text style={styles.tableCell}>{machine.type}</Text>
                      <Text style={styles.tableCell}>{machine.hours}h - {machine.cost}</Text>
                    </View>
                  ))}
                </>
              )}
            </ScrollView>
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 18, fontWeight: 'bold', marginLeft: 16 },
  content: { flex: 1, padding: 16 },
  conceptCard: { backgroundColor: '#fff', padding: 16, marginBottom: 12, borderRadius: 8 },
  conceptHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  statusDot: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  conceptCode: { flex: 1, fontSize: 16, fontWeight: 'bold', color: '#007AFF' },
  uploadButton: { padding: 4 },
  conceptName: { fontSize: 14, color: '#666', marginBottom: 12 },
  progressContainer: { flexDirection: 'row', alignItems: 'center' },
  progressBar: { flex: 1, height: 8, backgroundColor: '#e0e0e0', borderRadius: 4, marginRight: 12 },
  progressFill: { height: '100%', backgroundColor: '#4CAF50', borderRadius: 4 },
  progressText: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  modalContainer: { flex: 1, backgroundColor: '#fff' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 16 },
  modalContent: { flex: 1, padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 20, marginBottom: 12 },
  description: { fontSize: 14, color: '#666', marginBottom: 16 },
  tableRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  tableCell: { fontSize: 14, color: '#333' }
});