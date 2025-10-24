import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Modal } from 'react-native';
import { BimObject, ConstructionConcept } from '../types';
import { BimSchedulerService } from '../services/BimSchedulerService';

interface BIMObjectSelectorProps {
  selectedObjectId?: string;
  onObjectSelect?: (objectId: string) => void;
  onLinkToConcept?: (objectId: string, conceptId: string) => void;
  availableConcepts: ConstructionConcept[];
}

const BIMObjectSelector: React.FC<BIMObjectSelectorProps> = ({
  selectedObjectId,
  onObjectSelect,
  onLinkToConcept,
  availableConcepts
}) => {
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [selectedObject, setSelectedObject] = useState<BimObject | null>(null);
  const [linkedConcepts, setLinkedConcepts] = useState<ConstructionConcept[]>([]);

  useEffect(() => {
    if (selectedObjectId) {
      loadObjectDetails(selectedObjectId);
    }
  }, [selectedObjectId]);

  const loadObjectDetails = async (objectId: string) => {
    // Mock BIM object data
    const mockObject: BimObject = {
      id: objectId,
      name: `BIM Object ${objectId}`,
      type: 'wall',
      properties: {
        material: 'concrete',
        thickness: 200,
        height: 3000,
        area: 25.5
      },
      position: { x: 0, y: 0, z: 0 },
      linked_concept_ids: ['1', '2']
    };
    
    setSelectedObject(mockObject);
    
    // Load linked concepts
    const linked = availableConcepts.filter(concept => 
      mockObject.linked_concept_ids.includes(concept.id)
    );
    setLinkedConcepts(linked);
  };

  const handleLinkToConcept = async (conceptId: string) => {
    if (selectedObjectId) {
      try {
        await BimSchedulerService.linkBimObjectToConcept(selectedObjectId, conceptId);
        onLinkToConcept?.(selectedObjectId, conceptId);
        setShowLinkModal(false);
        
        // Refresh linked concepts
        if (selectedObject) {
          const updatedLinkedIds = [...selectedObject.linked_concept_ids, conceptId];
          const updatedLinked = availableConcepts.filter(concept => 
            updatedLinkedIds.includes(concept.id)
          );
          setLinkedConcepts(updatedLinked);
        }
      } catch (error) {
        console.error('Failed to link object to concept:', error);
      }
    }
  };

  const renderConceptItem = ({ item }: { item: ConstructionConcept }) => {
    const isLinked = linkedConcepts.some(concept => concept.id === item.id);
    
    return (
      <TouchableOpacity
        style={[styles.conceptItem, isLinked && styles.linkedConceptItem]}
        onPress={() => !isLinked && handleLinkToConcept(item.id)}
        disabled={isLinked}
      >
        <Text style={[styles.conceptName, isLinked && styles.linkedConceptName]}>
          {item.name}
        </Text>
        <Text style={styles.conceptTrade}>{item.trade}</Text>
        {isLinked && (
          <Text style={styles.linkedText}>✓ Linked</Text>
        )}
      </TouchableOpacity>
    );
  };

  if (!selectedObjectId || !selectedObject) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Click on a BIM object to select it</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Selected BIM Object</Text>
      
      {/* Object Details */}
      <View style={styles.objectDetails}>
        <Text style={styles.objectName}>{selectedObject.name}</Text>
        <Text style={styles.objectType}>Type: {selectedObject.type}</Text>
        
        {/* Properties */}
        <View style={styles.propertiesContainer}>
          <Text style={styles.propertiesTitle}>Properties:</Text>
          {Object.entries(selectedObject.properties).map(([key, value]) => (
            <View key={key} style={styles.propertyItem}>
              <Text style={styles.propertyKey}>{key}:</Text>
              <Text style={styles.propertyValue}>{value}</Text>
            </View>
          ))}
        </View>
      </View>
      
      {/* Linked Concepts */}
      <View style={styles.linkedConceptsContainer}>
        <Text style={styles.sectionTitle}>Linked Concepts ({linkedConcepts.length})</Text>
        {linkedConcepts.length > 0 ? (
          linkedConcepts.map(concept => (
            <View key={concept.id} style={styles.linkedConceptCard}>
              <Text style={styles.linkedConceptName}>{concept.name}</Text>
              <Text style={styles.linkedConceptTrade}>{concept.trade}</Text>
              <Text style={styles.linkedConceptStatus}>{concept.status}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noLinkedText}>No linked concepts</Text>
        )}
      </View>
      
      {/* Link Button */}
      <TouchableOpacity
        style={styles.linkButton}
        onPress={() => setShowLinkModal(true)}
      >
        <Text style={styles.linkButtonText}>+ Link to Concept</Text>
      </TouchableOpacity>
      
      {/* Link Modal */}
      <Modal
        visible={showLinkModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowLinkModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Link to Concept</Text>
            
            <FlatList
              data={availableConcepts}
              renderItem={renderConceptItem}
              keyExtractor={item => item.id}
              style={styles.conceptList}
            />
            
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowLinkModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    margin: 8
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center'
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333'
  },
  objectDetails: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0'
  },
  objectName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4
  },
  objectType: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    textTransform: 'capitalize'
  },
  propertiesContainer: {
    marginTop: 8
  },
  propertiesTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4
  },
  propertyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2
  },
  propertyKey: {
    fontSize: 10,
    color: '#666',
    textTransform: 'capitalize'
  },
  propertyValue: {
    fontSize: 10,
    color: '#333',
    fontWeight: 'bold'
  },
  linkedConceptsContainer: {
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333'
  },
  linkedConceptCard: {
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 4,
    marginBottom: 4
  },
  linkedConceptName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333'
  },
  linkedConceptTrade: {
    fontSize: 10,
    color: '#666',
    textTransform: 'capitalize'
  },
  linkedConceptStatus: {
    fontSize: 10,
    color: '#4CAF50',
    textTransform: 'capitalize'
  },
  noLinkedText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic'
  },
  linkButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center'
  },
  linkButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    width: '80%',
    maxHeight: '70%'
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
    textAlign: 'center'
  },
  conceptList: {
    maxHeight: 300
  },
  conceptItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0'
  },
  linkedConceptItem: {
    backgroundColor: '#f0f0f0',
    opacity: 0.6
  },
  conceptName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333'
  },
  linkedConceptName: {
    color: '#666'
  },
  conceptTrade: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize'
  },
  linkedText: {
    fontSize: 10,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginTop: 4
  },
  cancelButton: {
    backgroundColor: '#E0E0E0',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 16
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: 'bold'
  }
});

export default BIMObjectSelector;