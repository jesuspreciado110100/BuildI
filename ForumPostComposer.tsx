import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';

interface ForumPostComposerProps {
  onSubmit: (title: string, content: string, category: string) => void;
  onCancel: () => void;
}

export default function ForumPostComposer({ onSubmit, onCancel }: ForumPostComposerProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('General');

  const categories = [
    { id: 'Machinery', label: 'Machinery Q&A', color: '#007AFF' },
    { id: 'Labor', label: 'Labor Issues', color: '#34C759' },
    { id: 'Safety', label: 'Site Safety Tips', color: '#FF3B30' },
    { id: 'Management', label: 'Project Management', color: '#FF9500' },
    { id: 'Materials', label: 'Materials & Supplies', color: '#AF52DE' },
    { id: 'General', label: 'General Discussion', color: '#666' }
  ];

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for your post');
      return;
    }
    
    if (!content.trim()) {
      Alert.alert('Error', 'Please enter some content for your post');
      return;
    }
    
    onSubmit(title, content, selectedCategory);
    setTitle('');
    setContent('');
    setSelectedCategory('General');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel}>
          <Text style={styles.cancelButton}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>New Thread</Text>
        <TouchableOpacity onPress={handleSubmit}>
          <Text style={styles.submitButton}>Post</Text>
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
                selectedCategory === cat.id && { color: cat.color, fontWeight: 'bold' }
              ]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.titleInput}
          placeholder="What's your question or topic?"
          value={title}
          onChangeText={setTitle}
          maxLength={100}
        />
        
        <Text style={styles.label}>Content</Text>
        <TextInput
          style={styles.contentInput}
          placeholder="Describe your question or share your knowledge..."
          value={content}
          onChangeText={setContent}
          multiline
          numberOfLines={8}
          textAlignVertical="top"
        />
        
        <TouchableOpacity style={styles.attachButton}>
          <Text style={styles.attachButtonText}>📎 Attach Files</Text>
        </TouchableOpacity>
      </View>
    </View>
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
  submitButton: {
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
    fontSize: 12,
    color: '#666'
  },
  titleInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 16
  },
  contentInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 150,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 16
  },
  attachButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed'
  },
  attachButtonText: {
    color: '#666',
    fontSize: 16
  }
});