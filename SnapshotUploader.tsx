import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, Image, ScrollView, Platform } from 'react-native';
import { ProgressSnapshot } from '../types';
import { ProgressSnapshotService } from '../services/ProgressSnapshotService';

interface SnapshotUploaderProps {
  conceptId: string;
  siteId: string;
  onUploadComplete?: (snapshot: ProgressSnapshot) => void;
  onClose?: () => void;
}

export const SnapshotUploader: React.FC<SnapshotUploaderProps> = ({
  conceptId,
  siteId,
  onUploadComplete,
  onClose
}) => {
  const [phaseLabel, setPhaseLabel] = useState('');
  const [progressPercentage, setProgressPercentage] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const mockPhotoUrls = [
    'https://via.placeholder.com/300x200/4CAF50/white?text=Foundation+Work',
    'https://via.placeholder.com/300x200/2196F3/white?text=Structure+Phase',
    'https://via.placeholder.com/300x200/FF9800/white?text=Concrete+Pour',
    'https://via.placeholder.com/300x200/9C27B0/white?text=Steel+Frame',
    'https://via.placeholder.com/300x200/F44336/white?text=Roofing+Work'
  ];

  const handlePhotoSelect = () => {
    // Mock photo selection - removed expo-image-picker dependency
    const randomPhoto = mockPhotoUrls[Math.floor(Math.random() * mockPhotoUrls.length)];
    setSelectedPhoto(randomPhoto);
  };

  const handleUpload = async () => {
    if (!phaseLabel.trim()) {
      Alert.alert('Error', 'Please enter a phase label');
      return;
    }

    if (!progressPercentage.trim() || isNaN(Number(progressPercentage))) {
      Alert.alert('Error', 'Please enter a valid progress percentage');
      return;
    }

    if (!selectedPhoto) {
      Alert.alert('Error', 'Please select a photo');
      return;
    }

    const progress = Number(progressPercentage);
    if (progress < 0 || progress > 100) {
      Alert.alert('Error', 'Progress percentage must be between 0 and 100');
      return;
    }

    try {
      setIsUploading(true);
      
      const snapshotData: Omit<ProgressSnapshot, 'id'> = {
        site_id: siteId,
        concept_id: conceptId,
        photo_url: selectedPhoto,
        timestamp: new Date().toISOString(),
        phase_label: phaseLabel.trim(),
        progress_percentage: progress,
        notes: notes.trim() || undefined,
        created_by: 'current_user'
      };

      const uploadedSnapshot = await ProgressSnapshotService.uploadSnapshot(snapshotData);
      
      Alert.alert('Success', 'Progress snapshot uploaded successfully!');
      
      if (onUploadComplete) {
        onUploadComplete(uploadedSnapshot);
      }
      
      // Reset form
      setPhaseLabel('');
      setProgressPercentage('');
      setNotes('');
      setSelectedPhoto(null);
      
    } catch (error) {
      console.error('Error uploading snapshot:', error);
      Alert.alert('Error', 'Failed to upload snapshot. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <View style={{ padding: 20 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Upload Progress Snapshot</Text>
          {onClose && (
            <TouchableOpacity onPress={onClose}>
              <Text style={{ color: '#007AFF', fontSize: 16 }}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Photo Selection */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>Photo</Text>
          {selectedPhoto ? (
            <View>
              <Image
                source={{ uri: selectedPhoto }}
                style={{ width: '100%', height: 200, borderRadius: 10, marginBottom: 10 }}
                resizeMode="cover"
              />
              <TouchableOpacity
                onPress={handlePhotoSelect}
                style={{ padding: 10, backgroundColor: '#007AFF', borderRadius: 5 }}
              >
                <Text style={{ color: 'white', textAlign: 'center' }}>Change Photo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={handlePhotoSelect}
              style={{ 
                height: 200, 
                borderWidth: 2, 
                borderColor: '#ddd', 
                borderStyle: 'dashed', 
                borderRadius: 10, 
                justifyContent: 'center', 
                alignItems: 'center',
                backgroundColor: 'white'
              }}
            >
              <Text style={{ color: '#666', fontSize: 16 }}>Tap to Select Photo</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Phase Label */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>Phase Label</Text>
          <TextInput
            value={phaseLabel}
            onChangeText={setPhaseLabel}
            placeholder="e.g., Foundation, Structure, Roofing"
            style={{ 
              borderWidth: 1, 
              borderColor: '#ddd', 
              borderRadius: 5, 
              padding: 15, 
              backgroundColor: 'white',
              fontSize: 16
            }}
          />
        </View>

        {/* Progress Percentage */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>Progress Percentage</Text>
          <TextInput
            value={progressPercentage}
            onChangeText={setProgressPercentage}
            placeholder="0-100"
            keyboardType="numeric"
            style={{ 
              borderWidth: 1, 
              borderColor: '#ddd', 
              borderRadius: 5, 
              padding: 15, 
              backgroundColor: 'white',
              fontSize: 16
            }}
          />
        </View>

        {/* Notes */}
        <View style={{ marginBottom: 30 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>Notes (Optional)</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Add any additional notes about this progress update..."
            multiline
            numberOfLines={4}
            style={{ 
              borderWidth: 1, 
              borderColor: '#ddd', 
              borderRadius: 5, 
              padding: 15, 
              backgroundColor: 'white',
              fontSize: 16,
              textAlignVertical: 'top'
            }}
          />
        </View>

        {/* Upload Button */}
        <TouchableOpacity
          onPress={handleUpload}
          disabled={isUploading}
          style={{ 
            padding: 15, 
            backgroundColor: isUploading ? '#ccc' : '#4CAF50', 
            borderRadius: 10,
            marginBottom: 20
          }}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontSize: 16, fontWeight: 'bold' }}>
            {isUploading ? 'Uploading...' : 'Upload Snapshot'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};