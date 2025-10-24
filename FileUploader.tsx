import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { fileShareService } from '../services/FileShareService';
import { SharedFile } from '../types';

interface FileUploaderProps {
  siteId: string;
  uploaderId: string;
  onFileUploaded: (file: SharedFile) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  siteId,
  uploaderId,
  onFileUploaded
}) => {
  const [fileName, setFileName] = useState('');
  const [tags, setTags] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!fileName.trim()) {
      Alert.alert('Error', 'Please enter a file name');
      return;
    }

    setUploading(true);
    try {
      const file = await fileShareService.uploadFile({
        site_id: siteId,
        uploader_id: uploaderId,
        name: fileName.trim(),
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
      });
      
      onFileUploaded(file);
      setFileName('');
      setTags('');
      Alert.alert('Success', 'File uploaded successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload File</Text>
      
      <TextInput
        style={styles.input}
        placeholder="File name (e.g., blueprint.pdf)"
        value={fileName}
        onChangeText={setFileName}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Tags (comma separated)"
        value={tags}
        onChangeText={setTags}
      />
      
      <TouchableOpacity
        style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
        onPress={handleUpload}
        disabled={uploading}
      >
        <Text style={styles.uploadButtonText}>
          {uploading ? 'Uploading...' : 'Upload File'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  uploadButton: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  uploadButtonDisabled: {
    backgroundColor: '#ccc',
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});