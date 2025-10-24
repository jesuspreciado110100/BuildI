import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function NotificationsTab() {
  const [settings, setSettings] = useState({
    loginAlerts: true,
    newDeviceAlerts: true,
    passwordChangeAlerts: true,
    suspiciousActivityAlerts: true,
    weeklySecurityReport: false,
    twoFactorEnabled: false
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleEnableTwoFactor = () => {
    Alert.alert(
      'Two-Factor Authentication',
      'Two-factor authentication adds an extra layer of security to your account. This feature will be available soon.',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.description}>
        Configure security notifications and alerts to stay informed about your account activity.
      </Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security Alerts</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Login Alerts</Text>
            <Text style={styles.settingDesc}>Get notified when someone logs into your account</Text>
          </View>
          <Switch value={settings.loginAlerts} onValueChange={() => toggleSetting('loginAlerts')} />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>New Device Alerts</Text>
            <Text style={styles.settingDesc}>Alert when your account is accessed from a new device</Text>
          </View>
          <Switch value={settings.newDeviceAlerts} onValueChange={() => toggleSetting('newDeviceAlerts')} />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Password Changes</Text>
            <Text style={styles.settingDesc}>Notify when your password is changed</Text>
          </View>
          <Switch value={settings.passwordChangeAlerts} onValueChange={() => toggleSetting('passwordChangeAlerts')} />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Suspicious Activity</Text>
            <Text style={styles.settingDesc}>Alert on unusual account activity</Text>
          </View>
          <Switch value={settings.suspiciousActivityAlerts} onValueChange={() => toggleSetting('suspiciousActivityAlerts')} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reports</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Weekly Security Report</Text>
            <Text style={styles.settingDesc}>Receive weekly summary of account activity</Text>
          </View>
          <Switch value={settings.weeklySecurityReport} onValueChange={() => toggleSetting('weeklySecurityReport')} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Advanced Security</Text>
        
        <TouchableOpacity style={styles.twoFactorCard} onPress={handleEnableTwoFactor}>
          <Ionicons name="shield-checkmark" size={24} color="#007AFF" />
          <View style={styles.twoFactorInfo}>
            <Text style={styles.twoFactorLabel}>Two-Factor Authentication</Text>
            <Text style={styles.twoFactorDesc}>Add an extra layer of security (Coming Soon)</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 20 },
  description: { fontSize: 14, color: '#666', lineHeight: 20, marginBottom: 8 },
  section: { gap: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 4 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  settingInfo: { flex: 1, gap: 4, paddingRight: 12 },
  settingLabel: { fontSize: 15, fontWeight: '500', color: '#333' },
  settingDesc: { fontSize: 13, color: '#666', lineHeight: 18 },
  twoFactorCard: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#f9f9f9', borderRadius: 12, gap: 12 },
  twoFactorInfo: { flex: 1, gap: 4 },
  twoFactorLabel: { fontSize: 15, fontWeight: '600', color: '#333' },
  twoFactorDesc: { fontSize: 13, color: '#666' }
});
