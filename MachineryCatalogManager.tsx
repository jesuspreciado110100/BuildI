import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import MachineryCatalogService, { MachinerySpec } from '../services/MachineryCatalogService';

interface MachineryCatalogManagerProps {
  onClose?: () => void;
}

export function MachineryCatalogManager({ onClose }: MachineryCatalogManagerProps) {
  const [catalogSize, setCatalogSize] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MachinerySpec[]>([]);
  const [selectedTab, setSelectedTab] = useState<'add' | 'browse' | 'search'>('add');
  const [newMachinery, setNewMachinery] = useState({
    type: '',
    brand: '',
    model: '',
    category: '',
    specifications: '{}'
  });

  useEffect(() => {
    updateCatalogSize();
  }, []);

  const updateCatalogSize = () => {
    setCatalogSize(MachineryCatalogService.getCatalogSize());
  };

  const handleAddMachinery = () => {
    if (!newMachinery.type || !newMachinery.brand || !newMachinery.model) {
      Alert.alert('Error', 'Please fill in type, brand, and model');
      return;
    }

    try {
      const specs = JSON.parse(newMachinery.specifications || '{}');
      const machinery: MachinerySpec = {
        type: newMachinery.type,
        brand: newMachinery.brand,
        model: newMachinery.model,
        category: newMachinery.category || newMachinery.type,
        specifications: specs
      };

      MachineryCatalogService.addMachinery([machinery]);
      setNewMachinery({ type: '', brand: '', model: '', category: '', specifications: '{}' });
      updateCatalogSize();
      Alert.alert('Success', 'Machinery added to catalog');
    } catch (error) {
      Alert.alert('Error', 'Invalid specifications JSON');
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const results = MachineryCatalogService.searchMachinery(searchQuery);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleBulkAdd = () => {
    // Example bulk add with common machinery
    const commonMachinery: MachinerySpec[] = [
      {
        type: 'Excavator',
        brand: 'Caterpillar',
        model: '320D',
        category: 'Heavy Equipment',
        specifications: {
          operating_weight: '20,000 kg',
          bucket_capacity: '1.2 m³',
          max_dig_depth: '6.5 m',
          engine_power: '122 kW'
        }
      },
      {
        type: 'Bulldozer',
        brand: 'Komatsu',
        model: 'D65PX',
        category: 'Heavy Equipment',
        specifications: {
          operating_weight: '18,500 kg',
          blade_capacity: '3.8 m³',
          engine_power: '141 kW'
        }
      },
      {
        type: 'Crane',
        brand: 'Liebherr',
        model: 'LTM 1070',
        category: 'Lifting Equipment',
        specifications: {
          max_capacity: '70 tons',
          boom_length: '50 m',
          engine_power: '340 kW'
        }
      }
    ];

    MachineryCatalogService.addMachinery(commonMachinery);
    updateCatalogSize();
    Alert.alert('Success', `Added ${commonMachinery.length} machinery items`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Machinery Catalog Manager</Text>
        <Text style={styles.subtitle}>Catalog Size: {catalogSize} items</Text>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, selectedTab === 'add' && styles.activeTab]}
          onPress={() => setSelectedTab('add')}
        >
          <Text style={[styles.tabText, selectedTab === 'add' && styles.activeTabText]}>Add</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, selectedTab === 'search' && styles.activeTab]}
          onPress={() => setSelectedTab('search')}
        >
          <Text style={[styles.tabText, selectedTab === 'search' && styles.activeTabText]}>Search</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {selectedTab === 'add' && (
          <View style={styles.addForm}>
            <TextInput
              style={styles.input}
              placeholder="Type (e.g., Excavator)"
              value={newMachinery.type}
              onChangeText={(text) => setNewMachinery({...newMachinery, type: text})}
            />
            <TextInput
              style={styles.input}
              placeholder="Brand (e.g., Caterpillar)"
              value={newMachinery.brand}
              onChangeText={(text) => setNewMachinery({...newMachinery, brand: text})}
            />
            <TextInput
              style={styles.input}
              placeholder="Model (e.g., 320D)"
              value={newMachinery.model}
              onChangeText={(text) => setNewMachinery({...newMachinery, model: text})}
            />
            <TextInput
              style={styles.input}
              placeholder="Category (optional)"
              value={newMachinery.category}
              onChangeText={(text) => setNewMachinery({...newMachinery, category: text})}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder='Specifications JSON (e.g., {"weight": "20t"})'
              value={newMachinery.specifications}
              onChangeText={(text) => setNewMachinery({...newMachinery, specifications: text})}
              multiline
            />
            <TouchableOpacity style={styles.addButton} onPress={handleAddMachinery}>
              <Text style={styles.buttonText}>Add Machinery</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bulkButton} onPress={handleBulkAdd}>
              <Text style={styles.buttonText}>Add Sample Data</Text>
            </TouchableOpacity>
          </View>
        )}

        {selectedTab === 'search' && (
          <View style={styles.searchForm}>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search machinery..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                <Text style={styles.buttonText}>Search</Text>
              </TouchableOpacity>
            </View>
            {searchResults.map((item, index) => (
              <View key={index} style={styles.resultItem}>
                <Text style={styles.resultTitle}>{item.brand} {item.model}</Text>
                <Text style={styles.resultSubtitle}>{item.type} - {item.category}</Text>
                {item.specifications && (
                  <Text style={styles.resultSpecs}>
                    {JSON.stringify(item.specifications, null, 2)}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 18,
    color: '#666',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
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
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  addForm: {
    gap: 12,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  addButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  bulkButton: {
    backgroundColor: '#34C759',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  searchForm: {
    gap: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  resultItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  resultSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  resultSpecs: {
    fontSize: 12,
    color: '#888',
    marginTop: 8,
    fontFamily: 'monospace',
  },
});