import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { MachineryPhotoUploader } from '../components/MachineryPhotoUploader';
import { MachinerySupabaseService, MachineryType } from '../services/MachinerySupabaseService';
import { useAuth } from '../context/AuthContext';

export default function AddMachineryScreen() {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [model, setModel] = useState('');
  const [capacity, setCapacity] = useState('');
  const [location, setLocation] = useState('');
  const [dailyRate, setDailyRate] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [description, setDescription] = useState('');
  const [machineryTypeId, setMachineryTypeId] = useState('');
  const [machineryTypes, setMachineryTypes] = useState<MachineryType[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMachineryTypes();
  }, []);

  const loadMachineryTypes = async () => {
    const types = await MachinerySupabaseService.getMachineryTypes();
    setMachineryTypes(types);
    setIsLoading(false);
  };

  const handleSubmit = async () => {
    if (!name || !model || !dailyRate || !machineryTypeId || !location) {
      Alert.alert('Error', 'Please complete all required fields');
      return;
    }

    if (!user?.id) {
      Alert.alert('Error', 'You must be logged in to add machinery');
      return;
    }

    setIsSubmitting(true);
    try {
      // Create machinery entry
      const result = await MachinerySupabaseService.createMachinery({
        name,
        model,
        capacity,
        location,
        daily_rate: parseFloat(dailyRate),
        hourly_rate: hourlyRate ? parseFloat(hourlyRate) : undefined,
        description,
        machinery_type_id: machineryTypeId,
        owner_id: user.id,
        availability_status: 'available',
      });

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to create machinery');
      }

      const machineryId = result.data.id;

      // Upload photos if any
      if (photos.length > 0) {
        const photosToUpload = photos.map((photo, index) => ({
          uri: photo.uri,
          displayOrder: index,
          caption: photo.caption,
        }));
        await MachinerySupabaseService.uploadMachineryPhotos(machineryId, photosToUpload);

        // Set first photo as main image
        if (photos[0]?.uri) {
          const mainImageUrl = await MachinerySupabaseService.uploadSinglePhoto(machineryId, photos[0].uri);
          if (mainImageUrl) {
            await MachinerySupabaseService.updateMachineryMainImage(machineryId, mainImageUrl);
          }
        }
      }

      Alert.alert('Success', 'Machinery added successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Could not add machinery');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#0EA5E9" style={{ marginTop: 50 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Machinery</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.label}>Machinery Type *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={machineryTypeId}
              onValueChange={setMachineryTypeId}
              style={styles.picker}
            >
              <Picker.Item label="Select type..." value="" />
              {machineryTypes.map((type) => (
                <Picker.Item key={type.id} label={type.name} value={type.id} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="E.g: Caterpillar Excavator"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Model *</Text>
          <TextInput
            style={styles.input}
            value={model}
            onChangeText={setModel}
            placeholder="E.g: CAT 320D"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Location *</Text>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="E.g: Mexico City, CDMX"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Capacity</Text>
          <TextInput
            style={styles.input}
            value={capacity}
            onChangeText={setCapacity}
            placeholder="E.g: 20 ton"
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.section, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.label}>Daily Rate (MXN) *</Text>
            <TextInput
              style={styles.input}
              value={dailyRate}
              onChangeText={setDailyRate}
              placeholder="2000"
              keyboardType="numeric"
            />
          </View>

          <View style={[styles.section, { flex: 1 }]}>
            <Text style={styles.label}>Hourly Rate (MXN)</Text>
            <TextInput
              style={styles.input}
              value={hourlyRate}
              onChangeText={setHourlyRate}
              placeholder="250"
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Machinery description..."
            multiline
            numberOfLines={4}
          />
        </View>

        <MachineryPhotoUploader
          machineryId="temp_id"
          existingPhotos={photos}
          onPhotosChange={setPhotos}
          maxPhotos={10}
        />

        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.submitButtonText}>Add Machinery</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingVertical: 16, 
    backgroundColor: '#FFF', 
    borderBottomWidth: 1, 
    borderBottomColor: '#E2E8F0' 
  },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#1E293B' },
  content: { flex: 1, padding: 20 },
  section: { marginBottom: 20 },
  row: { flexDirection: 'row' },
  label: { fontSize: 16, fontWeight: '600', color: '#1E293B', marginBottom: 8 },
  input: { 
    backgroundColor: '#FFF', 
    borderWidth: 1, 
    borderColor: '#E2E8F0', 
    borderRadius: 12, 
    padding: 12, 
    fontSize: 16 
  },
  pickerContainer: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    overflow: 'hidden',
  },
  picker: { height: 50 },
  textArea: { height: 100, textAlignVertical: 'top' },
  submitButton: { 
    backgroundColor: '#0EA5E9', 
    paddingVertical: 16, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginTop: 20, 
    marginBottom: 40 
  },
  submitButtonText: { fontSize: 16, fontWeight: '600', color: '#FFF' },
  disabledButton: { backgroundColor: '#94A3B8' },
});
