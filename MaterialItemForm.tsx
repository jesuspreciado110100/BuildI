import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { MaterialItem } from '../types';

interface MaterialItemFormProps {
  onSubmit: (item: Partial<MaterialItem>) => void;
  onCancel: () => void;
  initialData?: MaterialItem;
}

const MATERIAL_CATEGORIES = [
  'Cement & Concrete', 'Steel & Rebar', 'Aggregates', 'Lumber & Wood',
  'Roofing Materials', 'Insulation', 'Plumbing Supplies', 'Electrical',
  'Paint & Coatings', 'Tiles & Flooring', 'Windows & Doors', 'Hardware',
  'Safety Equipment', 'Tools & Equipment', 'Landscaping', 'HVAC',
  'Waterproofing', 'Adhesives & Sealants', 'Masonry', 'Other'
];

const UNIT_TYPES = [
  'kg', 'm²', 'piece', 'sack', 'liter', 'm³', 'ton', 'roll',
  'sheet', 'box', 'bundle', 'linear meter'
];

export default function MaterialItemForm({ onSubmit, onCancel, initialData }: MaterialItemFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    category: initialData?.category || MATERIAL_CATEGORIES[0],
    unit_price: initialData?.unit_price?.toString() || '',
    unit_type: initialData?.unit_type || UNIT_TYPES[0],
    stock_quantity: initialData?.stock_quantity?.toString() || '',
    perishable: initialData?.perishable || false,
    lead_time_days: initialData?.lead_time_days?.toString() || '',
    photo_url: initialData?.photo_url || ''
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.unit_price || !formData.stock_quantity) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const submitData: Partial<MaterialItem> = {
      ...initialData,
      name: formData.name,
      category: formData.category,
      unit_price: parseFloat(formData.unit_price),
      unit_type: formData.unit_type,
      stock_quantity: parseInt(formData.stock_quantity),
      perishable: formData.perishable,
      lead_time_days: parseInt(formData.lead_time_days) || 0,
      photo_url: formData.photo_url || undefined
    };

    onSubmit(submitData);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{initialData ? 'Edit Material' : 'Add Material'}</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Material Name *"
        value={formData.name}
        onChangeText={(text) => setFormData({...formData, name: text})}
      />
      
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Category</Text>
        <Picker
          selectedValue={formData.category}
          onValueChange={(value) => setFormData({...formData, category: value})}
          style={styles.picker}
        >
          {MATERIAL_CATEGORIES.map(cat => (
            <Picker.Item key={cat} label={cat} value={cat} />
          ))}
        </Picker>
      </View>
      
      <TextInput
        style={styles.input}
        placeholder="Unit Price *"
        value={formData.unit_price}
        onChangeText={(text) => setFormData({...formData, unit_price: text})}
        keyboardType="numeric"
      />
      
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Unit Type</Text>
        <Picker
          selectedValue={formData.unit_type}
          onValueChange={(value) => setFormData({...formData, unit_type: value})}
          style={styles.picker}
        >
          {UNIT_TYPES.map(unit => (
            <Picker.Item key={unit} label={unit} value={unit} />
          ))}
        </Picker>
      </View>
      
      <TextInput
        style={styles.input}
        placeholder="Stock Quantity *"
        value={formData.stock_quantity}
        onChangeText={(text) => setFormData({...formData, stock_quantity: text})}
        keyboardType="numeric"
      />
      
      <TouchableOpacity
        style={styles.toggleButton}
        onPress={() => setFormData({...formData, perishable: !formData.perishable})}
      >
        <Text style={styles.toggleText}>
          Perishable: {formData.perishable ? 'Yes' : 'No'}
        </Text>
      </TouchableOpacity>
      
      <TextInput
        style={styles.input}
        placeholder="Lead Time (days)"
        value={formData.lead_time_days}
        onChangeText={(text) => setFormData({...formData, lead_time_days: text})}
        keyboardType="numeric"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Photo URL (optional)"
        value={formData.photo_url}
        onChangeText={(text) => setFormData({...formData, photo_url: text})}
      />
      
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16
  },
  pickerContainer: {
    marginBottom: 15
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8
  },
  toggleButton: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15
  },
  toggleText: {
    fontSize: 16,
    textAlign: 'center'
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20
  },
  cancelButton: {
    backgroundColor: '#6c757d',
    padding: 12,
    borderRadius: 8,
    flex: 0.45
  },
  cancelButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold'
  },
  submitButton: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    flex: 0.45
  },
  submitButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold'
  }
});