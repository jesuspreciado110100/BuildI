import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

interface Props {
  onStatusFilter: (status: string) => void;
  onTypeFilter: (type: string) => void;
  onCostSort: (order: 'asc' | 'desc' | null) => void;
}

export const FilterSystem: React.FC<Props> = ({
  onStatusFilter,
  onTypeFilter,
  onCostSort
}) => {
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [costSort, setCostSort] = useState<'asc' | 'desc' | null>(null);

  const statusOptions = ['All', 'Active', 'Completed', 'On Hold'];
  const typeOptions = ['All', 'Residential', 'Commercial', 'Industrial'];

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    onStatusFilter(status);
  };

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    onTypeFilter(type);
  };

  const handleCostSort = () => {
    let newSort: 'asc' | 'desc' | null;
    if (costSort === null) {
      newSort = 'asc';
    } else if (costSort === 'asc') {
      newSort = 'desc';
    } else {
      newSort = null;
    }
    setCostSort(newSort);
    onCostSort(newSort);
  };

  const getCostSortIcon = () => {
    if (costSort === 'asc') return '💰↑';
    if (costSort === 'desc') return '💰↓';
    return '💰';
  };

  const getStatusColor = (status: string) => {
    if (status === selectedStatus) {
      switch (status) {
        case 'Active': return '#4CAF50';
        case 'Completed': return '#2196F3';
        case 'On Hold': return '#FF9800';
        default: return '#007AFF';
      }
    }
    return '#f0f0f0';
  };

  const getTypeColor = (type: string) => {
    if (type === selectedType) {
      switch (type) {
        case 'Residential': return '#9C27B0';
        case 'Commercial': return '#FF5722';
        case 'Industrial': return '#607D8B';
        default: return '#007AFF';
      }
    }
    return '#f0f0f0';
  };

  const getTextColor = (isSelected: boolean) => {
    return isSelected ? 'white' : '#666';
  };

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
        {/* Status Filters */}
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Status:</Text>
          <View style={styles.filterRow}>
            {statusOptions.map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterButton,
                  { backgroundColor: getStatusColor(status) }
                ]}
                onPress={() => handleStatusChange(status)}
              >
                <Text style={[
                  styles.filterText,
                  { color: getTextColor(status === selectedStatus) }
                ]}>
                  {status}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Type Filters */}
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Type:</Text>
          <View style={styles.filterRow}>
            {typeOptions.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.filterButton,
                  { backgroundColor: getTypeColor(type) }
                ]}
                onPress={() => handleTypeChange(type)}
              >
                <Text style={[
                  styles.filterText,
                  { color: getTextColor(type === selectedType) }
                ]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Cost Sort */}
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Sort:</Text>
          <TouchableOpacity
            style={[
              styles.sortButton,
              { backgroundColor: costSort ? '#007AFF' : '#f0f0f0' }
            ]}
            onPress={handleCostSort}
          >
            <Text style={[
              styles.sortText,
              { color: costSort ? 'white' : '#666' }
            ]}>
              {getCostSortIcon()}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Active Filters Summary */}
      {(selectedStatus !== 'All' || selectedType !== 'All' || costSort) && (
        <View style={styles.activeFilters}>
          <Text style={styles.activeFiltersText}>Active filters: </Text>
          {selectedStatus !== 'All' && (
            <View style={styles.activeFilterTag}>
              <Text style={styles.activeFilterTagText}>{selectedStatus}</Text>
            </View>
          )}
          {selectedType !== 'All' && (
            <View style={styles.activeFilterTag}>
              <Text style={styles.activeFilterTagText}>{selectedType}</Text>
            </View>
          )}
          {costSort && (
            <View style={styles.activeFilterTag}>
              <Text style={styles.activeFilterTagText}>
                Cost {costSort === 'asc' ? 'Low→High' : 'High→Low'}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  scrollView: {
    paddingHorizontal: 16
  },
  filterGroup: {
    marginRight: 20
  },
  filterLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
    fontWeight: '600'
  },
  filterRow: {
    flexDirection: 'row'
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600'
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  sortText: {
    fontSize: 14,
    fontWeight: '600'
  },
  activeFilters: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    flexWrap: 'wrap'
  },
  activeFiltersText: {
    fontSize: 12,
    color: '#666',
    marginRight: 8
  },
  activeFilterTag: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 4,
    marginBottom: 4
  },
  activeFilterTagText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600'
  }
});