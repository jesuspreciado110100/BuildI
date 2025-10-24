import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Concept {
  code: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
  status: 'completed' | 'in-progress' | 'pending';
  progress: number;
  materials: Array<{ name: string; quantity: number; unit: string }>;
  labor: Array<{ role: string; workers: number; hours: number }>;
  machinery: Array<{ type: string; quantity: number; hours: number }>;
}

export default function JobConceptsScreen() {
  const [selectedConcept, setSelectedConcept] = useState<Concept | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const concepts: Concept[] = [
    {
      code: 'PRE-001',
      description: 'Trazo y nivelación del terreno',
      quantity: 1300,
      unit: 'M2',
      unitPrice: 13.13,
      total: 17069,
      status: 'completed',
      progress: 100,
      materials: [
        { name: 'Cal hidratada', quantity: 65, unit: 'kg' },
        { name: 'Estacas de madera', quantity: 200, unit: 'pzas' }
      ],
      labor: [
        { role: 'Topógrafo', workers: 1, hours: 16 },
        { role: 'Peón', workers: 4, hours: 32 }
      ],
      machinery: [
        { type: 'Nivel topográfico', quantity: 1, hours: 16 },
        { type: 'Teodolito', quantity: 1, hours: 8 }
      ]
    },
    {
      code: 'CIM-001',
      description: 'Excavación por medios mecánicos',
      quantity: 816,
      unit: 'M3',
      unitPrice: 94.08,
      total: 76769.28,
      status: 'in-progress',
      progress: 65,
      materials: [
        { name: 'Combustible diesel', quantity: 500, unit: 'lts' }
      ],
      labor: [
        { role: 'Operador de excavadora', workers: 1, hours: 40 },
        { role: 'Ayudante general', workers: 2, hours: 40 }
      ],
      machinery: [
        { type: 'Excavadora CAT 320', quantity: 1, hours: 40 },
        { type: 'Camión volteo 7m³', quantity: 2, hours: 32 }
      ]
    },
    {
      code: 'ALB-001',
      description: 'Muros de ladrillo listón',
      quantity: 1375.32,
      unit: 'M2',
      unitPrice: 799.65,
      total: 1099774.64,
      status: 'pending',
      progress: 0,
      materials: [
        { name: 'Ladrillo listón', quantity: 68766, unit: 'pzas' },
        { name: 'Cemento Portland', quantity: 275, unit: 'bultos' },
        { name: 'Arena', quantity: 137, unit: 'm³' }
      ],
      labor: [
        { role: 'Albañil especialista', workers: 6, hours: 220 },
        { role: 'Ayudante de albañil', workers: 6, hours: 220 }
      ],
      machinery: [
        { type: 'Revolvedora 1 bulto', quantity: 2, hours: 110 },
        { type: 'Andamios tubulares', quantity: 50, hours: 220 }
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10B981';
      case 'in-progress': return '#F59E0B';
      case 'pending': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getStatusDot = (status: string) => {
    const color = getStatusColor(status);
    return <View style={[styles.statusDot, { backgroundColor: color }]} />;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Conceptos de Obra</Text>
        <Text style={styles.subtitle}>Auditorio Cívico - Magdalena de Kino</Text>
      </View>

      <ScrollView style={styles.content}>
        {concepts.map((concept) => (
          <TouchableOpacity
            key={concept.code}
            style={styles.conceptCard}
            onPress={() => setSelectedConcept(concept)}
          >
            <View style={styles.conceptHeader}>
              <View style={styles.conceptCodeContainer}>
                {getStatusDot(concept.status)}
                <Text style={styles.conceptCode}>{concept.code}</Text>
              </View>
              <Text style={styles.conceptTotal}>
                ${concept.total.toLocaleString('es-MX')}
              </Text>
            </View>
            
            <Text style={styles.conceptDescription}>{concept.description}</Text>
            
            <View style={styles.conceptMeta}>
              <Text style={styles.conceptQuantity}>
                {concept.quantity} {concept.unit}
              </Text>
              <View style={styles.progressContainer}>
                <Text style={styles.progressText}>{concept.progress}%</Text>
                <View style={styles.progressBar}>
                  <View 
                    style={[styles.progressFill, { 
                      width: `${concept.progress}%`,
                      backgroundColor: getStatusColor(concept.status)
                    }]} 
                  />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Concept Detail Modal */}
      <Modal
        visible={selectedConcept !== null}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        {selectedConcept && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedConcept.code}</Text>
              <TouchableOpacity onPress={() => setSelectedConcept(null)}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <Text style={styles.modalDescription}>
                {selectedConcept.description}
              </Text>

              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Volúmenes</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Cantidad:</Text>
                  <Text style={styles.detailValue}>
                    {selectedConcept.quantity} {selectedConcept.unit}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Precio Unitario:</Text>
                  <Text style={styles.detailValue}>
                    ${selectedConcept.unitPrice.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Total:</Text>
                  <Text style={styles.detailValue}>
                    ${selectedConcept.total.toLocaleString('es-MX')}
                  </Text>
                </View>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Materiales</Text>
                {selectedConcept.materials.map((material, index) => (
                  <View key={index} style={styles.itemRow}>
                    <Text style={styles.itemName}>{material.name}</Text>
                    <Text style={styles.itemQuantity}>
                      {material.quantity} {material.unit}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Mano de Obra</Text>
                {selectedConcept.labor.map((labor, index) => (
                  <View key={index} style={styles.itemRow}>
                    <Text style={styles.itemName}>{labor.role}</Text>
                    <Text style={styles.itemQuantity}>
                      {labor.workers} trabajadores × {labor.hours}h
                    </Text>
                  </View>
                ))}
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Maquinaria</Text>
                {selectedConcept.machinery.map((machine, index) => (
                  <View key={index} style={styles.itemRow}>
                    <Text style={styles.itemName}>{machine.type}</Text>
                    <Text style={styles.itemQuantity}>
                      {machine.quantity} × {machine.hours}h
                    </Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={styles.uploadButton}
                onPress={() => setShowUploadModal(true)}
              >
                <Ionicons name="camera" size={20} color="white" />
                <Text style={styles.uploadButtonText}>Subir Evidencia</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB'
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280'
  },
  content: {
    flex: 1,
    padding: 16
  },
  conceptCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  conceptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  conceptCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8
  },
  conceptCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3B82F6'
  },
  conceptTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669'
  },
  conceptDescription: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 12
  },
  conceptMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  conceptQuantity: {
    fontSize: 12,
    color: '#6B7280'
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 16
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
    marginRight: 8,
    minWidth: 30
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2
  },
  progressFill: {
    height: '100%',
    borderRadius: 2
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937'
  },
  modalContent: {
    flex: 1,
    padding: 20
  },
  modalDescription: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 24
  },
  detailSection: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280'
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937'
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  itemName: {
    fontSize: 14,
    color: '#374151',
    flex: 1
  },
  itemQuantity: {
    fontSize: 14,
    color: '#6B7280'
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8
  }
});