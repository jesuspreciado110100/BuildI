import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { offlineDocumentService } from '../services/OfflineDocumentService';

interface OfflineSyncIndicatorProps {
  documentId?: string;
  showDetails?: boolean;
}

export const OfflineSyncIndicator: React.FC<OfflineSyncIndicatorProps> = ({
  documentId,
  showDetails = false
}) => {
  const [syncStatus, setSyncStatus] = useState(offlineDocumentService.getSyncStatus());
  const [documentStatus, setDocumentStatus] = useState<string>('synced');

  useEffect(() => {
    const interval = setInterval(() => {
      setSyncStatus(offlineDocumentService.getSyncStatus());
    }, 1000);

    if (documentId) {
      loadDocumentStatus();
    }

    return () => clearInterval(interval);
  }, [documentId]);

  const loadDocumentStatus = async () => {
    if (documentId) {
      const doc = await offlineDocumentService.getOfflineDocument(documentId);
      setDocumentStatus(doc?.syncStatus || 'synced');
    }
  };

  const getStatusIcon = () => {
    if (!syncStatus.isOnline) return 'cloud-offline';
    if (syncStatus.syncInProgress) return 'sync';
    if (documentStatus === 'conflict') return 'warning';
    if (documentStatus === 'pending') return 'time';
    return 'cloud-done';
  };

  const getStatusColor = () => {
    if (!syncStatus.isOnline) return '#ff6b6b';
    if (syncStatus.syncInProgress) return '#4ecdc4';
    if (documentStatus === 'conflict') return '#ffa726';
    if (documentStatus === 'pending') return '#42a5f5';
    return '#66bb6a';
  };

  const getStatusText = () => {
    if (!syncStatus.isOnline) return 'Offline';
    if (syncStatus.syncInProgress) return 'Syncing...';
    if (documentStatus === 'conflict') return 'Conflict';
    if (documentStatus === 'pending') return 'Pending';
    return 'Synced';
  };

  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#f8f9fa',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: '#e9ecef'
    }}>
      {syncStatus.syncInProgress ? (
        <ActivityIndicator size="small" color={getStatusColor()} />
      ) : (
        <Ionicons 
          name={getStatusIcon() as any} 
          size={16} 
          color={getStatusColor()} 
        />
      )}
      
      <Text style={{
        marginLeft: 6,
        fontSize: 12,
        fontWeight: '500',
        color: getStatusColor()
      }}>
        {getStatusText()}
      </Text>

      {showDetails && syncStatus.queueLength > 0 && (
        <View style={{
          marginLeft: 8,
          backgroundColor: getStatusColor(),
          borderRadius: 10,
          paddingHorizontal: 6,
          paddingVertical: 2
        }}>
          <Text style={{
            fontSize: 10,
            color: 'white',
            fontWeight: 'bold'
          }}>
            {syncStatus.queueLength}
          </Text>
        </View>
      )}
    </View>
  );
};