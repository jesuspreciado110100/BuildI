import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView } from 'react-native';
import { CurrencyService } from '../services/CurrencyService';

interface MaterialItem {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  unit: string;
  supplier_id: string;
  supplier_name: string;
}

interface CurrencyMaterialCatalogProps {
  materials: MaterialItem[];
  userCurrency: string;
  onAddToCart?: (item: MaterialItem) => void;
}

export const CurrencyMaterialCatalog: React.FC<CurrencyMaterialCatalogProps> = ({
  materials,
  userCurrency,
  onAddToCart
}) => {
  const [selectedCurrency, setSelectedCurrency] = useState(userCurrency);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMaterial, setNewMaterial] = useState({
    name: '',
    price: '',
    currency: 'USD',
    unit: 'piece'
  });

  const supportedCurrencies = CurrencyService.getSupportedCurrencies();

  const handleAddMaterial = () => {
    // Mock add material functionality
    console.log('Adding material:', newMaterial);
    setShowAddForm(false);
    setNewMaterial({ name: '', price: '', currency: 'USD', unit: 'piece' });
  };

  const renderMaterialCard = (material: MaterialItem) => {
    const displayPrice = selectedCurrency === material.currency 
      ? material.price
      : CurrencyService.convert(material.price, material.currency, selectedCurrency);

    const priceDisplay = selectedCurrency === material.currency
      ? CurrencyService.formatCurrency(material.price, material.currency)
      : CurrencyService.formatDualCurrency(material.price, material.currency, selectedCurrency);

    return (
      <View key={material.id} style={styles.materialCard}>
        <View style={styles.materialHeader}>
          <Text style={styles.materialName}>{material.name}</Text>
          <Text style={styles.materialPrice}>{priceDisplay}</Text>
        </View>
        <Text style={styles.materialDescription}>{material.description}</Text>
        <View style={styles.materialFooter}>
          <Text style={styles.materialUnit}>per {material.unit}</Text>
          <Text style={styles.supplierName}>{material.supplier_name}</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => onAddToCart?.(material)}
        >
          <Text style={styles.addButtonText}>Add to Quote</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Material Catalog</Text>
        <TouchableOpacity
          style={styles.addMaterialButton}
          onPress={() => setShowAddForm(true)}
        >
          <Text style={styles.addMaterialButtonText}>+ Add Material</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.currencySelector}>
        <Text style={styles.currencyLabel}>Display prices in:</Text>
        <View style={styles.currencyButtons}>
          {supportedCurrencies.map(currency => (
            <TouchableOpacity
              key={currency}
              style={[
                styles.currencyButton,
                selectedCurrency === currency && styles.selectedCurrencyButton
              ]}
              onPress={() => setSelectedCurrency(currency)}
            >
              <Text style={[
                styles.currencyButtonText,
                selectedCurrency === currency && styles.selectedCurrencyButtonText
              ]}>
                {currency}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {showAddForm && (
        <View style={styles.addForm}>
          <Text style={styles.formTitle}>Add New Material</Text>
          <TextInput
            style={styles.input}
            placeholder="Material name"
            value={newMaterial.name}
            onChangeText={(text) => setNewMaterial(prev => ({ ...prev, name: text }))}
          />
          <View style={styles.priceRow}>
            <TextInput
              style={[styles.input, styles.priceInput]}
              placeholder="Price"
              value={newMaterial.price}
              onChangeText={(text) => setNewMaterial(prev => ({ ...prev, price: text }))}
              keyboardType="numeric"
            />
            <View style={styles.currencyPicker}>
              {supportedCurrencies.map(currency => (
                <TouchableOpacity
                  key={currency}
                  style={[
                    styles.currencyOption,
                    newMaterial.currency === currency && styles.selectedCurrencyOption
                  ]}
                  onPress={() => setNewMaterial(prev => ({ ...prev, currency }))}
                >
                  <Text style={[
                    styles.currencyOptionText,
                    newMaterial.currency === currency && styles.selectedCurrencyOptionText
                  ]}>
                    {currency}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Unit (e.g., piece, kg, m²)"
            value={newMaterial.unit}
            onChangeText={(text) => setNewMaterial(prev => ({ ...prev, unit: text }))}
          />
          <View style={styles.formButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowAddForm(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleAddMaterial}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ScrollView style={styles.materialsList}>
        {materials.map(renderMaterialCard)}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333'
  },
  addMaterialButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6
  },
  addMaterialButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600'
  },
  currencySelector: {
    marginBottom: 16
  },
  currencyLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8
  },
  currencyButtons: {
    flexDirection: 'row',
    gap: 8
  },
  currencyButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9'
  },
  selectedCurrencyButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF'
  },
  currencyButtonText: {
    fontSize: 12,
    color: '#333'
  },
  selectedCurrencyButtonText: {
    color: '#fff'
  },
  addForm: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    backgroundColor: '#fff'
  },
  priceRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start'
  },
  priceInput: {
    flex: 1
  },
  currencyPicker: {
    flexDirection: 'row',
    gap: 4
  },
  currencyOption: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff'
  },
  selectedCurrencyOption: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF'
  },
  currencyOptionText: {
    fontSize: 12,
    color: '#333'
  },
  selectedCurrencyOptionText: {
    color: '#fff'
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center'
  },
  cancelButtonText: {
    color: '#666'
  },
  saveButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: '#007AFF',
    alignItems: 'center'
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600'
  },
  materialsList: {
    flex: 1
  },
  materialCard: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12
  },
  materialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  materialName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1
  },
  materialPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF'
  },
  materialDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8
  },
  materialFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  materialUnit: {
    fontSize: 12,
    color: '#888'
  },
  supplierName: {
    fontSize: 12,
    color: '#666'
  },
  addButton: {
    backgroundColor: '#28a745',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center'
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600'
  }
});