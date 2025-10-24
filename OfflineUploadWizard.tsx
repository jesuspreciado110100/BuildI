import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { offlineUploadService } from '../services/OfflineUploadService';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function OfflineUploadWizard({ visible, onClose }: Props) {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (visible) {
      checkStatus();
    }
  }, [visible]);

  const checkStatus = async () => {
    const online = await offlineUploadService.isOnline();
    const pending = await offlineUploadService.getPendingUploads();
    setIsOnline(online);
    setPendingCount(pending.filter(p => !p.isSynced).length);
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const result = await offlineUploadService.syncPendingUploads();
      if (result.success > 0) {
        Alert.alert('Success', `${result.success} machines synced successfully!`);
        await checkStatus();
      }
      if (result.failed > 0) {
        Alert.alert('Warning', `${result.failed} machines failed to sync`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to sync machines');
    } finally {
      setSyncing(false);
    }
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <View style={styles.header}>
          <Text style={styles.title}>Offline Sync</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.content}>
          <View style={styles.statusContainer}>
            <Ionicons 
              name={isOnline ? "wifi" : "wifi-off"} 
              size={48} 
              color={isOnline ? "#10b981" : "#f59e0b"} 
            />
            <Text style={styles.statusText}>
              {isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
          
          {pendingCount > 0 && (
            <View style={styles.pendingContainer}>
              <Text style={styles.pendingText}>
                {pendingCount} machines waiting to sync
              </Text>
              
              {isOnline && (
                <TouchableOpacity 
                  style={styles.syncButton} 
                  onPress={handleSync}
                  disabled={syncing}
                >
                  <Ionicons name="sync" size={20} color="white" />
                  <Text style={styles.syncButtonText}>
                    {syncing ? 'Syncing...' : 'Sync Now'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          
          {pendingCount === 0 && (
            <Text style={styles.noDataText}>No pending uploads</Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  modal: {
    backgroundColor: 'white',
    width: '80%',
    borderRadius: 15,
    padding: 20
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151'
  },
  content: {
    alignItems: 'center'
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 20
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 10,
    color: '#374151'
  },
  pendingContainer: {
    alignItems: 'center',
    marginBottom: 20
  },
  pendingText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 15
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dc2626',
    padding: 12,
    borderRadius: 8
  },
  syncButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8
  },
  noDataText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center'
  }
});