import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { SupabaseConnectionStatus } from './SupabaseConnectionStatus';

export const SimpleHomeScreen: React.FC = () => {
  const { user, logout } = useAuth();

  const mockSites = [
    {
      id: '1',
      name: 'Downtown Office Complex',
      location: 'New York, NY',
      status: 'Active',
      progress: 65
    },
    {
      id: '2',
      name: 'Residential Tower',
      location: 'Los Angeles, CA',
      status: 'Active',
      progress: 30
    }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome, {user?.name || 'User'}</Text>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        <SupabaseConnectionStatus />
        
        <View style={styles.setupCard}>
          <Text style={styles.setupTitle}>🚀 New Supabase Project Setup</Text>
          <Text style={styles.setupText}>
            Your FamousAI Construction Platform is now configured with a new Supabase project!
          </Text>
          <Text style={styles.setupSubtext}>
            Check the supabase-setup.md file for complete setup instructions.
          </Text>
        </View>
        
        <Text style={styles.sectionTitle}>My Sites</Text>
        
        {mockSites.map((site) => (
          <View key={site.id} style={styles.siteCard}>
            <Text style={styles.siteName}>{site.name}</Text>
            <Text style={styles.siteLocation}>{site.location}</Text>
            <Text style={styles.siteStatus}>Status: {site.status}</Text>
            <Text style={styles.siteProgress}>Progress: {site.progress}%</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${site.progress}%` }]} />
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: 'white' },
  title: { fontSize: 20, fontWeight: 'bold' },
  logoutButton: { backgroundColor: '#ff4444', padding: 8, borderRadius: 6 },
  logoutText: { color: 'white', fontSize: 14 },
  content: { flex: 1, padding: 16 },
  setupCard: { backgroundColor: '#e8f5e8', padding: 16, borderRadius: 8, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#4CAF50' },
  setupTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8, color: '#2E7D32' },
  setupText: { fontSize: 14, color: '#2E7D32', marginBottom: 4 },
  setupSubtext: { fontSize: 12, color: '#4CAF50', fontStyle: 'italic' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  siteCard: { backgroundColor: 'white', padding: 16, borderRadius: 8, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  siteName: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  siteLocation: { fontSize: 14, color: '#666', marginBottom: 4 },
  siteStatus: { fontSize: 14, color: '#007AFF', marginBottom: 4 },
  siteProgress: { fontSize: 14, color: '#333', marginBottom: 8 },
  progressBar: { height: 4, backgroundColor: '#e0e0e0', borderRadius: 2 },
  progressFill: { height: '100%', backgroundColor: '#007AFF', borderRadius: 2 }
});