import React, { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { MachinerySupabaseService, MachineryItem, MachineryType } from '../services/MachinerySupabaseService';

interface EditMachineryModalProps {
  machinery: MachineryItem;
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function EditMachineryModal({ machinery, visible, onClose, onSave }: EditMachineryModalProps) {
  const [name, setName] = useState(machinery.name);
  const [model, setModel] = useState(machinery.model || '');
  const [capacity, setCapacity] = useState(machinery.capacity || '');
  const [location, setLocation] = useState(machinery.location || '');
  const [dailyRate, setDailyRate] = useState(machinery.daily_rate?.toString() || '');
  const [hourlyRate, setHourlyRate] = useState(machinery.hourly_rate?.toString() || '');
  const [description, setDescription] = useState(machinery.description || '');
  const [machineryTypeId, setMachineryTypeId] = useState(machinery.machinery_type_id || '');
  const [availabilityStatus, setAvailabilityStatus] = useState(machinery.availability_status);
  const [machineryTypes, setMachineryTypes] = useState<MachineryType[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadMachineryTypes();
  }, []);

  const loadMachineryTypes = async () => {
    const types = await MachinerySupabaseService.getMachineryTypes();
    setMachineryTypes(types);
  };

  const handleSave = async () => {
    if (!name || !model || !dailyRate || !machineryTypeId || !location) {
      Alert.alert('Error', 'Please complete all required fields');
      return;
    }

    setIsSaving(true);
    try {
      const result = await MachinerySupabaseService.updateMachinery(machinery.id, {
        name,
        model,
        capacity,
        location,
        daily_rate: parseFloat(dailyRate),
        hourly_rate: hourlyRate ? parseFloat(hourlyRate) : undefined,
        description,
        machinery_type_id: machineryTypeId,
        availability_status: availabilityStatus,
      });

      if (result.success) {
        Alert.alert('Success', 'Machinery updated successfully');
        onSave();
      } else {
        Alert.alert('Error', result.error || 'Could not update machinery');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.title}>Edit Machinery</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.label}>Machinery Type *</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={machineryTypeId} onValueChange={setMachineryTypeId}>
                <Picker.Item label="Select type..." value="" />
                {machineryTypes.map((type) => (
                  <Picker.Item key={type.id} label={type.name} value={type.id} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Name *</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Machinery name" />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Model *</Text>
            <TextInput style={styles.input} value={model} onChangeText={setModel} placeholder="Model" />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Location *</Text>
            <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder="Location" />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Capacity</Text>
            <TextInput style={styles.input} value={capacity} onChangeText={setCapacity} placeholder="Capacity" />
          </View>

          <View style={styles.row}>
            <View style={[styles.section, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>Daily Rate *</Text>
              <TextInput style={styles.input} value={dailyRate} onChangeText={setDailyRate} keyboardType="numeric" />
            </View>
            <View style={[styles.section, { flex: 1 }]}>
              <Text style={styles.label}>Hourly Rate</Text>
              <TextInput style={styles.input} value={hourlyRate} onChangeText={setHourlyRate} keyboardType="numeric" />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Status</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={availabilityStatus} onValueChange={(val: any) => setAvailabilityStatus(val)}>
                <Picker.Item label="Available" value="available" />
                <Picker.Item label="Rented" value="rented" />
                <Picker.Item label="Maintenance" value="maintenance" />
              </Picker>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Description</Text>
            <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} multiline numberOfLines={4} />
          </View>

          <TouchableOpacity style={[styles.saveButton, isSaving && styles.disabledButton]} onPress={handleSave} disabled={isSaving}>
            {isSaving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveButtonText}>Save Changes</Text>}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  title: { fontSize: 18, fontWeight: '600', color: '#1E293B' },
  content: { flex: 1, padding: 20 },
  section: { marginBottom: 20 },
  row: { flexDirection: 'row' },
  label: { fontSize: 16, fontWeight: '600', color: '#1E293B', marginBottom: 8 },
  input: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 12, fontSize: 16 },
  pickerContainer: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, overflow: 'hidden' },
  textArea: { height: 100, textAlignVertical: 'top' },
  saveButton: { backgroundColor: '#0EA5E9', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 20, marginBottom: 40 },
  saveButtonText: { fontSize: 16, fontWeight: '600', color: '#FFF' },
  disabledButton: { backgroundColor: '#94A3B8' },
});
