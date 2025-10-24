import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { ConstructionConcept, ConceptProgressLog } from '../types';
import { QRGeneratorService } from '../services/QRGeneratorService';

interface ConceptScannerComponentProps {
  concept: ConstructionConcept;
  onProgressLogged: (log: ConceptProgressLog) => void;
}

export const ConceptScannerComponent: React.FC<ConceptScannerComponentProps> = ({
  concept,
  onProgressLogged
}) => {
  const [scannedCode, setScannedCode] = useState('');
  const [progressPercent, setProgressPercent] = useState('');
  const [volumeCompleted, setVolumeCompleted] = useState('');
  const [notes, setNotes] = useState('');
  const [photoProof, setPhotoProof] = useState<string[]>([]);
  const [scanning, setScanning] = useState(false);

  const handleScan = () => {
    setScanning(true);
    // Mock QR scan - in real app would use camera
    setTimeout(() => {
      const mockQR = concept.qr_code || `QR_CONCEPT_${concept.id}_${Date.now()}`;
      setScannedCode(mockQR);
      setScanning(false);
    }, 1500);
  };

  const handlePhotoCapture = () => {
    // Mock photo capture
    const mockPhotoUrl = `https://example.com/progress-proof-${Date.now()}.jpg`;
    setPhotoProof(prev => [...prev, mockPhotoUrl]);
    Alert.alert('Photo Captured', 'Progress photo saved');
  };

  const handleQuickProgress = (percent: number) => {
    const volumeCalc = (concept.total_volume * percent) / 100;
    setProgressPercent(percent.toString());
    setVolumeCompleted(volumeCalc.toString());
  };

  const handleSubmit = () => {
    if (!scannedCode) {
      Alert.alert('Error', 'Please scan QR code first');
      return;
    }

    const decoded = QRGeneratorService.decodeQR(scannedCode);
    if (!decoded.isValid || decoded.id !== concept.id) {
      Alert.alert('Invalid QR Code', 'This QR code does not match the concept');
      return;
    }

    const progress = parseInt(progressPercent) || 0;
    const volume = parseFloat(volumeCompleted) || 0;

    if (progress < 0 || progress > 100) {
      Alert.alert('Invalid Progress', 'Progress must be between 0 and 100%');
      return;
    }

    const progressLog: ConceptProgressLog = {
      id: `log_${Date.now()}`,
      concept_id: concept.id,
      user_id: 'current_user_id',
      progress_percent: progress,
      volume_completed: volume,
      notes: notes || undefined,
      photo_urls: photoProof.length > 0 ? photoProof : undefined,
      timestamp: new Date().toISOString(),
      scan_code: scannedCode,
      scanned_by_user_id: 'current_user_id',
      scan_time: new Date().toISOString()
    };

    onProgressLogged(progressLog);
    resetForm();
  };

  const resetForm = () => {
    setScannedCode('');
    setProgressPercent('');
    setVolumeCompleted('');
    setNotes('');
    setPhotoProof([]);
  };

  const plannedVolume = concept.total_volume;
  const currentProgress = concept.phases.reduce((sum, phase) => sum + phase.progress_percent, 0) / concept.phases.length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Progress Scanner</Text>
        <Text style={styles.conceptName}>{concept.name}</Text>
      </View>

      <View style={styles.conceptInfo}>
        <Text style={styles.infoLabel}>Planned Volume:</Text>
        <Text style={styles.infoValue}>{plannedVolume} {concept.unit}</Text>
        <Text style={styles.infoLabel}>Current Progress:</Text>
        <Text style={styles.infoValue}>{currentProgress.toFixed(1)}%</Text>
      </View>

      <View style={styles.scanSection}>
        <TouchableOpacity 
          style={[styles.scanButton, scanning && styles.scanButtonActive]} 
          onPress={handleScan}
          disabled={scanning}
        >
          <Text style={styles.scanButtonText}>
            {scanning ? 'Scanning Zone QR...' : 'Scan Zone QR Code'}
          </Text>
        </TouchableOpacity>
        
        {scannedCode && (
          <View style={styles.scannedCode}>
            <Text style={styles.scannedLabel}>Zone Scanned:</Text>
            <Text style={styles.scannedText}>{scannedCode}</Text>
          </View>
        )}
      </View>

      <View style={styles.progressSection}>
        <Text style={styles.sectionTitle}>Progress Update</Text>
        
        <View style={styles.quickButtons}>
          <Text style={styles.quickLabel}>Quick Progress:</Text>
          <View style={styles.quickButtonRow}>
            {[25, 50, 75, 100].map(percent => (
              <TouchableOpacity
                key={percent}
                style={styles.quickButton}
                onPress={() => handleQuickProgress(percent)}
              >
                <Text style={styles.quickButtonText}>{percent}%</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputRow}>
          <View style={styles.inputHalf}>
            <Text style={styles.inputLabel}>Progress %</Text>
            <TextInput
              style={styles.input}
              value={progressPercent}
              onChangeText={setProgressPercent}
              placeholder="0-100"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.inputHalf}>
            <Text style={styles.inputLabel}>Volume ({concept.unit})</Text>
            <TextInput
              style={styles.input}
              value={volumeCompleted}
              onChangeText={setVolumeCompleted}
              placeholder="Volume"
              keyboardType="numeric"
            />
          </View>
        </View>

        <Text style={styles.inputLabel}>Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Add progress notes..."
          multiline
          numberOfLines={3}
        />

        <TouchableOpacity style={styles.photoButton} onPress={handlePhotoCapture}>
          <Text style={styles.photoButtonText}>
            📷 Capture Photo ({photoProof.length})
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={[styles.submitButton, !scannedCode && styles.submitButtonDisabled]} 
        onPress={handleSubmit}
        disabled={!scannedCode}
      >
        <Text style={styles.submitButtonText}>Log Progress</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    margin: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  header: {
    marginBottom: 15
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5
  },
  conceptName: {
    fontSize: 16,
    color: '#666'
  },
  conceptInfo: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10
  },
  scanSection: {
    alignItems: 'center',
    marginBottom: 20
  },
  scanButton: {
    backgroundColor: '#FF9500',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 15
  },
  scanButtonActive: {
    backgroundColor: '#CC7700'
  },
  scanButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  scannedCode: {
    backgroundColor: '#fff3cd',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center'
  },
  scannedLabel: {
    fontSize: 12,
    color: '#856404',
    marginBottom: 5
  },
  scannedText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#856404'
  },
  progressSection: {
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15
  },
  quickButtons: {
    marginBottom: 20
  },
  quickLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10
  },
  quickButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  quickButton: {
    backgroundColor: '#e9ecef',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 6,
    flex: 1,
    marginHorizontal: 2,
    alignItems: 'center'
  },
  quickButtonText: {
    fontSize: 14,
    color: '#495057',
    fontWeight: 'bold'
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15
  },
  inputHalf: {
    flex: 1,
    marginHorizontal: 5
  },
  inputLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: 'white'
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    marginBottom: 15
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
  submitButtonDisabled: {
    backgroundColor: '#ccc'
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  }
});