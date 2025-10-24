import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { EmailVerificationService } from '../services/EmailVerificationService';
import VerificationStatusBadge from './VerificationStatusBadge';

export default function EnhancedVerificationScreen() {
  const { user, logout, skipEmailVerification } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'pending' | 'verified' | 'expired' | 'error'>('pending');
  const [canResend, setCanResend] = useState(true);
  const [waitTime, setWaitTime] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true
    }).start();
  }, []);

  useEffect(() => {
    if (waitTime > 0) {
      const timer = setTimeout(() => setWaitTime(waitTime - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [waitTime]);

  const handleResend = async () => {
    if (!user || !canResend) return;

    setLoading(true);
    setMessage('');

    try {
      const throttle = await EmailVerificationService.checkThrottling(user.id);
      
      if (!throttle.canSend) {
        setWaitTime(throttle.waitTime || 60);
        setCanResend(false);
        setMessage(`Please wait ${throttle.waitTime}s before resending`);
        setStatus('error');
        return;
      }

      await EmailVerificationService.sendVerificationEmail(
        user.id,
        user.email,
        user.name
      );

      setMessage('✅ Verification email sent! Check your inbox.');
      setStatus('pending');
      setWaitTime(60);
      setCanResend(false);
    } catch (error: any) {
      setMessage(error.message || 'Failed to resend email');
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.card}>
        <Text style={styles.icon}>📧</Text>
        <Text style={styles.title}>Verify Your Email</Text>
        
        <VerificationStatusBadge status={status} />

        <Text style={styles.subtitle}>We sent a verification link to:</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <Text style={styles.instructions}>
          Click the link in the email to verify your account and continue.
        </Text>

        {message ? (
          <View style={[styles.messageBox, status === 'error' && styles.errorBox]}>
            <Text style={[styles.message, status === 'error' && styles.errorText]}>
              {message}
            </Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.button, (!canResend || loading) && styles.buttonDisabled]}
          onPress={handleResend}
          disabled={!canResend || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {waitTime > 0 ? `Resend in ${waitTime}s` : 'Resend Verification Email'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipButton} onPress={skipEmailVerification}>
          <Text style={styles.skipText}>Continue Without Verification</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Use Different Email</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', justifyContent: 'center', padding: 20 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 30, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 },
  icon: { fontSize: 72, marginBottom: 20 },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 5, marginTop: 15 },
  email: { fontSize: 17, fontWeight: '600', color: '#007AFF', marginBottom: 20 },
  instructions: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 25, lineHeight: 20 },
  messageBox: { backgroundColor: '#d4edda', padding: 12, borderRadius: 8, marginBottom: 15, width: '100%' },
  errorBox: { backgroundColor: '#f8d7da' },
  message: { fontSize: 14, color: '#155724', textAlign: 'center' },
  errorText: { color: '#721c24' },
  button: { backgroundColor: '#007AFF', paddingVertical: 16, paddingHorizontal: 30, borderRadius: 10, width: '100%', alignItems: 'center', marginBottom: 15 },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  skipButton: { backgroundColor: '#f8f9fa', paddingVertical: 14, paddingHorizontal: 30, borderRadius: 10, width: '100%', alignItems: 'center', marginBottom: 10, borderWidth: 2, borderColor: '#007AFF' },
  skipText: { color: '#007AFF', fontSize: 16, fontWeight: '600' },
  logoutButton: { paddingVertical: 12 },
  logoutText: { color: '#007AFF', fontSize: 14 }
});
