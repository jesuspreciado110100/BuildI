import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Concept, BIMObject } from '../types';
import { BIMConceptMapService } from '../services/BIMConceptMapService';

interface LinkConceptModalProps {
  visible: boolean;
  onClose: () => void;
  bimObject: BIMObject | null;
  bimFileId: string;
  concepts: Concept[];
  onLinkCreated: () => void;
}

export default function LinkConceptModal({ 
  visible, 
  onClose, 
  bimObject, 
  bimFileId, 
  concepts, 
  onLinkCreated 
}: LinkConceptModalProps) {
  const [selectedConceptId, setSelectedConceptId] = useState<string | null>(null);
  const [isLinking, setIsLinking] = useState(false);

  const handleLinkToConcept = async () => {
    if (!bimObject || !selectedConceptId) return;
    
    setIsLinking(true);
    try {
      await BIMConceptMapService.linkObjectToConcept(
        bimFileId,
        bimObject.id,
        selectedConceptId
      );
      
      Alert.alert(
        'Success',
        `BIM object "${bimObject.name}" has been linked to the selected concept.`,
        [{ text: 'OK' }]
      );
      
      onLinkCreated();
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to link BIM object to concept.');
    } finally {
      setIsLinking(false);
    }
  };

  const handleUnlink = async () => {
    if (!bimObject) return;
    
    setIsLinking(true);
    try {
      await BIMConceptMapService.unlinkObject(bimFileId, bimObject.id);
      
      Alert.alert(
        'Success',
        `BIM object "${bimObject.name}" has been unlinked.`,
        [{ text: 'OK' }]
      );
      
      onLinkCreated();
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to unlink BIM object.');
    } finally {
      setIsLinking(false);
    }
  };

  if (!bimObject) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Link to Concept</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.objectInfo}>
            <Text style={styles.objectName}>{bimObject.name}</Text>
            <Text style={styles.objectType}>Type: {bimObject.type}</Text>
            <Text style={styles.objectId}>ID: {bimObject.guid}</Text>
          </View>
          
          <Text style={styles.sectionTitle}>Select Concept:</Text>
          
          <ScrollView style={styles.conceptList}>
            {concepts.map(concept => (
              <TouchableOpacity
                key={concept.id}
                style={[
                  styles.conceptItem,
                  selectedConceptId === concept.id && styles.conceptItemSelected
                ]}
                onPress={() => setSelectedConceptId(concept.id)}
              >
                <Text style={[
                  styles.conceptName,
                  selectedConceptId === concept.id && styles.conceptNameSelected
                ]}>
                  {concept.name}
                </Text>
                <Text style={styles.conceptDescription}>
                  {concept.description}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.unlinkButton}
              onPress={handleUnlink}
              disabled={isLinking}
            >
              <Text style={styles.unlinkButtonText}>Unlink</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.linkButton,
                (!selectedConceptId || isLinking) && styles.linkButtonDisabled
              ]}
              onPress={handleLinkToConcept}
              disabled={!selectedConceptId || isLinking}
            >
              <Text style={styles.linkButtonText}>
                {isLinking ? 'Linking...' : 'Link to Concept'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '100%',
    maxHeight: '80%',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  closeText: {
    fontSize: 18,
    color: '#666',
  },
  objectInfo: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  objectName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  objectType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  objectId: {
    fontSize: 12,
    color: '#999',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  conceptList: {
    maxHeight: 200,
    marginBottom: 20,
  },
  conceptItem: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 8,
  },
  conceptItemSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  conceptName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  conceptNameSelected: {
    color: '#007AFF',
  },
  conceptDescription: {
    fontSize: 12,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  unlinkButton: {
    flex: 1,
    backgroundColor: '#dc3545',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  unlinkButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  linkButton: {
    flex: 2,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  linkButtonDisabled: {
    backgroundColor: '#ccc',
  },
  linkButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});