import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, Alert, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DocumentService } from '../services/DocumentService';

interface DocumentUploadModalProps {
  visible: boolean;
  onClose: () => void;
  projectId: string;
  userId: string;
  onUploadComplete: () => void;
}

const categories = [
  { key: 'plans', label: 'Plans & Blueprints', icon: 'document-text' },
  { key: 'permits', label: 'Permits & Licenses', icon: 'shield-checkmark' },
  { key: 'contracts', label: 'Contracts', icon: 'document' },
  { key: 'photos', label: 'Photos', icon: 'camera' },
  { key: 'reports', label: 'Reports', icon: 'analytics' },
  { key: 'other', label: 'Other', icon: 'folder' }
];

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  visible,
  onClose,
  projectId,
  userId,
  onUploadComplete
}) => {
  const [selectedCategory, setSelectedCategory] = useState('plans');
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
      const mockFile = {
        name: fileName.trim(),
        type: 'application/pdf',
        size: Math.floor(Math.random() * 5000000) + 100000,
        url: `https://example.com/docs/${fileName.trim()}`,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
      };

      await DocumentService.uploadDocument(projectId, mockFile, selectedCategory, userId);
      
      Alert.alert('Success', 'Document uploaded successfully!');
      setFileName('');
      setTags('');
      onUploadComplete();
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Upload Document</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <Text style={styles.sectionTitle}>Category</Text>
          <View style={styles.categoryGrid}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.key}
                style={[
                  styles.categoryCard,
                  selectedCategory === category.key && styles.categoryCardSelected
                ]}
                onPress={() => setSelectedCategory(category.key)}
              >
                <Ionicons 
                  name={category.icon as any} 
                  size={24} 
                  color={selectedCategory === category.key ? '#3B82F6' : '#6B7280'} 
                />
                <Text style={[
                  styles.categoryText,
                  selectedCategory === category.key && styles.categoryTextSelected
                ]}>
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>File Details</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter file name (e.g., Floor Plan v2.1.pdf)"
            value={fileName}
            onChangeText={setFileName}
          />

          <TextInput
            style={styles.input}
            placeholder="Tags (comma separated, e.g., floor-plan, revision, approved)"
            value={tags}
            onChangeText={setTags}
            multiline
          />

          <TouchableOpacity
            style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
            onPress={handleUpload}
            disabled={uploading}
          >
            <Ionicons name="cloud-upload" size={20} color="#ffffff" style={styles.buttonIcon} />
            <Text style={styles.uploadButtonText}>
              {uploading ? 'Uploading...' : 'Upload Document'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827'
  },
  closeButton: {
    padding: 4
  },
  content: {
    flex: 1,
    padding: 20
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
    marginTop: 20
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  categoryCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center'
  },
  categoryCardSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF'
  },
  categoryText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8
  },
  categoryTextSelected: {
    color: '#3B82F6',
    fontWeight: '600'
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16
  },
  uploadButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginTop: 20
  },
  uploadButtonDisabled: {
    backgroundColor: '#9CA3AF'
  },
  buttonIcon: {
    marginRight: 8
  },
  uploadButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600'
  }
});