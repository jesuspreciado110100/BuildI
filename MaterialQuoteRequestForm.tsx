import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface MaterialQuoteRequestFormProps {
  onClose: () => void;
}

export default function MaterialQuoteRequestForm({ onClose }: MaterialQuoteRequestFormProps) {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    materialName: '',
    quantity: '',
    unit: '',
    urgency: 'Normal',
    location: '',
    notes: ''
  });

  const urgencyLevels = ['Low', 'Normal', 'High', 'Urgent'];
  const units = ['Tons', 'Cubic Yards', 'Square Feet', 'Linear Feet', 'Pieces', 'Bags'];

  const handleSubmit = () => {
    if (!formData.materialName || !formData.quantity) {
      Alert.alert('Error', 'Please fill in material name and quantity');
      return;
    }

    console.log('Submitting quote request:', formData);
    Alert.alert('Success', 'Quote request sent to suppliers!');
    onClose();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Request Material Quote</Text>
        <TouchableOpacity onPress={onClose}>
          <Text style={[styles.closeButton, { color: theme.colors.primary }]}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.form}>
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Material Name *</Text>
          <TextInput
            style={[styles.input, { 
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surface,
              color: theme.colors.text
            }]}
            placeholder="e.g., Concrete, Steel Rebar, Lumber"
            placeholderTextColor={theme.colors.textSecondary}
            value={formData.materialName}
            onChangeText={(text) => setFormData(prev => ({ ...prev, materialName: text }))}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Quantity *</Text>
            <TextInput
              style={[styles.input, { 
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surface,
                color: theme.colors.text
              }]}
              placeholder="100"
              placeholderTextColor={theme.colors.textSecondary}
              value={formData.quantity}
              onChangeText={(text) => setFormData(prev => ({ ...prev, quantity: text }))}
              keyboardType="numeric"
            />
          </View>
          <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Unit</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.unitButtons}>
                {units.map((unit) => (
                  <TouchableOpacity
                    key={unit}
                    style={[styles.unitButton, 
                      formData.unit === unit && { backgroundColor: theme.colors.primary }
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, unit }))}
                  >
                    <Text style={[styles.unitButtonText, {
                      color: formData.unit === unit ? '#fff' : theme.colors.text
                    }]}>{unit}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Urgency</Text>
          <View style={styles.urgencyButtons}>
            {urgencyLevels.map((level) => (
              <TouchableOpacity
                key={level}
                style={[styles.urgencyButton, 
                  formData.urgency === level && { backgroundColor: theme.colors.primary }
                ]}
                onPress={() => setFormData(prev => ({ ...prev, urgency: level }))}
              >
                <Text style={[styles.urgencyButtonText, {
                  color: formData.urgency === level ? '#fff' : theme.colors.text
                }]}>{level}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Delivery Location</Text>
          <TextInput
            style={[styles.input, { 
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surface,
              color: theme.colors.text
            }]}
            placeholder="Site address or area"
            placeholderTextColor={theme.colors.textSecondary}
            value={formData.location}
            onChangeText={(text) => setFormData(prev => ({ ...prev, location: text }))}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Additional Notes</Text>
          <TextInput
            style={[styles.textArea, { 
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surface,
              color: theme.colors.text
            }]}
            placeholder="Special requirements, quality specs, etc."
            placeholderTextColor={theme.colors.textSecondary}
            value={formData.notes}
            onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
            multiline
            numberOfLines={4}
          />
        </View>

        <TouchableOpacity 
          style={[styles.submitButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>📨 Send Quote Request</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  closeButton: { fontSize: 24, fontWeight: 'bold' },
  form: { flex: 1, padding: 16 },
  formGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16 },
  textArea: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, height: 100, textAlignVertical: 'top' },
  row: { flexDirection: 'row' },
  unitButtons: { flexDirection: 'row' },
  unitButton: { paddingHorizontal: 8, paddingVertical: 6, backgroundColor: '#f0f0f0', borderRadius: 12, marginRight: 4 },
  unitButtonText: { fontSize: 12 },
  urgencyButtons: { flexDirection: 'row', flexWrap: 'wrap' },
  urgencyButton: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#f0f0f0', borderRadius: 16, marginRight: 8, marginBottom: 8 },
  urgencyButtonText: { fontSize: 14 },
  submitButton: { paddingVertical: 16, borderRadius: 8, alignItems: 'center', marginTop: 16, marginBottom: 32 },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});