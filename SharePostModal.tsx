import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, Alert } from 'react-native';

interface SharePostModalProps {
  visible: boolean;
  onClose: () => void;
  onShare: (content: string, category: string) => void;
}

export default function SharePostModal({ visible, onClose, onShare }: SharePostModalProps) {
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('announcement');

  const categories = [
    { id: 'announcement', label: 'Announcement', color: '#FF3B30' },
    { id: 'progress_photo', label: 'Progress Photo', color: '#FF9500' },
    { id: 'industry_article', label: 'Industry Article', color: '#34C759' },
    { id: 'platform_update', label: 'Platform Update', color: '#007AFF' }
  ];

  const handleShare = () => {
    if (!content.trim()) {
      Alert.alert('Error', 'Please enter some content to share');
      return;
    }
    
    onShare(content, selectedCategory);
    setContent('');
    setSelectedCategory('announcement');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Share Post</Text>
          <TouchableOpacity onPress={handleShare}>
            <Text style={styles.shareButton}>Share</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.content}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryContainer}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryButton,
                  selectedCategory === cat.id && { backgroundColor: cat.color + '20' }
                ]}
                onPress={() => setSelectedCategory(cat.id)}
              >
                <Text style={[
                  styles.categoryText,
                  selectedCategory === cat.id && { color: cat.color }
                ]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <Text style={styles.label}>Content</Text>
          <TextInput
            style={styles.textInput}
            placeholder="What's happening in your construction world?"
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
          
          <TouchableOpacity style={styles.photoButton}>
            <Text style={styles.photoButtonText}>📷 Add Photo</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  cancelButton: {
    fontSize: 16,
    color: '#666'
  },
  shareButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: 'bold'
  },
  content: {
    flex: 1,
    padding: 16
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#f0f0f0'
  },
  categoryText: {
    fontSize: 14,
    color: '#666'
  },
  textInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 16
  },
  photoButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center'
  },
  photoButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  }
});