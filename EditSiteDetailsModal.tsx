import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Site {
  id: string;
  name: string;
  address: string;
  description: string;
  startDate: string;
  endDate: string;
  budget: string;
  status: string;
  clientName: string;
  projectManager: string;
}

interface EditSiteDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  site: Site | null;
  onSave: (updatedSite: Site) => void;
}

export const EditSiteDetailsModal: React.FC<EditSiteDetailsModalProps> = ({
  visible,
  onClose,
  site,
  onSave,
}) => {
  const [formData, setFormData] = useState<Site>(
    site || {
      id: '',
      name: '',
      address: '',
      description: '',
      startDate: '',
      endDate: '',
      budget: '',
      status: 'active',
      clientName: '',
      projectManager: '',
    }
  );

  const handleSave = () => {
    if (!formData.name || !formData.address) {
      Alert.alert('Error', 'Nombre y dirección son obligatorios');
      return;
    }
    onSave(formData);
    onClose();
  };

  const updateField = (field: keyof Site, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Editar Sitio</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1, padding: 20 }}>
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>Nombre del Proyecto *</Text>
            <TextInput
              value={formData.name}
              onChangeText={(value) => updateField('name', value)}
              style={{ backgroundColor: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0' }}
              placeholder="Ingrese el nombre del proyecto"
            />
          </View>

          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>Dirección *</Text>
            <TextInput
              value={formData.address}
              onChangeText={(value) => updateField('address', value)}
              style={{ backgroundColor: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0' }}
              placeholder="Ingrese la dirección"
            />
          </View>

          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>Descripción</Text>
            <TextInput
              value={formData.description}
              onChangeText={(value) => updateField('description', value)}
              style={{ backgroundColor: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0', height: 80 }}
              placeholder="Descripción del proyecto"
              multiline
            />
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
            <View style={{ flex: 0.48 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>Fecha Inicio</Text>
              <TextInput
                value={formData.startDate}
                onChangeText={(value) => updateField('startDate', value)}
                style={{ backgroundColor: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0' }}
                placeholder="DD/MM/YYYY"
              />
            </View>
            <View style={{ flex: 0.48 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>Fecha Fin</Text>
              <TextInput
                value={formData.endDate}
                onChangeText={(value) => updateField('endDate', value)}
                style={{ backgroundColor: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0' }}
                placeholder="DD/MM/YYYY"
              />
            </View>
          </View>

          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>Presupuesto</Text>
            <TextInput
              value={formData.budget}
              onChangeText={(value) => updateField('budget', value)}
              style={{ backgroundColor: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0' }}
              placeholder="$0.00"
              keyboardType="numeric"
            />
          </View>

          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>Cliente</Text>
            <TextInput
              value={formData.clientName}
              onChangeText={(value) => updateField('clientName', value)}
              style={{ backgroundColor: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0' }}
              placeholder="Nombre del cliente"
            />
          </View>

          <View style={{ marginBottom: 30 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>Gerente de Proyecto</Text>
            <TextInput
              value={formData.projectManager}
              onChangeText={(value) => updateField('projectManager', value)}
              style={{ backgroundColor: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0' }}
              placeholder="Nombre del gerente"
            />
          </View>
        </ScrollView>

        <View style={{ padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e0e0e0' }}>
          <TouchableOpacity
            onPress={handleSave}
            style={{ backgroundColor: '#007AFF', padding: 15, borderRadius: 8, alignItems: 'center' }}
          >
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Guardar Cambios</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};