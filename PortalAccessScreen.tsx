import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { PortalAccessService } from '../services/PortalAccessService';
import { ClientPortalViewer } from './ClientPortalViewer';
import { ClientPortal } from '../types/ClientPortal';

export const PortalAccessScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [portal, setPortal] = useState<ClientPortal | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleAccessPortal = async () => {
    if (!email.trim() || !accessCode.trim()) {
      Alert.alert('Error', 'Please enter both email and access code');
      return;
    }

    setLoading(true);
    try {
      const result = await PortalAccessService.verifyAccessCode(email, accessCode);
      
      if (result.isValid && result.portal) {
        setPortal(result.portal);
        setIsAuthenticated(true);
      } else {
        Alert.alert('Access Denied', result.error || 'Invalid credentials');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to verify access code');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPortal(null);
    setEmail('');
    setAccessCode('');
  };

  if (isAuthenticated && portal) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Client Portal</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
        <ClientPortalViewer 
          siteId={portal.site_id}
          role={portal.role}
          portalId={portal.id}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.loginContainer}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>🏗️</Text>
          <Text style={styles.title}>Client Portal Access</Text>
          <Text style={styles.subtitle}>
            Enter your email and access code to view project details
          </Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.inputLabel}>Email Address</Text>
          <TextInput
            style={styles.textInput}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.inputLabel}>Access Code</Text>
          <TextInput
            style={styles.textInput}
            value={accessCode}
            onChangeText={setAccessCode}
            placeholder="Enter access code"
            placeholderTextColor="#999"
            autoCapitalize="characters"
            maxLength={8}
          />

          <TouchableOpacity 
            style={[styles.accessButton, loading && styles.accessButtonDisabled]}
            onPress={handleAccessPortal}
            disabled={loading}
          >
            <Text style={styles.accessButtonText}>
              {loading ? 'Verifying...' : 'Access Portal'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.helpContainer}>
          <Text style={styles.helpText}>
            Don't have an access code? Contact your contractor for portal access.
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutButton: {
    backgroundColor: '#f44336',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoText: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  accessButton: {
    backgroundColor: '#2196f3',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  accessButtonDisabled: {
    backgroundColor: '#ccc',
  },
  accessButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  helpContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});