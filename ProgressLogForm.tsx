import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { ProgressLog, Concept, BookingRequest, LaborRequest, MaterialBooking } from '../types';
import SafetyScanService, { SafetyScanResult } from '../services/SafetyScanService';
import SafetyScanCard from './SafetyScanCard';

interface ProgressLogFormProps {
  onSubmit: (log: Omit<ProgressLog, 'id' | 'created_at' | 'contractor_approved'>) => void;
  laborChiefId: string;
  laborChiefName: string;
  concepts?: Concept[];
  bookings?: BookingRequest[];
  laborRequests?: LaborRequest[];
  materialBookings?: MaterialBooking[];
}

const mockSites = [
  { id: '1', name: 'Downtown Office Complex' },
  { id: '2', name: 'Residential Tower' },
];

export default function ProgressLogForm({ 
  onSubmit, 
  laborChiefId, 
  laborChiefName,
  concepts = [],
  bookings = [],
  laborRequests = [],
  materialBookings = []
}: ProgressLogFormProps) {
  const [selectedSite, setSelectedSite] = useState('');
  const [selectedConcept, setSelectedConcept] = useState('');
  const [conceptName, setConceptName] = useState('');
  const [quantityDone, setQuantityDone] = useState('');
  const [notes, setNotes] = useState('');
  const [photoCount, setPhotoCount] = useState(0);
  const [scanResults, setScanResults] = useState<SafetyScanResult[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  const handleConceptSelect = (conceptId: string) => {
    setSelectedConcept(conceptId);
    const concept = concepts.find(c => c.id === conceptId);
    setConceptName(concept?.name || '');
  };

  const handleAddPhoto = async () => {
    const newPhotoCount = photoCount + 1;
    setPhotoCount(newPhotoCount);
    
    const mockPhotoUrl = `https://example.com/progress-photos/${Date.now()}-${newPhotoCount}.jpg`;
    
    Alert.alert('Photo Added', `Photo ${newPhotoCount} added successfully. Scanning for safety violations...`);
    
    // Auto-scan the photo for safety violations
    setIsScanning(true);
    try {
      const scanResult = await SafetyScanService.scanPhoto(mockPhotoUrl);
      setScanResults(prev => [...prev, scanResult]);
      
      if (scanResult.violations.length > 0) {
        Alert.alert(
          '⚠️ Safety Violations Detected',
          `Found ${scanResult.violations.length} safety violation(s) in the uploaded photo. Please review and address them.`,
          [{ text: 'OK', style: 'default' }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to scan photo for safety violations');
    } finally {
      setIsScanning(false);
    }
  };

  const getAssociatedBookings = () => {
    if (!selectedConcept) return [];
    return [
      ...bookings.filter(b => b.concept_id === selectedConcept),
      ...laborRequests.filter(l => l.concept_id === selectedConcept),
      ...materialBookings.filter(m => m.concept_id === selectedConcept)
    ];
  };

  const handleSubmit = () => {
    if (!selectedSite || !selectedConcept || !quantityDone || !notes) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (photoCount === 0) {
      Alert.alert('Error', 'Please add at least one photo');
      return;
    }

    const hasUnresolvedViolations = scanResults.some(result => 
      result.violations.length > 0 && result.status === 'violation'
    );

    if (hasUnresolvedViolations) {
      Alert.alert(
        'Safety Violations Detected',
        'There are unresolved safety violations in your photos. Please address them before submitting.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    const mockPhotoUrls = Array.from({ length: photoCount }, (_, i) => 
      `https://example.com/progress-photos/${Date.now()}-${i + 1}.jpg`
    );

    const progressLog: Omit<ProgressLog, 'id' | 'created_at' | 'contractor_approved'> = {
      site_id: selectedSite,
      concept_id: selectedConcept,
      concept_name: conceptName,
      submitted_by: laborChiefId,
      submitted_by_name: laborChiefName,
      quantity_done: parseFloat(quantityDone),
      photo_urls: mockPhotoUrls,
      notes,
    };

    onSubmit(progressLog);
    
    // Reset form
    setSelectedSite('');
    setSelectedConcept('');
    setConceptName('');
    setQuantityDone('');
    setNotes('');
    setPhotoCount(0);
    setScanResults([]);

    Alert.alert('Success', 'Progress log submitted successfully!');
  };

  const associatedBookings = getAssociatedBookings();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Submit Progress Log</Text>

      <Text style={styles.label}>Site *</Text>
      <View style={styles.optionsContainer}>
        {mockSites.map((site) => (
          <TouchableOpacity
            key={site.id}
            style={[styles.optionButton, selectedSite === site.id && styles.selectedOption]}
            onPress={() => setSelectedSite(site.id)}
          >
            <Text style={[styles.optionText, selectedSite === site.id && styles.selectedOptionText]}>
              {site.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Task/Concept *</Text>
      <View style={styles.optionsContainer}>
        {concepts.map((concept) => (
          <TouchableOpacity
            key={concept.id}
            style={[styles.optionButton, selectedConcept === concept.id && styles.selectedOption]}
            onPress={() => handleConceptSelect(concept.id)}
          >
            <Text style={[styles.optionText, selectedConcept === concept.id && styles.selectedOptionText]}>
              {concept.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {associatedBookings.length > 0 && (
        <View style={styles.bookingsSection}>
          <Text style={styles.label}>Associated Bookings</Text>
          {associatedBookings.map((booking, index) => (
            <View key={index} style={styles.bookingItem}>
              <Text style={styles.bookingText}>
                {'resource_type' in booking ? booking.resource_type : 'labor'}: {booking.description || 'N/A'}
              </Text>
            </View>
          ))}
        </View>
      )}

      <Text style={styles.label}>Quantity Completed *</Text>
      <TextInput
        style={styles.input}
        value={quantityDone}
        onChangeText={setQuantityDone}
        placeholder="Enter quantity (e.g., 50 for 50% or 25 for 25 units)"
        keyboardType="numeric"
        placeholderTextColor="#9ca3af"
      />

      <Text style={styles.label}>Progress Photos *</Text>
      <View style={styles.photoSection}>
        <TouchableOpacity 
          style={[styles.photoButton, isScanning && styles.photoButtonDisabled]} 
          onPress={handleAddPhoto}
          disabled={isScanning}
        >
          <Text style={styles.photoButtonText}>
            {isScanning ? '🔄 Scanning...' : `📷 Add Photo (${photoCount})`}
          </Text>
        </TouchableOpacity>
        {photoCount > 0 && (
          <Text style={styles.photoCount}>{photoCount} photo(s) added</Text>
        )}
      </View>

      {scanResults.length > 0 && (
        <View style={styles.scanResultsSection}>
          <Text style={styles.label}>Safety Scan Results</Text>
          {scanResults.map((result) => (
            <SafetyScanCard key={result.id} scanResult={result} />
          ))}
        </View>
      )}

      <Text style={styles.label}>Notes/Description *</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={notes}
        onChangeText={setNotes}
        placeholder="Describe the work completed, any issues, next steps..."
        multiline
        numberOfLines={4}
        placeholderTextColor="#9ca3af"
      />

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>📋 Submit Progress Log</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1f2937', marginBottom: 20 },
  label: { fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 8, marginTop: 16 },
  optionsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  optionButton: { backgroundColor: '#f3f4f6', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: 'transparent' },
  selectedOption: { backgroundColor: '#dbeafe', borderColor: '#3b82f6' },
  optionText: { fontSize: 14, color: '#374151' },
  selectedOptionText: { color: '#1d4ed8', fontWeight: '600' },
  bookingsSection: { marginVertical: 10 },
  bookingItem: { backgroundColor: '#f0f9ff', padding: 8, borderRadius: 6, marginBottom: 4 },
  bookingText: { fontSize: 12, color: '#0369a1' },
  input: { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, fontSize: 16, color: '#111827' },
  textArea: { height: 100, textAlignVertical: 'top' },
  photoSection: { alignItems: 'center', marginBottom: 10 },
  photoButton: { backgroundColor: '#059669', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
  photoButtonDisabled: { backgroundColor: '#9ca3af' },
  photoButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  photoCount: { marginTop: 8, fontSize: 14, color: '#059669', fontWeight: '500' },
  scanResultsSection: { marginVertical: 16 },
  submitButton: { backgroundColor: '#2563eb', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 24, marginBottom: 40 },
  submitButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});