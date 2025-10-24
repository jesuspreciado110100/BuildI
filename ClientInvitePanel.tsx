import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface ClientInvitePanelProps {
  userId: string;
  userRole: string;
}

interface Client {
  id: string;
  name: string;
  email: string;
  company: string;
  status: 'invited' | 'active' | 'pending';
  invitedAt: string;
  lastActive?: string;
}

export const ClientInvitePanel: React.FC<ClientInvitePanelProps> = ({ userId, userRole }) => {
  const { theme } = useTheme();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteCompany, setInviteCompany] = useState('');
  const [activeTab, setActiveTab] = useState<'invite' | 'existing'>('invite');

  const mockClients: Client[] = [
    {
      id: '1',
      name: 'John Smith',
      email: 'john@acmecorp.com',
      company: 'Acme Corporation',
      status: 'active',
      invitedAt: '2024-01-10',
      lastActive: '2024-01-15'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah@buildco.com',
      company: 'BuildCo Inc',
      status: 'pending',
      invitedAt: '2024-01-12'
    },
    {
      id: '3',
      name: 'Mike Wilson',
      email: 'mike@devgroup.com',
      company: 'Development Group',
      status: 'invited',
      invitedAt: '2024-01-14'
    }
  ];

  const handleSendInvite = () => {
    if (!inviteEmail || !inviteName) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    Alert.alert(
      'Invite Sent',
      `Invitation sent to ${inviteName} (${inviteEmail})`,
      [{ text: 'OK', onPress: () => {
        setInviteEmail('');
        setInviteName('');
        setInviteCompany('');
      }}]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return theme.colors.success;
      case 'pending': return theme.colors.warning;
      case 'invited': return theme.colors.primary;
      default: return theme.colors.textSecondary;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'pending': return 'Pending';
      case 'invited': return 'Invited';
      default: return 'Unknown';
    }
  };

  const renderClientItem = ({ item }: { item: Client }) => (
    <View style={[styles.clientCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      <View style={styles.clientHeader}>
        <View style={styles.clientInfo}>
          <Text style={[styles.clientName, { color: theme.colors.text }]}>
            {item.name}
          </Text>
          <Text style={[styles.clientEmail, { color: theme.colors.textSecondary }]}>
            {item.email}
          </Text>
          <Text style={[styles.clientCompany, { color: theme.colors.textSecondary }]}>
            {item.company}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
        </View>
      </View>
      
      <View style={styles.clientFooter}>
        <Text style={[styles.inviteDate, { color: theme.colors.textSecondary }]}>
          Invited: {item.invitedAt}
        </Text>
        {item.lastActive && (
          <Text style={[styles.lastActive, { color: theme.colors.textSecondary }]}>
            Last active: {item.lastActive}
          </Text>
        )}
      </View>
      
      <View style={styles.clientActions}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: theme.colors.secondary }]}
        >
          <Text style={styles.actionButtonText}>View Portal</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
        >
          <Text style={styles.actionButtonText}>Resend Invite</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderInviteForm = () => (
    <View style={styles.inviteForm}>
      <Text style={[styles.formTitle, { color: theme.colors.text }]}>Invite New Client</Text>
      
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Client Name *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, color: theme.colors.text }]}
          value={inviteName}
          onChangeText={setInviteName}
          placeholder="Enter client name"
          placeholderTextColor={theme.colors.textSecondary}
        />
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Email Address *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, color: theme.colors.text }]}
          value={inviteEmail}
          onChangeText={setInviteEmail}
          placeholder="Enter email address"
          placeholderTextColor={theme.colors.textSecondary}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Company</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, color: theme.colors.text }]}
          value={inviteCompany}
          onChangeText={setInviteCompany}
          placeholder="Enter company name"
          placeholderTextColor={theme.colors.textSecondary}
        />
      </View>
      
      <TouchableOpacity 
        style={[styles.sendButton, { backgroundColor: theme.colors.primary }]}
        onPress={handleSendInvite}
      >
        <Text style={styles.sendButtonText}>Send Invitation</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Client Management</Text>
      </View>
      
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            {
              backgroundColor: activeTab === 'invite' ? theme.colors.primary : theme.colors.card,
              borderColor: theme.colors.border
            }
          ]}
          onPress={() => setActiveTab('invite')}
        >
          <Text style={[
            styles.tabText,
            { color: activeTab === 'invite' ? '#fff' : theme.colors.text }
          ]}>Invite Client</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab,
            {
              backgroundColor: activeTab === 'existing' ? theme.colors.primary : theme.colors.card,
              borderColor: theme.colors.border
            }
          ]}
          onPress={() => setActiveTab('existing')}
        >
          <Text style={[
            styles.tabText,
            { color: activeTab === 'existing' ? '#fff' : theme.colors.text }
          ]}>Existing Clients ({mockClients.length})</Text>
        </TouchableOpacity>
      </View>
      
      {activeTab === 'invite' ? (
        renderInviteForm()
      ) : (
        <FlatList
          data={mockClients}
          renderItem={renderClientItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.clientsList}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  inviteForm: {
    gap: 16,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
  },
  sendButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  clientsList: {
    gap: 12,
  },
  clientCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  clientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  clientEmail: {
    fontSize: 14,
    marginBottom: 2,
  },
  clientCompany: {
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  clientFooter: {
    marginBottom: 12,
  },
  inviteDate: {
    fontSize: 12,
    marginBottom: 2,
  },
  lastActive: {
    fontSize: 12,
  },
  clientActions: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});