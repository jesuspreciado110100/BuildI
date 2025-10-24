import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { MachineSpecModal } from './MachineSpecModal';

interface Machine {
  id: string;
  name: string;
  brand: string;
  model: string;
  category: string;
  hourlyRate: number;
  imageUrl: string;
  specs: {
    model: string;
    brand: string;
    capacity: string;
    weight: string;
    reach: string;
    fuelType: string;
    power: string;
    year: string;
    noiseLevel: string;
  };
}

const MACHINE_CATEGORIES = [
  'All',
  'Excavators',
  'Bulldozers',
  'Cranes',
  'Loaders',
  'Compactors',
  'Generators'
];

const MOCK_MACHINES: Machine[] = [
  {
    id: '1',
    name: 'CAT 320 Excavator',
    brand: 'Caterpillar',
    model: '320',
    category: 'Excavators',
    hourlyRate: 85,
    imageUrl: 'https://picsum.photos/200/150?random=1',
    specs: {
      model: '320',
      brand: 'Caterpillar',
      capacity: '20 tons',
      weight: '22,000 lbs',
      reach: '31 ft',
      fuelType: 'Diesel',
      power: '158 HP',
      year: '2022',
      noiseLevel: '85 dB'
    }
  },
  {
    id: '2',
    name: 'John Deere 850K',
    brand: 'John Deere',
    model: '850K',
    category: 'Bulldozers',
    hourlyRate: 95,
    imageUrl: 'https://picsum.photos/200/150?random=2',
    specs: {
      model: '850K',
      brand: 'John Deere',
      capacity: '25 tons',
      weight: '35,000 lbs',
      reach: 'N/A',
      fuelType: 'Diesel',
      power: '215 HP',
      year: '2023',
      noiseLevel: '88 dB'
    }
  },
  {
    id: '3',
    name: 'Liebherr LTM 1090',
    brand: 'Liebherr',
    model: 'LTM 1090',
    category: 'Cranes',
    hourlyRate: 150,
    imageUrl: 'https://picsum.photos/200/150?random=3',
    specs: {
      model: 'LTM 1090',
      brand: 'Liebherr',
      capacity: '90 tons',
      weight: '60,000 lbs',
      reach: '164 ft',
      fuelType: 'Diesel',
      power: '367 HP',
      year: '2021',
      noiseLevel: '82 dB'
    }
  }
];

export const BrowseCatalogTab: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [showSpecModal, setShowSpecModal] = useState(false);

  const filteredMachines = selectedCategory === 'All' 
    ? MOCK_MACHINES 
    : MOCK_MACHINES.filter(machine => machine.category === selectedCategory);

  const handleViewSpecs = (machine: Machine) => {
    setSelectedMachine(machine);
    setShowSpecModal(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Browse Machinery Catalog</Text>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categorySelector}>
        {MACHINE_CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.selectedCategory
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === category && styles.selectedCategoryText
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.machineList}>
        {filteredMachines.map((machine) => (
          <View key={machine.id} style={styles.machineCard}>
            <Image source={{ uri: machine.imageUrl }} style={styles.machineImage} />
            
            <View style={styles.machineInfo}>
              <Text style={styles.machineName}>{machine.name}</Text>
              <Text style={styles.machineCategory}>{machine.category}</Text>
              <Text style={styles.machineRate}>${machine.hourlyRate}/hour</Text>
              
              <View style={styles.buttonRow}>
                <TouchableOpacity 
                  style={styles.specsButton}
                  onPress={() => handleViewSpecs(machine)}
                >
                  <Text style={styles.specsButtonText}>View Specs</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.requestButton} disabled>
                  <Text style={styles.requestButtonText}>Request (Disabled)</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {selectedMachine && (
        <MachineSpecModal
          visible={showSpecModal}
          onClose={() => setShowSpecModal(false)}
          spec={selectedMachine.specs}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: 16,
    backgroundColor: 'white',
  },
  categorySelector: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  selectedCategory: {
    backgroundColor: '#007AFF',
  },
  categoryText: {
    fontSize: 14,
    color: '#333',
  },
  selectedCategoryText: {
    color: 'white',
  },
  machineList: {
    flex: 1,
    padding: 16,
  },
  machineCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  machineImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  machineInfo: {
    padding: 16,
  },
  machineName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  machineCategory: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  machineRate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  specsButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  specsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  requestButton: {
    flex: 1,
    backgroundColor: '#ccc',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  requestButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
});