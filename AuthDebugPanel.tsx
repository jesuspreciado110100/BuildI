import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { supabase } from '../lib/supabase';

export function AuthDebugPanel() {
  const [email, setEmail] = useState('japn2000@live.com.mx');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<string[]>([]);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    checkConnection();
  }, []);

  const addLog = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const emoji = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
    setStatus(prev => [`${emoji} ${new Date().toLocaleTimeString()}: ${message}`, ...prev].slice(0, 20));
  };

  const checkConnection = async () => {
    addLog('Testing Supabase connection...');
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        addLog(`Connection error: ${error.message}`, 'error');
      } else {
        addLog('Supabase connected successfully', 'success');
        setSession(data.session);
        if (data.session) {
          addLog(`Active session: ${data.session.user.email}`, 'success');
        }
      }
    } catch (err: any) {
      addLog(`Connection failed: ${err.message}`, 'error');
    }
  };

  const testLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    addLog(`Attempting login for: ${email}`);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        addLog(`Login failed: ${error.message}`, 'error');
        Alert.alert('Login Failed', error.message);
      } else {
        addLog(`Login successful: ${data.user?.email}`, 'success');
        setSession(data.session);
        Alert.alert('Success', 'Logged in successfully!');
      }
    } catch (err: any) {
      addLog(`Login error: ${err.message}`, 'error');
    }
  };

  const testSignup = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    addLog(`Attempting signup for: ${email}`);
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        addLog(`Signup failed: ${error.message}`, 'error');
      } else {
        addLog(`Signup successful: ${data.user?.email}`, 'success');
      }
    } catch (err: any) {
      addLog(`Signup error: ${err.message}`, 'error');
    }
  };

  const testLogout = async () => {
    addLog('Attempting logout...');
    const { error } = await supabase.auth.signOut();
    if (error) {
      addLog(`Logout failed: ${error.message}`, 'error');
    } else {
      addLog('Logged out successfully', 'success');
      setSession(null);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🔧 Auth Debug Panel</Text>
      
      <View style={styles.section}>
        <Text style={styles.label}>Email:</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <Text style={styles.label}>Password:</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.button} onPress={testLogin}>
          <Text style={styles.buttonText}>Test Login</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={testSignup}>
          <Text style={styles.buttonText}>Test Signup</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.dangerButton]} onPress={testLogout}>
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.infoButton]} onPress={checkConnection}>
          <Text style={styles.buttonText}>Check Connection</Text>
        </TouchableOpacity>
      </View>

      {session && (
        <View style={styles.sessionInfo}>
          <Text style={styles.sessionTitle}>Current Session:</Text>
          <Text style={styles.sessionText}>Email: {session.user?.email}</Text>
          <Text style={styles.sessionText}>ID: {session.user?.id}</Text>
        </View>
      )}

      <View style={styles.logs}>
        <Text style={styles.logsTitle}>Logs:</Text>
        {status.map((log, i) => (
          <Text key={i} style={styles.logText}>{log}</Text>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  section: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 15 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 5, color: '#333' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 15, fontSize: 16 },
  buttons: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 15 },
  button: { flex: 1, minWidth: '45%', backgroundColor: '#007AFF', padding: 12, borderRadius: 8, alignItems: 'center' },
  secondaryButton: { backgroundColor: '#34C759' },
  dangerButton: { backgroundColor: '#FF3B30' },
  infoButton: { backgroundColor: '#5856D6' },
  buttonText: { color: 'white', fontWeight: '600', fontSize: 14 },
  sessionInfo: { backgroundColor: '#E8F5E9', padding: 15, borderRadius: 10, marginBottom: 15 },
  sessionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#2E7D32' },
  sessionText: { fontSize: 14, color: '#333', marginBottom: 5 },
  logs: { backgroundColor: 'white', padding: 15, borderRadius: 10 },
  logsTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  logText: { fontSize: 12, fontFamily: 'monospace', marginBottom: 5, color: '#666' },
});
