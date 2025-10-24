import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { Store, Material } from '../types';

interface StoreAdminPanelProps {
  stores: Store[];
  materials: Material[];
  onAssignManager: (storeId: string, managerId: string) => void;
  onGlobalPriceUpdate: (materialId: string, newPrice: number) => void;
  onStorePriceOverride: (storeId: string, materialId: string, newPrice: number) => void;
}

export default function StoreAdminPanel({ 
  stores, 
  materials, 
  onAssignManager, 
  onGlobalPriceUpdate, 
  onStorePriceOverride 
}: StoreAdminPanelProps) {
  const [selectedTab, setSelectedTab] = useState<'managers' | 'pricing'>('managers');
  const [managerInput, setManagerInput] = useState('');
  const [selectedStore, setSelectedStore] = useState<string>('');
  const [priceUpdates, setPriceUpdates] = useState<{[key: string]: string}>({});

  const handleAssignManager = (storeId: string) => {
    if (!managerInput.trim()) {
      Alert.alert('Error', 'Please enter manager ID');
      return;
    }
    onAssignManager(storeId, managerInput.trim());
    setManagerInput('');
    Alert.alert('Success', 'Manager assigned successfully');
  };

  const handleGlobalPriceUpdate = (materialId: string) => {
    const newPrice = parseFloat(priceUpdates[materialId]);
    if (isNaN(newPrice) || newPrice <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }
    onGlobalPriceUpdate(materialId, newPrice);
    setPriceUpdates({...priceUpdates, [materialId]: ''});
    Alert.alert('Success', 'Global price updated');
  };

  const handleStorePriceOverride = (storeId: string, materialId: string) => {
    const key = `${storeId}-${materialId}`;
    const newPrice = parseFloat(priceUpdates[key]);
    if (isNaN(newPrice) || newPrice <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }
    onStorePriceOverride(storeId, materialId, newPrice);
    setPriceUpdates({...priceUpdates, [key]: ''});
    Alert.alert('Success', 'Store price overridden');
  };

  const renderManagerTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Assign Store Managers</Text>
      <FlatList
        data={stores}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.storeManagerCard}>
            <View style={styles.storeInfo}>
              <Text style={styles.storeName}>{item.name}</Text>
              <Text style={styles.storeAddress}>{item.address}</Text>
              <Text style={styles.currentManager}>
                Current Manager: {item.managerId || 'None'}
              </Text>
            </View>
            <View style={styles.managerActions}>
              <TextInput
                style={styles.managerInput}
                placeholder="Manager ID"
                value={selectedStore === item.id ? managerInput : ''}
                onChangeText={(text) => {
                  setManagerInput(text);
                  setSelectedStore(item.id);
                }}
              />
              <TouchableOpacity
                onPress={() => handleAssignManager(item.id)}
                style={styles.assignBtn}
              >
                <Text style={styles.btnText}>Assign</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );

  const renderPricingTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Global Price Updates</Text>
      <FlatList
        data={materials}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.materialCard}>
            <View style={styles.materialInfo}>
              <Text style={styles.materialName}>{item.name}</Text>
              <Text style={styles.currentPrice}>Current: ${item.unitPrice}</Text>
            </View>
            <View style={styles.priceActions}>
              <TextInput
                style={styles.priceInput}
                placeholder="New Price"
                value={priceUpdates[item.id] || ''}
                onChangeText={(text) => setPriceUpdates({...priceUpdates, [item.id]: text})}
                keyboardType="numeric"
              />
              <TouchableOpacity
                onPress={() => handleGlobalPriceUpdate(item.id)}
                style={styles.updateBtn}
              >
                <Text style={styles.btnText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      
      <Text style={styles.sectionTitle}>Store-Specific Overrides</Text>
      {stores.map(store => (
        <View key={store.id} style={styles.storeOverrideSection}>
          <Text style={styles.storeOverrideTitle}>{store.name}</Text>
          {materials.map(material => {
            const key = `${store.id}-${material.id}`;
            return (
              <View key={key} style={styles.overrideRow}>
                <Text style={styles.overrideMaterial}>{material.name}</Text>
                <View style={styles.overrideActions}>
                  <TextInput
                    style={styles.overrideInput}
                    placeholder="Override Price"
                    value={priceUpdates[key] || ''}
                    onChangeText={(text) => setPriceUpdates({...priceUpdates, [key]: text})}
                    keyboardType="numeric"
                  />
                  <TouchableOpacity
                    onPress={() => handleStorePriceOverride(store.id, material.id)}
                    style={styles.overrideBtn}
                  >
                    <Text style={styles.btnText}>Override</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        <TouchableOpacity
          onPress={() => setSelectedTab('managers')}
          style={[styles.tab, selectedTab === 'managers' && styles.activeTab]}
        >
          <Text style={[styles.tabText, selectedTab === 'managers' && styles.activeTabText]}>
            Managers
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setSelectedTab('pricing')}
          style={[styles.tab, selectedTab === 'pricing' && styles.activeTab]}
        >
          <Text style={[styles.tabText, selectedTab === 'pricing' && styles.activeTabText]}>
            Pricing
          </Text>
        </TouchableOpacity>
      </View>
      
      {selectedTab === 'managers' ? renderManagerTab() : renderPricingTab()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  storeManagerCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  storeInfo: {
    marginBottom: 12,
  },
  storeName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  storeAddress: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  currentManager: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  managerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  managerInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'white',
  },
  assignBtn: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  materialCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  materialInfo: {
    flex: 1,
  },
  materialName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  currentPrice: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  priceActions: {
    flexDirection: 'row',
    gap: 8,
  },
  priceInput: {
    width: 80,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    textAlign: 'center',
  },
  updateBtn: {
    backgroundColor: '#34C759',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  storeOverrideSection: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  storeOverrideTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  overrideRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  overrideMaterial: {
    flex: 1,
    fontSize: 14,
  },
  overrideActions: {
    flexDirection: 'row',
    gap: 8,
  },
  overrideInput: {
    width: 70,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 4,
    textAlign: 'center',
    fontSize: 12,
  },
  overrideBtn: {
    backgroundColor: '#FF9500',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  btnText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});