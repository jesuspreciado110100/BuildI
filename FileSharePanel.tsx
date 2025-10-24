import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface FileSharePanelProps {
  userId: string;
  userRole: string;
}

interface SharedFile {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedBy: string;
  uploadedAt: string;
  category: string;
  isPublic: boolean;
}

export const FileSharePanel: React.FC<FileSharePanelProps> = ({ userId, userRole }) => {
  const { theme } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const mockFiles: SharedFile[] = [
    {
      id: '1',
      name: 'Site_Plans_v2.pdf',
      type: 'PDF',
      size: '2.4 MB',
      uploadedBy: 'John Architect',
      uploadedAt: '2024-01-15',
      category: 'plans',
      isPublic: true
    },
    {
      id: '2',
      name: 'Material_Specs.xlsx',
      type: 'Excel',
      size: '1.2 MB',
      uploadedBy: 'Sarah Engineer',
      uploadedAt: '2024-01-14',
      category: 'specs',
      isPublic: false
    },
    {
      id: '3',
      name: 'Progress_Photos.zip',
      type: 'ZIP',
      size: '15.8 MB',
      uploadedBy: 'Mike Contractor',
      uploadedAt: '2024-01-13',
      category: 'photos',
      isPublic: true
    },
    {
      id: '4',
      name: 'Safety_Report.docx',
      type: 'Word',
      size: '856 KB',
      uploadedBy: 'Lisa Safety',
      uploadedAt: '2024-01-12',
      category: 'reports',
      isPublic: false
    }
  ];

  const categories = [
    { key: 'all', label: 'All Files', icon: '📁' },
    { key: 'plans', label: 'Plans', icon: '📋' },
    { key: 'specs', label: 'Specs', icon: '📊' },
    { key: 'photos', label: 'Photos', icon: '📸' },
    { key: 'reports', label: 'Reports', icon: '📄' }
  ];

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf': return '📄';
      case 'excel': return '📊';
      case 'word': return '📝';
      case 'zip': return '🗜️';
      case 'image': return '🖼️';
      default: return '📁';
    }
  };

  const filteredFiles = selectedCategory === 'all' 
    ? mockFiles 
    : mockFiles.filter(file => file.category === selectedCategory);

  const handleFilePress = (file: SharedFile) => {
    Alert.alert(
      'File Actions',
      `What would you like to do with ${file.name}?`,
      [
        { text: 'Download', onPress: () => console.log('Download:', file.name) },
        { text: 'Share', onPress: () => console.log('Share:', file.name) },
        { text: 'View Details', onPress: () => console.log('Details:', file.name) },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const renderCategoryButton = (category: any) => (
    <TouchableOpacity
      key={category.key}
      style={[
        styles.categoryButton,
        {
          backgroundColor: selectedCategory === category.key 
            ? theme.colors.primary 
            : theme.colors.card,
          borderColor: theme.colors.border
        }
      ]}
      onPress={() => setSelectedCategory(category.key)}
    >
      <Text style={styles.categoryIcon}>{category.icon}</Text>
      <Text style={[
        styles.categoryLabel,
        {
          color: selectedCategory === category.key 
            ? '#fff' 
            : theme.colors.text
        }
      ]}>
        {category.label}
      </Text>
    </TouchableOpacity>
  );

  const renderFileItem = ({ item }: { item: SharedFile }) => (
    <TouchableOpacity
      style={[styles.fileCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
      onPress={() => handleFilePress(item)}
    >
      <View style={styles.fileHeader}>
        <Text style={styles.fileIcon}>{getFileIcon(item.type)}</Text>
        <View style={styles.fileInfo}>
          <Text style={[styles.fileName, { color: theme.colors.text }]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={[styles.fileDetails, { color: theme.colors.textSecondary }]}>
            {item.type} • {item.size}
          </Text>
        </View>
        <View style={styles.fileActions}>
          {item.isPublic ? (
            <View style={[styles.publicBadge, { backgroundColor: theme.colors.success }]}>
              <Text style={styles.badgeText}>Public</Text>
            </View>
          ) : (
            <View style={[styles.privateBadge, { backgroundColor: theme.colors.warning }]}>
              <Text style={styles.badgeText}>Private</Text>
            </View>
          )}
        </View>
      </View>
      
      <View style={styles.fileFooter}>
        <Text style={[styles.uploadInfo, { color: theme.colors.textSecondary }]}>
          Uploaded by {item.uploadedBy} on {item.uploadedAt}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Shared Files</Text>
        <TouchableOpacity 
          style={[styles.uploadButton, { backgroundColor: theme.colors.primary }]}
        >
          <Text style={styles.uploadButtonText}>+ Upload</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.categoriesContainer}>
        <FlatList
          data={categories}
          renderItem={({ item }) => renderCategoryButton(item)}
          keyExtractor={(item) => item.key}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>
      
      <FlatList
        data={filteredFiles}
        renderItem={renderFileItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.filesList}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  uploadButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoriesList: {
    gap: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  categoryIcon: {
    fontSize: 16,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  filesList: {
    gap: 12,
  },
  fileCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  fileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  fileDetails: {
    fontSize: 12,
  },
  fileActions: {
    alignItems: 'flex-end',
  },
  publicBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  privateBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  fileFooter: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  uploadInfo: {
    fontSize: 12,
  },
});