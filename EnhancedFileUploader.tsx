import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, ScrollView } from 'react-native';
import { SharedFile } from '../types';

interface EnhancedFileUploaderProps {
  onFilesUploaded: (files: SharedFile[]) => void;
  acceptedTypes?: string[];
  maxFiles?: number;
}

export const EnhancedFileUploader: React.FC<EnhancedFileUploaderProps> = ({
  onFilesUploaded,
  acceptedTypes = ['image/*', 'application/pdf', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  maxFiles = 10
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<SharedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async () => {
    try {
      setIsUploading(true);
      
      // Simulate file picker functionality
      const mockFiles: SharedFile[] = [
        {
          id: Date.now().toString(),
          name: 'sample-document.pdf',
          type: 'application/pdf',
          size: 1024000,
          uri: 'https://example.com/sample.pdf',
          uploadedAt: new Date().toISOString(),
          uploadedBy: 'current-user'
        }
      ];

      const newFiles = [...uploadedFiles, ...mockFiles].slice(0, maxFiles);
      setUploadedFiles(newFiles);
      onFilesUploaded(newFiles);
      
      Alert.alert('Success', 'Files uploaded successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to upload files');
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (fileId: string) => {
    const filteredFiles = uploadedFiles.filter(file => file.id !== fileId);
    setUploadedFiles(filteredFiles);
    onFilesUploaded(filteredFiles);
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return '📄';
    if (type.includes('excel') || type.includes('spreadsheet')) return '📊';
    if (type.includes('image')) return '🖼️';
    return '📎';
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.uploadButton, isUploading && styles.uploadButtonDisabled]}
        onPress={handleFileUpload}
        disabled={isUploading || uploadedFiles.length >= maxFiles}
      >
        <Text style={styles.uploadButtonText}>
          {isUploading ? 'Uploading...' : 'Upload Files'}
        </Text>
        <Text style={styles.uploadHint}>
          Supports: Images, PDF, Excel files
        </Text>
      </TouchableOpacity>

      {uploadedFiles.length > 0 && (
        <ScrollView style={styles.filesList}>
          {uploadedFiles.map((file) => (
            <View key={file.id} style={styles.fileItem}>
              <Text style={styles.fileIcon}>{getFileIcon(file.type)}</Text>
              <View style={styles.fileInfo}>
                <Text style={styles.fileName}>{file.name}</Text>
                <Text style={styles.fileSize}>
                  {(file.size / 1024).toFixed(1)} KB
                </Text>
              </View>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeFile(file.id)}
              >
                <Text style={styles.removeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  uploadButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderStyle: 'dashed',
  },
  uploadButtonDisabled: {
    backgroundColor: '#9CA3AF',
    borderColor: '#9CA3AF',
  },
  uploadButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  uploadHint: {
    color: '#ffffff',
    fontSize: 12,
    opacity: 0.8,
  },
  filesList: {
    marginTop: 16,
    maxHeight: 200,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  fileIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  fileSize: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
});