import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AddTeamMemberModal } from './AddTeamMemberModal';
import { TeamMemberDetailsModal } from './TeamMemberDetailsModal';

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

export const EnhancedTeamMembersTab: React.FC = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'Carlos Mendez',
      role: 'Supervisor',
      specialty: 'Construcción',
      phone: '+1234567890',
      email: 'carlos@email.com',
      status: 'active',
      assignedTasks: 5,
      completedTasks: 3,
      joinDate: '2024-01-15',
    },
    {
      id: '2',
      name: 'Ana Rodriguez',
      role: 'Técnico',
      specialty: 'Electricidad',
      phone: '+1234567891',
      email: 'ana@email.com',
      status: 'active',
      assignedTasks: 3,
      completedTasks: 2,
      joinDate: '2024-02-01',
    },
  ]);

  const handleAddMember = (memberData: any) => {
    const newMember: TeamMember = {
      id: Date.now().toString(),
      ...memberData,
      assignedTasks: 0,
      completedTasks: 0,
      joinDate: new Date().toISOString().split('T')[0],
    };
    setTeamMembers(prev => [...prev, newMember]);
  };

  const handleRemoveMember = (memberId: string) => {
    Alert.alert(
      'Confirmar',
      '¿Está seguro de que desea eliminar este miembro del equipo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            setTeamMembers(prev => prev.filter(m => m.id !== memberId));
            setShowDetailsModal(false);
          },
        },
      ]
    );
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
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Miembros del Equipo ({teamMembers.length})</Text>
        <TouchableOpacity
          onPress={() => setShowAddModal(true)}
          style={{ backgroundColor: '#007AFF', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, flexDirection: 'row', alignItems: 'center' }}
        >
          <Ionicons name="add" size={16} color="#fff" />
          <Text style={{ color: '#fff', marginLeft: 5, fontWeight: '600' }}>Agregar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1, padding: 20 }}>
        {teamMembers.map((member) => (
          <TouchableOpacity
            key={member.id}
            onPress={() => {
              setSelectedMember(member);
              setShowDetailsModal(true);
            }}
            style={{ backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 4 }}>{member.name}</Text>
                <Text style={{ fontSize: 14, color: '#666', marginBottom: 2 }}>{member.role} • {member.specialty}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: getStatusColor(member.status), marginRight: 6 }} />
                  <Text style={{ fontSize: 12, color: '#666' }}>{getStatusText(member.status)}</Text>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 12, color: '#666', marginBottom: 2 }}>Tareas</Text>
                <Text style={{ fontSize: 14, fontWeight: '600' }}>{member.completedTasks}/{member.assignedTasks}</Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f0f0f0' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="call" size={14} color="#666" />
                <Text style={{ fontSize: 12, color: '#666', marginLeft: 4 }}>{member.phone}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="mail" size={14} color="#666" />
                <Text style={{ fontSize: 12, color: '#666', marginLeft: 4 }}>{member.email}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {teamMembers.length === 0 && (
          <View style={{ alignItems: 'center', padding: 40 }}>
            <Ionicons name="people-outline" size={48} color="#ccc" />
            <Text style={{ fontSize: 16, color: '#666', marginTop: 10, textAlign: 'center' }}>
              No hay miembros del equipo.{'\n'}Agregue el primer miembro.
            </Text>
          </View>
        )}
      </ScrollView>

      <AddTeamMemberModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddMember}
      />

      <TeamMemberDetailsModal
        visible={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        member={selectedMember}
        onRemove={handleRemoveMember}
      />
    </View>
  );
};