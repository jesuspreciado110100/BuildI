import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Document } from '../services/DocumentService';

interface Annotation {
  id: string;
  x: number;
  y: number;
  text: string;
  author: string;
  timestamp: string;
  type: 'note' | 'issue' | 'approval';
}

interface DocumentAnnotationToolProps {
  document: Document;
  annotations: Annotation[];
  onAnnotationsChange: (annotations: Annotation[]) => void;
}

export const DocumentAnnotationTool: React.FC<DocumentAnnotationToolProps> = ({
  document,
  annotations,
  onAnnotationsChange
}) => {
  const [selectedTool, setSelectedTool] = useState<'note' | 'issue' | 'approval'>('note');
  const [newAnnotationText, setNewAnnotationText] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const tools = [
    { key: 'note', label: 'Note', icon: 'chatbox-outline', color: '#3B82F6' },
    { key: 'issue', label: 'Issue', icon: 'warning-outline', color: '#EF4444' },
    { key: 'approval', label: 'Approval', icon: 'checkmark-circle-outline', color: '#10B981' }
  ];

  const addAnnotation = () => {
    if (!newAnnotationText.trim()) {
      Alert.alert('Error', 'Please enter annotation text');
      return;
    }

    const newAnnotation: Annotation = {
      id: Date.now().toString(),
      x: Math.random() * 300 + 50,
      y: Math.random() * 200 + 100,
      text: newAnnotationText.trim(),
      author: 'Current User',
      timestamp: new Date().toISOString(),
      type: selectedTool
    };

    onAnnotationsChange([...annotations, newAnnotation]);
    setNewAnnotationText('');
    setShowAddForm(false);
    Alert.alert('Success', 'Annotation added successfully');
  };

  const deleteAnnotation = (id: string) => {
    Alert.alert(
      'Delete Annotation',
      'Are you sure you want to delete this annotation?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            onAnnotationsChange(annotations.filter(a => a.id !== id));
          }
        }
      ]
    );
  };

  const getAnnotationColor = (type: string) => {
    switch (type) {
      case 'issue': return '#EF4444';
      case 'approval': return '#10B981';
      default: return '#3B82F6';
    }
  };

  const getAnnotationIcon = (type: string) => {
    switch (type) {
      case 'issue': return 'warning';
      case 'approval': return 'checkmark-circle';
      default: return 'chatbox';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <Text style={styles.toolbarTitle}>Annotation Tools</Text>
        <View style={styles.tools}>
          {tools.map((tool) => (
            <TouchableOpacity
              key={tool.key}
              style={[
                styles.tool,
                selectedTool === tool.key && { backgroundColor: tool.color + '20' }
              ]}
              onPress={() => setSelectedTool(tool.key as any)}
            >
              <Ionicons 
                name={tool.icon as any} 
                size={20} 
                color={selectedTool === tool.key ? tool.color : '#6B7280'} 
              />
              <Text style={[
                styles.toolText,
                selectedTool === tool.key && { color: tool.color }
              ]}>
                {tool.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.documentArea}>
        <View style={styles.documentPreview}>
          <Text style={styles.previewText}>📄</Text>
          <Text style={styles.previewLabel}>Document with Annotations</Text>
          
          {annotations.map((annotation) => (
            <View
              key={annotation.id}
              style={[
                styles.annotationPin,
                {
                  left: annotation.x,
                  top: annotation.y,
                  backgroundColor: getAnnotationColor(annotation.type)
                }
              ]}
            >
              <TouchableOpacity
                style={styles.pinButton}
                onPress={() => deleteAnnotation(annotation.id)}
              >
                <Ionicons 
                  name={getAnnotationIcon(annotation.type) as any} 
                  size={12} 
                  color="#ffffff" 
                />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.addAnnotationButton}
          onPress={() => setShowAddForm(true)}
        >
          <Ionicons name="add" size={20} color="#ffffff" />
          <Text style={styles.addAnnotationText}>Add Annotation</Text>
        </TouchableOpacity>
      </View>

      {showAddForm && (
        <View style={styles.addForm}>
          <Text style={styles.formTitle}>Add {selectedTool} Annotation</Text>
          <TextInput
            style={styles.textInput}
            placeholder={`Enter your ${selectedTool}...`}
            value={newAnnotationText}
            onChangeText={setNewAnnotationText}
            multiline
            numberOfLines={3}
          />
          <View style={styles.formActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setShowAddForm(false);
                setNewAnnotationText('');
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={addAnnotation}
            >
              <Text style={styles.saveButtonText}>Add Annotation</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ScrollView style={styles.annotationsList}>
        <Text style={styles.listTitle}>Annotations ({annotations.length})</Text>
        {annotations.map((annotation) => (
          <View key={annotation.id} style={styles.annotationItem}>
            <View style={styles.annotationHeader}>
              <View style={styles.annotationMeta}>
                <Ionicons 
                  name={getAnnotationIcon(annotation.type) as any} 
                  size={16} 
                  color={getAnnotationColor(annotation.type)} 
                />
                <Text style={styles.annotationType}>{annotation.type}</Text>
                <Text style={styles.annotationAuthor}>by {annotation.author}</Text>
              </View>
              <TouchableOpacity onPress={() => deleteAnnotation(annotation.id)}>
                <Ionicons name="trash-outline" size={16} color="#EF4444" />
              </TouchableOpacity>
            </View>
            <Text style={styles.annotationText}>{annotation.text}</Text>
            <Text style={styles.annotationTime}>
              {new Date(annotation.timestamp).toLocaleString()}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16
  },
  toolbar: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  toolbarTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12
  },
  tools: {
    flexDirection: 'row',
    gap: 12
  },
  tool: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  toolText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4
  },
  documentArea: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minHeight: 300
  },
  documentPreview: {
    position: 'relative',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 40,
    alignItems: 'center',
    minHeight: 200
  },
  previewText: {
    fontSize: 48,
    marginBottom: 8
  },
  previewLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827'
  },
  annotationPin: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  pinButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  addAnnotationButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 6,
    marginTop: 16
  },
  addAnnotationText: {
    color: '#ffffff',
    fontWeight: '600',
    marginLeft: 4
  },
  addForm: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
    textAlignVertical: 'top'
  },
  formActions: {
    flexDirection: 'row',
    gap: 12
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center'
  },
  cancelButtonText: {
    color: '#6B7280',
    fontWeight: '600'
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center'
  },
  saveButtonText: {
    color: '#ffffff',
    fontWeight: '600'
  },
  annotationsList: {
    flex: 1
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12
  },
  annotationItem: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  annotationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  annotationMeta: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  annotationType: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 4,
    textTransform: 'capitalize'
  },
  annotationAuthor: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 8
  },
  annotationText: {
    fontSize: 14,
    color: '#111827',
    marginBottom: 4
  },
  annotationTime: {
    fontSize: 10,
    color: '#9CA3AF'
  }
});