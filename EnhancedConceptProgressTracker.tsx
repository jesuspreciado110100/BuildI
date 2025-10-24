import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ConceptProgress {
  id: string;
  conceptCode: string;
  description: string;
  progress: number;
  status: 'not-started' | 'in-progress' | 'completed' | 'on-hold';
  assignedTo: string;
  startDate: string;
  dueDate: string;
  evidence: string[];
  notes: string;
  materials: { name: string; quantity: number; unit: string; }[];
  labor: { role: string; hours: number; }[];
}

export const EnhancedConceptProgressTracker: React.FC = () => {
  const [concepts, setConcepts] = useState<ConceptProgress[]>([
    {
      id: '1',
      conceptCode: 'CON-001',
      description: 'Excavación para cimentación',
      progress: 75,
      status: 'in-progress',
      assignedTo: 'Carlos Mendez',
      startDate: '2024-01-15',
      dueDate: '2024-01-25',
      evidence: [],
      notes: 'Progreso según cronograma',
      materials: [
        { name: 'Combustible', quantity: 50, unit: 'L' },
        { name: 'Aceite hidráulico', quantity: 5, unit: 'L' }
      ],
      labor: [
        { role: 'Operador', hours: 8 },
        { role: 'Ayudante', hours: 4 }
      ]
    },
    {
      id: '2',
      conceptCode: 'CON-002',
      description: 'Colocación de acero de refuerzo',
      progress: 25,
      status: 'in-progress',
      assignedTo: 'Ana Rodriguez',
      startDate: '2024-01-20',
      dueDate: '2024-02-05',
      evidence: [],
      notes: 'Esperando entrega de materiales',
      materials: [
        { name: 'Varilla #4', quantity: 100, unit: 'pza' },
        { name: 'Alambrón', quantity: 10, unit: 'kg' }
      ],
      labor: [
        { role: 'Fierrero', hours: 16 },
        { role: 'Ayudante', hours: 8 }
      ]
    }
  ]);

  const [selectedConcept, setSelectedConcept] = useState<ConceptProgress | null>(null);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progressUpdate, setProgressUpdate] = useState('');
  const [notesUpdate, setNotesUpdate] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not-started': return '#9E9E9E';
      case 'in-progress': return '#2196F3';
      case 'completed': return '#4CAF50';
      case 'on-hold': return '#FF9800';
      default: return '#666';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'not-started': return 'No Iniciado';
      case 'in-progress': return 'En Progreso';
      case 'completed': return 'Completado';
      case 'on-hold': return 'En Pausa';
      default: return status;
    }
  };

  const handleUpdateProgress = () => {
    if (!selectedConcept) return;
    
    const newProgress = parseInt(progressUpdate);
    if (isNaN(newProgress) || newProgress < 0 || newProgress > 100) {
      Alert.alert('Error', 'El progreso debe ser un número entre 0 y 100');
      return;
    }

    const newStatus = newProgress === 100 ? 'completed' : newProgress > 0 ? 'in-progress' : 'not-started';

    setConcepts(prev => prev.map(concept => 
      concept.id === selectedConcept.id 
        ? { ...concept, progress: newProgress, status: newStatus, notes: notesUpdate }
        : concept
    ));

    setShowProgressModal(false);
    setProgressUpdate('');
    setNotesUpdate('');
    Alert.alert('Éxito', 'Progreso actualizado correctamente');
  };

  const openProgressModal = (concept: ConceptProgress) => {
    setSelectedConcept(concept);
    setProgressUpdate(concept.progress.toString());
    setNotesUpdate(concept.notes);
    setShowProgressModal(true);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <View style={{ padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Seguimiento de Conceptos</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#4CAF50' }}>
              {concepts.filter(c => c.status === 'completed').length}
            </Text>
            <Text style={{ fontSize: 12, color: '#666' }}>Completados</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#2196F3' }}>
              {concepts.filter(c => c.status === 'in-progress').length}
            </Text>
            <Text style={{ fontSize: 12, color: '#666' }}>En Progreso</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#9E9E9E' }}>
              {concepts.filter(c => c.status === 'not-started').length}
            </Text>
            <Text style={{ fontSize: 12, color: '#666' }}>Pendientes</Text>
          </View>
        </View>
      </View>

      <ScrollView style={{ flex: 1, padding: 20 }}>
        {concepts.map((concept) => (
          <TouchableOpacity
            key={concept.id}
            onPress={() => openProgressModal(concept)}
            style={{ backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 4 }}>{concept.conceptCode}</Text>
                <Text style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>{concept.description}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: getStatusColor(concept.status), marginRight: 6 }} />
                  <Text style={{ fontSize: 12, color: '#666' }}>{getStatusText(concept.status)}</Text>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: getStatusColor(concept.status) }}>
                  {concept.progress}%
                </Text>
                <Text style={{ fontSize: 10, color: '#666' }}>Progreso</Text>
              </View>
            </View>

            <View style={{ backgroundColor: '#f0f0f0', height: 6, borderRadius: 3, marginBottom: 10 }}>
              <View 
                style={{ 
                  backgroundColor: getStatusColor(concept.status), 
                  height: 6, 
                  borderRadius: 3, 
                  width: `${concept.progress}%` 
                }} 
              />
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f0f0f0' }}>
              <View>
                <Text style={{ fontSize: 12, color: '#666' }}>Asignado a:</Text>
                <Text style={{ fontSize: 12, fontWeight: '600' }}>{concept.assignedTo}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 12, color: '#666' }}>Vence:</Text>
                <Text style={{ fontSize: 12, fontWeight: '600' }}>{concept.dueDate}</Text>
              </View>
            </View>

            {concept.notes && (
              <View style={{ marginTop: 10, padding: 8, backgroundColor: '#f9f9f9', borderRadius: 6 }}>
                <Text style={{ fontSize: 12, color: '#666', fontStyle: 'italic' }}>{concept.notes}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal visible={showProgressModal} animationType="slide" presentationStyle="pageSheet">
        <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Actualizar Progreso</Text>
            <TouchableOpacity onPress={() => setShowProgressModal(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {selectedConcept && (
            <ScrollView style={{ flex: 1, padding: 20 }}>
              <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 20, marginBottom: 20 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>{selectedConcept.conceptCode}</Text>
                <Text style={{ fontSize: 14, color: '#666', marginBottom: 15 }}>{selectedConcept.description}</Text>

                <View style={{ marginBottom: 20 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>Progreso (%)</Text>
                  <TextInput
                    value={progressUpdate}
                    onChangeText={setProgressUpdate}
                    style={{ backgroundColor: '#f5f5f5', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0' }}
                    placeholder="0-100"
                    keyboardType="numeric"
                  />
                </View>

                <View style={{ marginBottom: 20 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>Notas</Text>
                  <TextInput
                    value={notesUpdate}
                    onChangeText={setNotesUpdate}
                    style={{ backgroundColor: '#f5f5f5', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0', height: 80 }}
                    placeholder="Agregar notas sobre el progreso..."
                    multiline
                  />
                </View>

                <TouchableOpacity
                  onPress={handleUpdateProgress}
                  style={{ backgroundColor: '#007AFF', padding: 15, borderRadius: 8, alignItems: 'center' }}
                >
                  <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Actualizar</Text>
                </TouchableOpacity>
              </View>

              <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 20, marginBottom: 20 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 15 }}>Materiales Requeridos</Text>
                {selectedConcept.materials.map((material, index) => (
                  <View key={index} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: index < selectedConcept.materials.length - 1 ? 1 : 0, borderBottomColor: '#f0f0f0' }}>
                    <Text style={{ flex: 1, fontSize: 14 }}>{material.name}</Text>
                    <Text style={{ fontSize: 14, fontWeight: '600' }}>{material.quantity} {material.unit}</Text>
                  </View>
                ))}
              </View>

              <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 20, marginBottom: 20 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 15 }}>Mano de Obra</Text>
                {selectedConcept.labor.map((labor, index) => (
                  <View key={index} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: index < selectedConcept.labor.length - 1 ? 1 : 0, borderBottomColor: '#f0f0f0' }}>
                    <Text style={{ flex: 1, fontSize: 14 }}>{labor.role}</Text>
                    <Text style={{ fontSize: 14, fontWeight: '600' }}>{labor.hours} hrs</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          )}
        </View>
      </Modal>
    </View>
  );
};