import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import NotificationBell from './NotificationBell';
import { ThemeToggleButton } from './ThemeToggleButton';
import { LanguagePicker } from './LanguagePicker';
import { UnitSystemPicker } from './UnitSystemPicker';
import { GlobalSearchModal } from './GlobalSearchModal';
import { User } from '../types';

interface TopNavigationProps {
  user: User;
  onLogout: () => void;
  onSettingsPress?: () => void;
  onNotificationPress?: () => void;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({
  user,
  onLogout,
  onSettingsPress,
  onNotificationPress
}) => {
  const { theme } = useTheme();
  const [searchModalVisible, setSearchModalVisible] = useState(false);

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
    <>
      <View style={[styles.container, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
        <View style={styles.leftSection}>
          <Text style={[styles.userName, { color: theme.colors.text }]}>
            {user.name}
          </Text>
          <Text style={[styles.userRole, { color: theme.colors.textSecondary }]}>
            {getRoleDisplayName(user.role)}
          </Text>
        </View>
        
        <View style={styles.rightSection}>
          <TouchableOpacity 
            style={[styles.searchButton, { backgroundColor: theme.colors.secondary }]}
            onPress={() => setSearchModalVisible(true)}
          >
            <Text style={styles.searchButtonText}>🔍</Text>
          </TouchableOpacity>
          
          <LanguagePicker />
          <UnitSystemPicker />
          <ThemeToggleButton />
          <NotificationBell onPress={onNotificationPress} />
          
          {onSettingsPress && (
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: theme.colors.secondary }]}
              onPress={onSettingsPress}
            >
              <Text style={styles.actionButtonText}>⚙️</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={[styles.logoutButton, { backgroundColor: theme.colors.error }]}
            onPress={onLogout}
          >
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      <GlobalSearchModal
        visible={searchModalVisible}
        onClose={() => setSearchModalVisible(false)}
        user={user}
      />
    </>
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
    borderBottomWidth: 1,
  },
  leftSection: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userRole: {
    fontSize: 14,
    marginTop: 2,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    fontSize: 16,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
  },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});