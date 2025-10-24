import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { User } from '../types';

interface SimpleTopNavigationProps {
  user: User;
  onLogout: () => void;
}

export const SimpleTopNavigation: React.FC<SimpleTopNavigationProps> = ({
  user,
  onLogout
}) => {
  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'contractor': return 'Contractor';
      case 'labor_chief': return 'Labor Chief';
      case 'machinery_renter': return 'Machinery Renter';
      case 'material_supplier': return 'Material Supplier';
      case 'client': return 'Client';
      case 'investor': return 'Investor';
      case 'worker': return 'Worker';
      case 'admin': return 'Admin';
      default: return 'User';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <Text style={styles.userName}>
          {user.name}
        </Text>
        <Text style={styles.userRole}>
          {getRoleDisplayName(user.role)}
        </Text>
      </View>
      
      <View style={styles.rightSection}>
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={onLogout}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  leftSection: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  userRole: {
    fontSize: 14,
    marginTop: 2,
    color: '#64748b',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#ef4444',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});