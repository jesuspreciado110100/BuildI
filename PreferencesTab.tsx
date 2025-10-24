import React, { useState } from 'react';
import { View, Text, ScrollView, Switch, TouchableOpacity, StyleSheet } from 'react-native';

export default function PreferencesTab() {
  const [preferences, setPreferences] = useState({
    darkMode: false,
    notifications: true,
    emailUpdates: true,
    pushNotifications: false,
    autoSync: true,
    locationServices: false
  });

  const togglePreference = (key: string) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const sections = [
    {
      title: '🎨 Design Settings',
      items: [
        { key: 'darkMode', label: 'Dark Mode', description: 'Switch to dark theme' }
      ]
    },
    {
      title: '🔔 Notifications',
      items: [
        { key: 'notifications', label: 'All Notifications', description: 'Enable all notifications' },
        { key: 'emailUpdates', label: 'Email Updates', description: 'Receive email notifications' },
        { key: 'pushNotifications', label: 'Push Notifications', description: 'Mobile push alerts' }
      ]
    },
    {
      title: '⚙️ Functionality',
      items: [
        { key: 'autoSync', label: 'Auto Sync', description: 'Automatically sync data' },
        { key: 'locationServices', label: 'Location Services', description: 'Use GPS for location features' }
      ]
    }
  ];

  return (
    <ScrollView style={styles.container}>
      {sections.map((section, sectionIndex) => (
        <View key={sectionIndex} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          {section.items.map((item, itemIndex) => (
            <View key={itemIndex} style={styles.preferenceItem}>
              <View style={styles.preferenceInfo}>
                <Text style={styles.preferenceLabel}>{item.label}</Text>
                <Text style={styles.preferenceDescription}>{item.description}</Text>
              </View>
              <Switch
                value={preferences[item.key]}
                onValueChange={() => togglePreference(item.key)}
                trackColor={{ false: '#767577', true: '#3b82f6' }}
                thumbColor={preferences[item.key] ? '#ffffff' : '#f4f3f4'}
              />
            </View>
          ))}
        </View>
      ))}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔧 Account Actions</Text>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>📤 Export Data</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>🔄 Reset Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.dangerButton]}>
          <Text style={[styles.actionText, styles.dangerText]}>🗑️ Delete Account</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  section: { backgroundColor: 'white', margin: 16, padding: 16, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937', marginBottom: 16, fontFamily: 'System' },
  preferenceItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  preferenceInfo: { flex: 1 },
  preferenceLabel: { fontSize: 16, fontWeight: '500', color: '#1f2937', marginBottom: 2, fontFamily: 'System' },
  preferenceDescription: { fontSize: 14, color: '#6b7280', fontFamily: 'System' },
  actionButton: { paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  actionText: { fontSize: 16, color: '#374151', fontFamily: 'System' },
  dangerButton: { borderBottomWidth: 0 },
  dangerText: { color: '#ef4444' }
});