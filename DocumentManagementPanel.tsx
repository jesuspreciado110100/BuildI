import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DocumentService, Document } from '../services/DocumentService';
import { DocumentUploadModal } from './DocumentUploadModal';
import { DocumentViewerModal } from './DocumentViewerModal';

interface DocumentManagementPanelProps {
  projectId: string;
  userId: string;
}

const categories = [
  { key: 'all', label: 'All Documents', icon: 'folder-open' },
  { key: 'plans', label: 'Plans', icon: 'document-text' },
  { key: 'permits', label: 'Permits', icon: 'shield-checkmark' },
  { key: 'contracts', label: 'Contracts', icon: 'document' },
  { key: 'photos', label: 'Photos', icon: 'camera' },
  { key: 'reports', label: 'Reports', icon: 'analytics' }
];

export const DocumentManagementPanel: React.FC<DocumentManagementPanelProps> = ({
  projectId,
  userId
}) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocuments();
  }, [projectId]);

  useEffect(() => {
    filterDocuments();
  }, [documents, selectedCategory, searchQuery]);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const docs = await DocumentService.getDocuments(projectId);
      setDocuments(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterDocuments = () => {
    let filtered = documents;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(doc => doc.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(doc => 
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredDocuments(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return '#10B981';
      case 'rejected': return '#EF4444';
      case 'review': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getFileIcon = (type: string) => {
    if (type.includes('image')) return '🖼️';
    if (type.includes('pdf')) return '📄';
    if (type.includes('word')) return '📝';
    if (type.includes('excel')) return '📊';
    return '📎';
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Document Management</Text>
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={() => setShowUploadModal(true)}
        >
          <Ionicons name="add" size={20} color="#ffffff" />
          <Text style={styles.uploadButtonText}>Upload</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Search documents..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.key}
            style={[
              styles.categoryChip,
              selectedCategory === category.key && styles.categoryChipSelected
            ]}
            onPress={() => setSelectedCategory(category.key)}
          >
            <Ionicons 
              name={category.icon as any} 
              size={16} 
              color={selectedCategory === category.key ? '#3B82F6' : '#6B7280'} 
            />
            <Text style={[
              styles.categoryChipText,
              selectedCategory === category.key && styles.categoryChipTextSelected
            ]}>
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.documentList}>
        {filteredDocuments.map((document) => (
          <TouchableOpacity
            key={document.id}
            style={styles.documentCard}
            onPress={() => setSelectedDocument(document)}
          >
            <View style={styles.documentHeader}>
              <View style={styles.documentIcon}>
                <Text style={styles.fileIcon}>{getFileIcon(document.type)}</Text>
              </View>
              <View style={styles.documentInfo}>
                <Text style={styles.documentName}>{document.name}</Text>
                <Text style={styles.documentMeta}>
                  v{document.version} • {formatFileSize(document.size)} • {new Date(document.uploaded_at).toLocaleDateString()}
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(document.status) }]}>
                <Text style={styles.statusText}>{document.status}</Text>
              </View>
            </View>
            {document.tags && document.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {document.tags.slice(0, 3).map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <DocumentUploadModal
        visible={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        projectId={projectId}
        userId={userId}
        onUploadComplete={loadDocuments}
      />

      {selectedDocument && (
        <DocumentViewerModal
          document={selectedDocument}
          onClose={() => setSelectedDocument(null)}
          onStatusUpdate={loadDocuments}
        />
      )}
    </View>
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
  uploadButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6
  },
  uploadButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    marginLeft: 4
  },
  searchInput: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB'
  },
  categoryScroll: {
    paddingHorizontal: 16,
    marginBottom: 16
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8
  },
  categoryChipSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6'
  },
  categoryChipText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4
  },
  categoryChipTextSelected: {
    color: '#3B82F6',
    fontWeight: '600'
  },
  documentList: {
    flex: 1,
    paddingHorizontal: 16
  },
  documentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  documentIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  fileIcon: {
    fontSize: 20
  },
  documentInfo: {
    flex: 1
  },
  documentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4
  },
  documentMeta: {
    fontSize: 12,
    color: '#6B7280'
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  statusText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  tagsContainer: {
    flexDirection: 'row',
    marginTop: 12,
    flexWrap: 'wrap'
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4
  },
  tagText: {
    fontSize: 10,
    color: '#6B7280'
  }
});