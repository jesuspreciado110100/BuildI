import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Modal } from 'react-native';
import { BookingRequest, Concept } from '../types';
import ConceptSelector from './ConceptSelector';
import AIProviderSuggestions from './AIProviderSuggestions';
import { Provider } from './ProviderSuggestion';
import { MachinerySuggestionService } from '../services/MachinerySuggestionService';

interface BookingRequestFormProps {
  onSubmit: (request: Omit<BookingRequest, 'id' | 'created_at'>) => void;
  onCancel: () => void;
  concepts?: Concept[];
}

export default function BookingRequestForm({ onSubmit, onCancel, concepts = [] }: BookingRequestFormProps) {
  const [resourceType, setResourceType] = useState<'labor' | 'machinery' | 'material'>('labor');
  const [machineryCategory, setMachineryCategory] = useState('');
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [conceptId, setConceptId] = useState<string>('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [suggestedCategories, setSuggestedCategories] = useState<string[]>([]);

  const machineryCategories = MachinerySuggestionService.getAllMachineryCategories();

  useEffect(() => {
    if (conceptId && resourceType === 'machinery') {
      const selectedConcept = concepts.find(c => c.id === conceptId);
      if (selectedConcept) {
        const suggestions = MachinerySuggestionService.getSuggestedCategories(selectedConcept.name);
        setSuggestedCategories(suggestions);
        if (suggestions.length > 0 && !machineryCategory) {
          setMachineryCategory(suggestions[0]);
        }
      }
    } else {
      setSuggestedCategories([]);
    }
  }, [conceptId, resourceType, concepts]);

  const handleSubmit = () => {
    if (!location || !budget || !description || !startDate) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const request: Omit<BookingRequest, 'id' | 'created_at'> = {
      requester_id: '1',
      provider_id: selectedProvider?.id || '',
      resource_type: resourceType,
      resource_id: machineryCategory || '',
      status: 'pending',
      start_date: startDate,
      end_date: startDate,
      price: selectedProvider?.estimatedPrice || parseFloat(budget),
      final_price: selectedProvider?.estimatedPrice || parseFloat(budget),
      net_to_renter: (selectedProvider?.estimatedPrice || parseFloat(budget)) * 0.95,
      platform_fee_total: (selectedProvider?.estimatedPrice || parseFloat(budget)) * 0.05,
      location,
      notes: description,
      concept_id: conceptId || undefined
    };

    onSubmit(request);
  };

  const handleProviderSelect = (provider: Provider) => {
    setSelectedProvider(provider);
    setBudget(provider.estimatedPrice.toString());
    setShowSuggestions(false);
    Alert.alert('Provider Selected', `${provider.name} has been selected and form auto-filled.`);
  };

  const canShowSuggestions = location && budget && parseFloat(budget) > 0;
  const resourceTypes = ['labor', 'machinery', 'material'];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Booking Request</Text>
      
      <Text style={styles.label}>Resource Type</Text>
      <View style={styles.pickerContainer}>
        {resourceTypes.map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.pickerOption, resourceType === type && styles.selectedOption]}
            onPress={() => setResourceType(type as any)}
          >
            <Text style={[styles.pickerText, resourceType === type && styles.selectedText]}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {concepts.length > 0 && (
        <>
          <Text style={styles.label}>Assign to Concept (Optional)</Text>
          <ConceptSelector
            concepts={concepts}
            selectedConceptId={conceptId}
            onSelect={setConceptId}
            placeholder="Select concept to assign"
          />
        </>
      )}

      {resourceType === 'machinery' && (
        <>
          <Text style={styles.label}>Machinery Category</Text>
          {suggestedCategories.length > 0 && (
            <View style={styles.suggestedCategoriesContainer}>
              <Text style={styles.suggestedLabel}>Suggested for this concept:</Text>
              <View style={styles.suggestedCategories}>
                {suggestedCategories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[styles.suggestedCategory, machineryCategory === category && styles.selectedSuggestion]}
                    onPress={() => setMachineryCategory(category)}
                  >
                    <Text style={[styles.suggestedCategoryText, machineryCategory === category && styles.selectedSuggestionText]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
          <View style={styles.categoryGrid}>
            {machineryCategories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[styles.categoryOption, machineryCategory === category && styles.selectedCategory]}
                onPress={() => setMachineryCategory(category)}
              >
                <Text style={[styles.categoryText, machineryCategory === category && styles.selectedCategoryText]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      <Text style={styles.label}>Location</Text>
      <TextInput
        style={styles.input}
        value={location}
        onChangeText={setLocation}
        placeholder="Enter location"
      />

      <Text style={styles.label}>Budget ($)</Text>
      <TextInput
        style={styles.input}
        value={budget}
        onChangeText={setBudget}
        placeholder="Enter budget"
        keyboardType="numeric"
      />

      {canShowSuggestions && (
        <TouchableOpacity 
          style={styles.suggestButton} 
          onPress={() => setShowSuggestions(true)}
        >
          <Text style={styles.suggestButtonText}>🤖 Suggest Providers</Text>
        </TouchableOpacity>
      )}

      {selectedProvider && (
        <View style={styles.selectedProviderCard}>
          <Text style={styles.selectedProviderTitle}>Selected Provider:</Text>
          <Text style={styles.selectedProviderName}>{selectedProvider.name}</Text>
          <Text style={styles.selectedProviderDetails}>
            ${selectedProvider.estimatedPrice}/day • {selectedProvider.distance}km away
          </Text>
        </View>
      )}

      <Text style={styles.label}>Start Date</Text>
      <TextInput
        style={styles.input}
        value={startDate}
        onChangeText={setStartDate}
        placeholder="YYYY-MM-DD"
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={description}
        onChangeText={setDescription}
        placeholder="Describe your requirements"
        multiline
        numberOfLines={3}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Send Request</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showSuggestions} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <AIProviderSuggestions
            resourceType={resourceType}
            location={location}
            budget={parseFloat(budget) || 0}
            onSelectProvider={handleProviderSelect}
            onClose={() => setShowSuggestions(false)}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: 'white' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#2563eb' },
  label: { fontSize: 16, fontWeight: '500', marginBottom: 5, color: '#374151' },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, marginBottom: 15, fontSize: 16 },
  textArea: { height: 80, textAlignVertical: 'top' },
  pickerContainer: { flexDirection: 'row', marginBottom: 15 },
  pickerOption: { flex: 1, padding: 12, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, marginRight: 5, alignItems: 'center' },
  selectedOption: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  pickerText: { color: '#6b7280' },
  selectedText: { color: 'white' },
  suggestedCategoriesContainer: { marginBottom: 15, padding: 12, backgroundColor: '#f0f9ff', borderRadius: 8, borderWidth: 1, borderColor: '#0ea5e9' },
  suggestedLabel: { fontSize: 14, fontWeight: '600', color: '#0369a1', marginBottom: 8 },
  suggestedCategories: { flexDirection: 'row', flexWrap: 'wrap' },
  suggestedCategory: { backgroundColor: '#e0f2fe', padding: 8, borderRadius: 6, marginRight: 8, marginBottom: 4, borderWidth: 1, borderColor: '#0ea5e9' },
  selectedSuggestion: { backgroundColor: '#0ea5e9' },
  suggestedCategoryText: { color: '#0369a1', fontSize: 12, fontWeight: '500' },
  selectedSuggestionText: { color: 'white' },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15 },
  categoryOption: { backgroundColor: '#f3f4f6', padding: 8, borderRadius: 6, marginRight: 8, marginBottom: 8, borderWidth: 1, borderColor: '#d1d5db' },
  selectedCategory: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  categoryText: { color: '#6b7280', fontSize: 12 },
  selectedCategoryText: { color: 'white' },
  suggestButton: { backgroundColor: '#10b981', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 15 },
  suggestButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  selectedProviderCard: { backgroundColor: '#f0f9ff', padding: 12, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#0ea5e9' },
  selectedProviderTitle: { fontSize: 14, fontWeight: '600', color: '#0369a1', marginBottom: 4 },
  selectedProviderName: { fontSize: 16, fontWeight: 'bold', color: '#1e40af' },
  selectedProviderDetails: { fontSize: 14, color: '#6b7280' },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  cancelButton: { flex: 1, padding: 15, borderRadius: 8, backgroundColor: '#6b7280', marginRight: 10 },
  submitButton: { flex: 1, padding: 15, borderRadius: 8, backgroundColor: '#2563eb' },
  cancelButtonText: { color: 'white', textAlign: 'center', fontSize: 16, fontWeight: '500' },
  submitButtonText: { color: 'white', textAlign: 'center', fontSize: 16, fontWeight: '500' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center' },
});