import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator
} from 'react-native';

interface BoQFileUploaderProps {
  projectId: string;
  onUploadComplete?: (sectionId: string) => void;
}

export const BoQFileUploader: React.FC<BoQFileUploaderProps> = ({
  projectId,
  onUploadComplete
}) => {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async () => {
    try {
      setUploading(true);
      
      // Mock successful upload for demo
      setTimeout(() => {
        Alert.alert('Success', 'BoQ file uploaded successfully! (Demo mode)');
        onUploadComplete?.('demo-section-id');
        setUploading(false);
      }, 2000);

    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to upload file');
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
        onPress={handleFileUpload}
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.uploadButtonText}>Upload BoQ File (Demo)</Text>
        )}
      </TouchableOpacity>
      <Text style={styles.supportedFormats}>
        Demo mode - simulates PDF/XLSX upload
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center'
  },
  uploadButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    minWidth: 200,
    alignItems: 'center'
  },
  uploadButtonDisabled: {
    backgroundColor: '#999'
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  supportedFormats: {
    marginTop: 10,
    fontSize: 12,
    color: '#666',
    textAlign: 'center'
  }
});

export default BoQFileUploader;