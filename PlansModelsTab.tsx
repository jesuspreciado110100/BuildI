import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native';
import { SiteDocument, Concept } from '../types';
import DocumentViewer from './DocumentViewer';
import BIMViewer from './BIMViewer';
import BIMTaggerPanel from './BIMTaggerPanel';

interface PlansModelsTabProps {
  siteId: string;
  concepts?: Concept[];
}

const mockDocuments: SiteDocument[] = [
  {
    id: '1',
    name: 'Site_Plan_A.pdf',
    type: 'pdf',
    fileExtension: '.pdf',
    uploadDate: '2024-01-15T10:00:00Z',
    size: 2048000,
    url: 'mock://site-plan-a.pdf',
    siteId: 'site-1',
    uploadedBy: 'contractor-1'
  },
  {
    id: '2',
    name: 'Building_Model.ifc',
    type: 'bim',
    fileExtension: '.ifc',
    uploadDate: '2024-01-16T14:30:00Z',
    size: 15728640,
    url: 'mock://building-model.ifc',
    siteId: 'site-1',
    uploadedBy: 'contractor-1'
  },
  {
    id: '3',
    name: 'Foundation_Details.pdf',
    type: 'pdf',
    fileExtension: '.pdf',
    uploadDate: '2024-01-17T09:15:00Z',
    size: 1536000,
    url: 'mock://foundation-details.pdf',
    siteId: 'site-1',
    uploadedBy: 'contractor-1'
  },
  {
    id: '4',
    name: 'Structure_3D.glb',
    type: 'bim',
    fileExtension: '.glb',
    uploadDate: '2024-01-18T11:45:00Z',
    size: 8388608,
    url: 'mock://structure-3d.glb',
    siteId: 'site-1',
    uploadedBy: 'contractor-1'
  }
];

const mockConcepts: Concept[] = [
  {
    id: 'concept-1',
    site_id: 'site-1',
    name: 'Foundation Work',
    unit: 'm³',
    planned_quantity: 150,
    unit_price: 120,
    total_cost: 18000,
    progress: 25,
    required_materials: 'Concrete, Rebar',
    required_labor_type: 'Foundation Crew',
    description: 'Excavation and concrete foundation work'
  },
  {
    id: 'concept-2',
    site_id: 'site-1',
    name: 'Structural Framework',
    unit: 'ton',
    planned_quantity: 45,
    unit_price: 2500,
    total_cost: 112500,
    progress: 0,
    required_materials: 'Steel Beams, Bolts',
    required_labor_type: 'Steel Workers',
    description: 'Steel frame construction'
  },
  {
    id: 'concept-3',
    site_id: 'site-1',
    name: 'Wall Construction',
    unit: 'm²',
    planned_quantity: 800,
    unit_price: 85,
    total_cost: 68000,
    progress: 0,
    required_materials: 'Concrete Blocks, Mortar',
    required_labor_type: 'Masons',
    description: 'Exterior and interior wall construction'
  }
];

export default function PlansModelsTab({ siteId, concepts = mockConcepts }: PlansModelsTabProps) {
  const [documents, setDocuments] = useState<SiteDocument[]>(mockDocuments);
  const [selectedDocument, setSelectedDocument] = useState<SiteDocument | null>(null);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [taggerVisible, setTaggerVisible] = useState(false);

  const getFileTypeDisplay = (doc: SiteDocument) => {
    switch (doc.type) {
      case 'pdf':
        return 'PDF';
      case 'bim':
        return 'BIM';
      case 'image':
        return 'IMG';
      default:
        return 'DOC';
    }
  };

  const getFileTypeColor = (doc: SiteDocument) => {
    switch (doc.type) {
      case 'pdf':
        return '#e74c3c';
      case 'bim':
        return '#3498db';
      case 'image':
        return '#2ecc71';
      default:
        return '#95a5a6';
    }
  };

  const handleUpload = () => {
    Alert.alert(
      'Upload File',
      'File upload functionality would be implemented here.\n\nSupported formats:\n• PDF (drawings, permits, docs)\n• IFC, RVT (BIM models)\n• OBJ, GLB, GLTF (3D models)',
      [{ text: 'OK' }]
    );
  };

  const handleOpenViewer = (document: SiteDocument) => {
    setSelectedDocument(document);
    setViewerVisible(true);
  };

  const handleOpenTagger = (document: SiteDocument) => {
    setSelectedDocument(document);
    setTaggerVisible(true);
  };

  const handleDelete = (documentId: string) => {
    Alert.alert(
      'Delete Document',
      'Are you sure you want to delete this document?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setDocuments(prev => prev.filter(doc => doc.id !== documentId));
          }
        }
      ]
    );
  };

  const renderViewer = () => {
    if (!selectedDocument) return null;

    if (selectedDocument.type === 'bim') {
      return (
        <BIMViewer
          document={selectedDocument}
          onClose={() => setViewerVisible(false)}
          concepts={concepts}
        />
      );
    } else {
      return (
        <DocumentViewer
          document={selectedDocument}
          onClose={() => setViewerVisible(false)}
        />
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Plans & Models</Text>
        <TouchableOpacity style={styles.uploadButton} onPress={handleUpload}>
          <Text style={styles.uploadText}>+ Upload</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.documentList}>
        {documents.map(doc => (
          <View key={doc.id} style={styles.documentCard}>
            <View style={styles.documentInfo}>
              <View style={[styles.typeBadge, { backgroundColor: getFileTypeColor(doc) }]}>
                <Text style={styles.typeBadgeText}>{getFileTypeDisplay(doc)}</Text>
              </View>
              <View style={styles.documentDetails}>
                <Text style={styles.documentName}>{doc.name}</Text>
                <Text style={styles.documentMeta}>
                  {(doc.size / 1024 / 1024).toFixed(1)} MB • {new Date(doc.uploadDate).toLocaleDateString()}
                </Text>
              </View>
            </View>
            <View style={styles.documentActions}>
              <TouchableOpacity
                style={styles.viewButton}
                onPress={() => handleOpenViewer(doc)}
              >
                <Text style={styles.viewButtonText}>Open Viewer</Text>
              </TouchableOpacity>
              
              {doc.type === 'bim' && (
                <TouchableOpacity
                  style={styles.taggerButton}
                  onPress={() => handleOpenTagger(doc)}
                >
                  <Text style={styles.taggerButtonText}>Tag Objects</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(doc.id)}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal
        visible={viewerVisible}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        {renderViewer()}
      </Modal>
      
      <Modal
        visible={taggerVisible}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        {selectedDocument && (
          <BIMTaggerPanel
            document={selectedDocument}
            concepts={concepts}
            onClose={() => setTaggerVisible(false)}
          />
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  uploadButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  uploadText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  documentList: {
    flex: 1,
    padding: 16,
  },
  documentCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  documentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 12,
  },
  typeBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  documentDetails: {
    flex: 1,
  },
  documentName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  documentMeta: {
    fontSize: 14,
    color: '#666',
  },
  documentActions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  viewButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    flex: 1,
    minWidth: 80,
  },
  viewButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 12,
  },
  taggerButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    flex: 1,
    minWidth: 80,
  },
  taggerButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 12,
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    minWidth: 60,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
  },
});