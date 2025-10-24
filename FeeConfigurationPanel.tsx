import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Switch, Alert } from 'react-native';
import { CommissionManagerService } from '../services/CommissionManagerService';
import { CommissionConfig } from '../types';

export const FeeConfigurationPanel: React.FC = () => {
  const [configs, setConfigs] = useState<CommissionConfig[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = () => {
    const allConfigs = CommissionManagerService.getAllConfigs();
    setConfigs(allConfigs);
  };

  const handleEdit = (config: CommissionConfig) => {
    setEditingId(config.id);
    setEditValue(config.percentage.toString());
  };

  const handleSave = (id: string) => {
    const newPercentage = parseFloat(editValue);
    if (isNaN(newPercentage) || newPercentage < 0 || newPercentage > 50) {
      Alert.alert('Invalid Value', 'Please enter a valid percentage between 0 and 50');
      return;
    }

    const success = CommissionManagerService.updateConfig(id, newPercentage, 'admin-123');
    if (success) {
      loadConfigs();
      setEditingId(null);
      setEditValue('');
      Alert.alert('Success', 'Fee configuration updated successfully');
    }
  };

  const handleToggle = (id: string) => {
    const success = CommissionManagerService.toggleConfigStatus(id, 'admin-123');
    if (success) {
      loadConfigs();
    }
  };

  const renderConfigRow = (config: CommissionConfig) => {
    const isEditing = editingId === config.id;

    return (
      <View key={config.id} style={styles.configRow}>
        <View style={styles.configInfo}>
          <Text style={styles.moduleText}>{config.module.toUpperCase()}</Text>
          <Text style={styles.roleText}>{config.payer_role}</Text>
          <Text style={styles.countryText}>{config.country_code}</Text>
        </View>
        
        <View style={styles.percentageSection}>
          {isEditing ? (
            <TextInput
              style={styles.editInput}
              value={editValue}
              onChangeText={setEditValue}
              keyboardType="numeric"
              placeholder="%"
            />
          ) : (
            <Text style={styles.percentageText}>{config.percentage}%</Text>
          )}
        </View>

        <View style={styles.actions}>
          <Switch
            value={config.is_active}
            onValueChange={() => handleToggle(config.id)}
            trackColor={{ false: '#ccc', true: '#007AFF' }}
          />
          
          {isEditing ? (
            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => handleSave(config.id)}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => handleEdit(config)}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Platform Fee Configuration</Text>
      <Text style={styles.subtitle}>Manage commission rates by module, role, and region</Text>
      
      <View style={styles.table}>
        <View style={styles.headerRow}>
          <Text style={styles.headerText}>Module/Role/Country</Text>
          <Text style={styles.headerText}>Fee %</Text>
          <Text style={styles.headerText}>Actions</Text>
        </View>
        
        {configs.map(renderConfigRow)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16
  },
  table: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  headerText: {
    flex: 1,
    fontWeight: '600',
    fontSize: 14,
    color: '#333'
  },
  configRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center'
  },
  configInfo: {
    flex: 1
  },
  moduleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333'
  },
  roleText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2
  },
  countryText: {
    fontSize: 12,
    color: '#999',
    marginTop: 1
  },
  percentageSection: {
    flex: 1,
    alignItems: 'center'
  },
  percentageText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF'
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    width: 60,
    textAlign: 'center'
  },
  actions: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around'
  },
  editButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4
  },
  editButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500'
  },
  saveButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500'
  }
});