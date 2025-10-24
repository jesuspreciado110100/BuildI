import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SiteQuickViewModal } from './SiteQuickViewModal';

interface Site {
  id: string;
  name: string;
  location: string;
  status: 'Active' | 'Completed' | 'On Hold';
  progress: number;
  budget: number;
  teamSize: number;
  price: number;
  priceChange: number;
  type: 'Residential' | 'Commercial' | 'Industrial';
  lat: number;
  lng: number;
  photos: string[];
}

interface Props {
  searchQuery: string;
  statusFilter: string;
  typeFilter: string;
  onSitePress: (site: Site) => void;
}

export const InteractiveProjectDashboard: React.FC<Props> = ({
  searchQuery,
  statusFilter,
  typeFilter,
  onSitePress
}) => {
  const [sites, setSites] = useState<Site[]>([
    {
      id: '1',
      name: 'Downtown Office Complex',
      location: 'New York, NY',
      status: 'Active',
      progress: 65,
      budget: 2500000,
      teamSize: 24,
      price: 500,
      priceChange: -25,
      type: 'Commercial',
      lat: 40.7128,
      lng: -74.0060,
      photos: ['https://via.placeholder.com/300x200']
    },
    {
      id: '2',
      name: 'Residential Tower',
      location: 'Los Angeles, CA',
      status: 'Active',
      progress: 30,
      budget: 1800000,
      teamSize: 18,
      price: 750,
      priceChange: 50,
      type: 'Residential',
      lat: 34.0522,
      lng: -118.2437,
      photos: ['https://via.placeholder.com/300x200']
    }
  ]);

  const filteredSites = sites.filter(site => {
    const matchesSearch = site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         site.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || site.status === statusFilter;
    const matchesType = typeFilter === 'All' || site.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getPriceChangeColor = (change: number) => {
    return change >= 0 ? '#4CAF50' : '#f44336';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return '#4CAF50';
      case 'Completed': return '#2196F3';
      case 'On Hold': return '#FF9800';
      default: return '#666';
    }
  };

  return (
    <ScrollView style={styles.container}>
      {filteredSites.map((site) => (
        <TouchableOpacity
          key={site.id}
          style={styles.siteCard}
          onPress={() => onSitePress(site)}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.siteName}>{site.name}</Text>
            <View style={styles.priceTag}>
              <Text style={styles.priceText}>${site.price}</Text>
              <Text style={[styles.priceChange, { color: getPriceChangeColor(site.priceChange) }]}>
                {site.priceChange >= 0 ? '+' : ''}${site.priceChange}
              </Text>
            </View>
          </View>
          
          <Text style={styles.location}>{site.location}</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Progress</Text>
              <Text style={styles.statValue}>{site.progress}%</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Budget</Text>
              <Text style={styles.statValue}>${(site.budget / 1000000).toFixed(1)}M</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Team</Text>
              <Text style={styles.statValue}>{site.teamSize}</Text>
            </View>
          </View>
          
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${site.progress}%` }]} />
          </View>
          
          <View style={styles.cardFooter}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(site.status) }]}>
              <Text style={styles.statusText}>{site.status}</Text>
            </View>
            <Text style={styles.typeText}>{site.type}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  siteCard: {
    backgroundColor: 'white',
    margin: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  siteName: { fontSize: 18, fontWeight: 'bold', flex: 1 },
  priceTag: { alignItems: 'flex-end' },
  priceText: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  priceChange: { fontSize: 12, fontWeight: '600' },
  location: { fontSize: 14, color: '#666', marginBottom: 12 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  stat: { alignItems: 'center' },
  statLabel: { fontSize: 12, color: '#666', marginBottom: 2 },
  statValue: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  progressBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    marginBottom: 12
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  statusText: { color: 'white', fontSize: 12, fontWeight: '600' },
  typeText: { fontSize: 12, color: '#666', fontStyle: 'italic' }
});