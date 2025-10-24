import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Share, Clipboard } from 'react-native';
import { InviteLink } from '../types';
import { OnboardingService } from '../services/OnboardingService';
import { AnimatedButton } from './AnimatedButton';

interface PublicInviteSystemProps {
  userId: string;
  onInviteCreated?: (invite: InviteLink) => void;
}

export const PublicInviteSystem: React.FC<PublicInviteSystemProps> = ({ userId, onInviteCreated }) => {
  const [invites, setInvites] = useState<InviteLink[]>([]);
  const [selectedRole, setSelectedRole] = useState<'client' | 'investor'>('client');
  const [siteId, setSiteId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const createInviteLink = async () => {
    if (selectedRole === 'client' && !siteId) {
      Alert.alert('Error', 'Please enter a Site ID for client invites');
      return;
    }

    setIsLoading(true);
    try {
      const invite = await OnboardingService.createInviteLink(
        userId,
        selectedRole,
        selectedRole === 'client' ? siteId : undefined
      );
      
      setInvites([...invites, invite]);
      onInviteCreated?.(invite);
      
      Alert.alert('Success', 'Invite link created successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to create invite link');
    } finally {
      setIsLoading(false);
    }
  };

  const shareInviteLink = async (invite: InviteLink) => {
    const url = await OnboardingService.getPublicInviteUrl(invite.code);
    const message = `You're invited to join ConstructionHub as a ${invite.role}!\n\nUse invite code: ${invite.code}\nOr click: ${url}`;
    
    try {
      await Share.share({ message });
    } catch (error) {
      // Fallback to clipboard
      Clipboard.setString(url);
      Alert.alert('Link Copied', 'Invite link copied to clipboard');
    }
  };

  const copyInviteCode = (code: string) => {
    Clipboard.setString(code);
    Alert.alert('Copied', 'Invite code copied to clipboard');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#34C759';
      case 'used': return '#007AFF';
      case 'expired': return '#FF3B30';
      default: return '#666';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return '🟢';
      case 'used': return '✅';
      case 'expired': return '🔴';
      default: return '⚪';
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: '#FFF' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>Invite System</Text>

      {/* Create New Invite */}
      <View style={{ marginBottom: 30, padding: 15, backgroundColor: '#F8F9FA', borderRadius: 8 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 15 }}>Create New Invite</Text>
        
        {/* Role Selection */}
        <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8 }}>Role</Text>
        <View style={{ flexDirection: 'row', marginBottom: 15 }}>
          <TouchableOpacity
            style={{
              flex: 1,
              padding: 12,
              borderWidth: 1,
              borderColor: selectedRole === 'client' ? '#007AFF' : '#E5E5E5',
              borderRadius: 8,
              marginRight: 10,
              backgroundColor: selectedRole === 'client' ? '#F0F8FF' : '#FFF'
            }}
            onPress={() => setSelectedRole('client')}
          >
            <Text style={{ textAlign: 'center', fontWeight: '600' }}>Client</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flex: 1,
              padding: 12,
              borderWidth: 1,
              borderColor: selectedRole === 'investor' ? '#007AFF' : '#E5E5E5',
              borderRadius: 8,
              backgroundColor: selectedRole === 'investor' ? '#F0F8FF' : '#FFF'
            }}
            onPress={() => setSelectedRole('investor')}
          >
            <Text style={{ textAlign: 'center', fontWeight: '600' }}>Investor</Text>
          </TouchableOpacity>
        </View>

        {/* Site ID for Client */}
        {selectedRole === 'client' && (
          <View style={{ marginBottom: 15 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8 }}>Site ID</Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: '#E5E5E5',
                borderRadius: 8,
                padding: 12,
                fontSize: 16
              }}
              placeholder="Enter Site ID (e.g., site_5)"
              value={siteId}
              onChangeText={setSiteId}
            />
          </View>
        )}

        <AnimatedButton
          title={isLoading ? 'Creating...' : 'Create Invite Link'}
          onPress={createInviteLink}
          disabled={isLoading}
        />
      </View>

      {/* Existing Invites */}
      <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 15 }}>Active Invites</Text>
      {invites.length === 0 ? (
        <Text style={{ textAlign: 'center', color: '#666', fontStyle: 'italic' }}>No invites created yet</Text>
      ) : (
        invites.map((invite) => (
          <View key={invite.id} style={{ marginBottom: 15, padding: 15, backgroundColor: '#F8F9FA', borderRadius: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <Text style={{ fontSize: 16, fontWeight: '600' }}>{invite.role.toUpperCase()}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ marginRight: 5 }}>{getStatusIcon(invite.status)}</Text>
                <Text style={{ color: getStatusColor(invite.status), fontWeight: '600' }}>{invite.status}</Text>
              </View>
            </View>
            
            <TouchableOpacity
              style={{ marginBottom: 10 }}
              onPress={() => copyInviteCode(invite.code)}
            >
              <Text style={{ fontSize: 14, color: '#666' }}>Code: </Text>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#007AFF' }}>{invite.code}</Text>
            </TouchableOpacity>
            
            {invite.site_id && (
              <Text style={{ fontSize: 14, color: '#666', marginBottom: 10 }}>Site: {invite.site_id}</Text>
            )}
            
            <Text style={{ fontSize: 12, color: '#999', marginBottom: 10 }}>
              Expires: {new Date(invite.expires_at).toLocaleDateString()}
            </Text>
            
            {invite.status === 'active' && (
              <TouchableOpacity
                style={{
                  padding: 10,
                  backgroundColor: '#007AFF',
                  borderRadius: 6,
                  alignItems: 'center'
                }}
                onPress={() => shareInviteLink(invite)}
              >
                <Text style={{ color: '#FFF', fontWeight: '600' }}>Share Invite</Text>
              </TouchableOpacity>
            )}
          </View>
        ))
      )}
    </View>
  );
};