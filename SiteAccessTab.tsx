import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { SiteAccessService } from '../services/SiteAccessService';
import { SiteEntryLog, PPEViolation } from '../types';

interface SiteAccessTabProps {
  siteId: string;
}

export const SiteAccessTab: React.FC<SiteAccessTabProps> = ({ siteId }) => {
  const [entryLogs, setEntryLogs] = useState<SiteEntryLog[]>([]);
  const [ppeViolations, setPpeViolations] = useState<PPEViolation[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'today' | 'week'>('today');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [siteId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [entries, violations] = await Promise.all([
        SiteAccessService.getSiteEntries(siteId),
        SiteAccessService.getPPEViolations(siteId)
      ]);
      setEntryLogs(entries);
      setPpeViolations(violations);
    } catch (error) {
      console.error('Failed to load site access data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredEntries = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    return entryLogs.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      switch (activeFilter) {
        case 'today':
          return entryDate >= today;
        case 'week':
          return entryDate >= weekAgo;
        default:
          return true;
      }
    });
  };

  const getWeeklyViolationStats = () => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const weeklyViolations = ppeViolations.filter(
      v => new Date(v.timestamp) >= weekAgo
    );
    
    const stats = weeklyViolations.reduce((acc, violation) => {
      acc[violation.category] = (acc[violation.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return stats;
  };

  const renderEntryLog = ({ item }: { item: SiteEntryLog }) => {
    const time = new Date(item.timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    return (
      <View style={styles.logItem}>
        <View style={styles.logHeader}>
          <Text style={styles.logTime}>{time}</Text>
          <View style={[
            styles.statusBadge,
            item.approved ? styles.approvedBadge : styles.rejectedBadge
          ]}>
            <Text style={styles.statusText}>
              {item.approved ? '✅ APPROVED' : '❌ REJECTED'}
            </Text>
          </View>
        </View>
        
        <Text style={styles.logUser}>User ID: {item.user_id}</Text>
        <Text style={styles.logMethod}>
          Method: {item.entry_method.replace('_', ' ').toUpperCase()}
        </Text>
        
        {item.rejection_reason && (
          <Text style={styles.rejectionReason}>
            Reason: {item.rejection_reason}
          </Text>
        )}
      </View>
    );
  };

  const renderViolationChart = () => {
    const stats = getWeeklyViolationStats();
    const total = Object.values(stats).reduce((sum, count) => sum + count, 0);
    
    if (total === 0) {
      return (
        <View style={styles.noViolations}>
          <Text style={styles.noViolationsText}>✅ No PPE violations this week</Text>
        </View>
      );
    }
    
    return (
      <View style={styles.violationChart}>
        <Text style={styles.chartTitle}>PPE Violations (Last 7 Days)</Text>
        {Object.entries(stats).map(([category, count]) => {
          const percentage = (count / total) * 100;
          return (
            <View key={category} style={styles.chartItem}>
              <Text style={styles.chartLabel}>
                {category.toUpperCase()}: {count}
              </Text>
              <View style={styles.chartBar}>
                <View 
                  style={[styles.chartFill, { width: `${percentage}%` }]}
                />
              </View>
            </View>
          );
        })}
        <Text style={styles.chartTotal}>Total: {total} violations</Text>
      </View>
    );
  };

  const filteredEntries = getFilteredEntries();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Site Access Log</Text>
      
      {/* Filter Buttons */}
      <View style={styles.filterRow}>
        {['today', 'week', 'all'].map(filter => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterButton,
              activeFilter === filter && styles.activeFilter
            ]}
            onPress={() => setActiveFilter(filter as any)}
          >
            <Text style={[
              styles.filterText,
              activeFilter === filter && styles.activeFilterText
            ]}>
              {filter.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Entry Logs */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          📋 Entry Logs ({filteredEntries.length})
        </Text>
        
        {filteredEntries.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No entries found</Text>
          </View>
        ) : (
          <FlatList
            data={filteredEntries}
            renderItem={renderEntryLog}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />
        )}
      </View>

      {/* PPE Violations Chart */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚠️ PPE Compliance</Text>
        {renderViolationChart()}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 20,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#e9ecef',
  },
  activeFilter: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    fontSize: 14,
    color: '#6c757d',
  },
  activeFilterText: {
    color: 'white',
    fontWeight: 'bold',
  },
  section: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  logItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  logTime: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  approvedBadge: {
    backgroundColor: '#d4edda',
  },
  rejectedBadge: {
    backgroundColor: '#f8d7da',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  logUser: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
  logMethod: {
    fontSize: 14,
    color: '#6c757d',
  },
  rejectionReason: {
    fontSize: 14,
    color: '#dc3545',
    marginTop: 4,
    fontStyle: 'italic',
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6c757d',
  },
  violationChart: {
    padding: 10,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  chartItem: {
    marginBottom: 8,
  },
  chartLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  chartBar: {
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
  },
  chartFill: {
    height: '100%',
    backgroundColor: '#dc3545',
    borderRadius: 4,
  },
  chartTotal: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
  },
  noViolations: {
    padding: 20,
    alignItems: 'center',
  },
  noViolationsText: {
    fontSize: 16,
    color: '#28a745',
    fontWeight: 'bold',
  },
});