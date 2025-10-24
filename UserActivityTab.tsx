import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput } from 'react-native';

interface UserActivity {
  id: string;
  name: string;
  email: string;
  role: 'contractor' | 'supplier' | 'labor_chief' | 'worker';
  lastLogin: string;
  jobsCreated: number;
  averageRating: number;
  totalEarnings: number;
  isActive: boolean;
}

export const UserActivityTab: React.FC = () => {
  const [users, setUsers] = useState<UserActivity[]>([
    {
      id: '1',
      name: 'John Smith',
      email: 'john@contractor.com',
      role: 'contractor',
      lastLogin: '2024-01-20T14:30:00Z',
      jobsCreated: 25,
      averageRating: 4.8,
      totalEarnings: 125000,
      isActive: true
    },
    {
      id: '2',
      name: 'Mike Johnson',
      email: 'mike@labor.com',
      role: 'labor_chief',
      lastLogin: '2024-01-19T16:45:00Z',
      jobsCreated: 18,
      averageRating: 4.6,
      totalEarnings: 85000,
      isActive: true
    }
  ]);

  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(user => {
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesSearch = searchTerm === '' || 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'contractor': return '#007AFF';
      case 'supplier': return '#28A745';
      case 'labor_chief': return '#FFC107';
      case 'worker': return '#6C757D';
      default: return '#999';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Activity ({filteredUsers.length})</Text>
      
      <View style={styles.filtersContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Role:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {['all', 'contractor', 'supplier', 'labor_chief', 'worker'].map(role => (
              <TouchableOpacity
                key={role}
                style={[styles.filterButton, roleFilter === role && styles.activeFilter]}
                onPress={() => setRoleFilter(role)}
              >
                <Text style={[styles.filterText, roleFilter === role && styles.activeFilterText]}>
                  {role === 'all' ? 'All' : role.replace('_', ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      <ScrollView style={styles.usersList}>
        {filteredUsers.map(user => (
          <View key={user.id} style={styles.userCard}>
            <View style={styles.userHeader}>
              <View style={styles.userInfo}>
                <View style={styles.userDetails}>
                  <Text style={styles.userName}>{user.name}</Text>
                  <Text style={styles.userEmail}>{user.email}</Text>
                  <View style={[styles.roleBadge, { backgroundColor: getRoleColor(user.role) }]}>
                    <Text style={styles.roleText}>{user.role.replace('_', ' ')}</Text>
                  </View>
                </View>
              </View>
              <View style={[styles.statusIndicator, { backgroundColor: user.isActive ? '#28A745' : '#DC3545' }]} />
            </View>
            
            <View style={styles.userStats}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Last Login</Text>
                <Text style={styles.statValue}>{formatDate(user.lastLogin)}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Jobs Created</Text>
                <Text style={styles.statValue}>{user.jobsCreated}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Rating</Text>
                <Text style={styles.statValue}>{user.averageRating.toFixed(1)} ⭐</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Earnings</Text>
                <Text style={styles.statValue}>{formatCurrency(user.totalEarnings)}</Text>
              </View>
            </View>
            
            <View style={styles.userActions}>
              <TouchableOpacity style={[styles.actionButton, styles.viewButton]}>
                <Text style={styles.actionButtonText}>View Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, styles.messageButton]}>
                <Text style={styles.actionButtonText}>Message</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, user.isActive ? styles.suspendButton : styles.activateButton]}
                onPress={() => {
                  setUsers(prev => prev.map(u => 
                    u.id === user.id ? { ...u, isActive: !u.isActive } : u
                  ));
                }}
              >
                <Text style={styles.actionButtonText}>{user.isActive ? 'Suspend' : 'Activate'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: '#333' },
  filtersContainer: { backgroundColor: 'white', padding: 16, borderRadius: 8, marginBottom: 16 },
  searchInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 16 },
  filterRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  filterLabel: { fontSize: 14, fontWeight: '600', marginRight: 12, color: '#333', width: 60 },
  filterButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#f0f0f0', marginRight: 8 },
  activeFilter: { backgroundColor: '#007AFF' },
  filterText: { fontSize: 12, color: '#666', textTransform: 'capitalize' },
  activeFilterText: { color: 'white' },
  usersList: { flex: 1 },
  userCard: { backgroundColor: 'white', padding: 16, borderRadius: 8, marginBottom: 12 },
  userHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  userInfo: { flexDirection: 'row', flex: 1 },
  userDetails: { flex: 1 },
  userName: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 2 },
  userEmail: { fontSize: 14, color: '#666', marginBottom: 4 },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start' },
  roleText: { fontSize: 10, color: 'white', fontWeight: '600', textTransform: 'capitalize' },
  statusIndicator: { width: 12, height: 12, borderRadius: 6 },
  userStats: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  statItem: { alignItems: 'center' },
  statLabel: { fontSize: 12, color: '#666', marginBottom: 2 },
  statValue: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  userActions: { flexDirection: 'row', gap: 8 },
  actionButton: { flex: 1, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, alignItems: 'center' },
  viewButton: { backgroundColor: '#007AFF' },
  messageButton: { backgroundColor: '#28A745' },
  suspendButton: { backgroundColor: '#DC3545' },
  activateButton: { backgroundColor: '#FFC107' },
  actionButtonText: { fontSize: 12, color: 'white', fontWeight: '600' }
});