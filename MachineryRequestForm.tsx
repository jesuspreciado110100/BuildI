import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView, Alert } from 'react-native';
import { CommissionPricingService } from '../services/CommissionPricingService';
import { MachinerySuggestionService } from '../services/MachinerySuggestionService';
import { MachineryRequestService } from '../services/MachineryRequestService';
import { Concept, MachineryItem } from '../types';
import ConceptSelector from './ConceptSelector';
import FeaturedMachineryCarousel from './FeaturedMachineryCarousel';
import RentalGuaranteeToggle from './RentalGuaranteeToggle';

interface MachineryRequestFormProps {
  onSubmit: (request: any) => void;
  onCancel: () => void;
  concepts?: Concept[];
  preSelectedConceptId?: string;
  renterMetrics?: any;
  showBoostBadges?: boolean;
}

const MACHINERY_CATEGORIES = [
  { id: 'Loader', name: 'Loader', icon: '🚜' },
  { id: 'Backhoe', name: 'Backhoe', icon: '🚧' },
  { id: 'Excavator', name: 'Excavator', icon: '⛏️' },
  { id: 'Paver', name: 'Paver', icon: '🛣️' },
  { id: 'Compactor', name: 'Compactor', icon: '🔨' },
  { id: 'Bulldozer', name: 'Bulldozer', icon: '🚜' },
  { id: 'Crane', name: 'Crane', icon: '🏗️' },
  { id: 'Grader', name: 'Grader', icon: '🛤️' },
  { id: 'Dump Truck', name: 'Dump Truck', icon: '🚛' },
  { id: 'Concrete Mixer', name: 'Concrete Mixer', icon: '🚚' }
];

const FEATURED_MACHINERY: MachineryItem[] = [
  {
    id: 'featured1',
    renter_id: 'renter1',
    category: 'Excavator',
    brand: 'CAT',
    model: '320',
    year: '2022',
    rate: 450,
    rate_type: 'day',
    photos: ['https://d64gsuwffb70l.cloudfront.net/682b9339d741dd6bcf28bb65_1754072650265_aeeb9221.jpeg'],
    description: 'Excavadora CAT 320 con GPS',
    available: true,
    region: 'Downtown',
    created_at: '2024-01-01T00:00:00Z',
    status: 'active',
    is_featured: true
  },
  {
    id: 'featured2',
    renter_id: 'renter2',
    category: 'Bulldozer',
    brand: 'Komatsu',
    model: 'D65',
    year: '2021',
    rate: 380,
    rate_type: 'day',
    photos: ['https://d64gsuwffb70l.cloudfront.net/682b9339d741dd6bcf28bb65_1754072658400_4e9233f7.jpeg'],
    description: 'Bulldozer Komatsu D65 potente',
    available: true,
    region: 'Industrial Zone',
    created_at: '2024-01-01T00:00:00Z',
    status: 'active',
    is_featured: true
  },
  {
    id: 'featured3',
    renter_id: 'renter3',
    category: 'Crane',
    brand: 'Liebherr',
    model: 'LTM',
    year: '2023',
    rate: 650,
    rate_type: 'day',
    photos: ['https://d64gsuwffb70l.cloudfront.net/682b9339d741dd6bcf28bb65_1754072659294_bff9ec50.jpeg'],
    description: 'Grua Liebherr LTM profesional',
    available: true,
    region: 'Construction District',
    created_at: '2024-01-01T00:00:00Z',
    status: 'active',
    is_featured: true
  }
];

