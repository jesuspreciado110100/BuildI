import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

interface SharedFilesTabProps {
  siteId: string;
}

export const SharedFilesTab: React.FC<SharedFilesTabProps> = ({ siteId }) => {
  const mockFiles = [
    { id: '1', name: 'Project Plans.pdf', type: 'pdf', size: '2.4 MB', uploadedBy: 'John Doe', date: '2024-01-15' },
    { id: '2', name: 'Material List.xlsx', type: 'excel', size: '1.2 MB', uploadedBy: 'Jane Smith', date: '2024-01-14' },
    { id: '3', name: 'Site Photos.zip', type: 'zip', size: '15.8 MB', uploadedBy: 'Mike Johnson', date: '2024-01-13' }
  ];

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return '📄';
      case 'excel': return '📊';
      case 'zip': return '📦';
      default: return '📁';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Shared Files</Text>
        <TouchableOpacity style={styles.uploadButton}>
          <Text style={styles.uploadText}>+ Upload</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.filesList}>
        {mockFiles.map((file) => (
          <TouchableOpacity key={file.id} style={styles.fileItem}>
            <Text style={styles.fileIcon}>{getFileIcon(file.type)}</Text>
            <View style={styles.fileInfo}>
              <Text style={styles.fileName}>{file.name}</Text>
              <Text style={styles.fileDetails}>{file.size} • {file.uploadedBy} • {file.date}</Text>
            </View>
            <TouchableOpacity style={styles.downloadButton}>
              <Text style={styles.downloadText}>⬇️</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  uploadButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  uploadText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  filesList: {
    maxHeight: 300,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  fileIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  fileDetails: {
    fontSize: 12,
    color: '#6b7280',
  },
  downloadButton: {
    padding: 8,
  },
  downloadText: {
    fontSize: 16,
  },
});