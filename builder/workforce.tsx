import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LaborRequestScreen } from '../components/LaborRequestScreen';
import { GafeteScannerModal } from '../components/GafeteScannerModal';

export default function WorkforceTab() {
  const [scanning, setScanning] = useState(false);

  return (
    <View style={styles.container}>
      <LaborRequestScreen />
      <TouchableOpacity style={styles.scanButton} onPress={() => setScanning(true)} accessibilityLabel="Escanear gafete">
        <Ionicons name="qr-code" size={20} color="#FFFFFF" />
        <Text style={styles.scanText}>Escanear gafete</Text>
      </TouchableOpacity>
      <GafeteScannerModal visible={scanning} onClose={() => setScanning(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scanButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0EA5E9',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  scanText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
