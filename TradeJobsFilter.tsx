import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TradeJobsFilterProps {
  onFilterChange: (filter: string) => void;
  activeFilter: string;
}

export const TradeJobsFilter: React.FC<TradeJobsFilterProps> = ({
  onFilterChange,
  activeFilter
}) => {
  const filters = [
    { id: 'all', name: 'Todos', icon: 'apps' },
    { id: 'price', name: 'Precio', icon: 'pricetag' },
    { id: 'distance', name: 'Distancia', icon: 'location' },
    { id: 'skill', name: 'Habilidad', icon: 'star' }
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Filtrar por:</Text>
      <View style={styles.filterRow}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.filterButton,
              activeFilter === filter.id && styles.activeFilter
            ]}
            onPress={() => onFilterChange(filter.id)}
          >
            <Ionicons 
              name={filter.icon as any} 
              size={16} 
              color={activeFilter === filter.id ? '#FFFFFF' : '#64748B'} 
            />
            <Text style={[
              styles.filterText,
              activeFilter === filter.id && styles.activeFilterText
            ]}>
              {filter.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activeFilter: {
    backgroundColor: '#0EA5E9',
    borderColor: '#0EA5E9',
  },
  filterText: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 6,
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
});