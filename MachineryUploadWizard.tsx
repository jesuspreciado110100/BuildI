import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { OperatorInfo } from '../types';

interface MachineryData {
  category: string;
  brand: string;
  model: string;
  year: string;
  rate: string;
  rateType: 'hour' | 'day';
  description: string;
  photos: string[];
  operator?: OperatorInfo;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: MachineryData) => void;
}

const CATEGORIES = [
  { id: 'loader', name: 'Loader', icon: '🚜' },
  { id: 'excavator', name: 'Excavator', icon: '🏗️' },
  { id: 'backhoe', name: 'Backhoe', icon: '🚧' },
  { id: 'paver', name: 'Paver', icon: '🛤️' },
  { id: 'compactor', name: 'Compactor', icon: '🔨' },
  { id: 'dozer', name: 'Dozer', icon: '🚜' },
  { id: 'handler', name: 'Handler', icon: '🏗️' },
  { id: 'grader', name: 'Grader', icon: '🛣️' }
];

const BRANDS = ['Caterpillar', 'JCB', 'Bobcat', 'Komatsu', 'Volvo', 'Hitachi', 'Liebherr', 'Case'];

export default function MachineryUploadWizard({ visible, onClose, onSubmit }: Props) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<MachineryData>({
    category: '',
    brand: '',
    model: '',
    year: '',
    rate: '',
    rateType: 'day',
    description: '',
    photos: []
  });

  if (!visible) return null;

  const validateStep = () => {
    switch (step) {
      case 1: return data.category !== '';
      case 2: return data.brand !== '';
      case 3: return data.model && data.year && data.rate;
      case 4: return data.description.length > 0;
      case 5: return true; // Operator info is optional
      default: return false;
    }
  };

  const nextStep = () => {
    if (validateStep()) {
      if (step < 5) setStep(step + 1);
      else handleSubmit();
    } else {
      Alert.alert('Error', 'Please fill in all required fields');
    }
  };

  const handleSubmit = () => {
    onSubmit(data);
    onClose();
    setStep(1);
    setData({ category: '', brand: '', model: '', year: '', rate: '', rateType: 'day', description: '', photos: [] });
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <View>
            <Text style={styles.stepTitle}>Select Category</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.categoryCard, data.category === cat.id && styles.selectedCard]}
                  onPress={() => setData({ ...data, category: cat.id })}
                >
                  <Text style={styles.categoryIcon}>{cat.icon}</Text>
                  <Text style={styles.categoryName}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      case 2:
        return (
          <View>
            <Text style={styles.stepTitle}>Select Brand</Text>
            <View style={styles.brandGrid}>
              {BRANDS.map((brand) => (
                <TouchableOpacity
                  key={brand}
                  style={[styles.brandButton, data.brand === brand && styles.selectedBrand]}
                  onPress={() => setData({ ...data, brand })}
                >
                  <Text style={[styles.brandText, data.brand === brand && styles.selectedBrandText]}>{brand}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      case 3:
        return (
          <View>
            <Text style={styles.stepTitle}>Equipment Details</Text>
            <TextInput
              style={styles.input}
              placeholder="Model (e.g., 320D)"
              value={data.model}
              onChangeText={(model) => setData({ ...data, model })}
            />
            <TextInput
              style={styles.input}
              placeholder="Year"
              value={data.year}
              onChangeText={(year) => setData({ ...data, year })}
              keyboardType="numeric"
            />
            <View style={styles.rateContainer}>
              <TextInput
                style={[styles.input, styles.rateInput]}
                placeholder="Rate"
                value={data.rate}
                onChangeText={(rate) => setData({ ...data, rate })}
                keyboardType="numeric"
              />
              <View style={styles.rateTypeButtons}>
                <TouchableOpacity
                  style={[styles.rateTypeButton, data.rateType === 'hour' && styles.selectedRateType]}
                  onPress={() => setData({ ...data, rateType: 'hour' })}
                >
                  <Text style={[styles.rateTypeText, data.rateType === 'hour' && styles.selectedRateTypeText]}>per Hour</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.rateTypeButton, data.rateType === 'day' && styles.selectedRateType]}
                  onPress={() => setData({ ...data, rateType: 'day' })}
                >
                  <Text style={[styles.rateTypeText, data.rateType === 'day' && styles.selectedRateTypeText]}>per Day</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );
      case 4:
        return (
          <View>
            <Text style={styles.stepTitle}>Photo & Description</Text>
            <TouchableOpacity style={styles.photoUpload}>
              <Ionicons name="camera" size={40} color="#6b7280" />
              <Text style={styles.photoUploadText}>Add Photos</Text>
            </TouchableOpacity>
            <TextInput
              style={[styles.input, styles.descriptionInput]}
              placeholder="Brief description of the equipment condition and features"
              value={data.description}
              onChangeText={(description) => setData({ ...data, description })}
              multiline
              numberOfLines={4}
            />
          </View>
        );
      case 5:
        return (
          <View>
            <Text style={styles.stepTitle}>Operator Info (Optional)</Text>
            <Text style={styles.subtitle}>Add operator details to build trust with contractors</Text>
            <TextInput
              style={styles.input}
              placeholder="Operator Name"
              value={data.operator?.name || ''}
              onChangeText={(name) => setData({ ...data, operator: { ...data.operator, name, years_experience: data.operator?.years_experience || 0 } })}
            />
            <TextInput
              style={styles.input}
              placeholder="Years of Experience"
              value={data.operator?.years_experience?.toString() || ''}
              onChangeText={(exp) => setData({ ...data, operator: { ...data.operator, name: data.operator?.name || '', years_experience: parseInt(exp) || 0 } })}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="License Type (Optional)"
              value={data.operator?.license_type || ''}
              onChangeText={(license) => setData({ ...data, operator: { ...data.operator, name: data.operator?.name || '', years_experience: data.operator?.years_experience || 0, license_type: license } })}
            />
            <TouchableOpacity style={styles.photoUpload}>
              <Ionicons name="person" size={40} color="#6b7280" />
              <Text style={styles.photoUploadText}>Add Operator Photo</Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <View style={styles.header}>
          <Text style={styles.title}>Add Machinery</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.progressContainer}>
          {[1, 2, 3, 4, 5].map((i) => (
            <View key={i} style={[styles.progressDot, i <= step && styles.activeDot]} />
          ))}
        </View>
        
        <ScrollView style={styles.content}>
          {renderStep()}
        </ScrollView>
        
        <View style={styles.footer}>
          {step > 1 && (
            <TouchableOpacity style={styles.backButton} onPress={() => setStep(step - 1)}>
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.nextButton} onPress={nextStep}>
            <Text style={styles.nextButtonText}>{step === 5 ? 'Add Equipment' : 'Next'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modal: { backgroundColor: 'white', width: '90%', maxHeight: '80%', borderRadius: 15, padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#374151' },
  progressContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
  progressDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#e5e7eb', marginHorizontal: 5 },
  activeDot: { backgroundColor: '#dc2626' },
  content: { flex: 1, marginBottom: 20 },
  stepTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#374151' },
  subtitle: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 20 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  categoryCard: { width: '48%', backgroundColor: '#f9fafb', padding: 20, borderRadius: 10, alignItems: 'center', marginBottom: 10, borderWidth: 2, borderColor: 'transparent' },
  selectedCard: { borderColor: '#dc2626', backgroundColor: '#fef2f2' },
  categoryIcon: { fontSize: 30, marginBottom: 10 },
  categoryName: { fontSize: 14, fontWeight: '600', color: '#374151' },
  brandGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  brandButton: { width: '48%', backgroundColor: '#f9fafb', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 10, borderWidth: 2, borderColor: 'transparent' },
  selectedBrand: { borderColor: '#dc2626', backgroundColor: '#fef2f2' },
  brandText: { fontSize: 14, fontWeight: '600', color: '#374151' },
  selectedBrandText: { color: '#dc2626' },
  input: { backgroundColor: '#f9fafb', padding: 15, borderRadius: 8, marginBottom: 15, fontSize: 16, borderWidth: 1, borderColor: '#e5e7eb' },
  rateContainer: { flexDirection: 'row', alignItems: 'center' },
  rateInput: { flex: 1, marginRight: 10 },
  rateTypeButtons: { flexDirection: 'row' },
  rateTypeButton: { backgroundColor: '#f9fafb', padding: 10, borderRadius: 6, marginLeft: 5, borderWidth: 1, borderColor: '#e5e7eb' },
  selectedRateType: { backgroundColor: '#dc2626', borderColor: '#dc2626' },
  rateTypeText: { fontSize: 12, color: '#6b7280' },
  selectedRateTypeText: { color: 'white' },
  photoUpload: { backgroundColor: '#f9fafb', padding: 40, borderRadius: 8, alignItems: 'center', marginBottom: 15, borderWidth: 2, borderColor: '#e5e7eb', borderStyle: 'dashed' },
  photoUploadText: { marginTop: 10, color: '#6b7280', fontSize: 14 },
  descriptionInput: { height: 100, textAlignVertical: 'top' },
  footer: { flexDirection: 'row', justifyContent: 'space-between' },
  backButton: { backgroundColor: '#f3f4f6', padding: 15, borderRadius: 8, flex: 1, marginRight: 10 },
  backButtonText: { textAlign: 'center', color: '#6b7280', fontWeight: '600' },
  nextButton: { backgroundColor: '#dc2626', padding: 15, borderRadius: 8, flex: 1 },
  nextButtonText: { textAlign: 'center', color: 'white', fontWeight: '600' }
});