import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SecurityService, LoginHistory } from './security/SecurityService';

export default function HistoryTab() {
  const [history, setHistory] = useState<LoginHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await SecurityService.getLoginHistory();
      setHistory(data);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 40 }} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.description}>
        Review your recent login activity. If you notice any suspicious activity, change your password immediately.
      </Text>

      {history.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="shield-checkmark" size={48} color="#ccc" />
          <Text style={styles.emptyText}>No login history available</Text>
        </View>
      ) : (
        history.map(entry => (
          <View key={entry.id} style={styles.historyCard}>
            <View style={[styles.statusIcon, entry.status === 'success' ? styles.successIcon : styles.failedIcon]}>
              <Ionicons 
                name={entry.status === 'success' ? 'checkmark' : 'close'} 
                size={20} 
                color={entry.status === 'success' ? '#34C759' : '#FF3B30'} 
              />
            </View>
            <View style={styles.historyInfo}>
              <Text style={styles.historyDevice}>{entry.device} • {entry.browser}</Text>
              <Text style={styles.historyDetails}>{entry.location} • {entry.ip_address}</Text>
              <Text style={styles.historyTime}>{new Date(entry.timestamp).toLocaleString()}</Text>
            </View>
            <Text style={[styles.statusBadge, entry.status === 'success' ? styles.successBadge : styles.failedBadge]}>
              {entry.status}
            </Text>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  description: { fontSize: 14, color: '#666', lineHeight: 20, marginBottom: 8 },
  emptyState: { alignItems: 'center', padding: 40, gap: 12 },
  emptyText: { fontSize: 16, color: '#999' },
  historyCard: { flexDirection: 'row', padding: 16, backgroundColor: '#f9f9f9', borderRadius: 12, gap: 12, alignItems: 'center' },
  statusIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  successIcon: { backgroundColor: '#E8F8EC' },
  failedIcon: { backgroundColor: '#FFE8E8' },
  historyInfo: { flex: 1, gap: 4 },
  historyDevice: { fontSize: 14, fontWeight: '600', color: '#333' },
  historyDetails: { fontSize: 13, color: '#666' },
  historyTime: { fontSize: 12, color: '#999' },
  statusBadge: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  successBadge: { color: '#34C759', backgroundColor: '#E8F8EC' },
  failedBadge: { color: '#FF3B30', backgroundColor: '#FFE8E8' }
});