export default function MachineryRequestForm({ 
  onSubmit, 
  onCancel, 
  concepts = [], 
  preSelectedConceptId,
  renterMetrics,
  showBoostBadges
}: MachineryRequestFormProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('Downtown');
  const [conceptId, setConceptId] = useState<string>(preSelectedConceptId || '');
  const [suggestedCategories, setSuggestedCategories] = useState<string[]>([]);
  const [guaranteeEnabled, setGuaranteeEnabled] = useState(false);

  useEffect(() => {
    if (conceptId) {
      const selectedConcept = concepts.find(c => c.id === conceptId);
      if (selectedConcept) {
        const suggestions = MachinerySuggestionService.getSuggestedCategories(selectedConcept.name);
        setSuggestedCategories(suggestions);
        if (suggestions.length > 0 && !selectedCategory) {
          setSelectedCategory(suggestions[0]);
        }
      }
    } else {
      setSuggestedCategories([]);
    }
  }, [conceptId, concepts]);

  const handleFeaturedMachineSelect = (machine: MachineryItem) => {
    setSelectedCategory(machine.category);
    setBudget(machine.rate.toString());
    setLocation(machine.region);
  };

  const handleSubmit = async () => {
    if (!selectedCategory || !startDate || !endDate || !budget || !location) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const baseBudget = parseFloat(budget);
    const pricing = CommissionPricingService.calculateFinalPrice(baseBudget);
    
    const request = {
      id: Date.now().toString(),
      category: selectedCategory,
      startDate,
      endDate,
      budget: baseBudget,
      finalPrice: pricing.finalPrice,
      description,
      region: location,
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
      conceptId: conceptId || undefined,
      guaranteeEnabled
    };

    try {
      onSubmit(request);
    } catch (error) {
      Alert.alert('Error', 'Failed to submit request. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Request Machinery</Text>
        <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>

      <FeaturedMachineryCarousel 
        featuredMachinery={FEATURED_MACHINERY}
        onSelectMachine={handleFeaturedMachineSelect}
      />

      {concepts.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Link to Concept (Optional)</Text>
          <ConceptSelector
            concepts={concepts}
            selectedConceptId={conceptId}
            onSelect={setConceptId}
            placeholder="Select concept to link"
          />
        </>
      )}

      <Text style={styles.sectionTitle}>Select Category *</Text>
      {suggestedCategories.length > 0 && (
        <View style={styles.suggestedContainer}>
          <Text style={styles.suggestedLabel}>Suggested for this concept:</Text>
          <View style={styles.suggestedCategories}>
            {suggestedCategories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[styles.suggestedCategory, selectedCategory === category && styles.selectedSuggestion]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[styles.suggestedCategoryText, selectedCategory === category && styles.selectedSuggestionText]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
      
      <View style={styles.categoryGrid}>
        {MACHINERY_CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryCard,
              selectedCategory === category.id && styles.selectedCategory
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Text style={styles.categoryIcon}>{category.icon}</Text>
            <Text style={styles.categoryName}>{category.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Rental Period *</Text>
      <View style={styles.dateContainer}>
        <View style={styles.dateInput}>
          <Text style={styles.inputLabel}>Start Date</Text>
          <TextInput
            style={styles.input}
            value={startDate}
            onChangeText={setStartDate}
            placeholder="YYYY-MM-DD"
          />
        </View>
        <View style={styles.dateInput}>
          <Text style={styles.inputLabel}>End Date</Text>
          <TextInput
            style={styles.input}
            value={endDate}
            onChangeText={setEndDate}
            placeholder="YYYY-MM-DD"
          />
        </View>
      </View>

      <Text style={styles.sectionTitle}>Budget *</Text>
      <TextInput
        style={styles.input}
        value={budget}
        onChangeText={setBudget}
        placeholder="Enter your budget per day"
        keyboardType="numeric"
      />

      <Text style={styles.sectionTitle}>Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={description}
        onChangeText={setDescription}
        placeholder="Additional requirements or notes"
        multiline
        numberOfLines={3}
      />

      <Text style={styles.sectionTitle}>Location *</Text>
      <TextInput
        style={styles.input}
        value={location}
        onChangeText={setLocation}
        placeholder="Job site location"
      />

      <RentalGuaranteeToggle
        enabled={guaranteeEnabled}
        onToggle={setGuaranteeEnabled}
        budget={parseFloat(budget) || 0}
      />

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitText}>Submit Request</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white', padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#374151' },
  closeButton: { padding: 10 },
  closeText: { fontSize: 18, color: '#6b7280' },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginTop: 20, marginBottom: 10, color: '#374151' },
  suggestedContainer: { marginBottom: 15, padding: 12, backgroundColor: '#f0f9ff', borderRadius: 8, borderWidth: 1, borderColor: '#0ea5e9' },
  suggestedLabel: { fontSize: 14, fontWeight: '600', color: '#0369a1', marginBottom: 8 },
  suggestedCategories: { flexDirection: 'row', flexWrap: 'wrap' },
  suggestedCategory: { backgroundColor: '#e0f2fe', padding: 8, borderRadius: 6, marginRight: 8, marginBottom: 4, borderWidth: 1, borderColor: '#0ea5e9' },
  selectedSuggestion: { backgroundColor: '#0ea5e9' },
  suggestedCategoryText: { color: '#0369a1', fontSize: 12, fontWeight: '500' },
  selectedSuggestionText: { color: 'white' },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  categoryCard: { width: '48%', backgroundColor: '#f9fafb', padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 10, borderWidth: 2, borderColor: 'transparent' },
  selectedCategory: { borderColor: '#dc2626', backgroundColor: '#fef2f2' },
  categoryIcon: { fontSize: 30, marginBottom: 5 },
  categoryName: { fontSize: 14, fontWeight: '500', color: '#374151' },
  dateContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  dateInput: { width: '48%' },
  inputLabel: { fontSize: 14, fontWeight: '500', marginBottom: 5, color: '#374151' },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#f9fafb' },
  textArea: { height: 80, textAlignVertical: 'top' },
  submitButton: { backgroundColor: '#dc2626', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 30, marginBottom: 20 },
  submitText: { color: 'white', fontSize: 16, fontWeight: '600' }
});