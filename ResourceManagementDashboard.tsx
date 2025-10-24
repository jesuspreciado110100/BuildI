import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { ResourceManagementService, Site, Machinery, Material, Worker } from '@/app/services/ResourceManagementService';

interface ResourceManagementDashboardProps {
  contractorId: string;
}

export default function ResourceManagementDashboard({ contractorId }: ResourceManagementDashboardProps) {
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [machinery, setMachinery] = useState<Machinery[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSites();
  }, [contractorId]);

  useEffect(() => {
    if (selectedSite) {
      loadSiteResources(selectedSite.id);
    }
  }, [selectedSite]);

  const loadSites = async () => {
    try {
      const sitesData = await ResourceManagementService.getSites(contractorId);
      setSites(sitesData);
      if (sitesData.length > 0) {
        setSelectedSite(sitesData[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load sites');
    } finally {
      setLoading(false);
    }
  };

  const loadSiteResources = async (siteId: string) => {
    try {
      const [machineryData, materialsData, workersData] = await Promise.all([
        ResourceManagementService.getMachinery(siteId),
        ResourceManagementService.getMaterials(siteId),
        ResourceManagementService.getWorkers(siteId)
      ]);
      
      setMachinery(machineryData);
      setMaterials(materialsData);
      setWorkers(workersData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load site resources');
    }
  };

  const renderSiteSelector = () => (
    <View style={styles.siteSelector}>
      <Text style={styles.sectionTitle}>Select Site</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {sites.map((site) => (
          <TouchableOpacity
            key={site.id}
            style={[
              styles.siteCard,
              selectedSite?.id === site.id && styles.selectedSiteCard
            ]}
            onPress={() => setSelectedSite(site)}
          >
            <Text style={styles.siteName}>{site.name}</Text>
            <Text style={styles.siteLocation}>{site.location}</Text>
            <Text style={styles.siteStatus}>{site.status}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderResourceSection = (title: string, items: any[], type: 'machinery' | 'materials' | 'workers') => (
    <View style={styles.resourceSection}>
      <Text style={styles.sectionTitle}>{title} ({items.length})</Text>
      {items.length === 0 ? (
        <Text style={styles.emptyText}>No {title.toLowerCase()} assigned to this site</Text>
      ) : (
        items.map((item) => (
          <View key={item.id} style={styles.resourceCard}>
            <Text style={styles.resourceName}>{item.name}</Text>
            {type === 'machinery' && (
              <>
                <Text style={styles.resourceDetail}>Type: {item.type}</Text>
                <Text style={styles.resourceDetail}>Status: {item.status}</Text>
                {item.hourly_rate && <Text style={styles.resourceDetail}>Rate: ${item.hourly_rate}/hr</Text>}
              </>
            )}
            {type === 'materials' && (
              <>
                <Text style={styles.resourceDetail}>Category: {item.category}</Text>
                <Text style={styles.resourceDetail}>Available: {item.quantity_available} {item.unit}</Text>
                {item.unit_price && <Text style={styles.resourceDetail}>Price: ${item.unit_price}/{item.unit}</Text>}
              </>
            )}
            {type === 'workers' && (
              <>
                <Text style={styles.resourceDetail}>Trade: {item.trade}</Text>
                <Text style={styles.resourceDetail}>Skill: {item.skill_level}</Text>
                <Text style={styles.resourceDetail}>Status: {item.status}</Text>
                {item.hourly_rate && <Text style={styles.resourceDetail}>Rate: ${item.hourly_rate}/hr</Text>}
              </>
            )}
          </View>
        ))
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading resources...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {renderSiteSelector()}
      
      {selectedSite && (
        <View style={styles.resourcesContainer}>
          <Text style={styles.selectedSiteTitle}>Resources for {selectedSite.name}</Text>
          {renderResourceSection('Machinery', machinery, 'machinery')}
          {renderResourceSection('Materials', materials, 'materials')}
          {renderResourceSection('Workers', workers, 'workers')}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  siteSelector: {
    padding: 16,
    backgroundColor: 'white',
    marginBottom: 8,
  },
  siteCard: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    marginRight: 12,
    borderRadius: 8,
    minWidth: 120,
  },
  selectedSiteCard: {
    backgroundColor: '#007AFF',
  },
  siteName: {
    fontWeight: 'bold',
    color: '#333',
  },
  siteLocation: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  siteStatus: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  resourcesContainer: {
    padding: 16,
  },
  selectedSiteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  resourceSection: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  emptyText: {
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
  resourceCard: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    marginBottom: 8,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
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
    marginBottom: 2,
  },
});