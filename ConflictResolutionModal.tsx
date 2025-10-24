import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { OfflineDocument, offlineDocumentService } from '../services/OfflineDocumentService';

interface ConflictResolutionModalProps {
  visible: boolean;
  onClose: () => void;
  localDocument: OfflineDocument;
  remoteDocument: any;
  onResolve: (resolution: 'local' | 'remote' | 'merge') => void;
}

export const ConflictResolutionModal: React.FC<ConflictResolutionModalProps> = ({
  visible,
  onClose,
  localDocument,
  remoteDocument,
  onResolve
}) => {
  const [selectedResolution, setSelectedResolution] = useState<'local' | 'remote' | 'merge'>('local');

  const handleResolve = () => {
    Alert.alert(
      'Confirm Resolution',
      `Are you sure you want to ${selectedResolution === 'local' ? 'keep your changes' : 
        selectedResolution === 'remote' ? 'use server version' : 'merge both versions'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: () => {
            onResolve(selectedResolution);
            onClose();
          }
        }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 20,
          borderBottomWidth: 1,
          borderBottomColor: '#e9ecef'
        }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#212529' }}>
            Resolve Conflict
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#6c757d" />
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1, padding: 20 }}>
          <View style={{
            backgroundColor: '#fff3cd',
            padding: 16,
            borderRadius: 8,
            marginBottom: 20,
            borderLeftWidth: 4,
            borderLeftColor: '#ffc107'
          }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#856404', marginBottom: 8 }}>
              Document Conflict Detected
            </Text>
            <Text style={{ color: '#856404' }}>
              This document was modified both locally and on the server. Choose how to resolve the conflict.
            </Text>
          </View>

          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 16, color: '#212529' }}>
            Document: {localDocument.title}
          </Text>

          {/* Local Version */}
          <TouchableOpacity
            style={{
              borderWidth: 2,
              borderColor: selectedResolution === 'local' ? '#007bff' : '#dee2e6',
              borderRadius: 8,
              padding: 16,
              marginBottom: 12,
              backgroundColor: selectedResolution === 'local' ? '#f8f9ff' : 'white'
            }}
            onPress={() => setSelectedResolution('local')}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Ionicons 
                name={selectedResolution === 'local' ? 'radio-button-on' : 'radio-button-off'} 
                size={20} 
                color={selectedResolution === 'local' ? '#007bff' : '#6c757d'} 
              />
              <Text style={{ 
                marginLeft: 8, 
                fontSize: 16, 
                fontWeight: '600',
                color: selectedResolution === 'local' ? '#007bff' : '#212529'
              }}>
                Keep My Changes (Local)
              </Text>
            </View>
            <Text style={{ color: '#6c757d', marginBottom: 4 }}>
              Modified: {formatDate(localDocument.lastModified)}
            </Text>
            <Text style={{ color: '#6c757d' }}>
              Version: {localDocument.version}
            </Text>
          </TouchableOpacity>

          {/* Remote Version */}
          <TouchableOpacity
            style={{
              borderWidth: 2,
              borderColor: selectedResolution === 'remote' ? '#007bff' : '#dee2e6',
              borderRadius: 8,
              padding: 16,
              marginBottom: 12,
              backgroundColor: selectedResolution === 'remote' ? '#f8f9ff' : 'white'
            }}
            onPress={() => setSelectedResolution('remote')}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Ionicons 
                name={selectedResolution === 'remote' ? 'radio-button-on' : 'radio-button-off'} 
                size={20} 
                color={selectedResolution === 'remote' ? '#007bff' : '#6c757d'} 
              />
              <Text style={{ 
                marginLeft: 8, 
                fontSize: 16, 
                fontWeight: '600',
                color: selectedResolution === 'remote' ? '#007bff' : '#212529'
              }}>
                Use Server Version (Remote)
              </Text>
            </View>
            <Text style={{ color: '#6c757d', marginBottom: 4 }}>
              Modified: {formatDate(remoteDocument.updated_at)}
            </Text>
            <Text style={{ color: '#6c757d' }}>
              Version: {remoteDocument.version}
            </Text>
          </TouchableOpacity>

          {/* Merge Option */}
          <TouchableOpacity
            style={{
              borderWidth: 2,
              borderColor: selectedResolution === 'merge' ? '#007bff' : '#dee2e6',
              borderRadius: 8,
              padding: 16,
              marginBottom: 20,
              backgroundColor: selectedResolution === 'merge' ? '#f8f9ff' : 'white'
            }}
            onPress={() => setSelectedResolution('merge')}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Ionicons 
                name={selectedResolution === 'merge' ? 'radio-button-on' : 'radio-button-off'} 
                size={20} 
                color={selectedResolution === 'merge' ? '#007bff' : '#6c757d'} 
              />
              <Text style={{ 
                marginLeft: 8, 
                fontSize: 16, 
                fontWeight: '600',
                color: selectedResolution === 'merge' ? '#007bff' : '#212529'
              }}>
                Merge Both Versions
              </Text>
            </View>
            <Text style={{ color: '#6c757d' }}>
              Combine changes from both versions (requires manual review)
            </Text>
          </TouchableOpacity>
        </ScrollView>

        <View style={{
          padding: 20,
          borderTopWidth: 1,
          borderTopColor: '#e9ecef'
        }}>
          <TouchableOpacity
            style={{
              backgroundColor: '#007bff',
              paddingVertical: 14,
              borderRadius: 8,
              alignItems: 'center'
            }}
            onPress={handleResolve}
          >
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
              Resolve Conflict
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};