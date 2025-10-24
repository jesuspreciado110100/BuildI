import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Switch } from 'react-native';
import { AdminUser } from '../types';
import { AdminService } from '../services/AdminService';

interface AdminUsersTabProps {
  onUserSelect: (user: AdminUser) => void;
}

export const AdminUsersTab: React.FC<AdminUsersTabProps> = ({ onUserSelect }) => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, roleFilter]);

  const loadUsers = async () => {
    try {
      const data = await AdminService.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchQuery) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  };

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      await AdminService.toggleUserStatus(userId, isActive);
      setUsers(users.map(user => 
        user.id === userId ? { ...user, is_active: isActive } : user
      ));
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
  };

  const renderUser = ({ item }: { item: AdminUser }) => (
    <View style={styles.userCard}>
      <TouchableOpacity onPress={() => onUserSelect(item)} style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
        <Text style={styles.userRole}>{item.role}</Text>
        <Text style={styles.userStats}>
          Orders: {item.activity_summary.total_orders} | 
          Spent: ${item.activity_summary.total_spent}
        </Text>
      </TouchableOpacity>
      <View style={styles.userActions}>
        <Text style={styles.statusLabel}>Active</Text>
        <Switch
          value={item.is_active}
          onValueChange={(value) => toggleUserStatus(item.id, value)}
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.filters}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <View style={styles.roleFilters}>
          {['all', 'contractor', 'labor_chief', 'machinery_renter', 'material_supplier'].map(role => (
            <TouchableOpacity
              key={role}
              style={[styles.roleFilter, roleFilter === role && styles.activeFilter]}
              onPress={() => setRoleFilter(role)}
            >
              <Text style={[styles.roleFilterText, roleFilter === role && styles.activeFilterText]}>
                {role.replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <FlatList
        data={filteredUsers}
        renderItem={renderUser}
        keyExtractor={(item) => item.id}
        style={styles.userList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  filters: {
    marginBottom: 16,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  roleFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roleFilter: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  activeFilter: {
    backgroundColor: '#007AFF',
  },
  roleFilterText: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  activeFilterText: {
    color: 'white',
  },
  userList: {
    flex: 1,
  },
  userCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 12,
    color: '#007AFF',
    textTransform: 'capitalize',
    marginBottom: 4,
  },
  userStats: {
    fontSize: 12,
    color: '#888',
  },
  userActions: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
});