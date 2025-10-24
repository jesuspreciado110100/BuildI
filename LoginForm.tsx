import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { User } from '../types';

interface LoginFormProps {
  onLogin: (email: string, password: string) => void;
  onSignUp: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Trim whitespace and validate email
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    
    if (!trimmedEmail || !trimmedPassword) {
      Alert.alert('Error', 'Please enter valid email and password');
      return;
    }

    setIsLoading(true);
    
    try {
      await onLogin(trimmedEmail, trimmedPassword);
    } catch (error) {
      Alert.alert('Error', 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Construction Platform</Text>
      <Text style={styles.subtitle}>Sign in to continue</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email (try: contractor@test.com)"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <TouchableOpacity 
        style={[styles.button, isLoading && styles.buttonDisabled]} 
        onPress={handleLogin}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.signUpButton} 
        onPress={onSignUp}
      >
        <Text style={styles.signUpText}>
          New user? Sign up here
        </Text>
      </TouchableOpacity>

      <Text style={styles.helpText}>
        Try: contractor@test.com, labor@test.com, machinery@test.com, etc.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#2563eb',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    color: '#6b7280',
  },
  input: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: 'white',
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#2563eb',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signUpButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2563eb',
    marginBottom: 20,
  },
  signUpText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
  },
  helpText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#6b7280',
    marginTop: 20,
  },
});