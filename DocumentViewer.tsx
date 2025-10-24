import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Document } from '../types';

interface DocumentViewerProps {
  document: Document;
  onPress?: () => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({ document, onPress }) => {
  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf': return '📄';
      case 'doc':
      case 'docx': return '📝';
      case 'jpg':
      case 'jpeg':
      case 'png': return '🖼️';
      case 'xls':
      case 'xlsx': return '📊';
      default: return '📎';
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.fileIcon}>{getFileIcon(document.type)}</Text>
        </View>
        
        <View style={styles.info}>
          <Text style={styles.fileName} numberOfLines={1}>
            {document.name}
          </Text>
          <View style={styles.metadata}>
            <Text style={styles.metadataText}>
              {formatDate(document.uploadedAt)}
            </Text>
            {document.size && (
              <Text style={styles.metadataText}>
                • {formatFileSize(document.size)}
              </Text>
            )}
          </View>
        </View>
        
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>View</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fileIcon: {
    fontSize: 20,
  },
  info: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metadataText: {
    fontSize: 12,
    color: '#6B7280',
    marginRight: 4,
  },
  actionButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
});
