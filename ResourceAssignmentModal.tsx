import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { ResourceManagementService, Site, Machinery, Material, Worker } from '@/app/services/ResourceManagementService';

interface ResourceAssignmentModalProps {
  visible: boolean;
  onClose: () => void;
  sites: Site[];
  resourceType: 'machinery' | 'materials' | 'workers';
  onAssignmentComplete: () => void;
}

export default function ResourceAssignmentModal({
  visible,
  onClose,
  sites,
  resourceType,
  onAssignmentComplete
}: ResourceAssignmentModalProps) {
  const [availableResources, setAvailableResources] = useState<any[]>([]);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [selectedResource, setSelectedResource] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadAvailableResources();
    }
  }, [visible, resourceType]);

  const loadAvailableResources = async () => {
    try {
      setLoading(true);
      let resources: any[] = [];
      
      switch (resourceType) {
        case 'machinery':
          resources = await ResourceManagementService.getMachinery();
          resources = resources.filter(r => !r.site_id || r.status === 'available');
          break;
        case 'materials':
          resources = await ResourceManagementService.getMaterials();
          resources = resources.filter(r => !r.site_id);
          break;
        case 'workers':
          resources = await ResourceManagementService.getWorkers();
          resources = resources.filter(r => !r.site_id || r.status === 'available');
          break;
      }
      
      setAvailableResources(resources);
    } catch (error) {
      Alert.alert('Error', 'Failed to load available resources');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignment = async () => {
    if (!selectedSite || !selectedResource) {
      Alert.alert('Error', 'Please select both a site and a resource');
      return;
    }

    try {
      setLoading(true);
      
      switch (resourceType) {
        case 'machinery':
          await ResourceManagementService.assignMachineryToSite(selectedResource.id, selectedSite.id);
          break;
        case 'materials':
          await ResourceManagementService.assignMaterialToSite(selectedResource.id, selectedSite.id);
          break;
        case 'workers':
          await ResourceManagementService.assignWorkerToSite(selectedResource.id, selectedSite.id);
          break;
      }
      
      Alert.alert('Success', `${resourceType.slice(0, -1)} assigned to ${selectedSite.name}`);
      onAssignmentComplete();
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to assign resource');
    } finally {
      setLoading(false);
    }
  };

  const renderResourceItem = (resource: any) => {
    const isSelected = selectedResource?.id === resource.id;
    
    return (
      <TouchableOpacity
        key={resource.id}
        style={[styles.resourceItem, isSelected && styles.selectedItem]}
        onPress={() => setSelectedResource(resource)}
      >
        <Text style={styles.resourceName}>{resource.name}</Text>
        {resourceType === 'machinery' && (
          <Text style={styles.resourceDetail}>Type: {resource.type} | Status: {resource.status}</Text>
        )}
        {resourceType === 'materials' && (
          <Text style={styles.resourceDetail}>Category: {resource.category} | Available: {resource.quantity_available} {resource.unit}</Text>
        )}
        {resourceType === 'workers' && (
          <Text style={styles.resourceDetail}>Trade: {resource.trade} | Skill: {resource.skill_level}</Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderSiteItem = (site: Site) => {
    const isSelected = selectedSite?.id === site.id;
    
    return (
      <TouchableOpacity
        key={site.id}
        style={[styles.siteItem, isSelected && styles.selectedItem]}
        onPress={() => setSelectedSite(site)}
      >
        <Text style={styles.siteName}>{site.name}</Text>
        <Text style={styles.siteDetail}>{site.location} | {site.status}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Assign {resourceType.charAt(0).toUpperCase() + resourceType.slice(1)}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Site</Text>
            {sites.map(renderSiteItem)}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select {resourceType.charAt(0).toUpperCase() + resourceType.slice(1, -1)}</Text>
            {loading ? (
              <Text style={styles.loadingText}>Loading available resources...</Text>
            ) : availableResources.length === 0 ? (
              <Text style={styles.emptyText}>No available {resourceType} found</Text>
            ) : (
              availableResources.map(renderResourceItem)
            )}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.assignButton,
              (!selectedSite || !selectedResource || loading) && styles.disabledButton
            ]}
            onPress={handleAssignment}
            disabled={!selectedSite || !selectedResource || loading}
          >
            <Text style={styles.assignButtonText}>
              {loading ? 'Assigning...' : 'Assign to Site'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  resourceItem: {
    backgroundColor: 'white',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  siteItem: {
    backgroundColor: 'white',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedItem: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  resourceName: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  resourceDetail: {
    fontSize: 12,
    color: '#666',
  },
  siteName: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  siteDetail: {
    fontSize: 12,
    color: '#666',
  },
  loadingText: {
    textAlign: 'center',
    color: '#666',
    padding: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    padding: 20,
  },
  footer: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  assignButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  assignButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});