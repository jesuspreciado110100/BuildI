import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Alert } from 'react-native';

interface PhotoUploadModalProps {
  visible: boolean;
  onClose: () => void;
  conceptName?: string;
}

export const PhotoUploadModal: React.FC<PhotoUploadModalProps> = ({
  visible,
  onClose,
  conceptName = 'Concept X',
}) => {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    setUploading(true);
    // Simulate upload process
    setTimeout(() => {
      setUploading(false);
      Alert.alert('Success', 'Photo uploaded successfully!');
      onClose();
    }, 2000);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Upload Photo</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <Text style={styles.conceptTitle}>{conceptName}</Text>
          <Text style={styles.subtitle}>Foundation Phase Progress</Text>

          <View style={styles.uploadArea}>
            <Text style={styles.uploadIcon}>📸</Text>
            <Text style={styles.uploadText}>Tap to take photo</Text>
            <Text style={styles.uploadSubtext}>or select from gallery</Text>
          </View>

          <TouchableOpacity
            style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
            onPress={handleUpload}
            disabled={uploading}
          >
            <Text style={styles.uploadButtonText}>
              {uploading ? 'Uploading...' : 'Upload Photo'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  cancelButton: {
    fontSize: 16,
    color: '#6b7280',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  conceptTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 32,
  },
  uploadArea: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    padding: 40,
    alignItems: 'center',
    marginBottom: 32,
  },
  uploadIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 4,
  },
  uploadSubtext: {
    fontSize: 14,
    color: '#6b7280',
  },
  uploadButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  uploadButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  uploadButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});