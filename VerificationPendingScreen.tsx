import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function VerificationPendingScreen() {
  const { user, resendVerificationEmail, logout, skipEmailVerification } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleResend = async () => {
    setLoading(true);
    setMessage('');
    try {
      await resendVerificationEmail();
      setMessage('Verification email sent! Check your inbox.');
    } catch (error: any) {
      setMessage(error.message || 'Failed to resend email');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    skipEmailVerification();
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.icon}>📧</Text>
        <Text style={styles.title}>Verify Your Email</Text>
        <Text style={styles.subtitle}>
          We sent a verification link to:
        </Text>
        <Text style={styles.email}>{user?.email}</Text>
        <Text style={styles.instructions}>
          Click the link in the email to verify your account and continue.
        </Text>

        {message ? (
          <Text style={[styles.message, message.includes('Failed') && styles.error]}>
            {message}
          </Text>
        ) : null}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleResend}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Resend Verification Email</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Continue Without Verification</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Use Different Email</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', justifyContent: 'center', padding: 20 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 30, alignItems: 'center' },
  icon: { fontSize: 64, marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 5 },
  email: { fontSize: 16, fontWeight: '600', color: '#007AFF', marginBottom: 20 },
  instructions: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 30 },
  message: { fontSize: 14, color: '#28a745', marginBottom: 15, textAlign: 'center' },
  error: { color: '#dc3545' },
  button: { backgroundColor: '#007AFF', paddingVertical: 14, paddingHorizontal: 30, borderRadius: 8, width: '100%', alignItems: 'center', marginBottom: 15 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  skipButton: { backgroundColor: '#f8f9fa', paddingVertical: 14, paddingHorizontal: 30, borderRadius: 8, width: '100%', alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: '#007AFF' },
  skipText: { color: '#007AFF', fontSize: 16, fontWeight: '600' },
  logoutButton: { paddingVertical: 10 },
  logoutText: { color: '#007AFF', fontSize: 14 },
});

