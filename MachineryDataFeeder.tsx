import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import MachineryCatalogService, { MachinerySpec } from '../services/MachineryCatalogService';

interface MachineryDataFeederProps {
  onDataLoaded?: (count: number) => void;
}

export function MachineryDataFeeder({ onDataLoaded }: MachineryDataFeederProps) {
  const [jsonInput, setJsonInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleBulkImport = async () => {
    if (!jsonInput.trim()) {
      Alert.alert('Error', 'Please enter machinery data in JSON format');
      return;
    }

    setIsLoading(true);
    try {
      const data = JSON.parse(jsonInput);
      const machineryArray = Array.isArray(data) ? data : [data];
      
      // Validate required fields
      const validMachinery: MachinerySpec[] = machineryArray.filter(item => {
        return item.type && item.brand && item.model;
      }).map(item => ({
        type: item.type,
        brand: item.brand,
        model: item.model,
        category: item.category || item.type,
        specifications: item.specifications || {},
        typical_daily_rate: item.typical_daily_rate,
        typical_hourly_rate: item.typical_hourly_rate
      }));

      if (validMachinery.length === 0) {
        Alert.alert('Error', 'No valid machinery data found. Each item must have type, brand, and model.');
        return;
      }

      MachineryCatalogService.addMachinery(validMachinery);
      setJsonInput('');
      onDataLoaded?.(validMachinery.length);
      Alert.alert('Success', `Added ${validMachinery.length} machinery items to catalog`);
    } catch (error) {
      Alert.alert('Error', 'Invalid JSON format. Please check your data.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSampleData = () => {
    const sampleData = [
      {
        type: 'Excavator',
        brand: 'Caterpillar',
        model: '320D',
        category: 'Heavy Equipment',
        specifications: {
          operating_weight: '20,000 kg',
          bucket_capacity: '1.2 m³',
          max_dig_depth: '6.5 m',
          engine_power: '122 kW',
          fuel_capacity: '400 L'
        },
        typical_daily_rate: 450,
        typical_hourly_rate: 65
      },
      {
        type: 'Excavator',
        brand: 'Komatsu',
        model: 'PC200',
        category: 'Heavy Equipment',
        specifications: {
          operating_weight: '19,500 kg',
          bucket_capacity: '1.0 m³',
          max_dig_depth: '6.2 m',
          engine_power: '110 kW'
        },
        typical_daily_rate: 420,
        typical_hourly_rate: 60
      },
      {
        type: 'Bulldozer',
        brand: 'Caterpillar',
        model: 'D6T',
        category: 'Heavy Equipment',
        specifications: {
          operating_weight: '18,200 kg',
          blade_capacity: '3.5 m³',
          engine_power: '149 kW'
        },
        typical_daily_rate: 380,
        typical_hourly_rate: 55
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
        },
        typical_daily_rate: 800,
        typical_hourly_rate: 120
      },
      {
        type: 'Loader',
        brand: 'John Deere',
        model: '544K',
        category: 'Heavy Equipment',
        specifications: {
          operating_weight: '15,800 kg',
          bucket_capacity: '2.3 m³',
          engine_power: '130 kW'
        },
        typical_daily_rate: 350,
        typical_hourly_rate: 50
      }
    ];
    
    setJsonInput(JSON.stringify(sampleData, null, 2));
  };

  const clearData = () => {
    MachineryCatalogService.clearCatalog();
    Alert.alert('Success', 'Catalog cleared');
    onDataLoaded?.(0);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Feed Machinery Data</Text>
        <Text style={styles.subtitle}>Import machinery by type, model, and brand</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>JSON Data Input</Text>
          <Text style={styles.helpText}>
            Enter machinery data in JSON format. Each item should have:
            • type (required)
            • brand (required)
            • model (required)
            • category (optional)
            • specifications (optional object)
            • typical_daily_rate (optional)
            • typical_hourly_rate (optional)
          </Text>
          
          <TextInput
            style={styles.jsonInput}
            placeholder="Paste your machinery JSON data here..."
            value={jsonInput}
            onChangeText={setJsonInput}
            multiline
            textAlignVertical="top"
          />
          
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={styles.sampleButton} 
              onPress={loadSampleData}
            >
              <Text style={styles.buttonText}>Load Sample</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.importButton, isLoading && styles.disabledButton]} 
              onPress={handleBulkImport}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Importing...' : 'Import Data'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Catalog Management</Text>
          <TouchableOpacity style={styles.clearButton} onPress={clearData}>
            <Text style={styles.buttonText}>Clear All Data</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Catalog Info</Text>
          <Text style={styles.infoText}>Total Items: {MachineryCatalogService.getCatalogSize()}</Text>
          <Text style={styles.infoText}>Types: {MachineryCatalogService.getAllTypes().join(', ')}</Text>
          <Text style={styles.infoText}>Brands: {MachineryCatalogService.getAllBrands().join(', ')}</Text>
        </View>
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
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  jsonInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontSize: 14,
    fontFamily: 'monospace',
    minHeight: 200,
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  sampleButton: {
    flex: 1,
    backgroundColor: '#34C759',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  importButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
});