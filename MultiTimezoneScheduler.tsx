import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Site } from '../types';
import { TimezoneService } from '../services/TimezoneService';
import { TimestampDisplay } from './TimestampDisplay';
import { SiteTimeBadge } from './SiteTimeBadge';

interface ScheduleItem {
  id: string;
  title: string;
  site_id: string;
  datetime: string;
  type: 'booking' | 'milestone' | 'meeting' | 'delivery';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
}

interface MultiTimezoneSchedulerProps {
  sites: Site[];
  userTimezone?: string;
}

export const MultiTimezoneScheduler: React.FC<MultiTimezoneSchedulerProps> = ({
  sites,
  userTimezone = 'America/New_York'
}) => {
  const { theme } = useTheme();
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [selectedSite, setSelectedSite] = useState<string>('all');
  const [showTimezoneView, setShowTimezoneView] = useState(false);

  useEffect(() => {
    loadScheduleItems();
  }, []);

  const loadScheduleItems = () => {
    // Mock schedule data
    const mockItems: ScheduleItem[] = [
      {
        id: '1',
        title: 'Foundation Inspection',
        site_id: '1',
        datetime: '2024-01-20T14:00:00Z',
        type: 'booking',
        status: 'scheduled'
      },
      {
        id: '2',
        title: 'Material Delivery',
        site_id: '2',
        datetime: '2024-01-21T10:30:00Z',
        type: 'delivery',
        status: 'confirmed'
      },
      {
        id: '3',
        title: 'Milestone Review',
        site_id: '3',
        datetime: '2024-01-22T16:00:00Z',
        type: 'milestone',
        status: 'scheduled'
      }
    ];
    setScheduleItems(mockItems);
  };

  const getSiteById = (siteId: string) => {
    return sites.find(site => site.id === siteId);
  };

  const getFilteredItems = () => {
    if (selectedSite === 'all') {
      return scheduleItems;
    }
    return scheduleItems.filter(item => item.site_id === selectedSite);
  };

  const checkForHolidayConflicts = (datetime: string, timezone: string) => {
    // Simple holiday check - in real app, this would use a holiday API
    const date = new Date(datetime);
    const dayOfWeek = date.getDay();
    
    // Check for weekends
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return 'Weekend scheduling may affect availability';
    }
    
    // Check for common holidays (simplified)
    const month = date.getMonth();
    const day = date.getDate();
    
    if (month === 11 && day === 25) {
      return 'Christmas Day - Site may be closed';
    }
    if (month === 0 && day === 1) {
      return 'New Year\'s Day - Site may be closed';
    }
    
    return null;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'booking': return '📅';
      case 'milestone': return '🎯';
      case 'meeting': return '👥';
      case 'delivery': return '🚚';
      default: return '📋';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return '#ffc107';
      case 'confirmed': return '#28a745';
      case 'completed': return '#007bff';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const renderScheduleItem = (item: ScheduleItem) => {
    const site = getSiteById(item.site_id);
    if (!site) return null;
    
    const holidayWarning = checkForHolidayConflicts(item.datetime, site.timezone);
    
    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.scheduleItem, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
        onPress={() => {
          if (holidayWarning) {
            Alert.alert('Scheduling Notice', holidayWarning);
          }
        }}
      >
        <View style={styles.itemHeader}>
          <View style={styles.itemTitle}>
            <Text style={styles.typeIcon}>{getTypeIcon(item.type)}</Text>
            <Text style={[styles.title, { color: theme.colors.text }]}>{item.title}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
          </View>
        </View>
        
        <View style={styles.itemDetails}>
          <View style={styles.siteInfo}>
            <Text style={[styles.siteName, { color: theme.colors.textSecondary }]}>
              {site.name} • {site.location}
            </Text>
            <SiteTimeBadge timezone={site.timezone} region={site.region} showRegion={false} />
          </View>
          
          <TimestampDisplay
            timestamp={item.datetime}
            userTimezone={userTimezone}
            siteTimezone={site.timezone}
            showToggle={true}
          />
          
          {holidayWarning && (
            <View style={styles.warningContainer}>
              <Text style={styles.warningIcon}>⚠️</Text>
              <Text style={[styles.warningText, { color: theme.colors.warning }]}>
                {holidayWarning}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Multi-Timezone Schedule</Text>
        
        <View style={styles.filters}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[styles.filterButton, selectedSite === 'all' && styles.activeFilter]}
              onPress={() => setSelectedSite('all')}
            >
              <Text style={[styles.filterText, selectedSite === 'all' && styles.activeFilterText]}>All Sites</Text>
            </TouchableOpacity>
            {sites.map(site => (
              <TouchableOpacity
                key={site.id}
                style={[styles.filterButton, selectedSite === site.id && styles.activeFilter]}
                onPress={() => setSelectedSite(site.id)}
              >
                <Text style={[styles.filterText, selectedSite === site.id && styles.activeFilterText]}>
                  {site.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {getFilteredItems().map(renderScheduleItem)}
        
        {getFilteredItems().length === 0 && (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              No scheduled items found
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  filters: {
    marginBottom: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  activeFilter: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
  },
  activeFilterText: {
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  scheduleItem: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  typeIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
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
  itemDetails: {
    gap: 8,
  },
  siteInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  siteName: {
    fontSize: 14,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    padding: 8,
    borderRadius: 6,
  },
  warningIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  warningText: {
    fontSize: 12,
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
  },
});