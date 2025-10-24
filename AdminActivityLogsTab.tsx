import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { AdminActivityLog } from '../types';
import { AdminService } from '../services/AdminService';

interface AdminActivityLogsTabProps {
  onLogSelect: (log: AdminActivityLog) => void;
}

export const AdminActivityLogsTab: React.FC<AdminActivityLogsTabProps> = ({ onLogSelect }) => {
  const [logs, setLogs] = useState<AdminActivityLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AdminActivityLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [entityFilter, setEntityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'timestamp' | 'user'>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  useEffect(() => {
    filterAndSortLogs();
  }, [logs, searchQuery, entityFilter, sortBy, sortOrder]);

  const loadLogs = async () => {
    try {
      const data = await AdminService.getActivityLogs();
      setLogs(data);
    } catch (error) {
      console.error('Error loading activity logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortLogs = () => {
    let filtered = logs;

    if (searchQuery) {
      filtered = filtered.filter(log => 
        log.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.details.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (entityFilter !== 'all') {
      filtered = filtered.filter(log => log.entity_type === entityFilter);
    }

    // Sort logs
    filtered.sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'timestamp') {
        comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      } else if (sortBy === 'user') {
        comparison = a.user_name.localeCompare(b.user_name);
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredLogs(filtered);
  };

  const getEntityColor = (entityType: string) => {
    switch (entityType) {
      case 'booking': return '#007AFF';
      case 'payment': return '#28A745';
      case 'complaint': return '#DC3545';
      case 'review': return '#FFA500';
      default: return '#666';
    }
  };

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case 'booking': return '📅';
      case 'payment': return '💳';
      case 'complaint': return '⚠️';
      case 'review': return '⭐';
      default: return '📋';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const renderLog = ({ item }: { item: AdminActivityLog }) => {
    const { date, time } = formatTimestamp(item.timestamp);
    
    return (
      <TouchableOpacity style={styles.logCard} onPress={() => onLogSelect(item)}>
        <View style={styles.logHeader}>
          <View style={styles.entityInfo}>
            <Text style={styles.entityIcon}>{getEntityIcon(item.entity_type)}</Text>
            <View style={[styles.entityBadge, { backgroundColor: getEntityColor(item.entity_type) }]}>
              <Text style={styles.entityBadgeText}>{item.entity_type}</Text>
            </View>
          </View>
          <View style={styles.timestampInfo}>
            <Text style={styles.logDate}>{date}</Text>
            <Text style={styles.logTime}>{time}</Text>
          </View>
        </View>
        
        <View style={styles.logContent}>
          <Text style={styles.logUser}>{item.user_name}</Text>
          <Text style={styles.logAction}>{item.action}</Text>
          <Text style={styles.logDetails} numberOfLines={2}>{item.details}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const toggleSort = (field: 'timestamp' | 'user') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.controls}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search logs..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        
        <View style={styles.filters}>
          <Text style={styles.filterLabel}>Entity Type:</Text>
          <View style={styles.filterRow}>
            {['all', 'booking', 'payment', 'complaint', 'review'].map(entity => (
              <TouchableOpacity
                key={entity}
                style={[styles.filterButton, entityFilter === entity && styles.activeFilter]}
                onPress={() => setEntityFilter(entity)}
              >
                <Text style={[styles.filterText, entityFilter === entity && styles.activeFilterText]}>
                  {entity}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={styles.sortControls}>
          <Text style={styles.filterLabel}>Sort by:</Text>
          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[styles.sortButton, sortBy === 'timestamp' && styles.activeSortButton]}
              onPress={() => toggleSort('timestamp')}
            >
              <Text style={[styles.sortButtonText, sortBy === 'timestamp' && styles.activeSortButtonText]}>
                Time {sortBy === 'timestamp' && (sortOrder === 'asc' ? '↑' : '↓')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sortButton, sortBy === 'user' && styles.activeSortButton]}
              onPress={() => toggleSort('user')}
            >
              <Text style={[styles.sortButtonText, sortBy === 'user' && styles.activeSortButtonText]}>
                User {sortBy === 'user' && (sortOrder === 'asc' ? '↑' : '↓')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      <FlatList
        data={filteredLogs}
        renderItem={renderLog}
        keyExtractor={(item) => item.id}
        style={styles.logList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  controls: {
    marginBottom: 16,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  filters: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  activeFilter: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  activeFilterText: {
    color: 'white',
  },
  sortControls: {
    marginBottom: 12,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  activeSortButton: {
    backgroundColor: '#28A745',
  },
  sortButtonText: {
    fontSize: 12,
    color: '#666',
  },
  activeSortButtonText: {
    color: 'white',
  },
  logList: {
    flex: 1,
  },
  logCard: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  entityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  entityIcon: {
    fontSize: 16,
  },
  entityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  entityBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  timestampInfo: {
    alignItems: 'flex-end',
  },
  logDate: {
    fontSize: 12,
    color: '#666',
  },
  logTime: {
    fontSize: 12,
    color: '#666',
    fontWeight: 'bold',
  },
  logContent: {
    gap: 4,
  },
  logUser: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  logAction: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  logDetails: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
});