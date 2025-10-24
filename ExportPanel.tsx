import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput } from 'react-native';
import { reportExportService } from '../services/ReportExportService';

interface ExportPanelProps {
  onExport?: (fileName: string) => void;
}

const ExportPanel: React.FC<ExportPanelProps> = ({ onExport }) => {
  const [format, setFormat] = useState<'excel' | 'pdf'>('excel');
  const [dataType, setDataType] = useState<'concept' | 'booking' | 'roi' | 'safety'>('concept');
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2024-12-31');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const fileName = await reportExportService.exportReport({
        format,
        dataType,
        startDate,
        endDate
      });
      Alert.alert('Export Successful', `Report exported as ${fileName}`);
      onExport?.(fileName);
    } catch (error) {
      Alert.alert('Export Failed', 'Unable to export report');
    } finally {
      setIsExporting(false);
    }
  };

  const formatOptions = [{ label: 'Excel', value: 'excel' }, { label: 'PDF', value: 'pdf' }];
  const dataOptions = [
    { label: 'Concept Progress', value: 'concept' },
    { label: 'Booking & Budget', value: 'booking' },
    { label: 'ROI Summary', value: 'roi' },
    { label: 'Safety Logs', value: 'safety' }
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Export Reports</Text>
      
      <View style={styles.section}>
        <Text style={styles.label}>Format:</Text>
        <View style={styles.optionRow}>
          {formatOptions.map(option => (
            <TouchableOpacity
              key={option.value}
              style={[styles.option, format === option.value && styles.selectedOption]}
              onPress={() => setFormat(option.value as 'excel' | 'pdf')}
            >
              <Text style={[styles.optionText, format === option.value && styles.selectedText]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Data Type:</Text>
        <View style={styles.optionColumn}>
          {dataOptions.map(option => (
            <TouchableOpacity
              key={option.value}
              style={[styles.option, dataType === option.value && styles.selectedOption]}
              onPress={() => setDataType(option.value as any)}
            >
              <Text style={[styles.optionText, dataType === option.value && styles.selectedText]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Date Range:</Text>
        <TextInput
          style={styles.input}
          value={startDate}
          onChangeText={setStartDate}
          placeholder="Start Date (YYYY-MM-DD)"
        />
        <TextInput
          style={styles.input}
          value={endDate}
          onChangeText={setEndDate}
          placeholder="End Date (YYYY-MM-DD)"
        />
      </View>

      <TouchableOpacity
        style={[styles.exportButton, isExporting && styles.disabledButton]}
        onPress={handleExport}
        disabled={isExporting}
      >
        <Text style={styles.exportButtonText}>
          {isExporting ? 'Exporting...' : 'Export Report'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333'
  },
  section: {
    marginBottom: 20
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#555'
  },
  optionRow: {
    flexDirection: 'row',
    gap: 10
  },
  optionColumn: {
    gap: 8
  },
  option: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd'
  },
  selectedOption: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF'
  },
  optionText: {
    fontSize: 14,
    color: '#333'
  },
  selectedText: {
    color: '#fff',
    fontWeight: '600'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#fff',
    fontSize: 16
  },
  exportButton: {
    backgroundColor: '#28a745',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20
  },
  disabledButton: {
    backgroundColor: '#ccc'
  },
  exportButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  }
});

export default ExportPanel;