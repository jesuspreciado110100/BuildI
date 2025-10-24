import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';

interface PhotoUploadStepProps {
  photos: {
    front?: string;
    side?: string;
    control?: string;
  };
  onPhotosChange: (photos: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export const PhotoUploadStep: React.FC<PhotoUploadStepProps> = ({
  photos,
  onPhotosChange,
  onNext,
  onBack
}) => {
  const [selectedType, setSelectedType] = useState<string>('');

  const handlePhotoUpload = (type: string) => {
    // Mock photo upload - in real app would use expo-image-picker
    Alert.alert('Photo Upload', `Would upload ${type} photo`, [
      { text: 'Cancel' },
      { 
        text: 'Mock Upload', 
        onPress: () => {
          const mockUri = `mock://photo-${type}-${Date.now()}.jpg`;
          onPhotosChange({ ...photos, [type]: mockUri });
        }
      }
    ]);
  };

  const photoTypes = [
    { key: 'front', label: 'Front View', required: true },
    { key: 'side', label: 'Side View', required: true },
    { key: 'control', label: 'Control Panel', required: false }
  ];

  const canProceed = photos.front && photos.side;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload Photos</Text>
      <Text style={styles.subtitle}>Take clear photos of your machinery</Text>
      
      {photoTypes.map((type) => (
        <View key={type.key} style={styles.photoItem}>
          <View style={styles.photoHeader}>
            <Text style={styles.photoLabel}>{type.label}</Text>
            {type.required && <Text style={styles.required}>*</Text>}
          </View>
          
          {photos[type.key] ? (
            <View style={styles.photoPreview}>
              <Text style={styles.photoSuccess}>✓ Photo uploaded</Text>
              <TouchableOpacity 
                style={styles.retakeButton}
                onPress={() => handlePhotoUpload(type.key)}
              >
                <Text style={styles.retakeText}>Retake</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.uploadButton}
              onPress={() => handlePhotoUpload(type.key)}
            >
              <Text style={styles.uploadText}>📷 Take Photo</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.nextButton, !canProceed && styles.disabledButton]}
          onPress={onNext}
          disabled={!canProceed}
        >
          <Text style={[styles.nextText, !canProceed && styles.disabledText]}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  photoItem: {
    marginBottom: 20,
  },
  photoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  photoLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  required: {
    color: '#ef4444',
    marginLeft: 4,
  },
  photoPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0ea5e9',
  },
  photoSuccess: {
    color: '#0ea5e9',
    fontWeight: '500',
  },
  retakeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 6,
  },
  retakeText: {
    color: '#475569',
    fontSize: 14,
  },
  uploadButton: {
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  uploadText: {
    color: '#64748b',
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
  },
  backText: {
    color: '#475569',
    fontSize: 16,
    fontWeight: '500',
  },
  nextButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#0ea5e9',
    borderRadius: 8,
  },
  nextText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  disabledButton: {
    backgroundColor: '#e2e8f0',
  },
  disabledText: {
    color: '#94a3b8',
  },
});