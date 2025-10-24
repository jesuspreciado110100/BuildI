import React, { useState } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, StyleSheet, Alert, Switch } from 'react-native';
import { PortalAccessService } from '../services/PortalAccessService';

interface InvitePortalModalProps {
  visible: boolean;
  onClose: () => void;
  siteId: string;
  onInviteSent?: (email: string, role: string) => void;
}

export const InvitePortalModal: React.FC<InvitePortalModalProps> = ({
  visible,
  onClose,
  siteId,
  onInviteSent
}) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'client' | 'investor'>('client');
  const [permissions, setPermissions] = useState({
    sharePhotos: true,
    shareReports: true,
    shareCosts: true
  });
  const [loading, setLoading] = useState(false);

  const handleSendInvite = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const { portalId, accessCode, portalLink } = PortalAccessService.generatePortalLink(siteId, role);
      
      // In a real app, you would send this via email service
      console.log('Portal invitation generated:', {
        email,
        role,
        portalId,
        accessCode,
        portalLink,
        permissions
      });

      Alert.alert(
        'Invitation Sent',
        `Portal access link has been sent to ${email}\n\nAccess Code: ${accessCode}`,
        [
          {
            text: 'Copy Link',
            onPress: () => {
              // In a real app, copy to clipboard
              console.log('Copied to clipboard:', portalLink);
            }
          },
          { text: 'OK' }
        ]
      );

      onInviteSent?.(email, role);
      handleClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setRole('client');
    setPermissions({
      sharePhotos: true,
      shareReports: true,
      shareCosts: true
    });
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Invite Client/Investor</Text>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={styles.textInput}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter email address"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.inputLabel}>Role</Text>
            <View style={styles.roleContainer}>
              <TouchableOpacity
                style={[styles.roleButton, role === 'client' && styles.roleButtonActive]}
                onPress={() => setRole('client')}
              >
                <Text style={[styles.roleButtonText, role === 'client' && styles.roleButtonTextActive]}>
                  Client
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.roleButton, role === 'investor' && styles.roleButtonActive]}
                onPress={() => setRole('investor')}
              >
                <Text style={[styles.roleButtonText, role === 'investor' && styles.roleButtonTextActive]}>
                  Investor
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Permissions</Text>
            <View style={styles.permissionItem}>
              <Text style={styles.permissionText}>Share progress photos</Text>
              <Switch
                value={permissions.sharePhotos}
                onValueChange={(value) => setPermissions(prev => ({ ...prev, sharePhotos: value }))}
              />
            </View>
            <View style={styles.permissionItem}>
              <Text style={styles.permissionText}>Share reports & documents</Text>
              <Switch
                value={permissions.shareReports}
                onValueChange={(value) => setPermissions(prev => ({ ...prev, shareReports: value }))}
              />
            </View>
            <View style={styles.permissionItem}>
              <Text style={styles.permissionText}>Share cost breakdown</Text>
              <Switch
                value={permissions.shareCosts}
                onValueChange={(value) => setPermissions(prev => ({ ...prev, shareCosts: value }))}
              />
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.sendButton, loading && styles.sendButtonDisabled]} 
                onPress={handleSendInvite}
                disabled={loading}
              >
                <Text style={styles.sendButtonText}>
                  {loading ? 'Sending...' : 'Send Invitation'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
  },
  formContainer: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  roleContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  roleButtonActive: {
    backgroundColor: '#2196f3',
    borderColor: '#2196f3',
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  roleButtonTextActive: {
    color: '#fff',
  },
  permissionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  permissionText: {
    fontSize: 14,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  sendButton: {
    flex: 1,
    backgroundColor: '#2196f3',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});