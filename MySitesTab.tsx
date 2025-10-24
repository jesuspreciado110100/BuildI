import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Site, Concept } from '../types';
import { ClientPortalService } from '../services/ClientPortalService';

interface MySitesTabProps {
  userId: string;
  onViewConcepts: (siteId: string, concepts: Concept[]) => void;
}

export const MySitesTab: React.FC<MySitesTabProps> = ({ userId, onViewConcepts }) => {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSites();
  }, [userId]);

  const loadSites = async () => {
    try {
      const clientSites = await ClientPortalService.getClientSites(userId);
      setSites(clientSites);
    } catch (error) {
      console.error('Error loading sites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewConcepts = async (site: Site) => {
    try {
      const concepts = await ClientPortalService.getSiteConcepts(site.id);
      onViewConcepts(site.id, concepts);
    } catch (error) {
      console.error('Error loading concepts:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading your sites...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>My Sites</Text>
      {sites.map((site) => (
        <View key={site.id} style={styles.siteCard}>
          <View style={styles.siteHeader}>
            <Text style={styles.siteName}>{site.name}</Text>
            <Text style={styles.siteStatus}>{site.status.toUpperCase()}</Text>
          </View>
          
          <Text style={styles.siteAddress}>{site.address}</Text>
          
          <View style={styles.progressContainer}>
            <Text style={styles.progressLabel}>Overall Progress</Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { 
                    width: `${site.overall_progress || 0}%`,
                    backgroundColor: ClientPortalService.getProgressColor(site.overall_progress || 0)
                  }
                ]}
              />
            </View>
            <Text style={styles.progressText}>{site.overall_progress || 0}%</Text>
          </View>
          
          <View style={styles.siteFooter}>
            <Text style={styles.lastUpdated}>
              Last updated: {ClientPortalService.formatLastUpdated(site.last_updated || '')}
            </Text>
            <TouchableOpacity 
              style={styles.viewButton}
              onPress={() => handleViewConcepts(site)}
            >
              <Text style={styles.viewButtonText}>View Details</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
    color: '#666',
  },
  siteCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  siteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  siteName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  siteStatus: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4CAF50',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  siteAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  siteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastUpdated: {
    fontSize: 12,
    color: '#999',
    flex: 1,
  },
  viewButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  viewButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});