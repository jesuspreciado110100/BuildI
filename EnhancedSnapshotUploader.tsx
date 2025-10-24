import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, Image, ScrollView, Platform } from 'react-native';
import { ProgressSnapshot } from '../types';
import { ProgressSnapshotService } from '../services/ProgressSnapshotService';

interface EnhancedSnapshotUploaderProps {
  conceptId: string;
  siteId: string;
  onUploadComplete?: (snapshot: ProgressSnapshot) => void;
  onClose?: () => void;
}

export const EnhancedSnapshotUploader: React.FC<EnhancedSnapshotUploaderProps> = ({
  conceptId,
  siteId,
  onUploadComplete,
  onClose
}) => {
  const [phaseLabel, setPhaseLabel] = useState('');
  const [progressPercentage, setProgressPercentage] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showPhotoGrid, setShowPhotoGrid] = useState(false);

  const photoCategories = {
    foundation: [
      'https://via.placeholder.com/300x200/8B4513/white?text=Excavation',
      'https://via.placeholder.com/300x200/654321/white?text=Concrete+Pour',
      'https://via.placeholder.com/300x200/A0522D/white?text=Foundation+Complete'
    ],
    structure: [
      'https://via.placeholder.com/300x200/708090/white?text=Steel+Frame',
      'https://via.placeholder.com/300x200/2F4F4F/white?text=Beam+Installation',
      'https://via.placeholder.com/300x200/696969/white?text=Structure+Progress'
    ],
    roofing: [
      'https://via.placeholder.com/300x200/8B0000/white?text=Roof+Trusses',
      'https://via.placeholder.com/300x200/B22222/white?text=Shingles',
      'https://via.placeholder.com/300x200/DC143C/white?text=Roof+Complete'
    ],
    finishing: [
      'https://via.placeholder.com/300x200/4169E1/white?text=Interior+Work',
      'https://via.placeholder.com/300x200/1E90FF/white?text=Painting',
      'https://via.placeholder.com/300x200/87CEEB/white?text=Final+Touches'
    ]
  };

  const allPhotos = Object.values(photoCategories).flat();

  const handlePhotoSelect = (photoUrl: string) => {
    if (selectedPhotos.includes(photoUrl)) {
      setSelectedPhotos(prev => prev.filter(url => url !== photoUrl));
    } else if (selectedPhotos.length < 5) {
      setSelectedPhotos(prev => [...prev, photoUrl]);
    } else {
      Alert.alert('Limit Reached', 'You can select up to 5 photos');
    }
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

    if (selectedPhotos.length === 0) {
      Alert.alert('Error', 'Please select at least one photo');
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
        photo_url: selectedPhotos[0],
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
      setSelectedPhotos([]);
      setShowPhotoGrid(false);
      
    } catch (error) {
      console.error('Error uploading snapshot:', error);
      Alert.alert('Error', 'Failed to upload snapshot. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View className="bg-white rounded-lg shadow-lg p-4 m-4">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-xl font-bold text-gray-800">Upload Progress</Text>
        {onClose && (
          <TouchableOpacity onPress={onClose}>
            <Text className="text-blue-500 text-base">Cancel</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Photo Selection */}
      <View className="mb-4">
        <Text className="text-base font-semibold mb-2">Photos ({selectedPhotos.length}/5)</Text>
        
        {selectedPhotos.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
            {selectedPhotos.map((photo, index) => (
              <View key={index} className="mr-2 relative">
                <Image
                  source={{ uri: photo }}
                  className="w-20 h-20 rounded-lg"
                  resizeMode="cover"
                />
                <TouchableOpacity
                  onPress={() => handlePhotoSelect(photo)}
                  className="absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 items-center justify-center"
                >
                  <Text className="text-white text-xs font-bold">×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}
        
        <TouchableOpacity
          onPress={() => setShowPhotoGrid(!showPhotoGrid)}
          className="bg-blue-500 p-3 rounded-lg"
        >
          <Text className="text-white text-center font-medium">
            {showPhotoGrid ? 'Hide Photo Gallery' : 'Select Photos'}
          </Text>
        </TouchableOpacity>
        
        {showPhotoGrid && (
          <View className="mt-3 bg-gray-50 rounded-lg p-3">
            <Text className="text-sm font-medium mb-2">Tap to select photos:</Text>
            <View className="flex-row flex-wrap">
              {allPhotos.map((photo, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handlePhotoSelect(photo)}
                  className={`w-16 h-16 m-1 rounded-lg border-2 ${
                    selectedPhotos.includes(photo) ? 'border-blue-500' : 'border-gray-300'
                  }`}
                >
                  <Image
                    source={{ uri: photo }}
                    className="w-full h-full rounded-lg"
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Phase Label */}
      <View className="mb-4">
        <Text className="text-base font-semibold mb-2">Phase Label</Text>
        <TextInput
          value={phaseLabel}
          onChangeText={setPhaseLabel}
          placeholder="e.g., Foundation, Structure, Roofing"
          className="border border-gray-300 rounded-lg p-3 bg-white"
        />
      </View>

      {/* Progress Percentage */}
      <View className="mb-4">
        <Text className="text-base font-semibold mb-2">Progress %</Text>
        <TextInput
          value={progressPercentage}
          onChangeText={setProgressPercentage}
          placeholder="0-100"
          keyboardType="numeric"
          className="border border-gray-300 rounded-lg p-3 bg-white"
        />
      </View>

      {/* Notes */}
      <View className="mb-6">
        <Text className="text-base font-semibold mb-2">Notes (Optional)</Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Add notes about this progress update..."
          multiline
          numberOfLines={3}
          className="border border-gray-300 rounded-lg p-3 bg-white"
          style={{ textAlignVertical: 'top' }}
        />
      </View>

      {/* Upload Button */}
      <TouchableOpacity
        onPress={handleUpload}
        disabled={isUploading}
        className={`p-4 rounded-lg ${
          isUploading ? 'bg-gray-400' : 'bg-green-500'
        }`}
      >
        <Text className="text-white text-center font-bold text-base">
          {isUploading ? 'Uploading...' : 'Upload Snapshot'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};