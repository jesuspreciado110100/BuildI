import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SecurityService, LoginSession } from './security/SecurityService';

export default function SessionsTab() {
  const [sessions, setSessions] = useState<LoginSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const data = await SecurityService.getActiveSessions();
      setSessions(data);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeSession = (sessionId: string) => {
    Alert.alert(
      'Revoke Session',
      'Are you sure you want to sign out this device?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke',
          style: 'destructive',
          onPress: async () => {
            try {
              await SecurityService.revokeSession(sessionId);
              setSessions(sessions.filter(s => s.id !== sessionId));
              Alert.alert('Success', 'Session revoked successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to revoke session');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 40 }} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.description}>
        Manage devices where you're currently signed in. You can sign out of any device remotely.
      </Text>

      {sessions.map(session => (
        <View key={session.id} style={styles.sessionCard}>
          <View style={styles.sessionIcon}>
            <Ionicons name={session.is_current ? 'phone-portrait' : 'laptop'} size={24} color="#007AFF" />
          </View>
          <View style={styles.sessionInfo}>
            <Text style={styles.sessionDevice}>{session.device}</Text>
            <Text style={styles.sessionDetails}>{session.browser} • {session.location}</Text>
            <Text style={styles.sessionTime}>Last active: {new Date(session.last_active).toLocaleString()}</Text>
            {session.is_current && <Text style={styles.currentBadge}>Current Session</Text>}
          </View>
          {!session.is_current && (
            <TouchableOpacity onPress={() => handleRevokeSession(session.id)} style={styles.revokeButton}>
              <Text style={styles.revokeText}>Revoke</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  description: { fontSize: 14, color: '#666', lineHeight: 20, marginBottom: 8 },
  sessionCard: { flexDirection: 'row', padding: 16, backgroundColor: '#f9f9f9', borderRadius: 12, gap: 12 },
  sessionIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#E3F2FD', alignItems: 'center', justifyContent: 'center' },
  sessionInfo: { flex: 1, gap: 4 },
  sessionDevice: { fontSize: 16, fontWeight: '600', color: '#333' },
  sessionDetails: { fontSize: 14, color: '#666' },
  sessionTime: { fontSize: 12, color: '#999' },
  currentBadge: { fontSize: 12, color: '#007AFF', fontWeight: '600', marginTop: 4 },
  revokeButton: { paddingHorizontal: 16, paddingVertical: 8, justifyContent: 'center' },
  revokeText: { color: '#FF3B30', fontSize: 14, fontWeight: '600' }
});
