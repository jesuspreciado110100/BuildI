import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, Alert, Image } from 'react-native';
import { MaterialOrder, MaterialScanLog } from '../types';
import { QRGeneratorService } from '../services/QRGeneratorService';

interface MaterialScannerModalProps {
  visible: boolean;
  onClose: () => void;
  order: MaterialOrder;
  onScanComplete: (scanLog: MaterialScanLog) => void;
}

export const MaterialScannerModal: React.FC<MaterialScannerModalProps> = ({
  visible,
  onClose,
  order,
  onScanComplete
}) => {
  const [scannedCode, setScannedCode] = useState('');
  const [status, setStatus] = useState<'delivered' | 'partial' | 'rejected'>('delivered');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [photoProof, setPhotoProof] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  const handleScan = () => {
    setScanning(true);
    // Mock QR scan - in real app would use camera
    setTimeout(() => {
      const mockQR = order.qr_code || `QR_MATERIAL_${order.id}_${Date.now()}`;
      setScannedCode(mockQR);
      setScanning(false);
    }, 1500);
  };

  const handlePhotoCapture = () => {
    // Mock photo capture
    const mockPhotoUrl = `https://example.com/delivery-proof-${Date.now()}.jpg`;
    setPhotoProof(mockPhotoUrl);
    Alert.alert('Photo Captured', 'Delivery proof photo saved');
  };

  const handleSubmit = () => {
    if (!scannedCode) {
      Alert.alert('Error', 'Please scan QR code first');
      return;
    }

    const decoded = QRGeneratorService.decodeQR(scannedCode);
    if (!decoded.isValid || decoded.id !== order.id) {
      Alert.alert('Invalid QR Code', 'This QR code does not match the order');
      return;
    }

    const scanLog: MaterialScanLog = {
      id: `scan_${Date.now()}`,
      order_id: order.id,
      material_id: order.items[0]?.material_id || '',
      scanned_by_user_id: 'current_user_id',
      scan_time: new Date().toISOString(),
      status,
      quantity_scanned: parseInt(quantity) || 0,
      photo_proof_url: photoProof || undefined,
      notes: notes || undefined
    };

    onScanComplete(scanLog);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setScannedCode('');
    setStatus('delivered');
    setQuantity('');
    setNotes('');
    setPhotoProof(null);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Scan Material Delivery</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.orderInfo}>
          <Text style={styles.orderTitle}>Order #{order.id.slice(-6)}</Text>
          <Text style={styles.orderDetails}>
            {order.items.length} items • Expected: {order.expected_count || 0}
          </Text>
        </View>

        <View style={styles.scanSection}>
          <TouchableOpacity 
            style={[styles.scanButton, scanning && styles.scanButtonActive]} 
            onPress={handleScan}
            disabled={scanning}
          >
            <Text style={styles.scanButtonText}>
              {scanning ? 'Scanning...' : 'Scan QR Code'}
            </Text>
          </TouchableOpacity>
          
          {scannedCode && (
            <View style={styles.scannedCode}>
              <Text style={styles.scannedLabel}>Scanned:</Text>
              <Text style={styles.scannedText}>{scannedCode}</Text>
            </View>
          )}
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Delivery Status</Text>
          <View style={styles.statusButtons}>
            {(['delivered', 'partial', 'rejected'] as const).map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.statusButton, status === s && styles.statusButtonActive]}
                onPress={() => setStatus(s)}
              >
                <Text style={[styles.statusButtonText, status === s && styles.statusButtonTextActive]}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Quantity Received</Text>
          <TextInput
            style={styles.input}
            value={quantity}
            onChangeText={setQuantity}
            placeholder="Enter quantity"
            keyboardType="numeric"
          />

          <Text style={styles.label}>Notes (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Add notes about delivery condition..."
            multiline
            numberOfLines={3}
          />

          <TouchableOpacity style={styles.photoButton} onPress={handlePhotoCapture}>
            <Text style={styles.photoButtonText}>
              {photoProof ? '✓ Photo Captured' : '📷 Capture Photo Proof'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Complete Scan</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333'
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center'
  },
  closeText: {
    fontSize: 20,
    color: '#666'
  },
  orderInfo: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20
  },
  orderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  orderDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 5
  },
  scanSection: {
    alignItems: 'center',
    marginBottom: 20
  },
  scanButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 15
  },
  scanButtonActive: {
    backgroundColor: '#0056CC'
  },
  scanButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  scannedCode: {
    backgroundColor: '#e8f5e8',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center'
  },
  scannedLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5
  },
  scannedText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2d5a2d'
  },
  form: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10
  },
  statusButtons: {
    flexDirection: 'row',
    marginBottom: 20
  },
  statusButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 5,
    alignItems: 'center'
  },
  statusButtonActive: {
    backgroundColor: '#007AFF'
  },
  statusButtonText: {
    fontSize: 14,
    color: '#666'
  },
  statusButtonTextActive: {
    color: 'white',
    fontWeight: 'bold'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: 'white',
    marginBottom: 15
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top'
  },
  photoButton: {
    backgroundColor: '#34C759',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center'
  },
  photoButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center'
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  }
});