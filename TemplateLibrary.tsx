import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { DocumentTemplateService, DocumentTemplate } from '../services/DocumentTemplateService';

interface TemplateLibraryProps {
  onSelectTemplate: (template: DocumentTemplate) => void;
  onCreateNew: () => void;
}

export const TemplateLibrary: React.FC<TemplateLibraryProps> = ({ onSelectTemplate, onCreateNew }) => {
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const templateService = new DocumentTemplateService();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    const allTemplates = await templateService.getTemplates();
    setTemplates(allTemplates);
  };

  const categories = [
    { id: 'all', name: 'All Templates' },
    { id: 'safety', name: 'Safety Reports' },
    { id: 'daily-log', name: 'Daily Logs' },
    { id: 'inspection', name: 'Inspections' },
    { id: 'change-order', name: 'Change Orders' },
    { id: 'progress', name: 'Progress Reports' },
    { id: 'custom', name: 'Custom' }
  ];

  const filteredTemplates = templates.filter(template => 
    selectedCategory === 'all' || template.category === selectedCategory
  );

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      'safety': '🛡️',
      'daily-log': '📋',
      'inspection': '🔍',
      'change-order': '📝',
      'progress': '📊',
      'custom': '⚙️'
    };
    return icons[category] || '📄';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Document Templates</Text>
        <TouchableOpacity style={styles.createButton} onPress={onCreateNew}>
          <Text style={styles.createButtonText}>+ Create New</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal style={styles.categoryScroll} showsHorizontalScrollIndicator={false}>
        {categories.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[styles.categoryButton, selectedCategory === category.id && styles.selectedCategory]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Text style={[styles.categoryText, selectedCategory === category.id && styles.selectedCategoryText]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.templateList}>
        {filteredTemplates.map(template => (
          <TouchableOpacity
            key={template.id}
            style={styles.templateCard}
            onPress={() => onSelectTemplate(template)}
          >
            <View style={styles.templateHeader}>
              <Text style={styles.templateIcon}>{getCategoryIcon(template.category)}</Text>
              <View style={styles.templateInfo}>
                <Text style={styles.templateName}>{template.name}</Text>
                <Text style={styles.templateDescription}>{template.description}</Text>
              </View>
              {template.isPublic && (
                <View style={styles.publicBadge}>
                  <Text style={styles.publicBadgeText}>Built-in</Text>
                </View>
              )}
            </View>
            <Text style={styles.fieldCount}>{template.fields.length} fields</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: 'white' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  createButton: { backgroundColor: '#007AFF', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  createButtonText: { color: 'white', fontWeight: '600' },
  categoryScroll: { backgroundColor: 'white', paddingVertical: 12 },
  categoryButton: { paddingHorizontal: 16, paddingVertical: 8, marginHorizontal: 4, borderRadius: 20, backgroundColor: '#f0f0f0' },
  selectedCategory: { backgroundColor: '#007AFF' },
  categoryText: { fontSize: 14, color: '#666' },
  selectedCategoryText: { color: 'white' },
  templateList: { flex: 1, padding: 16 },
  templateCard: { backgroundColor: 'white', padding: 16, marginBottom: 12, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  templateHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  templateIcon: { fontSize: 24, marginRight: 12 },
  templateInfo: { flex: 1 },
  templateName: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 4 },
  templateDescription: { fontSize: 14, color: '#666' },
  publicBadge: { backgroundColor: '#28a745', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  publicBadgeText: { fontSize: 12, color: 'white', fontWeight: '500' },
  fieldCount: { fontSize: 12, color: '#999', marginTop: 8 }
});