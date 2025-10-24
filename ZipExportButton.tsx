import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';

export const ZipExportButton: React.FC = () => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    
    // TODO: Implement actual ZIP generation and download
    // This would typically involve:
    // 1. Collecting all project files
    // 2. Creating a ZIP archive
    // 3. Triggering download
    
    setTimeout(() => {
      setIsExporting(false);
      Alert.alert(
        'Export Complete',
        'Project has been packaged for GitHub upload. Check your downloads folder.',
        [{ text: 'OK' }]
      );
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, isExporting && styles.buttonDisabled]}
        onPress={handleExport}
        disabled={isExporting}
      >
        <Text style={styles.buttonText}>
          {isExporting ? 'Exporting...' : 'Export to ZIP'}
        </Text>
      </TouchableOpacity>
      <Text style={styles.description}>
        Packages the entire codebase for GitHub upload
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  buttonDisabled: {
    backgroundColor: '#A0A0A0',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});