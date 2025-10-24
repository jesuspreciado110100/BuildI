import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export interface Provider {
  id: string;
  name: string;
  distance: number;
  rating: number;
  estimatedPrice: number;
  availability: string;
  category: string;
}

interface ProviderSuggestionProps {
  provider: Provider;
  onSelect: (provider: Provider) => void;
}

export default function ProviderSuggestion({ provider, onSelect }: ProviderSuggestionProps) {
  const getRatingStars = (rating: number) => {
    return '⭐'.repeat(Math.floor(rating)) + (rating % 1 >= 0.5 ? '⭐' : '');
  };

  return (
    <TouchableOpacity style={styles.container} onPress={() => onSelect(provider)}>
      <View style={styles.header}>
        <Text style={styles.name}>{provider.name}</Text>
        <Text style={styles.price}>${provider.estimatedPrice}/day</Text>
      </View>
      
      <View style={styles.details}>
        <Text style={styles.distance}>📍 {provider.distance} km away</Text>
        <Text style={styles.rating}>{getRatingStars(provider.rating)} ({provider.rating})</Text>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.category}>{provider.category}</Text>
        <Text style={[styles.availability, 
          provider.availability === 'Available' ? styles.available : styles.busy
        ]}>
          {provider.availability}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: '#059669',
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  distance: {
    fontSize: 14,
    color: '#6b7280',
  },
  rating: {
    fontSize: 14,
    color: '#6b7280',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  category: {
    fontSize: 12,
    color: '#9ca3af',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  availability: {
    fontSize: 12,
    fontWeight: '500',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  available: {
    color: '#059669',
    backgroundColor: '#d1fae5',
  },
  busy: {
    color: '#dc2626',
    backgroundColor: '#fee2e2',
  },
});