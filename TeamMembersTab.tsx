import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import AddTeamMemberModal from './AddTeamMemberModal';
import TeamMemberDetailsModal from './TeamMemberDetailsModal';
import TeamMemberRoleAssignment from './TeamMemberRoleAssignment';
interface TeamMember {
  id: string;
  name: string;
  role: string;
  specialty?: string;
  phone?: string;
  email?: string;
  status: 'active' | 'inactive' | 'on_leave';
  assignedRoles?: string[];
}

const TeamMembersTab: React.FC = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRoleAssignment, setShowRoleAssignment] = useState(false);
  const [roleAssignmentMember, setRoleAssignmentMember] = useState<TeamMember | null>(null);
  useEffect(() => {
    loadTeamMembers();
  }, [user]);

  const loadTeamMembers = async () => {
    if (user?.id) {
      const members = await UserService.getTeamMembers(user.id);
      setTeamMembers(members);
      setLoading(false);
    }
  };

  const handleAddMember = (memberData: any) => {
    setTeamMembers([...teamMembers, memberData]);
    setShowAddModal(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'inactive': return '#ef4444';
      case 'on_leave': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getSpecialtyIcon = (specialty: string) => {
    switch (specialty?.toLowerCase()) {
      case 'estructuras': return '🏗️';
      case 'albañilería': return '🧱';
      case 'electricidad': return '⚡';
      case 'plomería': return '🔧';
      case 'pintura': return '🎨';
      default: return '👷';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando equipo...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>👥 Equipo de Trabajo</Text>
        <Text style={styles.subtitle}>Auditorio Cívico - Magdalena de Kino</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{teamMembers.length}</Text>
          <Text style={styles.statLabel}>Miembros Activos</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>2</Text>
          <Text style={styles.statLabel}>Especialidades</Text>
        </View>
      </View>

      <View style={styles.membersContainer}>
        {teamMembers.map((member) => (
          <View key={member.id} style={styles.memberCard}>
            <View style={styles.memberHeader}>
              <View style={styles.memberInfo}>
                <Text style={styles.memberIcon}>
                  {getSpecialtyIcon(member.specialty || '')}
                </Text>
                <View style={styles.memberDetails}>
                  <Text style={styles.memberName}>{member.name}</Text>
                  <Text style={styles.memberRole}>{member.role}</Text>
                </View>
              </View>
              <View 
                style={[styles.statusBadge, { backgroundColor: getStatusColor(member.status) }]}
              >
                <Text style={styles.statusText}>
                  {member.status === 'active' ? 'Activo' : member.status}
                </Text>
              </View>
            </View>

            <View style={styles.memberFooter}>
              <View style={styles.contactInfo}>
                <Text style={styles.specialty}>📋 {member.specialty}</Text>
                {member.phone && (
                  <Text style={styles.phone}>📱 {member.phone}</Text>
                )}
              </View>
              <TouchableOpacity style={styles.contactButton}>
                <Text style={styles.contactButtonText}>Contactar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
        <Text style={styles.addButtonIcon}>➕</Text>
        <Text style={styles.addButtonText}>Agregar Miembro</Text>
      </TouchableOpacity>

      <AddTeamMemberModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddMember}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16, color: '#6b7280', fontFamily: 'System' },
  header: { padding: 20, backgroundColor: 'white', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#1f2937', marginBottom: 4, fontFamily: 'System' },
  subtitle: { fontSize: 14, color: '#6b7280', fontFamily: 'System' },
  statsContainer: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: 'white', padding: 16, borderRadius: 12, marginHorizontal: 4, alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: '700', color: '#3b82f6', fontFamily: 'System' },
  statLabel: { fontSize: 12, color: '#6b7280', marginTop: 4, fontFamily: 'System' },
  membersContainer: { paddingHorizontal: 16 },
  memberCard: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  memberHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  memberInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  memberIcon: { fontSize: 32, marginRight: 12 },
  memberDetails: { flex: 1 },
  memberName: { fontSize: 18, fontWeight: '600', color: '#1f2937', fontFamily: 'System' },
  memberRole: { fontSize: 14, color: '#6b7280', marginTop: 2, fontFamily: 'System' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, color: 'white', fontWeight: '500', fontFamily: 'System' },
  memberFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  contactInfo: { flex: 1 },
  specialty: { fontSize: 14, color: '#374151', marginBottom: 4, fontFamily: 'System' },
  phone: { fontSize: 14, color: '#374151', fontFamily: 'System' },
  contactButton: { backgroundColor: '#3b82f6', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  contactButtonText: { color: 'white', fontSize: 14, fontWeight: '500', fontFamily: 'System' },
  addButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#10b981', margin: 16, padding: 16, borderRadius: 12 },
  addButtonIcon: { fontSize: 20, marginRight: 8 },
  addButtonText: { color: 'white', fontSize: 16, fontWeight: '600', fontFamily: 'System' }
});