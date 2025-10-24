import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CameraModalProps {
  visible: boolean;
  onClose: () => void;
  onImageCaptured: (imageUrl: string) => void;
}

export default function CameraModal({ visible, onClose, onImageCaptured }: CameraModalProps) {
  const [isCapturing, setIsCapturing] = useState(false);

  const handleTakePhoto = async () => {
    setIsCapturing(true);
    
    // Simulate camera capture - in real app would use expo-camera
    setTimeout(() => {
      const mockImageUrl = `https://picsum.photos/800/600?random=${Date.now()}`;
      onImageCaptured(mockImageUrl);
      setIsCapturing(false);
      onClose();
    }, 1500);
  };

  const handleSelectFromGallery = () => {
    // Simulate gallery selection
    const mockImageUrl = `https://picsum.photos/800/600?random=${Date.now() + 1}`;
    onImageCaptured(mockImageUrl);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.title}>Add Photo Evidence</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.cameraPreview}>
          <Ionicons name="camera" size={80} color="#ccc" />
          <Text style={styles.previewText}>Camera Preview</Text>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity 
            style={styles.galleryButton} 
            onPress={handleSelectFromGallery}
          >
            <Ionicons name="images" size={24} color="#007AFF" />
            <Text style={styles.buttonText}>Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.captureButton, isCapturing && styles.capturing]} 
            onPress={handleTakePhoto}
            disabled={isCapturing}
          >
            <View style={styles.captureInner} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.switchButton}>
            <Ionicons name="camera-reverse" size={24} color="#007AFF" />
            <Text style={styles.buttonText}>Flip</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  placeholder: {
    width: 40,
  },
  cameraPreview: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  previewText: {
    color: '#ccc',
    marginTop: 16,
    fontSize: 16,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: '#000',
  },
  galleryButton: {
    alignItems: 'center',
  },
  switchButton: {
    alignItems: 'center',
  },
  buttonText: {
    color: '#007AFF',
    fontSize: 12,
    marginTop: 4,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#ddd',
  },
  capturing: {
    opacity: 0.7,
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#000',
  },
});