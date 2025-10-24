import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import ConceptFileUploader from './ConceptFileUploader';
import ProgressTrackingIntegration from './ProgressTrackingIntegration';

interface ConceptManagementModalProps {
  visible: boolean;
  onClose: () => void;
  siteId: string;
  onConceptCreated: (concept: any) => void;
}

export const ConceptManagementModal: React.FC<ConceptManagementModalProps> = ({
  visible,
  onClose,
  siteId,
  onConceptCreated
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'upload'>('create');

  const handleConceptCreated = (concept: any) => {
    onConceptCreated(concept);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelButton}>Cancelar</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Gestionar Conceptos</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'create' && styles.activeTab]}
            onPress={() => setActiveTab('create')}
          >
            <Text style={[styles.tabText, activeTab === 'create' && styles.activeTabText]}>
              Crear Concepto
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'upload' && styles.activeTab]}
            onPress={() => setActiveTab('upload')}
          >
            <Text style={[styles.tabText, activeTab === 'upload' && styles.activeTabText]}>
              Subir Excel
            </Text>
          </TouchableOpacity>
        </View>
        {activeTab === 'create' ? (
          <ScrollView style={styles.content}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📋 Crear Nuevo Concepto</Text>
              <ConceptFileUploader 
                siteId={siteId}
                onFileSelected={(file) => {
                  console.log('File selected:', file);
                  handleConceptCreated({ name: file.name, type: 'file', file });
                }}
              />
            </View>
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📊 Seguimiento de Progreso</Text>
              <ProgressTrackingIntegration 
                siteId={siteId}
                onProgressUpdate={(progress) => {
                  console.log('Progress updated:', progress);
                }}
              />
            </View>
          </ScrollView>
        ) : (
          <View style={styles.uploadContainer}>
            <View style={styles.uploadArea}>
              <Text style={styles.uploadIcon}>📊</Text>
              <Text style={styles.uploadTitle}>Subir Archivo Excel</Text>
              <Text style={styles.uploadSubtitle}>
                Sube un archivo Excel con los conceptos de obra
              </Text>
              <ConceptFileUploader 
                siteId={siteId}
                onFileSelected={(file) => {
                  console.log('Excel file selected:', file);
                  handleConceptCreated({ name: file.name, type: 'excel', file });
                }}
              />
            </View>
            
            <View style={styles.templateSection}>
              <Text style={styles.templateTitle}>¿Necesitas una plantilla?</Text>
              <TouchableOpacity style={styles.templateButton}>
                <Text style={styles.templateButtonText}>Descargar Plantilla Excel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  title: { fontSize: 18, fontWeight: '600', color: '#111827' },
  cancelButton: { fontSize: 16, color: '#6B7280' },
  placeholder: { width: 60 },
  tabContainer: { flexDirection: 'row', backgroundColor: '#F3F4F6', margin: 16, borderRadius: 8, padding: 4 },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 6 },
  activeTab: { backgroundColor: 'white', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  tabText: { fontSize: 14, fontWeight: '500', color: '#6B7280' },
  activeTabText: { color: '#3B82F6' },
  uploadContainer: { flex: 1, padding: 20 },
  uploadArea: { backgroundColor: '#F9FAFB', borderWidth: 2, borderColor: '#E5E7EB', borderStyle: 'dashed', borderRadius: 12, padding: 40, alignItems: 'center', marginBottom: 24 },
  uploadIcon: { fontSize: 48, marginBottom: 16 },
  uploadTitle: { fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 8 },
  uploadSubtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 24 },
  uploadButton: { backgroundColor: '#3B82F6', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  uploadButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  templateSection: { alignItems: 'center' },
  templateTitle: { fontSize: 16, fontWeight: '500', color: '#374151', marginBottom: 12 },
  templateButton: { borderWidth: 1, borderColor: '#D1D5DB', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  templateButtonText: { fontSize: 14, color: '#6B7280' },
  content: { flex: 1 },
  section: { backgroundColor: '#fff', margin: 16, borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 12 }
});