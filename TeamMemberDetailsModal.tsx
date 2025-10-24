import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  specialty: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive' | 'on-leave';
  assignedTasks: number;
  completedTasks: number;
  joinDate: string;
}

interface TeamMemberDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  member: TeamMember | null;
  onRemove: (memberId: string) => void;
}

export const TeamMemberDetailsModal: React.FC<TeamMemberDetailsModalProps> = ({
  visible,
  onClose,
  member,
  onRemove,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<TeamMember | null>(null);

  React.useEffect(() => {
    if (member) {
      setEditData({ ...member });
    }
  }, [member]);

  if (!member || !editData) return null;

  const handleSave = () => {
    // Here you would typically save to your backend
    Alert.alert('Éxito', 'Cambios guardados correctamente');
    setIsEditing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'inactive': return '#f44336';
      case 'on-leave': return '#FF9800';
      default: return '#666';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'inactive': return 'Inactivo';
      case 'on-leave': return 'En Licencia';
      default: return status;
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Detalles del Miembro</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              onPress={() => setIsEditing(!isEditing)}
              style={{ marginRight: 15 }}
            >
              <Ionicons name={isEditing ? "checkmark" : "pencil"} size={24} color="#007AFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={{ flex: 1, padding: 20 }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 20, marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
              <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: '#007AFF', alignItems: 'center', justifyContent: 'center', marginRight: 15 }}>
                <Text style={{ color: '#fff', fontSize: 24, fontWeight: 'bold' }}>
                  {member.name.charAt(0)}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                {isEditing ? (
                  <TextInput
                    value={editData.name}
                    onChangeText={(text) => setEditData({...editData, name: text})}
                    style={{ fontSize: 20, fontWeight: 'bold', borderBottomWidth: 1, borderBottomColor: '#e0e0e0', paddingBottom: 5 }}
                  />
                ) : (
                  <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{member.name}</Text>
                )}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: getStatusColor(member.status), marginRight: 6 }} />
                  <Text style={{ fontSize: 14, color: '#666' }}>{getStatusText(member.status)}</Text>
                </View>
              </View>
            </View>

            <View style={{ marginBottom: 15 }}>
              <Text style={{ fontSize: 14, color: '#666', marginBottom: 5 }}>Rol</Text>
              {isEditing ? (
                <TextInput
                  value={editData.role}
                  onChangeText={(text) => setEditData({...editData, role: text})}
                  style={{ fontSize: 16, borderBottomWidth: 1, borderBottomColor: '#e0e0e0', paddingBottom: 5 }}
                />
              ) : (
                <Text style={{ fontSize: 16 }}>{member.role}</Text>
              )}
            </View>

            <View style={{ marginBottom: 15 }}>
              <Text style={{ fontSize: 14, color: '#666', marginBottom: 5 }}>Especialidad</Text>
              {isEditing ? (
                <TextInput
                  value={editData.specialty}
                  onChangeText={(text) => setEditData({...editData, specialty: text})}
                  style={{ fontSize: 16, borderBottomWidth: 1, borderBottomColor: '#e0e0e0', paddingBottom: 5 }}
                />
              ) : (
                <Text style={{ fontSize: 16 }}>{member.specialty}</Text>
              )}
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
              <View style={{ flex: 0.48 }}>
                <Text style={{ fontSize: 14, color: '#666', marginBottom: 5 }}>Tareas Asignadas</Text>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#007AFF' }}>{member.assignedTasks}</Text>
              </View>
              <View style={{ flex: 0.48 }}>
                <Text style={{ fontSize: 14, color: '#666', marginBottom: 5 }}>Tareas Completadas</Text>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#4CAF50' }}>{member.completedTasks}</Text>
              </View>
            </View>

            <View style={{ marginBottom: 15 }}>
              <Text style={{ fontSize: 14, color: '#666', marginBottom: 5 }}>Progreso</Text>
              <View style={{ backgroundColor: '#f0f0f0', height: 8, borderRadius: 4, marginBottom: 5 }}>
                <View 
                  style={{ 
                    backgroundColor: '#4CAF50', 
                    height: 8, 
                    borderRadius: 4, 
                    width: `${member.assignedTasks > 0 ? (member.completedTasks / member.assignedTasks) * 100 : 0}%` 
                  }} 
                />
              </View>
              <Text style={{ fontSize: 12, color: '#666' }}>
                {member.assignedTasks > 0 ? Math.round((member.completedTasks / member.assignedTasks) * 100) : 0}% completado
              </Text>
            </View>
          </View>

          <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 20, marginBottom: 20 }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 15 }}>Información de Contacto</Text>
            
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
              <Ionicons name="call" size={20} color="#666" style={{ marginRight: 10 }} />
              {isEditing ? (
                <TextInput
                  value={editData.phone}
                  onChangeText={(text) => setEditData({...editData, phone: text})}
                  style={{ flex: 1, fontSize: 16, borderBottomWidth: 1, borderBottomColor: '#e0e0e0', paddingBottom: 5 }}
                />
              ) : (
                <Text style={{ fontSize: 16 }}>{member.phone}</Text>
              )}
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
              <Ionicons name="mail" size={20} color="#666" style={{ marginRight: 10 }} />
              {isEditing ? (
                <TextInput
                  value={editData.email}
                  onChangeText={(text) => setEditData({...editData, email: text})}
                  style={{ flex: 1, fontSize: 16, borderBottomWidth: 1, borderBottomColor: '#e0e0e0', paddingBottom: 5 }}
                />
              ) : (
                <Text style={{ fontSize: 16 }}>{member.email}</Text>
              )}
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="calendar" size={20} color="#666" style={{ marginRight: 10 }} />
              <Text style={{ fontSize: 16 }}>Ingresó: {member.joinDate}</Text>
            </View>
          </View>

          {isEditing && (
            <TouchableOpacity
              onPress={handleSave}
              style={{ backgroundColor: '#007AFF', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 10 }}
            >
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Guardar Cambios</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => onRemove(member.id)}
            style={{ backgroundColor: '#f44336', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 20 }}
          >
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Eliminar Miembro</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
};