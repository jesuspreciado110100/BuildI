import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput } from 'react-native';

interface ConceptRow {
  id: string;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  group?: string;
}

interface ConceptPreviewGridProps {
  data: ConceptRow[];
  onConfirm: (mappedData: ConceptRow[]) => void;
  onCancel: () => void;
}

const ConceptPreviewGrid: React.FC<ConceptPreviewGridProps> = ({ data, onConfirm, onCancel }) => {
  const [mappedData, setMappedData] = useState<ConceptRow[]>(data);
  const [columnHeaders, setColumnHeaders] = useState({
    description: 'Description',
    unit: 'Unit',
    quantity: 'Quantity',
    unitPrice: 'Unit Price',
    group: 'Group'
  });

  const updateRowData = (id: string, field: keyof ConceptRow, value: any) => {
    setMappedData(prev => prev.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    ));
  };

  const calculateTotal = (row: ConceptRow) => {
    return (row.quantity * row.unitPrice).toFixed(2);
  };

  const calculateGrandTotal = () => {
    return mappedData.reduce((total, row) => total + (row.quantity * row.unitPrice), 0).toFixed(2);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Preview & Map Columns</Text>
        <Text style={styles.subtitle}>Review and adjust the imported data</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.table}>
          {/* Header Row */}
          <View style={styles.headerRow}>
            <Text style={styles.headerCell}>{columnHeaders.description}</Text>
            <Text style={styles.headerCell}>{columnHeaders.unit}</Text>
            <Text style={styles.headerCell}>{columnHeaders.quantity}</Text>
            <Text style={styles.headerCell}>{columnHeaders.unitPrice}</Text>
            <Text style={styles.headerCell}>{columnHeaders.group}</Text>
            <Text style={styles.headerCell}>Total</Text>
          </View>

          {/* Data Rows */}
          {mappedData.map((row) => (
            <View key={row.id} style={styles.dataRow}>
              <TextInput
                style={styles.cell}
                value={row.description}
                onChangeText={(text) => updateRowData(row.id, 'description', text)}
                multiline
              />
              <TextInput
                style={styles.cell}
                value={row.unit}
                onChangeText={(text) => updateRowData(row.id, 'unit', text)}
              />
              <TextInput
                style={styles.cell}
                value={row.quantity.toString()}
                onChangeText={(text) => updateRowData(row.id, 'quantity', parseFloat(text) || 0)}
                keyboardType="numeric"
              />
              <TextInput
                style={styles.cell}
                value={row.unitPrice.toString()}
                onChangeText={(text) => updateRowData(row.id, 'unitPrice', parseFloat(text) || 0)}
                keyboardType="numeric"
              />
              <TextInput
                style={styles.cell}
                value={row.group || ''}
                onChangeText={(text) => updateRowData(row.id, 'group', text)}
              />
              <Text style={styles.totalCell}>${calculateTotal(row)}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.summary}>
        <Text style={styles.grandTotal}>Grand Total: ${calculateGrandTotal()}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.confirmButton} onPress={() => onConfirm(mappedData)}>
          <Text style={styles.confirmButtonText}>Generate Concepts</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  table: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerCell: {
    width: 120,
    padding: 12,
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
  },
  dataRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  cell: {
    width: 120,
    padding: 8,
    fontSize: 12,
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
  },
  totalCell: {
    width: 120,
    padding: 8,
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  summary: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  grandTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
  },
  confirmButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});

export default ConceptPreviewGrid;