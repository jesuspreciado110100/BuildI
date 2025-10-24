import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { checkSupabaseConnection } from '../lib/supabase-config';

interface SupabaseConnectionStatusProps {
  onConnectionChange?: (connected: boolean) => void;
}

export const SupabaseConnectionStatus: React.FC<SupabaseConnectionStatusProps> = ({ 
  onConnectionChange 
}) => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkConnection = async () => {
    setIsChecking(true);
    try {
      const connected = await checkSupabaseConnection();
      setIsConnected(connected);
      onConnectionChange?.(connected);
    } catch (error) {
      console.log('Connection check failed, using mock mode');
      setIsConnected(false);
      onConnectionChange?.(false);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const getStatusColor = () => {
    if (isChecking) return '#FFA500';
    if (isConnected === null) return '#808080';
    return isConnected ? '#4CAF50' : '#FF9800';
  };

  const getStatusText = () => {
    if (isChecking) return 'Checking...';
    if (isConnected === null) return 'Unknown';
    return isConnected ? 'Connected' : 'Mock Mode';
  };

  return (
    <View style={styles.container}>
      <View style={styles.statusRow}>
        <View style={[styles.indicator, { backgroundColor: getStatusColor() }]} />
        <Text style={styles.statusText}>Database: {getStatusText()}</Text>
        <TouchableOpacity 
          style={styles.refreshButton} 
          onPress={checkConnection}
          disabled={isChecking}
        >
          <Text style={styles.refreshText}>↻</Text>
        </TouchableOpacity>
      </View>
      {!isConnected && isConnected !== null && (
        <Text style={styles.infoText}>
          Running in mock mode with sample data
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    margin: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  refreshButton: {
    padding: 4,
  },
  refreshText: {
    fontSize: 16,
    color: '#007AFF',
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});