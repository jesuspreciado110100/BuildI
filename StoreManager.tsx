import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { Store } from '../types';

interface StoreManagerProps {
  stores: Store[];
  onAddStore: (store: Omit<Store, 'id'>) => void;
  onEditStore: (store: Store) => void;
  onDeleteStore: (storeId: string) => void;
  onSelectStore: (store: Store) => void;
}

export default function StoreManager({ stores, onAddStore, onEditStore, onDeleteStore, onSelectStore }: StoreManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStore, setNewStore] = useState({
    name: '',
    address: '',
    latitude: 0,
    longitude: 0,
    deliveryRadius: 10,
    supplierId: '',
    managerId: '',
    apiKey: ''
  });

  const handleAddStore = () => {
    if (!newStore.name || !newStore.address) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    onAddStore(newStore);
    setNewStore({
      name: '',
      address: '',
      latitude: 0,
      longitude: 0,
      deliveryRadius: 10,
      supplierId: '',
      managerId: '',
      apiKey: ''
    });
    setShowAddForm(false);
  };

  const renderStore = ({ item }: { item: Store }) => (
    <View style={styles.storeCard}>
      <TouchableOpacity onPress={() => onSelectStore(item)} style={styles.storeInfo}>
        <Text style={styles.storeName}>{item.name}</Text>
        <Text style={styles.storeAddress}>{item.address}</Text>
        <Text style={styles.storeRadius}>Delivery: {item.deliveryRadius}km</Text>
      </TouchableOpacity>
      <View style={styles.storeActions}>
        <TouchableOpacity onPress={() => onEditStore(item)} style={styles.editBtn}>
          <Text style={styles.btnText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDeleteStore(item.id)} style={styles.deleteBtn}>
          <Text style={styles.btnText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Store Locations</Text>
        <TouchableOpacity onPress={() => setShowAddForm(!showAddForm)} style={styles.addBtn}>
          <Text style={styles.addBtnText}>+ Add Store</Text>
        </TouchableOpacity>
      </View>

      {showAddForm && (
        <View style={styles.addForm}>
          <TextInput
            style={styles.input}
            placeholder="Store Name"
            value={newStore.name}
            onChangeText={(text) => setNewStore({...newStore, name: text})}
          />
          <TextInput
            style={styles.input}
            placeholder="Address"
            value={newStore.address}
            onChangeText={(text) => setNewStore({...newStore, address: text})}
          />
          <TextInput
            style={styles.input}
            placeholder="Delivery Radius (km)"
            value={newStore.deliveryRadius.toString()}
            onChangeText={(text) => setNewStore({...newStore, deliveryRadius: parseInt(text) || 10})}
            keyboardType="numeric"
          />
          <View style={styles.formActions}>
            <TouchableOpacity onPress={handleAddStore} style={styles.saveBtn}>
              <Text style={styles.btnText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowAddForm(false)} style={styles.cancelBtn}>
              <Text style={styles.btnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <FlatList
        data={stores}
        renderItem={renderStore}
        keyExtractor={(item) => item.id}
        style={styles.storeList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  addBtn: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addBtnText: {
    color: 'white',
    fontWeight: 'bold',
  },
  addForm: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  input: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  saveBtn: {
    backgroundColor: '#34C759',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  cancelBtn: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  storeList: {
    flex: 1,
  },
  storeCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  storeAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  storeRadius: {
    fontSize: 12,
    color: '#999',
  },
  storeActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editBtn: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteBtn: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  btnText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});