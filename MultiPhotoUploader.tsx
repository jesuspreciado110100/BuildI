import React, { useState } from 'react';
import { View, TouchableOpacity, Image, Text, StyleSheet, Alert } from 'react-native';

interface MultiPhotoUploaderProps {
  maxPhotos?: number;
  onPhotosChange?: (photos: string[]) => void;
}

export const MultiPhotoUploader: React.FC<MultiPhotoUploaderProps> = ({ 
  maxPhotos = 5, 
  onPhotosChange 
}) => {
  const [photos, setPhotos] = useState<string[]>([]);

  const handleAddPhoto = () => {
    if (photos.length >= maxPhotos) {
      Alert.alert('Maximum Photos', `You can only upload ${maxPhotos} photos`);
      return;
    }
    
    // Mock photo selection - in real app would use image picker
    const mockPhotoUri = `https://picsum.photos/300/200?random=${Date.now()}`;
    const newPhotos = [...photos, mockPhotoUri];
    setPhotos(newPhotos);
    onPhotosChange?.(newPhotos);
  };

  const handleRemovePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
    onPhotosChange?.(newPhotos);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Photos ({photos.length}/{maxPhotos})</Text>
      <View style={styles.photosGrid}>
        {photos.map((photo, index) => (
          <View key={index} style={styles.photoContainer}>
            <Image source={{ uri: photo }} style={styles.photo} />
            <TouchableOpacity 
              style={styles.removeButton}
              onPress={() => handleRemovePhoto(index)}
            >
              <Text style={styles.removeText}>×</Text>
            </TouchableOpacity>
          </View>
        ))}
        {photos.length < maxPhotos && (
          <TouchableOpacity style={styles.addButton} onPress={handleAddPhoto}>
            <Text style={styles.addText}>+</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  photoContainer: {
    position: 'relative',
    width: 80,
    height: 80,
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'red',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addButton: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addText: {
    fontSize: 32,
    color: '#666',
  },
});