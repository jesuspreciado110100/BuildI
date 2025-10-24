import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { LaborRequestService } from '../services/LaborRequestService';
import { useTheme } from '../context/ThemeContext';

interface LaborRequestFormProps {
  onSubmit: (request: any) => void;
  onCancel: () => void;
  siteId?: string;
  conceptId?: string;
}

export const LaborRequestForm: React.FC<LaborRequestFormProps> = ({
  onSubmit,
  onCancel,
  siteId,
  conceptId
}) => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tradeType: '',
    skillLevel: 'Intermediate',
    workersNeeded: '1',
    startDate: '',
    endDate: '',
    hourlyRate: '',
    location: '',
    requirements: '',
    urgency: 'Medium'
  });
  const [loading, setLoading] = useState(false);

  const tradeTypes = [
    'Carpenter', 'Electrician', 'Plumber', 'Mason', 'Painter',
    'Roofer', 'HVAC', 'Welder', 'Laborer', 'Foreman'
  ];

  const skillLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
  const urgencyLevels = ['Low', 'Medium', 'High', 'Urgent'];

  const handleSubmit = async () => {
    if (!formData.title || !formData.tradeType || !formData.startDate) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const request = {
        ...formData,
        workersNeeded: parseInt(formData.workersNeeded),
        hourlyRate: parseFloat(formData.hourlyRate),
        siteId,
        conceptId,
        status: 'pending'
      };

      await LaborRequestService.createRequest(request);
      onSubmit(request);
      Alert.alert('Success', 'Labor request submitted successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.form}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Request Labor</Text>

        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Job Title *</Text>
          <TextInput
            style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]}
            value={formData.title}
            onChangeText={(value) => updateField('title', value)}
            placeholder="Enter job title"
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Trade Type *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {tradeTypes.map((trade) => (
              <TouchableOpacity
                key={trade}
                style={[
                  styles.chip,
                  formData.tradeType === trade && styles.chipActive
                ]}
                onPress={() => updateField('tradeType', trade)}
              >
                <Text style={[
                  styles.chipText,
                  formData.tradeType === trade && styles.chipTextActive
                ]}>{trade}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Description</Text>
          <TextInput
            style={[styles.textArea, { borderColor: theme.colors.border, color: theme.colors.text }]}
            value={formData.description}
            onChangeText={(value) => updateField('description', value)}
            placeholder="Describe the work needed"
            placeholderTextColor={theme.colors.textSecondary}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.field, styles.halfField]}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Workers Needed</Text>
            <TextInput
              style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]}
              value={formData.workersNeeded}
              onChangeText={(value) => updateField('workersNeeded', value)}
              placeholder="1"
              keyboardType="numeric"
            />
          </View>

          <View style={[styles.field, styles.halfField]}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Hourly Rate ($)</Text>
            <TextInput
              style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]}
              value={formData.hourlyRate}
              onChangeText={(value) => updateField('hourlyRate', value)}
              placeholder="25.00"
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Skill Level</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {skillLevels.map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.chip,
                  formData.skillLevel === level && styles.chipActive
                ]}
                onPress={() => updateField('skillLevel', level)}
              >
                <Text style={[
                  styles.chipText,
                  formData.skillLevel === level && styles.chipTextActive
                ]}>{level}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.row}>
          <View style={[styles.field, styles.halfField]}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Start Date *</Text>
            <TextInput
              style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]}
              value={formData.startDate}
              onChangeText={(value) => updateField('startDate', value)}
              placeholder="YYYY-MM-DD"
            />
          </View>

          <View style={[styles.field, styles.halfField]}>
            <Text style={[styles.label, { color: theme.colors.text }]}>End Date</Text>
            <TextInput
              style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]}
              value={formData.endDate}
              onChangeText={(value) => updateField('endDate', value)}
              placeholder="YYYY-MM-DD"
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Location</Text>
          <TextInput
            style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]}
            value={formData.location}
            onChangeText={(value) => updateField('location', value)}
            placeholder="Work location"
          />
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Urgency</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {urgencyLevels.map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.chip,
                  formData.urgency === level && styles.chipActive
                ]}
                onPress={() => updateField('urgency', level)}
              >
                <Text style={[
                  styles.chipText,
                  formData.urgency === level && styles.chipTextActive
                ]}>{level}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Requirements</Text>
          <TextInput
            style={[styles.textArea, { borderColor: theme.colors.border, color: theme.colors.text }]}
            value={formData.requirements}
            onChangeText={(value) => updateField('requirements', value)}
            placeholder="Special requirements or certifications needed"
            placeholderTextColor={theme.colors.textSecondary}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onCancel}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.submitButton]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Submitting...' : 'Submit Request'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  form: { padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  field: { marginBottom: 16 },
  halfField: { flex: 1, marginHorizontal: 4 },
  row: { flexDirection: 'row', marginHorizontal: -4 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16 },
  textArea: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, textAlignVertical: 'top' },
  chip: { backgroundColor: '#f0f0f0', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8, marginBottom: 8 },
  chipActive: { backgroundColor: '#2196F3' },
  chipText: { fontSize: 14, color: '#666' },
  chipTextActive: { color: '#fff' },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 },
  button: { flex: 1, paddingVertical: 12, borderRadius: 8, marginHorizontal: 4 },
  cancelButton: { backgroundColor: '#f5f5f5', borderWidth: 1, borderColor: '#ddd' },
  submitButton: { backgroundColor: '#2196F3' },
  cancelButtonText: { textAlign: 'center', fontSize: 16, color: '#666' },
  submitButtonText: { textAlign: 'center', fontSize: 16, color: '#fff', fontWeight: '600' }
});