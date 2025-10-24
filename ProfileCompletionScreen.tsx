import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';


export function ProfileCompletionScreen() {
  const { user, updateUser, setNeedsProfileCompletion } = useAuth();

  const [companyName, setCompanyName] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');
  const [rfc, setRfc] = useState('');
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const pickImage = async () => {
    Alert.alert('Foto de Perfil', 'La funcionalidad de imagen estará disponible pronto');
  };


  const validateStep = () => {
    switch (currentStep) {
      case 1:
        if (!companyName.trim()) {
          Alert.alert('Error', 'Por favor ingresa el nombre de tu empresa');
          return false;
        }
        return true;
      case 2:
        if (!location.trim()) {
          Alert.alert('Error', 'Por favor ingresa tu ubicación');
          return false;
        }
        return true;
      case 3:
        if (!phone.trim() || phone.length < 10) {
          Alert.alert('Error', 'Por favor ingresa un número de teléfono válido');
          return false;
        }
        return true;
      case 4:
        if (!rfc.trim() || rfc.length < 12) {
          Alert.alert('Error', 'Por favor ingresa un RFC válido');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep()) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      } else {
        handleComplete();
      }
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          company_name: companyName,
          location: location,
          phone: phone,
          rfc: rfc,
          profile_picture_url: profilePicture,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user?.id);

      if (error) throw error;

      // Update user state and clear profile completion flag
      updateUser({ 
        onboarding_completed: true,
        phone: phone
      });
      setNeedsProfileCompletion(false);
      
      Alert.alert('¡Éxito!', 'Tu perfil ha sido completado. Serás redirigido a tu dashboard.');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Completa tu Perfil</Text>
        <Text style={styles.subtitle}>Paso {currentStep} de {totalSteps}</Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>

      <View style={styles.content}>
        {currentStep === 1 && (
          <View style={styles.stepContainer}>
            <Ionicons name="business-outline" size={48} color="#0EA5E9" style={styles.stepIcon} />
            <Text style={styles.stepTitle}>Nombre de la Empresa</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Constructora ABC"
              value={companyName}
              onChangeText={setCompanyName}
            />
          </View>
        )}

        {currentStep === 2 && (
          <View style={styles.stepContainer}>
            <Ionicons name="location-outline" size={48} color="#0EA5E9" style={styles.stepIcon} />
            <Text style={styles.stepTitle}>Ubicación</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Ciudad de México"
              value={location}
              onChangeText={setLocation}
            />
          </View>
        )}

        {currentStep === 3 && (
          <View style={styles.stepContainer}>
            <Ionicons name="call-outline" size={48} color="#0EA5E9" style={styles.stepIcon} />
            <Text style={styles.stepTitle}>Teléfono</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: 5512345678"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>
        )}

        {currentStep === 4 && (
          <View style={styles.stepContainer}>
            <Ionicons name="document-text-outline" size={48} color="#0EA5E9" style={styles.stepIcon} />
            <Text style={styles.stepTitle}>RFC</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: XAXX010101000"
              value={rfc}
              onChangeText={setRfc}
              autoCapitalize="characters"
              maxLength={13}
            />
            <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
              <Ionicons name="camera-outline" size={24} color="#0EA5E9" />
              <Text style={styles.imageButtonText}>Foto de Perfil (Opcional)</Text>
            </TouchableOpacity>
            {profilePicture && (
              <Image source={{ uri: profilePicture }} style={styles.profileImage} />
            )}
          </View>
        )}
      </View>

      <View style={styles.buttonContainer}>
        {currentStep > 1 && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setCurrentStep(currentStep - 1)}
          >
            <Text style={styles.backButtonText}>Atrás</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.nextButton, currentStep === 1 && styles.fullWidthButton]}
          onPress={handleNext}
          disabled={isLoading}
        >
          <Text style={styles.nextButtonText}>
            {currentStep === totalSteps ? (isLoading ? 'Guardando...' : 'Completar') : 'Siguiente'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20 },
  title: { fontSize: 28, fontWeight: '700', color: '#1E293B' },
  subtitle: { fontSize: 16, color: '#64748B', marginTop: 8 },
  progressContainer: { paddingHorizontal: 20, marginBottom: 30 },
  progressBar: { height: 8, backgroundColor: '#E2E8F0', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#0EA5E9' },
  content: { paddingHorizontal: 20 },
  stepContainer: { alignItems: 'center' },
  stepIcon: { marginBottom: 20 },
  stepTitle: { fontSize: 20, fontWeight: '600', color: '#1E293B', marginBottom: 20 },
  input: { width: '100%', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, fontSize: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  imageButton: { flexDirection: 'row', alignItems: 'center', marginTop: 20, padding: 16, backgroundColor: '#EFF6FF', borderRadius: 12 },
  imageButtonText: { marginLeft: 12, fontSize: 16, fontWeight: '600', color: '#0EA5E9' },
  profileImage: { width: 120, height: 120, borderRadius: 60, marginTop: 20 },
  buttonContainer: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 30, gap: 12 },
  backButton: { flex: 1, padding: 16, borderRadius: 12, backgroundColor: '#E2E8F0', alignItems: 'center' },
  backButtonText: { fontSize: 16, fontWeight: '600', color: '#64748B' },
  nextButton: { flex: 1, padding: 16, borderRadius: 12, backgroundColor: '#0EA5E9', alignItems: 'center' },
  fullWidthButton: { flex: 1 },
  nextButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
});
