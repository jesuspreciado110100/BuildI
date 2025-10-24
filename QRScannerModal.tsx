import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SiteAccessService } from '../services/SiteAccessService';
import { User } from '../types';

interface QRScannerModalProps {
  visible: boolean;
  onClose: () => void;
  siteId: string;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  visible,
  onClose,
  siteId
}) => {
  const [qrInput, setQrInput] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scannedUser, setScannedUser] = useState<User | null>(null);
  const [result, setResult] = useState<'success' | 'rejected' | null>(null);

  const handleScan = async () => {
    if (!qrInput.trim()) {
      Alert.alert('Error', 'Please enter a QR code');
      return;
    }

    setScanning(true);
    
    try {
      // Simulate scanning delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const user = await SiteAccessService.getUserByQR(qrInput);
      
      if (user) {
        setScannedUser(user);
        
        // Log entry attempt
        const entry = await SiteAccessService.logEntry(
          user.id,
          siteId,
          new Date().toISOString()
        );
        
        setResult(entry.approved ? 'success' : 'rejected');
      } else {
        setResult('rejected');
        Alert.alert('Access Denied', 'Invalid QR code');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to scan QR code');
    } finally {
      setScanning(false);
    }
  };

  const handleClose = () => {
    setQrInput('');
    setScannedUser(null);
    setResult(null);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>QR Code Scanner</Text>
          
          <View style={styles.scannerArea}>
            <Text style={styles.instruction}>
              📱 Point camera at QR code or enter manually:
            </Text>
            
            <TextInput
              style={styles.input}
              placeholder="Enter QR code (e.g., QR123456)"
              value={qrInput}
              onChangeText={setQrInput}
              autoCapitalize="characters"
            />
            
            <TouchableOpacity
              style={[styles.scanButton, scanning && styles.scanningButton]}
              onPress={handleScan}
              disabled={scanning}
            >
              <Text style={styles.scanButtonText}>
                {scanning ? 'Scanning...' : 'Scan QR Code'}
              </Text>
            </TouchableOpacity>
          </View>

          {scannedUser && (
            <View style={styles.resultArea}>
              <Text style={styles.userInfo}>
                👤 {scannedUser.name}
              </Text>
              <Text style={styles.roleInfo}>
                Role: {scannedUser.role.replace('_', ' ').toUpperCase()}
              </Text>
              
              <View style={[
                styles.statusBadge,
                result === 'success' ? styles.successBadge : styles.rejectedBadge
              ]}>
                <Text style={styles.statusText}>
                  {result === 'success' ? '✅ ACCESS GRANTED' : '❌ ACCESS DENIED'}
                </Text>
              </View>
              
              {result === 'rejected' && (
                <Text style={styles.rejectionReason}>
                  Reason: Invalid role for site access
                </Text>
              )}
            </View>
          )}

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  scannerArea: {
    marginBottom: 20,
  },
  instruction: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15,
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  scanButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  scanningButton: {
    backgroundColor: '#999',
  },
  scanButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultArea: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  userInfo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  roleInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  statusBadge: {
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 10,
  },
  successBadge: {
    backgroundColor: '#d4edda',
  },
  rejectedBadge: {
    backgroundColor: '#f8d7da',
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  rejectionReason: {
    fontSize: 14,
    color: '#721c24',
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  closeButton: {
    backgroundColor: '#6c757d',
    padding: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});