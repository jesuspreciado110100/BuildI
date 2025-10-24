import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import MockMachineryCatalogService, { MachinerySpec } from '../services/MockMachineryCatalogService';

interface MachineryTypeSelectorProps {
  onSelect?: (machinery: MachinerySpec) => void;
  selectedType?: string;
  selectedBrand?: string;
  selectedModel?: string;
}

export function MachineryTypeSelector({ 
  onSelect, 
  selectedType, 
  selectedBrand, 
  selectedModel 
}: MachineryTypeSelectorProps) {
  const [types, setTypes] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [currentType, setCurrentType] = useState(selectedType || '');
  const [currentBrand, setCurrentBrand] = useState(selectedBrand || '');
  const [currentModel, setCurrentModel] = useState(selectedModel || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTypes, setFilteredTypes] = useState<string[]>([]);

  useEffect(() => {
    loadTypes();
  }, []);

  useEffect(() => {
    if (currentType) {
      loadBrandsForType(currentType);
    } else {
      setBrands([]);
      setModels([]);
    }
  }, [currentType]);

  useEffect(() => {
    if (currentBrand) {
      loadModelsForBrand(currentBrand);
    } else {
      setModels([]);
    }
  }, [currentBrand]);

  useEffect(() => {
    if (currentType && currentBrand && currentModel) {
      const specs = MockMachineryCatalogService.getMachinerySpecs(currentType, currentBrand, currentModel);
      if (specs && onSelect) {
        onSelect(specs);
      }
    }
  }, [currentType, currentBrand, currentModel]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = types.filter(type => 
        type.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTypes(filtered);
    } else {
      setFilteredTypes(types);
    }
  }, [searchQuery, types]);

  const loadTypes = () => {
    const allTypes = MockMachineryCatalogService.getAllTypes();
    setTypes(allTypes);
    setFilteredTypes(allTypes);
  };

  const loadBrandsForType = (type: string) => {
    const machinery = MockMachineryCatalogService.getMachineryByType(type);
    const uniqueBrands = [...new Set(machinery.map(m => m.brand))];
    setBrands(uniqueBrands);
  };

  const loadModelsForBrand = (brand: string) => {
    const modelsList = MockMachineryCatalogService.getModelsByBrand(brand);
    setModels(modelsList);
  };

  const handleTypeSelect = (type: string) => {
    setCurrentType(type);
    setCurrentBrand('');
    setCurrentModel('');
  };

  const handleBrandSelect = (brand: string) => {
    setCurrentBrand(brand);
    setCurrentModel('');
  };

  const handleModelSelect = (model: string) => {
    setCurrentModel(model);
  };

  const resetSelection = () => {
    setCurrentType('');
    setCurrentBrand('');
    setCurrentModel('');
    setSearchQuery('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Select Machinery</Text>
        <TouchableOpacity onPress={resetSelection} style={styles.resetButton}>
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search machinery types..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.breadcrumb}>
        <Text style={styles.breadcrumbText}>
          {currentType ? `${currentType}` : 'Select Type'}
          {currentBrand ? ` → ${currentBrand}` : ''}
          {currentModel ? ` → ${currentModel}` : ''}
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {!currentType && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Types ({filteredTypes.length})</Text>
            <View style={styles.grid}>
              {filteredTypes.map((type, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.gridItem}
                  onPress={() => handleTypeSelect(type)}
                >
                  <Text style={styles.gridItemText}>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {currentType && !currentBrand && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Brands for {currentType} ({brands.length})</Text>
            <View style={styles.grid}>
              {brands.map((brand, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.gridItem}
                  onPress={() => handleBrandSelect(brand)}
                >
                  <Text style={styles.gridItemText}>{brand}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {currentBrand && !currentModel && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Models for {currentBrand} ({models.length})</Text>
            <View style={styles.grid}>
              {models.map((model, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.gridItem}
                  onPress={() => handleModelSelect(model)}
                >
                  <Text style={styles.gridItemText}>{model}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {currentType && currentBrand && currentModel && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Selected Machinery</Text>
            <View style={styles.detailCard}>
              <Text style={styles.detailTitle}>{currentBrand} {currentModel}</Text>
              <Text style={styles.detailSubtitle}>{currentType}</Text>
              {(() => {
                const specs = MockMachineryCatalogService.getMachinerySpecs(currentType, currentBrand, currentModel);
                if (specs?.specifications) {
                  return (
                    <View style={styles.specsContainer}>
                      <Text style={styles.specsTitle}>Specifications:</Text>
                      {Object.entries(specs.specifications).map(([key, value]) => (
                        <Text key={key} style={styles.specItem}>
                          {key.replace(/_/g, ' ')}: {value}
                        </Text>
                      ))}
                    </View>
                  );
                }
                return null;
              })()}
            </View>
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
  resetButton: {
    padding: 8,
  },
  resetText: {
    color: '#007AFF',
    fontSize: 16,
  },
  searchContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  breadcrumb: {
    backgroundColor: '#fff',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  breadcrumbText: {
    fontSize: 14,
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gridItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minWidth: '45%',
    alignItems: 'center',
  },
  gridItemText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  detailCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  detailSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  specsContainer: {
    marginTop: 16,
  },
  specsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  specItem: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
});