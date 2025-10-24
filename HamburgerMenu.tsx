import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RoleSelector from './RoleSelector';
import { useAuth } from '../context/AuthContext';

interface HamburgerMenuProps {
  visible: boolean;
  onClose: () => void;
}

export default function HamburgerMenu({ visible, onClose }: HamburgerMenuProps) {
  const { updateUserRole } = useAuth();

  const handleRoleSelect = async (role: string) => {
    try {
      await updateUserRole(role);
      onClose();
    } catch (error) {
      console.error('Failed to update role:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.menuContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Menu</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>Switch Role</Text>
            <RoleSelector onSelectRole={handleRoleSelect} />
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}


const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    minHeight: '50%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    marginBottom: 16,
  },
});