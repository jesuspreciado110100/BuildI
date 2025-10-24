import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

interface DiagnosticInfo {
  authStatus: string;
  supabaseConnection: string;
  userProfile: any;
  sessionInfo: any;
  componentRenderCount: number;
  memoryUsage: string;
  errors: string[];
}

export default function AppDiagnostics() {
  const { user, session, isLoading, error } = useAuth();
  const [diagnostics, setDiagnostics] = useState<DiagnosticInfo>({
    authStatus: 'Unknown',
    supabaseConnection: 'Unknown',
    userProfile: null,
    sessionInfo: null,
    componentRenderCount: 0,
    memoryUsage: 'Unknown',
    errors: []
  });
  const [renderCount, setRenderCount] = useState(0);

  useEffect(() => {
    setRenderCount(prev => prev + 1);
    runDiagnostics();
  }, [user, session, isLoading, error]);

  const runDiagnostics = async () => {
    const errors: string[] = [];
    
    try {
      // Test Supabase connection
      const { data, error: supabaseError } = await supabase
        .from('users')
        .select('count')
        .limit(1);
      
      const supabaseStatus = supabaseError ? `Error: ${supabaseError.message}` : 'Connected';
      
      // Memory usage estimation
      const memoryInfo = (performance as any)?.memory ? 
        `${Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024)}MB` : 
        'Not available';
      
      // Auth status
      let authStatus = 'Not authenticated';
      if (isLoading) authStatus = 'Loading...';
      else if (user && session) authStatus = 'Authenticated';
      else if (error) authStatus = `Error: ${error}`;
      
      if (error) errors.push(`Auth Error: ${error}`);
      if (supabaseError) errors.push(`Supabase Error: ${supabaseError.message}`);
      
      setDiagnostics({
        authStatus,
        supabaseConnection: supabaseStatus,
        userProfile: user,
        sessionInfo: session ? {
          userId: session.user?.id,
          email: session.user?.email,
          expiresAt: new Date(session.expires_at! * 1000).toLocaleString()
        } : null,
        componentRenderCount: renderCount,
        memoryUsage: memoryInfo,
        errors
      });
    } catch (err: any) {
      errors.push(`Diagnostic Error: ${err.message}`);
      setDiagnostics(prev => ({ ...prev, errors }));
    }
  };

  const getStatusColor = (status: string) => {
    if (status.includes('Error')) return '#ff4444';
    if (status.includes('Loading')) return '#ffaa00';
    if (status.includes('Connected') || status.includes('Authenticated')) return '#44ff44';
    return '#888888';
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>App Diagnostics</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>System Status</Text>
        <Text style={[styles.status, { color: getStatusColor(diagnostics.authStatus) }]}>
          Auth: {diagnostics.authStatus}
        </Text>
        <Text style={[styles.status, { color: getStatusColor(diagnostics.supabaseConnection) }]}>
          Database: {diagnostics.supabaseConnection}
        </Text>
        <Text style={styles.status}>Memory: {diagnostics.memoryUsage}</Text>
        <Text style={styles.status}>Renders: {diagnostics.componentRenderCount}</Text>
      </View>

      {diagnostics.errors.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Errors</Text>
          {diagnostics.errors.map((error, index) => (
            <Text key={index} style={styles.error}>{error}</Text>
          ))}
        </View>
      )}

      {diagnostics.userProfile && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>User Profile</Text>
          <Text style={styles.info}>ID: {diagnostics.userProfile.id}</Text>
          <Text style={styles.info}>Email: {diagnostics.userProfile.email}</Text>
          <Text style={styles.info}>Name: {diagnostics.userProfile.name}</Text>
          <Text style={styles.info}>Role: {diagnostics.userProfile.role}</Text>
        </View>
      )}

      {diagnostics.sessionInfo && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Session Info</Text>
          <Text style={styles.info}>User ID: {diagnostics.sessionInfo.userId}</Text>
          <Text style={styles.info}>Email: {diagnostics.sessionInfo.email}</Text>
          <Text style={styles.info}>Expires: {diagnostics.sessionInfo.expiresAt}</Text>
        </View>
      )}

      <TouchableOpacity style={styles.button} onPress={runDiagnostics}>
        <Text style={styles.buttonText}>Refresh Diagnostics</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  },
  section: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333'
  },
  status: {
    fontSize: 14,
    marginBottom: 5,
    fontWeight: '500'
  },
  error: {
    fontSize: 14,
    color: '#ff4444',
    marginBottom: 5
  },
  info: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  }
});
