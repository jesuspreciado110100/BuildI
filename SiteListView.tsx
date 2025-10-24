import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Site } from '../types';

interface SiteListViewProps {
  contractorId?: string;
}

export default function SiteListView({ contractorId }: SiteListViewProps) {
  const [selectedSite, setSelectedSite] = useState<string | null>(null);

  const mockSites: Site[] = [
    {
      id: '1',
      name: 'Downtown Plaza',
      location: 'New York, NY',
      contractor_id: contractorId || 'demo',
      status: 'active',
      timezone: 'America/New_York',
      country: 'USA',
      region: 'Northeast',
      currency: 'USD',
      base_currency: 'USD',
      language: 'en',
      unit_system: 'imperial',
      overall_progress: 75
    },
    {
      id: '2',
      name: 'Shopping Center',
      location: 'Los Angeles, CA',
      contractor_id: contractorId || 'demo',
      status: 'active',
      timezone: 'America/Los_Angeles',
      country: 'USA',
      region: 'West',
      currency: 'USD',
      base_currency: 'USD',
      language: 'en',
      unit_system: 'imperial',
      overall_progress: 45
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10B981';
      case 'planning': return '#F59E0B';
      case 'completed': return '#3B82F6';
      case 'on_hold': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const renderSiteItem = ({ item }: { item: Site }) => (
    <TouchableOpacity
      style={styles.siteCard}
      onPress={() => setSelectedSite(selectedSite === item.id ? null : item.id)}
    >
      <View style={styles.siteHeader}>
        <Text style={styles.siteName}>{item.name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      
      <Text style={styles.siteLocation}>📍 {item.location}</Text>
      
      <View style={styles.progressContainer}>
        <Text style={styles.progressLabel}>Progress: {item.overall_progress}%</Text>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill,
              { width: `${item.overall_progress}%` }
            ]}
          />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={mockSites}
        renderItem={renderSiteItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    gap: 12,
  },
  siteCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
    color: '#1F2937',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  siteLocation: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 3,
  },
});