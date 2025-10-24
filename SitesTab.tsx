import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Site } from '../types';
import { SiteTimeBadge } from './SiteTimeBadge';
import { TimestampDisplay } from './TimestampDisplay';

interface SitesTabProps {
  userId: string;
  userRole: string;
}

export const SitesTab: React.FC<SitesTabProps> = ({ userId, userRole }) => {
  const { theme } = useTheme();
  const [sites, setSites] = useState<Site[]>([]);
  const [groupBy, setGroupBy] = useState<'region' | 'timezone'>('region');

  useEffect(() => {
    loadSites();
  }, []);

  const loadSites = () => {
    // Mock data with timezone info
    const mockSites: Site[] = [
      {
        id: '1',
        name: 'Downtown Plaza',
        location: 'New York, NY',
        contractor_id: userId,
        status: 'active',
        timezone: 'America/New_York',
        country: 'USA',
        region: 'Northeast',
        currency: 'USD',
        overall_progress: 75,
        last_updated: '2024-01-15T14:30:00Z'
      },
      {
        id: '2',
        name: 'Tech Campus',
        location: 'San Francisco, CA',
        contractor_id: userId,
        status: 'active',
        timezone: 'America/Los_Angeles',
        country: 'USA',
        region: 'West Coast',
        currency: 'USD',
        overall_progress: 45,
        last_updated: '2024-01-15T11:15:00Z'
      },
      {
        id: '3',
        name: 'Manufacturing Hub',
        location: 'Mexico City, MX',
        contractor_id: userId,
        status: 'active',
        timezone: 'America/Mexico_City',
        country: 'Mexico',
        region: 'Central America',
        currency: 'MXN',
        overall_progress: 60,
        last_updated: '2024-01-15T16:45:00Z'
      }
    ];
    setSites(mockSites);
  };

  const groupSites = () => {
    const grouped: Record<string, Site[]> = {};
    
    sites.forEach(site => {
      const key = groupBy === 'region' ? site.region : site.timezone;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(site);
    });
    
    return grouped;
  };

  const renderSiteCard = (site: Site) => (
    <TouchableOpacity
      key={site.id}
      style={[styles.siteCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
    >
      <View style={styles.siteHeader}>
        <View style={styles.siteInfo}>
          <Text style={[styles.siteName, { color: theme.colors.text }]}>
            {site.name}
          </Text>
          <Text style={[styles.siteLocation, { color: theme.colors.textSecondary }]}>
            {site.location}
          </Text>
        </View>
        <SiteTimeBadge 
          timezone={site.timezone}
          region={site.region}
        />
      </View>
      
      <View style={styles.siteDetails}>
        <View style={styles.progressContainer}>
          <Text style={[styles.progressLabel, { color: theme.colors.textSecondary }]}>Progress</Text>
          <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
            <View 
              style={[styles.progressFill, { backgroundColor: theme.colors.primary, width: `${site.overall_progress}%` }]}
            />
          </View>
          <Text style={[styles.progressText, { color: theme.colors.text }]}>
            {site.overall_progress}%
          </Text>
        </View>
        
        <TimestampDisplay
          timestamp={site.last_updated || new Date().toISOString()}
          siteTimezone={site.timezone}
          label="Last Updated"
          showToggle={false}
        />
      </View>
      
      <View style={styles.siteFooter}>
        <Text style={[styles.currency, { color: theme.colors.textSecondary }]}>
          {site.currency}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(site.status) }]}>
          <Text style={styles.statusText}>{site.status.toUpperCase()}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#28a745';
      case 'completed': return '#007bff';
      case 'on_hold': return '#ffc107';
      default: return '#6c757d';
    }
  };

  const groupedSites = groupSites();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>My Sites</Text>
        <View style={styles.groupToggle}>
          <TouchableOpacity
            style={[styles.toggleButton, groupBy === 'region' && styles.activeToggle]}
            onPress={() => setGroupBy('region')}
          >
            <Text style={[styles.toggleText, groupBy === 'region' && styles.activeToggleText]}>Region</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, groupBy === 'timezone' && styles.activeToggle]}
            onPress={() => setGroupBy('timezone')}
          >
            <Text style={[styles.toggleText, groupBy === 'timezone' && styles.activeToggleText]}>Timezone</Text>
          </TouchableOpacity>
        </View>
      </View>

      {Object.entries(groupedSites).map(([groupKey, groupSites]) => (
        <View key={groupKey} style={styles.group}>
          <Text style={[styles.groupTitle, { color: theme.colors.text }]}>
            {groupKey}
          </Text>
          {groupSites.map(renderSiteCard)}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  groupToggle: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 2,
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  activeToggle: {
    backgroundColor: '#007AFF',
  },
  toggleText: {
    fontSize: 14,
    color: '#666',
  },
  activeToggleText: {
    color: '#fff',
  },
  group: {
    marginBottom: 24,
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  siteCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  siteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  siteInfo: {
    flex: 1,
  },
  siteName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  siteLocation: {
    fontSize: 14,
  },
  siteDetails: {
    marginBottom: 12,
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
  },
  siteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currency: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
});