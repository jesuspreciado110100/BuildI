import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';

export default function NetworksTab() {
  const [activeSection, setActiveSection] = useState('connections');

  const connections = [
    { name: 'Mike Johnson', role: 'Project Manager', company: 'BuildCorp', status: 'online', avatar: '👨‍💼' },
    { name: 'Sarah Wilson', role: 'Architect', company: 'Design Studio', status: 'offline', avatar: '👩‍🎨' },
    { name: 'David Chen', role: 'Engineer', company: 'TechBuild', status: 'online', avatar: '👨‍🔧' }
  ];

  const stats = [
    { label: 'Connections', value: '247', icon: '🤝' },
    { label: 'Followers', value: '1.2K', icon: '👥' },
    { label: 'Following', value: '189', icon: '➡️' },
    { label: 'Messages', value: '23', icon: '💬' }
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Network Statistics</Text>
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🤝 Recent Connections</Text>
        {connections.map((connection, index) => (
          <View key={index} style={styles.connectionCard}>
            <Text style={styles.avatar}>{connection.avatar}</Text>
            <View style={styles.connectionInfo}>
              <Text style={styles.connectionName}>{connection.name}</Text>
              <Text style={styles.connectionRole}>{connection.role} at {connection.company}</Text>
            </View>
            <View style={[styles.statusDot, { backgroundColor: connection.status === 'online' ? '#10b981' : '#6b7280' }]} />
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💬 Quick Actions</Text>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>🔍</Text>
          <Text style={styles.actionText}>Find New Connections</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>📧</Text>
          <Text style={styles.actionText}>Send Messages</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>👥</Text>
          <Text style={styles.actionText}>Join Groups</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  section: { backgroundColor: 'white', margin: 16, padding: 16, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937', marginBottom: 16, fontFamily: 'System' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statCard: { width: '48%', backgroundColor: '#f9fafb', padding: 16, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  statIcon: { fontSize: 24, marginBottom: 8 },
  statValue: { fontSize: 20, fontWeight: '700', color: '#1f2937', marginBottom: 4, fontFamily: 'System' },
  statLabel: { fontSize: 12, color: '#6b7280', textAlign: 'center', fontFamily: 'System' },
  connectionCard: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#f9fafb', borderRadius: 8, marginBottom: 8 },
  avatar: { fontSize: 32, marginRight: 12 },
  connectionInfo: { flex: 1 },
  connectionName: { fontSize: 16, fontWeight: '500', color: '#1f2937', fontFamily: 'System' },
  connectionRole: { fontSize: 14, color: '#6b7280', fontFamily: 'System' },
  statusDot: { width: 12, height: 12, borderRadius: 6 },
  actionButton: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  actionIcon: { fontSize: 20, marginRight: 12 },
  actionText: { fontSize: 16, color: '#374151', fontFamily: 'System' }
});