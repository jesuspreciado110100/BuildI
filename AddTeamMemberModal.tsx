import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';

interface AddTeamMemberModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (member: any) => void;
}

export const AddTeamMemberModal: React.FC<AddTeamMemberModalProps> = ({ visible, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    specialty: '',
    phone: '',
    email: '',
    status: 'active' as const,
  });

  const specialties = [
    'Estructuras', 'Albañilería', 'Electricidad', 'Plomería', 'Pintura', 
    'Carpintería', 'Soldadura', 'Excavación', 'Techado', 'Acabados'
  ];

  const handleSave = () => {
    if (!formData.name || !formData.role) {
      Alert.alert('Error', 'Complete los campos requeridos');
      return;
    }

    const memberData = {
      id: Date.now().toString(),
      ...formData,
      createdAt: new Date().toISOString(),
    };

    onSubmit(memberData);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      role: '',
      specialty: '',
      phone: '',
      email: '',
      status: 'active',
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose}>
            <Text style={styles.cancelButton}>Cancelar</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Nuevo Miembro</Text>
          <TouchableOpacity onPress={handleSave}>
            <Text style={styles.saveButton}>Guardar</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre Completo *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Ingrese el nombre completo"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Rol/Puesto *</Text>
            <TextInput
              style={styles.input}
              value={formData.role}
              onChangeText={(text) => setFormData({ ...formData, role: text })}
              placeholder="Ej: Maestro de Obra, Oficial, Ayudante"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Especialidad</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.specialtyContainer}>
              {specialties.map((specialty) => (
                <TouchableOpacity
                  key={specialty}
                  style={[
                    styles.specialtyButton,
                    formData.specialty === specialty && styles.specialtyButtonActive
                  ]}
                  onPress={() => setFormData({ ...formData, specialty })}
                >
                  <Text style={[
                    styles.specialtyText,
                    formData.specialty === specialty && styles.specialtyTextActive
                  ]}>
                    {specialty}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Teléfono</Text>
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              placeholder="Ingrese el teléfono"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              placeholder="Ingrese el email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Estado</Text>
            <View style={styles.statusContainer}>
              {[
                { id: 'active', label: 'Activo', color: '#10b981' },
                { id: 'inactive', label: 'Inactivo', color: '#ef4444' },
                { id: 'on_leave', label: 'Con Permiso', color: '#f59e0b' }
              ].map((status) => (
                <TouchableOpacity
                  key={status.id}
                  style={[
                    styles.statusButton,
                    formData.status === status.id && { backgroundColor: status.color, borderColor: status.color }
                  ]}
                  onPress={() => setFormData({ ...formData, status: status.id as any })}
                >
                  <Text style={[
                    styles.statusText,
                    formData.status === status.id && styles.statusTextActive
                  ]}>
                    {status.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  title: { fontSize: 18, fontWeight: '600', color: '#111827' },
  cancelButton: { fontSize: 16, color: '#6B7280' },
  saveButton: { fontSize: 16, color: '#3B82F6', fontWeight: '600' },
  form: { flex: 1, padding: 20 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#F9FAFB' },
  specialtyContainer: { flexDirection: 'row' },
  specialtyButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: '#D1D5DB', backgroundColor: 'white', marginRight: 8 },
  specialtyButtonActive: { backgroundColor: '#3B82F6', borderColor: '#3B82F6' },
  specialtyText: { fontSize: 12, color: '#6B7280' },
  specialtyTextActive: { color: 'white' },
  statusContainer: { flexDirection: 'row', gap: 8 },
  statusButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#D1D5DB', backgroundColor: 'white' },
  statusText: { fontSize: 14, color: '#6B7280' },
  statusTextActive: { color: 'white' }
});