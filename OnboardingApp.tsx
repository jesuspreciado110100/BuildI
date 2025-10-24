import React, { useState } from 'react';
import { View, Modal, Alert } from 'react-native';
import { OnboardingWizard } from './OnboardingWizard';
import { LoginForm } from './LoginForm';
import { BrandingSettingsPanel } from './BrandingSettingsPanel';
import { PublicInviteSystem } from './PublicInviteSystem';
import { OnboardingData, User } from '../types';
import { OnboardingService } from '../services/OnboardingService';
import { OnboardingNotificationService } from '../services/OnboardingNotificationService';

interface OnboardingAppProps {
  currentUser?: User;
  onUserCreated?: (user: User) => void;
}

export const OnboardingApp: React.FC<OnboardingAppProps> = ({ currentUser, onUserCreated }) => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showBranding, setShowBranding] = useState(false);
  const [showInvites, setShowInvites] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  const handleOnboardingComplete = async (data: OnboardingData) => {
    try {
      const newUser = await OnboardingService.createUser(data);
      setUsers([...users, newUser]);
      onUserCreated?.(newUser);
      setShowOnboarding(false);
      
      // Send notifications
      if (newUser.role === 'client' && newUser.assigned_sites?.length) {
        await OnboardingNotificationService.sendNewClientNotification(newUser, newUser.assigned_sites[0]);
      } else if (newUser.role === 'investor') {
        await OnboardingNotificationService.sendNewInvestorNotification(newUser, !!data.invite_code);
      }
      
      Alert.alert('Success', 'Account created successfully!');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to create account');
    }
  };

  const handleBrandingSave = async (brandTheme: User['brand_theme']) => {
    if (!currentUser) return;
    
    const updatedUser = { ...currentUser, brand_theme: brandTheme };
    setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
    
    const changes = [];
    if (brandTheme?.logo_url) changes.push('logo');
    if (brandTheme?.primary_color) changes.push('primary color');
    if (brandTheme?.powered_by_footer === false) changes.push('white-label mode');
    
    await OnboardingNotificationService.sendBrandingUpdatedNotification(currentUser.id, changes);
  };

  const handleLogin = (credentials: { email: string; password: string }) => {
    // Mock login - find user by email
    const user = users.find(u => u.email === credentials.email);
    if (user) {
      onUserCreated?.(user);
      Alert.alert('Success', 'Logged in successfully!');
    } else {
      Alert.alert('Error', 'Invalid credentials');
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <LoginForm
        onLogin={handleLogin}
        onSignUp={() => setShowOnboarding(true)}
        brandTheme={currentUser?.brand_theme}
      />

      {/* Onboarding Modal */}
      <Modal visible={showOnboarding} animationType="slide" presentationStyle="fullScreen">
        <OnboardingWizard
          onComplete={handleOnboardingComplete}
          onCancel={() => setShowOnboarding(false)}
        />
      </Modal>

      {/* Branding Settings Modal */}
      {currentUser?.role === 'admin' && (
        <Modal visible={showBranding} animationType="slide" presentationStyle="fullScreen">
          <View style={{ flex: 1 }}>
            <BrandingSettingsPanel
              user={currentUser}
              onSave={handleBrandingSave}
            />
          </View>
        </Modal>
      )}

      {/* Invite System Modal */}
      {currentUser?.role === 'admin' && (
        <Modal visible={showInvites} animationType="slide" presentationStyle="fullScreen">
          <View style={{ flex: 1 }}>
            <PublicInviteSystem
              userId={currentUser.id}
              onInviteCreated={async (invite) => {
                await OnboardingNotificationService.sendInviteLinkCreatedNotification(invite, currentUser.id);
              }}
            />
          </View>
        </Modal>
      )}
    </View>
  );
};