import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList } from 'react-native';
import { Concept } from '../types';

interface ConceptSelectorProps {
  concepts: Concept[];
  selectedConceptId: string;
  onSelect: (conceptId: string) => void;
  placeholder: string;
}

export default function ConceptSelector({ concepts, selectedConceptId, onSelect, placeholder }: ConceptSelectorProps) {
  const [showModal, setShowModal] = useState(false);
  
  const selectedConcept = concepts.find(c => c.id === selectedConceptId);
  
  const handleSelect = (conceptId: string) => {
    onSelect(conceptId);
    setShowModal(false);
  };
  
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.selector}
        onPress={() => setShowModal(true)}
      >
        <Text style={styles.text}>
          {selectedConcept ? selectedConcept.name : placeholder}
        </Text>
      </TouchableOpacity>
      
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Concept</Text>
            
            <TouchableOpacity 
              style={styles.conceptItem}
              onPress={() => handleSelect('')}
            >
              <Text style={styles.conceptText}>None</Text>
            </TouchableOpacity>
            
            <FlatList
              data={concepts}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.conceptItem}
                  onPress={() => handleSelect(item.id)}
                >
                  <Text style={styles.conceptText}>{item.name}</Text>
                  {item.description && (
                    <Text style={styles.conceptDescription}>{item.description}</Text>
                  )}
                </TouchableOpacity>
              )}
            />
            
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  selector: { 
    borderWidth: 1, 
    borderColor: '#d1d5db', 
    borderRadius: 8, 
    padding: 12,
    backgroundColor: '#f9fafb'
  },
  text: { fontSize: 16, color: '#374151' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxHeight: '60%'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center'
  },
  conceptItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  conceptText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151'
  },
  conceptDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4
  },
  closeButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#dc2626',
    borderRadius: 8,
    alignItems: 'center'
  },
  closeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  }
});