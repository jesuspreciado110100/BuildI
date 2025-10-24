import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';

export function EnhancedAuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { login, signup } = useAuth();

  const handleAuth = async () => {
    setErrorMsg('');
    if (!email || !password) {
      setErrorMsg('Please enter email and password');
      return;
    }
    if (!isLogin && !name) {
      setErrorMsg('Please enter your name');
      return;
    }

    setLoading(true);
    console.log(`🔐 Attempting ${isLogin ? 'login' : 'signup'} for:`, email);

    try {
      if (isLogin) {
        await login(email, password);
        console.log('✅ Login successful');
      } else {
        await signup(email, password, { name, role: 'contractor' });
        console.log('✅ Signup successful');
      }
    } catch (error: any) {
      console.error('❌ Auth error:', error);
      const msg = error.message || 'Authentication failed';
      setErrorMsg(msg);
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Construction Platform</Text>
        <Text style={styles.subtitle}>{isLogin ? 'Welcome Back' : 'Create Account'}</Text>
      </View>

      <View style={styles.form}>
        {!isLogin && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              autoCapitalize="words"
            />
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="your@email.com"
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter password"
            secureTextEntry
            autoComplete="password"
          />
        </View>

        {errorMsg ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>❌ {errorMsg}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleAuth}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>
              {isLogin ? 'Login' : 'Sign Up'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.switchButton}
          onPress={() => {
            setIsLogin(!isLogin);
            setErrorMsg('');
          }}
        >
          <Text style={styles.switchText}>
            {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.debugInfo}>
        <Text style={styles.debugText}>Testing with: japn2000@live.com.mx</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  content: { padding: 20, paddingTop: 60 },
  header: { marginBottom: 40, alignItems: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 8 },
  subtitle: { fontSize: 18, color: '#666' },
  form: { backgroundColor: 'white', padding: 24, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 14, fontSize: 16, backgroundColor: '#f8f9fa' },
  errorBox: { backgroundColor: '#fee', padding: 12, borderRadius: 8, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#f44' },
  errorText: { color: '#c33', fontSize: 14 },
  button: { backgroundColor: '#007AFF', padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  switchButton: { marginTop: 20, alignItems: 'center', padding: 12 },
  switchText: { color: '#007AFF', fontSize: 14, fontWeight: '500' },
  debugInfo: { marginTop: 20, padding: 12, backgroundColor: '#fff3cd', borderRadius: 8 },
  debugText: { fontSize: 12, color: '#856404', textAlign: 'center' },
});
