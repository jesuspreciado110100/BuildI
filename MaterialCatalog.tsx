import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native';
import { Material } from '../types';
import { MaterialService } from '../services/MaterialService';
import InventoryService from '../services/InventoryService';

interface MaterialCatalogProps {
  supplierId: string;
  storeId?: string;
}

const MaterialCatalog: React.FC<MaterialCatalogProps> = ({ supplierId, storeId }) => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editStock, setEditStock] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMaterial, setNewMaterial] = useState({
    name: '',
    category: '',
    unitPrice: '',
    stockQuantity: '',
    sku: '',
    deliveryTimeEstimate: '24'
  });
  const inventoryService = InventoryService.getInstance();

  useEffect(() => {
    loadMaterials();
  }, [supplierId, storeId]);

  const loadMaterials = async () => {
    try {
      if (storeId) {
        // Load materials for specific store
        const storeMaterials = inventoryService.getMaterialsByStore(storeId);
        setMaterials(storeMaterials);
      } else {
        // Load all materials for supplier
        const supplierMaterials = await MaterialService.getMaterialsBySupplier(supplierId);
        setMaterials(supplierMaterials);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load materials');
    }
  };

  const handleEdit = (material: Material) => {
    setEditingId(material.id);
    setEditPrice(material.unitPrice.toString());
    setEditStock(material.stockQuantity.toString());
  };

  const handleSave = async (id: string) => {
    const price = parseFloat(editPrice);
    const stock = parseInt(editStock);
    
    if (isNaN(price) || isNaN(stock)) {
      Alert.alert('Error', 'Please enter valid numbers');
      return;
    }

    try {
      if (storeId) {
        // Update material in specific store
        const material = materials.find(m => m.id === id);
        if (material) {
          const updatedMaterial = { ...material, unitPrice: price, stockQuantity: stock };
          inventoryService.updateMaterial(updatedMaterial);
        }
      } else {
        // Update material globally
        await MaterialService.updateMaterial(id, {
          unitPrice: price,
          stockQuantity: stock
        });
      }
      
      setMaterials(prev => prev.map(m => 
        m.id === id ? { ...m, unitPrice: price, stockQuantity: stock } : m
      ));
      setEditingId(null);
      Alert.alert('Success', 'Material updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update material');
    }
  };

  const handleAddMaterial = () => {
    const price = parseFloat(newMaterial.unitPrice);
    const stock = parseInt(newMaterial.stockQuantity);
    const deliveryTime = parseInt(newMaterial.deliveryTimeEstimate);
    
    if (!newMaterial.name || !newMaterial.category || isNaN(price) || isNaN(stock)) {
      Alert.alert('Error', 'Please fill in all required fields with valid values');
      return;
    }

    const material: Material = {
      id: Date.now().toString(),
      name: newMaterial.name,
      category: newMaterial.category,
      unitPrice: price,
      stockQuantity: stock,
      deliveryAreaRadius: 10, // Default radius
      deliveryTimeEstimate: deliveryTime,
      supplierId,
      storeId,
      sku: newMaterial.sku || `SKU-${Date.now()}`
    };

    inventoryService.addMaterial(material);
    setMaterials(prev => [...prev, material]);
    setNewMaterial({
      name: '',
      category: '',
      unitPrice: '',
      stockQuantity: '',
      sku: '',
      deliveryTimeEstimate: '24'
    });
    setShowAddForm(false);
    Alert.alert('Success', 'Material added successfully');
  };

  const handleDeleteMaterial = (id: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this material?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            inventoryService.deleteMaterial(id);
            setMaterials(prev => prev.filter(m => m.id !== id));
          }
        }
      ]
    );
  };

  const renderMaterial = ({ item }: { item: Material }) => (
    <View style={styles.materialCard}>
      <View style={styles.materialHeader}>
        <Text style={styles.materialName}>{item.name}</Text>
        {item.sku && <Text style={styles.sku}>SKU: {item.sku}</Text>}
      </View>
      <Text style={styles.category}>{item.category}</Text>
      
      {editingId === item.id ? (
        <View style={styles.editContainer}>
          <TextInput
            style={styles.input}
            value={editPrice}
            onChangeText={setEditPrice}
            placeholder="Unit Price"
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            value={editStock}
            onChangeText={setEditStock}
            placeholder="Stock Quantity"
            keyboardType="numeric"
          />
          <View style={styles.editActions}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => handleSave(item.id)}
            >
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setEditingId(null)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.infoContainer}>
          <Text>Price: ${item.unitPrice}/unit</Text>
          <Text>Stock: {item.stockQuantity} units</Text>
          <Text>Delivery: {item.deliveryAreaRadius}km, {item.deliveryTimeEstimate}h</Text>
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => handleEdit(item)}
            >
              <Text style={styles.buttonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteMaterial(item.id)}
            >
              <Text style={styles.buttonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {storeId ? 'Store Materials' : 'Material Catalog'}
        </Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddForm(!showAddForm)}
        >
          <Text style={styles.addButtonText}>+ Add Material</Text>
        </TouchableOpacity>
      </View>

      {showAddForm && (
        <View style={styles.addForm}>
          <TextInput
            style={styles.input}
            placeholder="Material Name"
            value={newMaterial.name}
            onChangeText={(text) => setNewMaterial({...newMaterial, name: text})}
          />
          <TextInput
            style={styles.input}
            placeholder="Category"
            value={newMaterial.category}
            onChangeText={(text) => setNewMaterial({...newMaterial, category: text})}
          />
          <TextInput
            style={styles.input}
            placeholder="SKU (optional)"
            value={newMaterial.sku}
            onChangeText={(text) => setNewMaterial({...newMaterial, sku: text})}
          />
          <TextInput
            style={styles.input}
            placeholder="Unit Price"
            value={newMaterial.unitPrice}
            onChangeText={(text) => setNewMaterial({...newMaterial, unitPrice: text})}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Stock Quantity"
            value={newMaterial.stockQuantity}
            onChangeText={(text) => setNewMaterial({...newMaterial, stockQuantity: text})}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Delivery Time (hours)"
            value={newMaterial.deliveryTimeEstimate}
            onChangeText={(text) => setNewMaterial({...newMaterial, deliveryTimeEstimate: text})}
            keyboardType="numeric"
          />
          <View style={styles.formActions}>
            <TouchableOpacity style={styles.saveButton} onPress={handleAddMaterial}>
              <Text style={styles.buttonText}>Add Material</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowAddForm(false)}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <FlatList
        data={materials}
        renderItem={renderMaterial}
        keyExtractor={item => item.id}
        style={styles.materialList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 20, fontWeight: 'bold' },
  addButton: { backgroundColor: '#007AFF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  addButtonText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
  addForm: { backgroundColor: '#f9f9f9', padding: 16, borderRadius: 8, marginBottom: 16 },
  materialList: { flex: 1 },
  materialCard: { backgroundColor: 'white', padding: 16, marginBottom: 12, borderRadius: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  materialHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  materialName: { fontSize: 16, fontWeight: 'bold' },
  sku: { fontSize: 12, color: '#666' },
  category: { fontSize: 14, color: '#666', marginBottom: 8 },
  editContainer: { marginTop: 8 },
  infoContainer: { marginTop: 8 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  editActions: { flexDirection: 'row', gap: 8 },
  formActions: { flexDirection: 'row', gap: 8 },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 8, marginBottom: 8, borderRadius: 4, backgroundColor: 'white' },
  editButton: { backgroundColor: '#007AFF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4 },
  saveButton: { backgroundColor: '#34C759', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4 },
  cancelButton: { backgroundColor: '#8E8E93', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4 },
  deleteButton: { backgroundColor: '#FF3B30', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4 },
  buttonText: { color: 'white', textAlign: 'center', fontWeight: 'bold', fontSize: 12 }
});

export default MaterialCatalog;