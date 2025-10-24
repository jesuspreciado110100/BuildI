import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';

interface MachineSpec {
  model: string;
  brand: string;
  capacity: string;
  weight: string;
  reach: string;
  fuelType: string;
  power: string;
  year: string;
  noiseLevel: string;
}

interface MachineSpecModalProps {
  visible: boolean;
  onClose: () => void;
  spec: MachineSpec;
}

export const MachineSpecModal: React.FC<MachineSpecModalProps> = ({ 
  visible, 
  onClose, 
  spec 
}) => {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Machine Specifications</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>×</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.content}>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Model:</Text>
              <Text style={styles.specValue}>{spec.model}</Text>
            </View>
            
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Brand:</Text>
              <Text style={styles.specValue}>{spec.brand}</Text>
            </View>
            
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Capacity:</Text>
              <Text style={styles.specValue}>{spec.capacity}</Text>
            </View>
            
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Weight:</Text>
              <Text style={styles.specValue}>{spec.weight}</Text>
            </View>
            
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Reach:</Text>
              <Text style={styles.specValue}>{spec.reach}</Text>
            </View>
            
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Fuel Type:</Text>
              <Text style={styles.specValue}>{spec.fuelType}</Text>
            </View>
            
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Power:</Text>
              <Text style={styles.specValue}>{spec.power}</Text>
            </View>
            
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Year:</Text>
              <Text style={styles.specValue}>{spec.year}</Text>
            </View>
            
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Noise Level:</Text>
              <Text style={styles.specValue}>{spec.noiseLevel}</Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  closeText: {
    fontSize: 24,
    color: '#666',
  },
  content: {
    padding: 16,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  specLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  specValue: {
    fontSize: 14,
    color: '#666',
  },
});