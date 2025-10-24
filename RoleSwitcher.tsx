import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList } from 'react-native';
import { styles } from './RoleSwitcherStyles';

interface Role {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface RoleSwitcherProps {
  onClose: () => void;
  onRoleChange: (role: string) => void;
}

const availableRoles: Role[] = [
  {
    id: 'contractor',
    name: 'Contractor',
    description: 'Manage projects and teams',
    icon: '👷'
  },
  {
    id: 'client',
    name: 'Client',
    description: 'Post projects and hire contractors',
    icon: '🏢'
  },
  {
    id: 'builder',
    name: 'Builder',
    description: 'Execute construction work',
    icon: '🔨'
  },
  {
    id: 'chief-of-labor',
    name: 'Chief of Labor',
    description: 'Manage workforce and crews',
    icon: '👨‍💼'
  }
];

export default function RoleSwitcher({ onClose, onRoleChange }: RoleSwitcherProps) {
  const [selectedRole, setSelectedRole] = useState<string>('contractor');

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role.id);
    onRoleChange(role.id);
    onClose();
  };

  const renderRoleItem = ({ item }: { item: Role }) => (
    <TouchableOpacity
      style={[styles.roleCard, item.id === selectedRole && styles.selectedRoleCard]}
      onPress={() => handleRoleSelect(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.roleIconContainer, item.id === selectedRole && styles.selectedIconContainer]}>
        <Text style={styles.roleIcon}>{item.icon}</Text>
      </View>
      <View style={styles.roleContent}>
        <Text style={[styles.roleName, item.id === selectedRole && styles.selectedRoleName]}>{item.name}</Text>
        <Text style={styles.roleDescription}>{item.description}</Text>
      </View>
      {item.id === selectedRole && (
        <View style={styles.checkmarkContainer}>
          <Text style={styles.checkmark}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={true}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Switch Role</Text>
          <Text style={styles.modalSubtitle}>Choose your workspace role</Text>
        </View>
        
        <FlatList
          data={availableRoles}
          renderItem={renderRoleItem}
          keyExtractor={(item) => item.id}
          style={styles.rolesList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.rolesListContent}
        />
        
        <View style={styles.modalFooter}>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={onClose}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}