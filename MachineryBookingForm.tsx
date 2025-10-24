import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Modal } from 'react-native';
import { BookingRequest, Concept } from '../types';
import ConceptSelector from './ConceptSelector';
import AIProviderSuggestions from './AIProviderSuggestions';
import { Provider } from './ProviderSuggestion';
import { CommissionPricingService } from '../services/CommissionPricingService';
import { GuaranteeService } from '../services/GuaranteeService';

interface MachineryBookingFormProps {
  onSubmit: (request: Omit<BookingRequest, 'id' | 'created_at'>) => void;
  onCancel: () => void;
  concepts?: Concept[];
}

const machineTypes = [
  { id: 'excavator', name: 'Excavator', icon: '🚜' },
  { id: 'crane', name: 'Crane', icon: '🏗️' },
  { id: 'bulldozer', name: 'Bulldozer', icon: '🚧' },
  { id: 'loader', name: 'Loader', icon: '🚛' },
];

export default function MachineryBookingForm({ onSubmit, onCancel, concepts = [] }: MachineryBookingFormProps) {
  const [selectedType, setSelectedType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [conceptId, setConceptId] = useState<string>('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [guaranteeEnabled, setGuaranteeEnabled] = useState(false);

  const handleSubmit = () => {
    if (!selectedType || !startDate || !budget || !location) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const basePrice = selectedProvider?.estimatedPrice || parseFloat(budget);
    const pricing = CommissionPricingService.calculatePricing(basePrice);
    const guaranteeFee = guaranteeEnabled ? GuaranteeService.calculateGuaranteeFee(pricing.finalPrice) : 0;

    const request: Omit<BookingRequest, 'id' | 'created_at'> = {
      requester_id: '1',
      provider_id: selectedProvider?.id || '',
      resource_type: 'machinery',
      resource_id: selectedType,
      status: 'pending',
      start_date: startDate,
      end_date: endDate || startDate,
      price: basePrice,
      final_price: pricing.finalPrice + guaranteeFee,
      net_to_renter: pricing.netToRenter,
      platform_fee_total: pricing.platformFeeTotal,
      location,
      notes,
      concept_id: conceptId || undefined,
      rental_guarantee_enabled: guaranteeEnabled,
      guarantee_fee: guaranteeFee,
      guarantee_status: guaranteeEnabled ? 'active' : 'not_requested'
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
  const basePrice = budget ? CommissionPricingService.getFinalPrice(parseFloat(budget)) : 0;
  const guaranteeFee = guaranteeEnabled ? GuaranteeService.calculateGuaranteeFee(basePrice) : 0;
  const totalPrice = basePrice + guaranteeFee;
  const guaranteeConfig = GuaranteeService.getConfig();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Book Machinery</Text>
        <TouchableOpacity onPress={onCancel}>
          <Text style={styles.cancelButton}>✕</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Machine Type *</Text>
      <View style={styles.typeGrid}>
        {machineTypes.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[styles.typeCard, selectedType === type.id && styles.selectedType]}
            onPress={() => setSelectedType(type.id)}
          >
            <Text style={styles.typeIcon}>{type.icon}</Text>
            <Text style={styles.typeName}>{type.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Location *</Text>
      <TextInput
        style={styles.input}
        value={location}
        onChangeText={setLocation}
        placeholder="Enter job site location"
        placeholderTextColor="#9ca3af"
      />

      <View style={styles.row}>
        <View style={styles.halfWidth}>
          <Text style={styles.label}>Start Date *</Text>
          <TextInput
            style={styles.input}
            value={startDate}
            onChangeText={setStartDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#9ca3af"
          />
        </View>
        <View style={styles.halfWidth}>
          <Text style={styles.label}>End Date</Text>
          <TextInput
            style={styles.input}
            value={endDate}
            onChangeText={setEndDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#9ca3af"
          />
        </View>
      </View>

      <Text style={styles.label}>Budget (per day) *</Text>
      <TextInput
        style={styles.input}
        value={budget}
        onChangeText={setBudget}
        placeholder="Enter daily rate"
        keyboardType="numeric"
        placeholderTextColor="#9ca3af"
      />

      {budget && parseFloat(budget) > 0 && (
        <View style={styles.guaranteeSection}>
          <TouchableOpacity 
            style={styles.guaranteeCheckbox}
            onPress={() => setGuaranteeEnabled(!guaranteeEnabled)}
          >
            <View style={[styles.checkbox, guaranteeEnabled && styles.checkedBox]}>
              {guaranteeEnabled && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.guaranteeText}>
              Add Rental Guarantee (+{guaranteeConfig.fee_percentage}%)
            </Text>
          </TouchableOpacity>
          <Text style={styles.guaranteeTooltip}>
            Covers up to ${guaranteeConfig.max_coverage_amount.toLocaleString()} in minor damage/loss
          </Text>
        </View>
      )}
      
      {budget && parseFloat(budget) > 0 && (
        <View style={styles.priceBreakdown}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Base Price:</Text>
            <Text style={styles.priceValue}>${basePrice.toFixed(2)}/day</Text>
          </View>
          {guaranteeEnabled && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Guarantee Fee:</Text>
              <Text style={styles.priceValue}>+${guaranteeFee.toFixed(2)}/day</Text>
            </View>
          )}
          <View style={[styles.priceRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Price:</Text>
            <Text style={styles.totalValue}>${totalPrice.toFixed(2)}/day</Text>
          </View>
        </View>
      )}

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>🚀 Request Now</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white', padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1f2937' },
  cancelButton: { fontSize: 24, color: '#6b7280', padding: 5 },
  label: { fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 8, marginTop: 16 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 10 },
  typeCard: { flex: 1, minWidth: '45%', backgroundColor: '#f3f4f6', padding: 15, borderRadius: 12, alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  selectedType: { backgroundColor: '#dbeafe', borderColor: '#3b82f6' },
  typeIcon: { fontSize: 24, marginBottom: 5 },
  typeName: { fontSize: 14, fontWeight: '500', color: '#374151' },
  input: { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, fontSize: 16, color: '#111827' },
  row: { flexDirection: 'row', gap: 12 },
  halfWidth: { flex: 1 },
  guaranteeSection: { marginTop: 16, padding: 12, backgroundColor: '#f8fafc', borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  guaranteeCheckbox: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  checkbox: { width: 20, height: 20, borderWidth: 2, borderColor: '#3b82f6', borderRadius: 4, marginRight: 12, alignItems: 'center', justifyContent: 'center' },
  checkedBox: { backgroundColor: '#3b82f6' },
  checkmark: { color: 'white', fontSize: 14, fontWeight: 'bold' },
  guaranteeText: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  guaranteeTooltip: { fontSize: 12, color: '#6b7280', fontStyle: 'italic' },
  priceBreakdown: { marginTop: 12, padding: 12, backgroundColor: '#f0f9ff', borderRadius: 8 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  priceLabel: { fontSize: 14, color: '#374151' },
  priceValue: { fontSize: 14, color: '#374151', fontWeight: '500' },
  totalRow: { borderTopWidth: 1, borderTopColor: '#d1d5db', paddingTop: 8, marginTop: 8 },
  totalLabel: { fontSize: 16, fontWeight: 'bold', color: '#1f2937' },
  totalValue: { fontSize: 16, fontWeight: 'bold', color: '#059669' },
  submitButton: { backgroundColor: '#10b981', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 24 },
  submitButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});