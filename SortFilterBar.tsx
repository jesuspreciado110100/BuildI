import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SortFilterBarProps {
  sortBy: 'price' | 'distance' | 'newest';
  onSortChange: (sort: 'price' | 'distance' | 'newest') => void;
}

export const SortFilterBar: React.FC<SortFilterBarProps> = ({
  sortBy,
  onSortChange
}) => {
  const sortOptions = [
    { key: 'price', label: 'Precio', icon: 'pricetag-outline' },
    { key: 'distance', label: 'Distancia', icon: 'location-outline' },
    { key: 'newest', label: 'Más Nuevo', icon: 'time-outline' }
  ] as const;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ordenar por:</Text>
      <View style={styles.sortOptions}>
        {sortOptions.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.sortButton,
              sortBy === option.key && styles.activeSortButton
            ]}
            onPress={() => onSortChange(option.key)}
          >
            <Ionicons
              name={option.icon}
              size={16}
              color={sortBy === option.key ? '#FFFFFF' : '#64748B'}
            />
            <Text
              style={[
                styles.sortText,
                sortBy === option.key && styles.activeSortText
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  sortOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    gap: 6,
  },
  activeSortButton: {
    backgroundColor: '#0EA5E9',
  },
  sortText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  activeSortText: {
    color: '#FFFFFF',
  },
});