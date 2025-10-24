import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
interface ConceptFileUploaderProps {
  onFileSelected: (file: any) => void;
  siteId: string;
}

const ConceptFileUploader: React.FC<ConceptFileUploaderProps> = ({ onFileSelected, siteId }) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async () => {
    setIsUploading(true);
    try {
      // Simulate file upload for now
      Alert.alert('File Upload', 'File upload functionality will be implemented with proper file picker');
      
      // Mock file data
      const mockFile = {
        name: 'concepts.xlsx',
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        size: 12345,
        uri: 'mock://file/path'
      };
      
      onFileSelected(mockFile);
    } catch (error) {
      Alert.alert('Error', 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.uploadButton, isUploading && styles.uploadButtonDisabled]}
        onPress={handleFileUpload}
        disabled={isUploading}
      >
        {isUploading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.uploadButtonText}>Upload Concept File (PDF or Excel)</Text>
        )}
      </TouchableOpacity>
      
      <Text style={styles.supportedFormats}>
        Supported formats: .xlsx, .xls, .csv, .pdf
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
  },
  uploadButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 200,
    alignItems: 'center',
  },
  uploadButtonDisabled: {
    backgroundColor: '#999',
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  supportedFormats: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

export default ConceptFileUploader;