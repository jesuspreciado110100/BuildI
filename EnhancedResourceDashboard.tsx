import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import ResourceManagementDashboard from './ResourceManagementDashboard';
import ResourceAssignmentModal from './ResourceAssignmentModal';
import { ResourceManagementService, Site } from '@/app/services/ResourceManagementService';

interface EnhancedResourceDashboardProps {
  contractorId: string;
}

export default function EnhancedResourceDashboard({ contractorId }: EnhancedResourceDashboardProps) {
  const [sites, setSites] = useState<Site[]>([]);
  const [assignmentModalVisible, setAssignmentModalVisible] = useState(false);
  const [selectedResourceType, setSelectedResourceType] = useState<'machinery' | 'materials' | 'workers'>('machinery');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadSites();
  }, [contractorId]);

  const loadSites = async () => {
    try {
      const sitesData = await ResourceManagementService.getSites(contractorId);
      setSites(sitesData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load sites');
    }
  };

  const handleAssignResource = (resourceType: 'machinery' | 'materials' | 'workers') => {
    setSelectedResourceType(resourceType);
    setAssignmentModalVisible(true);
  };

  const handleAssignmentComplete = () => {
    setRefreshKey(prev => prev + 1);
    setAssignmentModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Resource Management</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.machineryButton]}
            onPress={() => handleAssignResource('machinery')}
          >
            <Text style={styles.actionButtonText}>Assign Machinery</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.materialsButton]}
            onPress={() => handleAssignResource('materials')}
          >
            <Text style={styles.actionButtonText}>Assign Materials</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.workersButton]}
            onPress={() => handleAssignResource('workers')}
          >
            <Text style={styles.actionButtonText}>Assign Workers</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ResourceManagementDashboard 
        key={refreshKey}
        contractorId={contractorId} 
      />

      <ResourceAssignmentModal
        visible={assignmentModalVisible}
        onClose={() => setAssignmentModalVisible(false)}
        sites={sites}
        resourceType={selectedResourceType}
        onAssignmentComplete={handleAssignmentComplete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  machineryButton: {
    backgroundColor: '#FF6B35',
  },
  materialsButton: {
    backgroundColor: '#4ECDC4',
  },
  workersButton: {
    backgroundColor: '#45B7D1',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});