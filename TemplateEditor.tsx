import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { DocumentTemplate, TemplateField, DocumentTemplateService } from '../services/DocumentTemplateService';

interface TemplateEditorProps {
  template?: DocumentTemplate;
  onSave: (template: DocumentTemplate) => void;
  onCancel: () => void;
}

export const TemplateEditor: React.FC<TemplateEditorProps> = ({ template, onSave, onCancel }) => {
  const [name, setName] = useState(template?.name || '');
  const [description, setDescription] = useState(template?.description || '');
  const [category, setCategory] = useState(template?.category || 'custom');
  const [fields, setFields] = useState<TemplateField[]>(template?.fields || []);
  const templateService = new DocumentTemplateService();

  const fieldTypes = [
    { value: 'text', label: 'Text' },
    { value: 'number', label: 'Number' },
    { value: 'date', label: 'Date' },
    { value: 'select', label: 'Dropdown' },
    { value: 'multiselect', label: 'Multi-select' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'signature', label: 'Signature' },
    { value: 'photo', label: 'Photo' }
  ];

  const categories = [
    { value: 'safety', label: 'Safety Report' },
    { value: 'daily-log', label: 'Daily Log' },
    { value: 'inspection', label: 'Inspection' },
    { value: 'change-order', label: 'Change Order' },
    { value: 'progress', label: 'Progress Report' },
    { value: 'custom', label: 'Custom' }
  ];

  const addField = () => {
    const newField: TemplateField = {
      id: `field_${Date.now()}`,
      name: '',
      type: 'text',
      required: false
    };
    setFields([...fields, newField]);
  };

  const updateField = (index: number, updates: Partial<TemplateField>) => {
    const updatedFields = fields.map((field, i) => 
      i === index ? { ...field, ...updates } : field
    );
    setFields(updatedFields);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    const newTemplate: DocumentTemplate = {
      id: template?.id || `template_${Date.now()}`,
      name,
      description,
      category: category as any,
      fields,
      isPublic: false,
      createdBy: 'current_user',
      createdAt: template?.createdAt || new Date().toISOString(),
      version: (template?.version || 0) + 1
    };

    const validation = await templateService.validateTemplate(newTemplate);
    if (!validation.isValid) {
      Alert.alert('Validation Error', validation.errors.join('\n'));
      return;
    }

    await templateService.saveTemplate(newTemplate);
    onSave(newTemplate);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel}>
          <Text style={styles.cancelButton}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{template ? 'Edit Template' : 'Create Template'}</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveButton}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Template Details</Text>
          <TextInput
            style={styles.input}
            placeholder="Template Name"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fields</Text>
          {fields.map((field, index) => (
            <View key={field.id} style={styles.fieldEditor}>
              <View style={styles.fieldHeader}>
                <TextInput
                  style={[styles.input, styles.fieldNameInput]}
                  placeholder="Field Name"
                  value={field.name}
                  onChangeText={(text) => updateField(index, { name: text })}
                />
                <TouchableOpacity onPress={() => removeField(index)}>
                  <Text style={styles.removeButton}>✕</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.fieldOptions}>
                <TouchableOpacity
                  style={[styles.checkbox, field.required && styles.checkedBox]}
                  onPress={() => updateField(index, { required: !field.required })}
                >
                  <Text style={styles.checkboxText}>Required</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
          <TouchableOpacity style={styles.addFieldButton} onPress={addField}>
            <Text style={styles.addFieldText}>+ Add Field</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  title: { fontSize: 18, fontWeight: 'bold' },
  cancelButton: { color: '#666', fontSize: 16 },
  saveButton: { color: '#007AFF', fontSize: 16, fontWeight: '600' },
  content: { flex: 1, padding: 16 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#333' },
  input: { backgroundColor: 'white', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0', marginBottom: 12 },
  textArea: { height: 80, textAlignVertical: 'top' },
  fieldEditor: { backgroundColor: 'white', padding: 12, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#e0e0e0' },
  fieldHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  fieldNameInput: { flex: 1, marginRight: 12, marginBottom: 0 },
  removeButton: { color: '#ff4444', fontSize: 18, fontWeight: 'bold' },
  fieldOptions: { flexDirection: 'row', alignItems: 'center' },
  checkbox: { flexDirection: 'row', alignItems: 'center', padding: 8, borderRadius: 4, backgroundColor: '#f0f0f0' },
  checkedBox: { backgroundColor: '#007AFF' },
  checkboxText: { color: '#333', fontSize: 14 },
  addFieldButton: { backgroundColor: '#007AFF', padding: 12, borderRadius: 8, alignItems: 'center' },
  addFieldText: { color: 'white', fontSize: 16, fontWeight: '600' }
});