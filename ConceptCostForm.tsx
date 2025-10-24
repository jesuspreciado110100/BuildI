import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Modal } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Concept } from '../services/ConceptService';
import { ConceptCostData } from './ConceptCatalogManager';

interface ConceptCostFormProps {
  concept: Concept;
  onSave: (costData: ConceptCostData) => void;
  onCancel: () => void;
  initialData?: ConceptCostData;
}

export const ConceptCostForm: React.FC<ConceptCostFormProps> = ({
  concept,
  onSave,
  onCancel,
  initialData
}) => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState<ConceptCostData>(
    initialData || {
      machineryCost: 0,
      toolCost: 0,
      consumableCost: 0,
      materialCost: 0,
      laborCost: 0,
      suretiesCost: 0,
      officeCost: 0,
      transportationCost: 0,
      consultingCost: 0,
      salariesCost: 0,
    }
  );

  const updateCost = (field: keyof ConceptCostData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  const getTotalDirectCosts = () => {
    return formData.machineryCost + formData.toolCost + formData.consumableCost + 
           formData.materialCost + formData.laborCost;
  };

  const getTotalIndirectCosts = () => {
    return formData.suretiesCost + formData.officeCost + formData.transportationCost + 
           formData.consultingCost + formData.salariesCost;
  };

  const getTotalCost = () => {
    return getTotalDirectCosts() + getTotalIndirectCosts();
  };

  const costFields = [
    { key: 'machineryCost', label: 'Machinery Cost', section: 'direct' },
    { key: 'toolCost', label: 'Tool Cost', section: 'direct' },
    { key: 'consumableCost', label: 'Consumable Cost', section: 'direct' },
    { key: 'materialCost', label: 'Material Cost', section: 'direct' },
    { key: 'laborCost', label: 'Labor Cost', section: 'direct' },
    { key: 'suretiesCost', label: 'Sureties Cost', section: 'indirect' },
    { key: 'officeCost', label: 'Office Cost', section: 'indirect' },
    { key: 'transportationCost', label: 'Transportation Cost', section: 'indirect' },
    { key: 'consultingCost', label: 'Consulting Cost (App)', section: 'indirect' },
    { key: 'salariesCost', label: 'Team Salaries Cost', section: 'indirect' },
  ];

  return (
    <Modal visible={true} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <TouchableOpacity onPress={onCancel}>
            <Text style={[styles.cancelButton, { color: theme.colors.textSecondary }]}>Cancel</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Cost Data: {concept.description}
          </Text>
          <TouchableOpacity onPress={handleSave}>
            <Text style={[styles.saveButton, { color: theme.colors.primary }]}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Direct Costs</Text>
            {costFields.filter(field => field.section === 'direct').map(field => (
              <View key={field.key} style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.text }]}>{field.label}</Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: theme.colors.background,
                    borderColor: theme.colors.border,
                    color: theme.colors.text
                  }]}
                  value={formData[field.key as keyof ConceptCostData].toString()}
                  onChangeText={(value) => updateCost(field.key as keyof ConceptCostData, value)}
                  keyboardType="numeric"
                  placeholder="0.00"
                  placeholderTextColor={theme.colors.textSecondary}
                />
              </View>
            ))}
            <Text style={[styles.subtotal, { color: theme.colors.primary }]}>
              Direct Subtotal: ${getTotalDirectCosts().toLocaleString()}
            </Text>
          </View>

          <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Indirect Costs</Text>
            {costFields.filter(field => field.section === 'indirect').map(field => (
              <View key={field.key} style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.text }]}>{field.label}</Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: theme.colors.background,
                    borderColor: theme.colors.border,
                    color: theme.colors.text
                  }]}
                  value={formData[field.key as keyof ConceptCostData].toString()}
                  onChangeText={(value) => updateCost(field.key as keyof ConceptCostData, value)}
                  keyboardType="numeric"
                  placeholder="0.00"
                  placeholderTextColor={theme.colors.textSecondary}
                />
              </View>
            ))}
            <Text style={[styles.subtotal, { color: theme.colors.primary }]}>
              Indirect Subtotal: ${getTotalIndirectCosts().toLocaleString()}
            </Text>
          </View>

          <View style={[styles.totalSection, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.totalText}>
              Total Unitary Cost: ${getTotalCost().toLocaleString()}
            </Text>
            <Text style={styles.totalQuantityText}>
              Total for {concept.quantity} {concept.unit}: ${(getTotalCost() * concept.quantity).toLocaleString()}
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  cancelButton: {
    fontSize: 16,
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  subtotal: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'right',
    marginTop: 8,
  },
  totalSection: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  totalText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  totalQuantityText: {
    color: 'white',
    fontSize: 16,
    opacity: 0.9,
  },
});