import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { MaterialItem } from '../types';
import MaterialCard from './MaterialCard';
import MaterialItemForm from './MaterialItemForm';

interface MaterialCatalogTabProps {
  materials: MaterialItem[];
  onAddMaterial: (material: Partial<MaterialItem>) => void;
  onEditMaterial: (material: MaterialItem) => void;
  onDeleteMaterial: (materialId: string) => void;
}

export default function MaterialCatalogTab({ 
  materials, 
  onAddMaterial, 
  onEditMaterial, 
  onDeleteMaterial 
}: MaterialCatalogTabProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<MaterialItem | null>(null);

  const handleAddMaterial = () => {
    setEditingMaterial(null);
    setShowForm(true);
  };

  const handleEditMaterial = (material: MaterialItem) => {
    setEditingMaterial(material);
    setShowForm(true);
  };

  const handleFormSubmit = (materialData: Partial<MaterialItem>) => {
    if (editingMaterial) {
      onEditMaterial({ ...editingMaterial, ...materialData });
    } else {
      onAddMaterial(materialData);
    }
    setShowForm(false);
    setEditingMaterial(null);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingMaterial(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Material Catalog</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddMaterial}>
          <Text style={styles.addButtonText}>+ Add Material</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {materials.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No materials in your catalog yet.</Text>
            <Text style={styles.emptySubtext}>Add your first material to get started!</Text>
          </View>
        ) : (
          materials.map((material) => (
            <MaterialCard
              key={material.id}
              material={material}
              onPress={() => handleEditMaterial(material)}
            />
          ))
        )}
      </ScrollView>

      <Modal
        visible={showForm}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <MaterialItemForm
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          initialData={editingMaterial || undefined}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  addButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  scrollView: {
    flex: 1,
    padding: 16
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center'
  }
});