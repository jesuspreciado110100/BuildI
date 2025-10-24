import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { MultiPhotoUploader } from './MultiPhotoUploader';

interface DamageReportModalProps {
  visible: boolean;
  onClose: () => void;
  bookingId: string;
  onSubmit: (report: DamageReport) => void;
}

export interface DamageReport {
  bookingId: string;
  damageType: string;
  severity: 'Minor' | 'Moderate' | 'Severe';
  description: string;
  photos: string[];
  estimatedCost?: number;
  reportedBy: string;
  reportedAt: Date;
}

const DAMAGE_TYPES = [
  'Scratches/Dents',
  'Hydraulic Leak',
  'Engine Issues',
  'Tire/Track Damage',
  'Electrical Problems',
  'Structural Damage',
  'Missing Parts',
  'Other'
];

export const DamageReportModal: React.FC<DamageReportModalProps> = ({ 
  visible, 
  onClose, 
  bookingId,
  onSubmit 
}) => {
  const [damageType, setDamageType] = useState('');
  const [severity, setSeverity] = useState<'Minor' | 'Moderate' | 'Severe'>('Minor');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [estimatedCost, setEstimatedCost] = useState('');

  const handleSubmit = () => {
    if (!damageType || !description) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const report: DamageReport = {
      bookingId,
      damageType,
      severity,
      description,
      photos,
      estimatedCost: estimatedCost ? parseFloat(estimatedCost) : undefined,
      reportedBy: 'Current User',
      reportedAt: new Date()
    };

    onSubmit(report);
    onClose();
    
    // Reset form
    setDamageType('');
    setSeverity('Minor');
    setDescription('');
    setPhotos([]);
    setEstimatedCost('');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Report Damage</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>×</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.content}>
            <Text style={styles.label}>Damage Type *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeSelector}>
              {DAMAGE_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    damageType === type && styles.selectedType
                  ]}
                  onPress={() => setDamageType(type)}
                >
                  <Text style={[
                    styles.typeText,
                    damageType === type && styles.selectedTypeText
                  ]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>Severity *</Text>
            <View style={styles.severitySelector}>
              {(['Minor', 'Moderate', 'Severe'] as const).map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.severityButton,
                    severity === level && styles.selectedSeverity,
                    level === 'Severe' && styles.severeButton
                  ]}
                  onPress={() => setSeverity(level)}
                >
                  <Text style={[
                    styles.severityText,
                    severity === level && styles.selectedSeverityText
                  ]}>
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={styles.textArea}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe the damage in detail..."
              multiline
              numberOfLines={4}
            />

            <Text style={styles.label}>Estimated Repair Cost</Text>
            <TextInput
              style={styles.input}
              value={estimatedCost}
              onChangeText={setEstimatedCost}
              placeholder="$0.00"
              keyboardType="numeric"
            />

            <MultiPhotoUploader
              maxPhotos={5}
              onPhotosChange={setPhotos}
            />

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitText}>Submit Damage Report</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '95%',
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  closeText: {
    fontSize: 24,
    color: '#666',
  },
  content: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  typeSelector: {
    marginBottom: 16,
  },
  typeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  selectedType: {
    backgroundColor: '#007AFF',
  },
  typeText: {
    fontSize: 14,
    color: '#333',
  },
  selectedTypeText: {
    color: 'white',
  },
  severitySelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  severityButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  selectedSeverity: {
    backgroundColor: '#007AFF',
  },
  severeButton: {
    backgroundColor: '#ff4444',
  },
  severityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  selectedSeverityText: {
    color: 'white',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  submitText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});