import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export default function DebugAuthPanel() {
  const { user, isEmailVerified, hasSkippedVerification, permanentRole } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const checkUserInDB = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', user.email)
      .single();
    
    setDebugInfo({ data, error });
  };

  const checkAuthUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setDebugInfo(session);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🔍 Auth Debug Panel</Text>
      
      <View style={styles.section}>
        <Text style={styles.label}>User Email:</Text>
        <Text style={styles.value}>{user?.email || 'Not logged in'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>User ID:</Text>
        <Text style={styles.value}>{user?.id || 'N/A'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Role:</Text>
        <Text style={styles.value}>{permanentRole || 'N/A'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Email Verified:</Text>
        <Text style={[styles.value, isEmailVerified ? styles.success : styles.error]}>
          {isEmailVerified ? '✅ Yes' : '❌ No'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Skipped Verification:</Text>
        <Text style={styles.value}>{hasSkippedVerification ? '✅ Yes' : '❌ No'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Created At:</Text>
        <Text style={styles.value}>{user?.created_at || 'N/A'}</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={checkUserInDB}>
        <Text style={styles.buttonText}>Check User in Database</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={checkAuthUser}>
        <Text style={styles.buttonText}>Check Auth Session</Text>
      </TouchableOpacity>

      {debugInfo && (
        <View style={styles.debugBox}>
          <Text style={styles.debugTitle}>Debug Info:</Text>
          <Text style={styles.debugText}>{JSON.stringify(debugInfo, null, 2)}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  section: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 10 },
  label: { fontSize: 14, color: '#666', marginBottom: 5 },
  value: { fontSize: 16, fontWeight: '600', color: '#333' },
  success: { color: '#34C759' },
  error: { color: '#FF3B30' },
  button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, marginVertical: 10 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600', textAlign: 'center' },
  debugBox: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginTop: 20 },
  debugTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  debugText: { fontSize: 12, fontFamily: 'monospace', color: '#666' }
});
