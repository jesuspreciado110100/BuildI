import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { DocumentTemplate, TemplateField } from '../services/DocumentTemplateService';

interface TemplateRendererProps {
  template: DocumentTemplate;
  initialData?: { [key: string]: any };
  onSave: (data: { [key: string]: any }) => void;
  onCancel: () => void;
}

export const TemplateRenderer: React.FC<TemplateRendererProps> = ({ 
  template, 
  initialData = {}, 
  onSave, 
  onCancel 
}) => {
  const [formData, setFormData] = useState<{ [key: string]: any }>(initialData);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    autoPopulateFields();
  }, [template]);

  const autoPopulateFields = () => {
    const autoData: { [key: string]: any } = {};
    
    template.fields.forEach(field => {
      if (field.autoPopulate && !formData[field.id]) {
        switch (field.autoPopulate.source) {
          case 'date':
            if (field.autoPopulate.field === 'current') {
              autoData[field.id] = new Date().toISOString().split('T')[0];
            }
            break;
          case 'user':
            if (field.autoPopulate.field === 'name') {
              autoData[field.id] = 'Current User'; // In real app, get from auth context
            }
            break;
          case 'site':
            if (field.autoPopulate.field === 'name') {
              autoData[field.id] = 'Current Site'; // In real app, get from context
            }
            break;
        }
      }
    });

    if (Object.keys(autoData).length > 0) {
      setFormData(prev => ({ ...prev, ...autoData }));
    }
  };

  const validateField = (field: TemplateField, value: any): string | null => {
    if (field.required && (!value || value.toString().trim() === '')) {
      return `${field.name} is required`;
    }

    if (field.validation) {
      if (field.type === 'number' && value) {
        const num = Number(value);
        if (field.validation.min !== undefined && num < field.validation.min) {
          return `${field.name} must be at least ${field.validation.min}`;
        }
        if (field.validation.max !== undefined && num > field.validation.max) {
          return `${field.name} must be no more than ${field.validation.max}`;
        }
      }

      if (field.validation.pattern && value) {
        const regex = new RegExp(field.validation.pattern);
        if (!regex.test(value.toString())) {
          return `${field.name} format is invalid`;
        }
      }
    }

    return null;
  };

  const updateField = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
    
    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors(prev => ({ ...prev, [fieldId]: '' }));
    }
  };

  const handleSave = () => {
    const newErrors: { [key: string]: string } = {};
    
    template.fields.forEach(field => {
      const error = validateField(field, formData[field.id]);
      if (error) {
        newErrors[field.id] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      Alert.alert('Validation Error', 'Please fix the errors before saving.');
      return;
    }

    onSave(formData);
  };

  const renderField = (field: TemplateField) => {
    const value = formData[field.id] || '';
    const error = errors[field.id];

    switch (field.type) {
      case 'text':
        return (
          <TextInput
            style={[styles.input, error && styles.inputError]}
            placeholder={field.name}
            value={value}
            onChangeText={(text) => updateField(field.id, text)}
          />
        );

      case 'number':
        return (
          <TextInput
            style={[styles.input, error && styles.inputError]}
            placeholder={field.name}
            value={value.toString()}
            onChangeText={(text) => updateField(field.id, Number(text) || '')}
            keyboardType="numeric"
          />
        );

      case 'date':
        return (
          <TextInput
            style={[styles.input, error && styles.inputError]}
            placeholder={field.name}
            value={value}
            onChangeText={(text) => updateField(field.id, text)}
          />
        );

      case 'select':
        return (
          <View style={styles.selectContainer}>
            {field.validation?.options?.map(option => (
              <TouchableOpacity
                key={option}
                style={[styles.option, value === option && styles.selectedOption]}
                onPress={() => updateField(field.id, option)}
              >
                <Text style={[styles.optionText, value === option && styles.selectedOptionText]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        );

      case 'checkbox':
        return (
          <TouchableOpacity
            style={[styles.checkbox, value && styles.checkedBox]}
            onPress={() => updateField(field.id, !value)}
          >
            <Text style={styles.checkboxText}>{field.name}</Text>
          </TouchableOpacity>
        );

      default:
        return (
          <TextInput
            style={[styles.input, error && styles.inputError]}
            placeholder={field.name}
            value={value}
            onChangeText={(text) => updateField(field.id, text)}
          />
        );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel}>
          <Text style={styles.cancelButton}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{template.name}</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveButton}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {template.fields.map(field => (
          <View key={field.id} style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              {field.name}
              {field.required && <Text style={styles.required}> *</Text>}
            </Text>
            {renderField(field)}
            {errors[field.id] && (
              <Text style={styles.errorText}>{errors[field.id]}</Text>
            )}
          </View>
        ))}
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
  fieldContainer: { marginBottom: 20 },
  fieldLabel: { fontSize: 16, fontWeight: '500', marginBottom: 8, color: '#333' },
  required: { color: '#ff4444' },
  input: { backgroundColor: 'white', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0' },
  inputError: { borderColor: '#ff4444' },
  selectContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  option: { backgroundColor: '#f0f0f0', padding: 8, borderRadius: 6, margin: 4 },
  selectedOption: { backgroundColor: '#007AFF' },
  optionText: { color: '#333' },
  selectedOptionText: { color: 'white' },
  checkbox: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#f0f0f0', borderRadius: 8 },
  checkedBox: { backgroundColor: '#007AFF' },
  checkboxText: { color: '#333', fontSize: 16 },
  errorText: { color: '#ff4444', fontSize: 14, marginTop: 4 }
});