import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, Alert } from 'react-native';

export default function IntegrationsTab() {
  const [integrations, setIntegrations] = useState({
    quickbooks: false,
    procore: true,
    linkedin: false,
    calendar: true,
    crm: false
  });

  const toggleIntegration = (key: string) => {
    // Handle missing secrets gracefully
    if (!integrations[key]) {
      Alert.alert('Integration', `${key} integration activated locally. External API connection requires setup.`);
    }
    setIntegrations(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const integrationsList = [
    { key: 'quickbooks', name: 'QuickBooks', description: 'Sync accounting data', icon: '💰', status: 'Available' },
    { key: 'procore', name: 'Procore', description: 'Project management', icon: '🏗️', status: 'Connected' },
    { key: 'linkedin', name: 'LinkedIn', description: 'Professional profile', icon: '💼', status: 'Available' },
    { key: 'calendar', name: 'Calendar', description: 'Schedule sync', icon: '📅', status: 'Connected' },
    { key: 'crm', name: 'CRM Tools', description: 'Customer management', icon: '👥', status: 'Available' }
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔗 API Connectors</Text>
        <Text style={styles.sectionDescription}>Connect with external tools to streamline workflow</Text>
        
        {integrationsList.map(integration => (
          <View key={integration.key} style={styles.integrationItem}>
            <View style={styles.integrationInfo}>
              <Text style={styles.integrationIcon}>{integration.icon}</Text>
              <View style={styles.integrationDetails}>
                <Text style={styles.integrationName}>{integration.name}</Text>
                <Text style={styles.integrationDescription}>{integration.description}</Text>
                <Text style={[styles.integrationStatus, { color: integration.status === 'Connected' ? '#10b981' : '#6b7280' }]}>
                  {integration.status}
                </Text>
              </View>
            </View>
            <Switch
              value={integrations[integration.key]}
              onValueChange={() => toggleIntegration(integration.key)}
              trackColor={{ false: '#767577', true: '#3b82f6' }}
            />
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Data Import</Text>
        <TouchableOpacity style={styles.importButton} onPress={() => Alert.alert('Import', 'Data import feature available')}>
          <Text style={styles.importButtonText}>📥 Import from LinkedIn</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.importButton} onPress={() => Alert.alert('Import', 'Contact import available')}>
          <Text style={styles.importButtonText}>📇 Import Contacts</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.importButton} onPress={() => Alert.alert('Import', 'Project data import available')}>
          <Text style={styles.importButtonText}>📁 Import Project Data</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔄 Sync Status</Text>
        <View style={styles.syncItem}>
          <Text style={styles.syncLabel}>📅 Last Calendar Sync</Text>
          <Text style={styles.syncTime}>2 hours ago</Text>
        </View>
        <View style={styles.syncItem}>
          <Text style={styles.syncLabel}>💾 Last Data Backup</Text>
          <Text style={styles.syncTime}>1 day ago</Text>
        </View>
        <TouchableOpacity style={styles.syncButton} onPress={() => Alert.alert('Sync', 'Manual sync completed')}>
          <Text style={styles.syncButtonText}>🔄 Sync Now</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  section: { backgroundColor: 'white', margin: 16, padding: 16, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937', marginBottom: 8, fontFamily: 'System' },
  sectionDescription: { fontSize: 14, color: '#6b7280', marginBottom: 16, fontFamily: 'System' },
  integrationItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  integrationInfo: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  integrationIcon: { fontSize: 24, marginRight: 12 },
  integrationDetails: { flex: 1 },
  integrationName: { fontSize: 16, fontWeight: '500', color: '#1f2937', fontFamily: 'System' },
  integrationDescription: { fontSize: 14, color: '#6b7280', fontFamily: 'System' },
  integrationStatus: { fontSize: 12, fontWeight: '500', marginTop: 2, fontFamily: 'System' },
  importButton: { backgroundColor: '#3b82f6', padding: 12, borderRadius: 8, marginBottom: 8 },
  importButtonText: { color: 'white', textAlign: 'center', fontSize: 16, fontFamily: 'System' },
  syncItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  syncLabel: { fontSize: 16, color: '#1f2937', fontFamily: 'System' },
  syncTime: { fontSize: 14, color: '#6b7280', fontFamily: 'System' },
  syncButton: { backgroundColor: '#10b981', padding: 12, borderRadius: 8, marginTop: 8 },
  syncButtonText: { color: 'white', textAlign: 'center', fontSize: 16, fontFamily: 'System' }
});