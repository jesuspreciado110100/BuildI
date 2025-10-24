import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SiteDocument, BIMObject, BIMConceptMapping, Concept } from '../types';
import { BIMConceptMapService } from '../services/BIMConceptMapService';
import LinkConceptModal from './LinkConceptModal';

interface BIMTaggerPanelProps {
  document: SiteDocument;
  concepts: Concept[];
  onClose: () => void;
}

export default function BIMTaggerPanel({ document, concepts, onClose }: BIMTaggerPanelProps) {
  const [bimObjects, setBimObjects] = useState<BIMObject[]>([]);
  const [mappings, setMappings] = useState<BIMConceptMapping[]>([]);
  const [selectedObject, setSelectedObject] = useState<BIMObject | null>(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBIMData();
  }, [document.id]);

  const loadBIMData = async () => {
    try {
      setLoading(true);
      const [objects, links] = await Promise.all([
        BIMConceptMapService.getBIMObjects(document.id),
        BIMConceptMapService.getLinkedConcepts(document.id)
      ]);
      setBimObjects(objects);
      setMappings(links);
    } catch (error) {
      Alert.alert('Error', 'Failed to load BIM data');
    } finally {
      setLoading(false);
    }
  };

  const handleObjectSelect = (object: BIMObject) => {
    setSelectedObject(object);
    setShowLinkModal(true);
  };

  const getObjectMapping = (objectId: string) => {
    return mappings.find(m => m.bim_object_id === objectId);
  };

  const getConceptName = (conceptId: string) => {
    const concept = concepts.find(c => c.id === conceptId);
    return concept?.name || 'Unknown Concept';
  };

  const getObjectColor = (objectId: string) => {
    const mapping = getObjectMapping(objectId);
    return mapping ? '#28a745' : '#6c757d';
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>BIM Tagger</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.loading}>
          <Text>Loading BIM objects...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>BIM Tagger - {document.name}</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.viewerContainer}>
        <View style={styles.mockViewer}>
          <Text style={styles.viewerTitle}>3D Model Viewer</Text>
          <Text style={styles.viewerSubtitle}>Click on objects to link to concepts</Text>
          
          <ScrollView style={styles.objectGrid}>
            {bimObjects.map(object => {
              const mapping = getObjectMapping(object.id);
              const isLinked = !!mapping;
              
              return (
                <TouchableOpacity
                  key={object.id}
                  style={[
                    styles.objectItem,
                    { borderColor: getObjectColor(object.id) },
                    isLinked && styles.objectItemLinked
                  ]}
                  onPress={() => handleObjectSelect(object)}
                >
                  <View style={styles.objectHeader}>
                    <Text style={styles.objectName}>{object.name}</Text>
                    <Text style={styles.objectType}>{object.type}</Text>
                  </View>
                  
                  {isLinked && (
                    <View style={styles.linkInfo}>
                      <Text style={styles.linkText}>🔗 {getConceptName(mapping.concept_id)}</Text>
                    </View>
                  )}
                  
                  <View style={styles.objectProperties}>
                    <Text style={styles.propertyText}>Material: {object.material || 'N/A'}</Text>
                    <Text style={styles.propertyText}>Layer: {object.layer || 'N/A'}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
      
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Legend:</Text>
        <View style={styles.legendItems}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#28a745' }]} />
            <Text style={styles.legendText}>Linked to Concept</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#6c757d' }]} />
            <Text style={styles.legendText}>Not Linked</Text>
          </View>
        </View>
      </View>
      
      <LinkConceptModal
        visible={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        bimObject={selectedObject}
        bimFileId={document.id}
        concepts={concepts}
        onLinkCreated={loadBIMData}
      />
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
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 18,
    color: '#666',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewerContainer: {
    flex: 1,
    padding: 16,
  },
  mockViewer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
  },
  viewerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  viewerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  objectGrid: {
    flex: 1,
  },
  objectItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#6c757d',
  },
  objectItemLinked: {
    backgroundColor: '#f8fff8',
  },
  objectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  objectName: {
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
  },
  objectType: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#e9ecef',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  linkInfo: {
    backgroundColor: '#d4edda',
    padding: 6,
    borderRadius: 4,
    marginBottom: 8,
  },
  linkText: {
    fontSize: 12,
    color: '#155724',
    fontWeight: 'bold',
  },
  objectProperties: {
    gap: 2,
  },
  propertyText: {
    fontSize: 12,
    color: '#666',
  },
  legend: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  legendItems: {
    flexDirection: 'row',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
});