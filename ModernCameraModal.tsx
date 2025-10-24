import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface ModernCameraModalProps {
  visible: boolean;
  onClose: () => void;
  onPhotoTaken: (uri: string) => void;
}

export default function ModernCameraModal({
  visible,
  onClose,
  onPhotoTaken,
}: ModernCameraModalProps) {
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const handleTakePhoto = async () => {
    setIsCapturing(true);
    
    // Simulate camera capture
    setTimeout(() => {
      const samplePhotoUri = `https://picsum.photos/800/600?random=${Date.now()}`;
      setCapturedPhoto(samplePhotoUri);
      setIsCapturing(false);
    }, 1000);
  };

  const handleConfirmPhoto = () => {
    if (capturedPhoto) {
      onPhotoTaken(capturedPhoto);
      setCapturedPhoto(null);
      onClose();
    }
  };

  const handleRetakePhoto = () => {
    setCapturedPhoto(null);
  };

  return (
    <Modal visible={visible} animationType="slide" statusBarTranslucent>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Construction Photo</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Camera Preview Area */}
        <View style={styles.previewContainer}>
          {capturedPhoto ? (
            <Image source={{ uri: capturedPhoto }} style={styles.capturedImage} />
          ) : (
            <View style={styles.cameraPreview}>
              <View style={styles.gridOverlay}>
                <View style={styles.gridLine} />
                <View style={[styles.gridLine, styles.gridLineVertical]} />
              </View>
              <View style={styles.centerFocus}>
                <View style={styles.focusCorner} />
                <View style={[styles.focusCorner, styles.topRight]} />
                <View style={[styles.focusCorner, styles.bottomLeft]} />
                <View style={[styles.focusCorner, styles.bottomRight]} />
              </View>
              {isCapturing && (
                <View style={styles.capturingOverlay}>
                  <Text style={styles.capturingText}>Capturing...</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          {capturedPhoto ? (
            <View style={styles.reviewControls}>
              <TouchableOpacity onPress={handleRetakePhoto} style={styles.retakeButton}>
                <Ionicons name="refresh" size={24} color="#fff" />
                <Text style={styles.buttonText}>Retake</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleConfirmPhoto} style={styles.confirmButton}>
                <Ionicons name="checkmark" size={24} color="#fff" />
                <Text style={styles.buttonText}>Use Photo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.captureControls}>
              <TouchableOpacity 
                onPress={handleTakePhoto} 
                style={[styles.captureButton, isCapturing && styles.capturingButton]}
                disabled={isCapturing}
              >
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>
            </View>
          )}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 44,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  cameraPreview: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    position: 'relative',
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.3)',
    top: '33.33%',
    left: 0,
    right: 0,
    height: 1,
  },
  gridLineVertical: {
    top: 0,
    bottom: 0,
    left: '33.33%',
    width: 1,
    height: 'auto',
  },
  centerFocus: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 100,
    height: 100,
    marginTop: -50,
    marginLeft: -50,
    zIndex: 2,
  },
  focusCorner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#007AFF',
    borderWidth: 2,
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    left: 'auto',
    borderLeftWidth: 0,
    borderRightWidth: 2,
  },
  bottomLeft: {
    bottom: 0,
    top: 'auto',
    borderTopWidth: 0,
    borderBottomWidth: 2,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    top: 'auto',
    left: 'auto',
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 2,
    borderBottomWidth: 2,
  },
  capturedImage: {
    flex: 1,
    width: '100%',
    resizeMode: 'cover',
  },
  capturingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
  },
  capturingText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  controls: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  captureControls: {
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#007AFF',
  },
  capturingButton: {
    backgroundColor: '#007AFF',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
  },
  reviewControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  buttonText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
});