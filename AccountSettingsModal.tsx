import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, TextInput, Switch, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SecurityService } from './security/SecurityService';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function AccountSettingsModal({ visible, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<'password' | 'sessions' | 'history' | 'notifications'>('password');
  
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Account Settings</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={28} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.tabs}>
          {[
            { key: 'password', label: 'Password', icon: 'lock-closed' },
            { key: 'sessions', label: 'Sessions', icon: 'phone-portrait' },
            { key: 'history', label: 'History', icon: 'time' },
            { key: 'notifications', label: 'Security', icon: 'shield-checkmark' }
          ].map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.activeTab]}
              onPress={() => setActiveTab(tab.key as any)}
            >
              <Ionicons name={tab.icon as any} size={20} color={activeTab === tab.key ? '#007AFF' : '#666'} />
              <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView style={styles.content}>
          {activeTab === 'password' && <PasswordTab />}
          {activeTab === 'sessions' && <SessionsTab />}
          {activeTab === 'history' && <HistoryTab />}
          {activeTab === 'notifications' && <NotificationsTab />}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
  title: { fontSize: 24, fontWeight: 'bold' },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#eee' },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, gap: 6 },
  activeTab: { borderBottomWidth: 2, borderBottomColor: '#007AFF' },
  tabText: { fontSize: 12, color: '#666' },
  activeTabText: { color: '#007AFF', fontWeight: '600' },
  content: { flex: 1, padding: 20 }
});
