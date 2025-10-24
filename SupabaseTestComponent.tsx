import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { supabase } from '@/app/lib/supabase';

export default function SupabaseTestComponent() {
  const [connectionStatus, setConnectionStatus] = useState('Testing...');
  const [projects, setProjects] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      console.log('Testing Supabase connection...');
      
      // Test basic connection
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .limit(5);

      console.log('Connection test result:', { data, error });

      if (error) {
        setError(error.message);
        setConnectionStatus('Connection failed');
        console.error('Supabase error:', error);
      } else {
        setProjects(data || []);
        setConnectionStatus('Connected successfully');
        console.log('Projects found:', data?.length || 0);
      }
    } catch (err: any) {
      setError(err.message);
      setConnectionStatus('Connection error');
      console.error('Connection error:', err);
    }
  };

  const createSampleProject = async () => {
    try {
      const sampleProject = {
        name: 'Test Residential Project',
        description: 'A sample project for testing',
        status: 'active',
        construction_type: 'residencial',
        budget: 250000,
        location: 'Test City',
        client_name: 'Test Client',
        progress_percentage: 45
      };

      const { data, error } = await supabase
        .from('projects')
        .insert([sampleProject])
        .select();

      if (error) {
        console.error('Insert error:', error);
        setError(`Insert failed: ${error.message}`);
      } else {
        console.log('Project created:', data);
        testConnection(); // Refresh the list
      }
    } catch (err: any) {
      console.error('Create error:', err);
      setError(`Create failed: ${err.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Supabase Connection Test</Text>
      
      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Status:</Text>
        <Text style={[styles.status, error ? styles.errorText : styles.successText]}>
          {connectionStatus}
        </Text>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Error:</Text>
          <Text style={styles.errorMessage}>{error}</Text>
        </View>
      )}

      <Text style={styles.projectsTitle}>Projects Found: {projects.length}</Text>
      
      <ScrollView style={styles.projectsList}>
        {projects.map((project, index) => (
          <View key={project.project_id || index} style={styles.projectItem}>
            <Text style={styles.projectName}>{project.name}</Text>
            <Text style={styles.projectDetails}>
              Type: {project.construction_type} | Status: {project.status}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={testConnection}>
          <Text style={styles.buttonText}>Refresh</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={createSampleProject}>
          <Text style={styles.buttonText}>Create Sample</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: 'white', margin: 10, borderRadius: 8 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  statusContainer: { flexDirection: 'row', marginBottom: 12 },
  statusLabel: { fontWeight: '600', marginRight: 8 },
  status: { fontWeight: '500' },
  successText: { color: '#10b981' },
  errorText: { color: '#ef4444' },
  errorContainer: { backgroundColor: '#fef2f2', padding: 12, borderRadius: 6, marginBottom: 16 },
  errorTitle: { fontWeight: 'bold', color: '#dc2626', marginBottom: 4 },
  errorMessage: { color: '#dc2626', fontSize: 12 },
  projectsTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  projectsList: { maxHeight: 200, marginBottom: 16 },
  projectItem: { padding: 8, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  projectName: { fontWeight: '600', marginBottom: 2 },
  projectDetails: { fontSize: 12, color: '#6b7280' },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-around' },
  button: { backgroundColor: '#3b82f6', padding: 12, borderRadius: 6, minWidth: 100 },
  buttonText: { color: 'white', textAlign: 'center', fontWeight: '600' }
});