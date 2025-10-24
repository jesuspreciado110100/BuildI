import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, Alert } from 'react-native';

interface Role {
  id: string;
  name: string;
  permissions: string[];
  color: string;
}

interface TeamMemberRoleAssignmentProps {
  visible: boolean;
  onClose: () => void;
  memberId: string;
  memberName: string;
  currentRoles: string[];
  onRolesUpdate: (memberId: string, roles: string[]) => void;
}

const AVAILABLE_ROLES: Role[] = [
  { id: 'foreman', name: 'Foreman', permissions: ['site_management', 'team_oversight'], color: '#FF6B35' },
  { id: 'supervisor', name: 'Supervisor', permissions: ['progress_tracking', 'quality_control'], color: '#F7931E' },
  { id: 'safety_officer', name: 'Safety Officer', permissions: ['safety_compliance', 'incident_reporting'], color: '#FFD23F' },
  { id: 'quality_inspector', name: 'Quality Inspector', permissions: ['quality_checks', 'documentation'], color: '#06FFA5' },
  { id: 'project_coordinator', name: 'Project Coordinator', permissions: ['scheduling', 'communication'], color: '#118AB2' },
  { id: 'equipment_operator', name: 'Equipment Operator', permissions: ['machinery_operation'], color: '#073B4C' },
];

const TeamMemberRoleAssignment: React.FC<TeamMemberRoleAssignmentProps> = ({
  visible,
  onClose,
  memberId,
  memberName,
  currentRoles,
  onRolesUpdate,
}) => {
  const [selectedRoles, setSelectedRoles] = useState<string[]>(currentRoles);

  const toggleRole = (roleId: string) => {
    setSelectedRoles(prev => 
      prev.includes(roleId) 
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  };

  const handleSave = () => {
    onRolesUpdate(memberId, selectedRoles);
    Alert.alert('Success', `Roles updated for ${memberName}`);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Assign Roles</Text>
          <Text style={styles.subtitle}>{memberName}</Text>
        </View>

        <ScrollView style={styles.content}>
          {AVAILABLE_ROLES.map(role => (
            <TouchableOpacity
              key={role.id}
              style={[
                styles.roleCard,
                { borderColor: role.color },
                selectedRoles.includes(role.id) && { backgroundColor: role.color + '20' }
              ]}
              onPress={() => toggleRole(role.id)}
            >
              <View style={styles.roleHeader}>
                <View style={[styles.roleIndicator, { backgroundColor: role.color }]} />
                <Text style={styles.roleName}>{role.name}</Text>
                {selectedRoles.includes(role.id) && (
                  <Text style={styles.selectedBadge}>✓</Text>
                )}
              </View>
              <View style={styles.permissions}>
                {role.permissions.map(permission => (
                  <Text key={permission} style={styles.permission}>
                    • {permission.replace('_', ' ')}
                  </Text>
                ))}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveText}>Save Roles</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  subtitle: { fontSize: 16, color: '#666', marginTop: 4 },
  content: { flex: 1, padding: 16 },
  roleCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 2 },
  roleHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  roleIndicator: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  roleName: { fontSize: 18, fontWeight: '600', color: '#333', flex: 1 },
  selectedBadge: { fontSize: 18, color: '#4CAF50', fontWeight: 'bold' },
  permissions: { marginLeft: 24 },
  permission: { fontSize: 14, color: '#666', marginBottom: 2, textTransform: 'capitalize' },
  actions: { flexDirection: 'row', padding: 16, backgroundColor: '#fff' },
  cancelButton: { flex: 1, padding: 16, marginRight: 8, borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
  saveButton: { flex: 1, padding: 16, marginLeft: 8, borderRadius: 8, backgroundColor: '#007AFF' },
  cancelText: { textAlign: 'center', fontSize: 16, color: '#666' },
  saveText: { textAlign: 'center', fontSize: 16, color: '#fff', fontWeight: '600' },
});

export default TeamMemberRoleAssignment;