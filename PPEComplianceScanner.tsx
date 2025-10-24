import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { SiteAccessService } from '../services/SiteAccessService';
import { PPEViolation } from '../types';

interface PPEComplianceScannerProps {
  userId: string;
  onViolationDetected?: (violation: PPEViolation) => void;
}

interface PPEResult {
  helmet: boolean;
  vest: boolean;
  glasses: boolean;
  gloves: boolean;
  boots: boolean;
}

export const PPEComplianceScanner: React.FC<PPEComplianceScannerProps> = ({
  userId,
  onViolationDetected
}) => {
  const [scanning, setScanning] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<PPEResult | null>(null);
  const [violations, setViolations] = useState<string[]>([]);

  const mockPhotoCapture = () => {
    // Simulate photo capture
    const mockPhotoUri = 'https://via.placeholder.com/300x200?text=Worker+Photo';
    setPhotoUri(mockPhotoUri);
    return mockPhotoUri;
  };

  const mockAIScan = async (): Promise<PPEResult> => {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock AI results with some randomness
    const results: PPEResult = {
      helmet: Math.random() > 0.3, // 70% chance of having helmet
      vest: Math.random() > 0.4,   // 60% chance of having vest
      glasses: Math.random() > 0.5, // 50% chance of having glasses
      gloves: Math.random() > 0.6,  // 40% chance of having gloves
      boots: Math.random() > 0.2    // 80% chance of having boots
    };
    
    return results;
  };

  const handleScan = async () => {
    setScanning(true);
    setScanResult(null);
    setViolations([]);
    
    try {
      // Capture photo
      const photoUri = mockPhotoCapture();
      
      // Perform AI scan
      const result = await mockAIScan();
      setScanResult(result);
      
      // Check for violations
      const detectedViolations: string[] = [];
      
      Object.entries(result).forEach(([item, detected]) => {
        if (!detected) {
          detectedViolations.push(item);
        }
      });
      
      setViolations(detectedViolations);
      
      // Log violations
      for (const violation of detectedViolations) {
        const ppeViolation = await SiteAccessService.logPPEViolation(
          userId,
          violation as any,
          new Date().toISOString(),
          photoUri
        );
        
        if (onViolationDetected) {
          onViolationDetected(ppeViolation);
        }
      }
      
      if (detectedViolations.length > 0) {
        Alert.alert(
          'PPE Violations Detected',
          `Missing: ${detectedViolations.join(', ')}`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'PPE Compliance ✅',
          'All required PPE detected',
          [{ text: 'OK' }]
        );
      }
      
    } catch (error) {
      Alert.alert('Error', 'Failed to scan PPE compliance');
    } finally {
      setScanning(false);
    }
  };

  const renderPPEItem = (item: string, detected: boolean) => {
    const icons: { [key: string]: string } = {
      helmet: '⛑️',
      vest: '🦺',
      glasses: '🥽',
      gloves: '🧤',
      boots: '🥾'
    };
    
    return (
      <View key={item} style={styles.ppeItem}>
        <Text style={styles.ppeIcon}>{icons[item]}</Text>
        <Text style={styles.ppeLabel}>
          {item.charAt(0).toUpperCase() + item.slice(1)}
        </Text>
        <Text style={[styles.ppeStatus, detected ? styles.detected : styles.missing]}>
          {detected ? '✅' : '❌'}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>PPE Compliance Scanner</Text>
      
      <View style={styles.scanArea}>
        {photoUri && (
          <Image source={{ uri: photoUri }} style={styles.photo} />
        )}
        
        <TouchableOpacity
          style={[styles.scanButton, scanning && styles.scanningButton]}
          onPress={handleScan}
          disabled={scanning}
        >
          <Text style={styles.scanButtonText}>
            {scanning ? '🔍 Scanning PPE...' : '📸 Scan PPE Compliance'}
          </Text>
        </TouchableOpacity>
      </View>

      {scanResult && (
        <View style={styles.resultsArea}>
          <Text style={styles.resultsTitle}>Scan Results:</Text>
          
          <View style={styles.ppeGrid}>
            {Object.entries(scanResult).map(([item, detected]) =>
              renderPPEItem(item, detected)
            )}
          </View>
          
          {violations.length > 0 && (
            <View style={styles.violationsArea}>
              <Text style={styles.violationsTitle}>⚠️ Violations Detected:</Text>
              <Text style={styles.violationsList}>
                {violations.map(v => v.toUpperCase()).join(', ')}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  scanArea: {
    alignItems: 'center',
    marginBottom: 20,
  },
  photo: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginBottom: 15,
  },
  scanButton: {
    backgroundColor: '#FF6B35',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 200,
  },
  scanningButton: {
    backgroundColor: '#999',
  },
  scanButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultsArea: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  ppeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  ppeItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 6,
    marginBottom: 8,
  },
  ppeIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  ppeLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  ppeStatus: {
    fontSize: 16,
  },
  detected: {
    color: '#28a745',
  },
  missing: {
    color: '#dc3545',
  },
  violationsArea: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#f8d7da',
    borderRadius: 6,
  },
  violationsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#721c24',
    marginBottom: 5,
  },
  violationsList: {
    fontSize: 14,
    color: '#721c24',
  },
});