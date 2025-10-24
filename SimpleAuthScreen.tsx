import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function SimpleAuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const { login, signup, isLoading, error } = useAuth();

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (isSignup && !name) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    try {
      if (isSignup) {
        await signup(email, password, { name, role: 'contractor' });
        if (email !== 'demo@construction.com') {
          Alert.alert('Success', 'Account created successfully!');
        }
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      Alert.alert('Authentication Error', err.message || 'Please try again');
    }
  };

  const handleDemoLogin = () => {
    setEmail('demo@construction.com');
    setPassword('demo123456');
    setName('Demo User');
    setIsSignup(false);
  };

  const handleQuickDemo = async () => {
    try {
      await login('demo@construction.com', 'demo123456');
    } catch (err: any) {
      Alert.alert('Demo Error', 'Please use the demo credentials manually');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Construction Management</Text>
      
      <View style={styles.form}>
        {isSignup && (
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        )}
        
        <TextInput
          style={styles.input}
          placeholder="Email"
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
          style={styles.button} 
          onPress={handleAuth}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Loading...' : (isSignup ? 'Sign Up' : 'Login')}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.linkButton} 
          onPress={() => setIsSignup(!isSignup)}
        >
          <Text style={styles.linkText}>
            {isSignup ? 'Already have an account? Login' : 'Need an account? Sign Up'}
          </Text>
        </TouchableOpacity>
        
        <View style={styles.demoSection}>
          <TouchableOpacity 
            style={styles.demoButton} 
            onPress={handleDemoLogin}
          >
            <Text style={styles.demoButtonText}>Fill Demo Credentials</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickDemoButton} 
            onPress={handleQuickDemo}
          >
            <Text style={styles.quickDemoButtonText}>Quick Demo Login</Text>
          </TouchableOpacity>
        </View>
        
        {error && <Text style={styles.error}>{error}</Text>}
        
        <View style={styles.instructions}>
          <Text style={styles.instructionTitle}>Demo Account:</Text>
          <Text style={styles.instructionText}>Email: demo@construction.com</Text>
          <Text style={styles.instructionText}>Password: demo123456</Text>
          <Text style={styles.instructionNote}>No email verification required for demo</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  form: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    marginBottom: 15,
    borderRadius: 8,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkButton: {
    alignItems: 'center',
    marginBottom: 15,
  },
  linkText: {
    color: '#007AFF',
    fontSize: 14,
  },
  demoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  demoButton: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 8,
    flex: 0.48,
    alignItems: 'center',
  },
  demoButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  quickDemoButton: {
    backgroundColor: '#17a2b8',
    padding: 12,
    borderRadius: 8,
    flex: 0.48,
    alignItems: 'center',
  },
  quickDemoButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 15,
    fontSize: 14,
  },
  instructions: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  instructionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  instructionText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  instructionNote: {
    fontSize: 11,
    color: '#28a745',
    textAlign: 'center',
    marginTop: 5,
    fontStyle: 'italic',
  },
});