import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { ProfileTab } from './ProfileTab';
import { DevelopmentTab } from './DevelopmentTab';
import { ToolsTab } from './ToolsTab';
import NetworksTab from './NetworksTab';
import IntegrationsTab from './IntegrationsTab';
import PreferencesTab from './PreferencesTab';
import AccountSettingsModal from './AccountSettingsModal';

export const ProfileScreen: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [showAccountSettings, setShowAccountSettings] = useState(false);


  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'development', label: 'Development' },
    { id: 'tools', label: 'Tools' },
    { id: 'networks', label: 'Networks' },
    { id: 'integrations', label: 'Integrations' },
    { id: 'preferences', label: 'Preferences' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileTab />;
      case 'development':
        return <DevelopmentTab />;
      case 'tools':
        return <ToolsTab />;
      case 'networks':
        return <NetworksTab />;
      case 'integrations':
        return <IntegrationsTab />;
      case 'preferences':
        return <PreferencesTab />;
      default:
        return <ProfileTab />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => setShowAccountSettings(true)}
        >
          <Ionicons name="settings-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatar}>👤</Text>
        </View>
        <Text style={styles.name}>{user?.name || 'John Doe'}</Text>
        <Text style={styles.role}>{user?.role || 'Contractor'}</Text>
        <Text style={styles.email}>{user?.email || 'john@example.com'}</Text>
      </View>


      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.activeTab]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content}>
        {renderTabContent()}
      </ScrollView>

      <AccountSettingsModal 
        visible={showAccountSettings}
        onClose={() => setShowAccountSettings(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { backgroundColor: 'white', padding: 20, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  settingsButton: { position: 'absolute', top: 20, right: 20, zIndex: 10 },
  avatarContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatar: { fontSize: 32 },
  name: { fontSize: 24, fontWeight: '700', color: '#1F2937', marginBottom: 4, fontFamily: 'System' },
  role: { fontSize: 16, color: '#6B7280', marginBottom: 4, fontFamily: 'System' },
  email: { fontSize: 14, color: '#9CA3AF', fontFamily: 'System' },
  tabContainer: { flexDirection: 'row', backgroundColor: 'white', marginTop: 8 },
  tab: { flex: 1, paddingVertical: 16, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: '#3B82F6' },
  tabText: { fontSize: 12, color: '#6B7280', fontWeight: '500', fontFamily: 'System', textAlign: 'center' },
  activeTabText: { color: '#3B82F6', fontWeight: '700' },
  content: { flex: 1 },
});
