import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { MachineryItem } from '../types';

interface FeaturedMachineryCarouselProps {
  featuredMachinery: MachineryItem[];
  onSelectMachine: (machine: MachineryItem) => void;
}

export default function FeaturedMachineryCarousel({ featuredMachinery, onSelectMachine }: FeaturedMachineryCarouselProps) {
  if (featuredMachinery.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>🚜 Featured Machinery</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No featured machinery available</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🚜 Featured Machinery</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.carousel}
        contentContainerStyle={styles.carouselContent}
      >
        {featuredMachinery.map((machine) => (
          <TouchableOpacity
            key={machine.id}
            style={styles.card}
            onPress={() => onSelectMachine(machine)}
          >
            <View style={styles.featuredBadge}>
              <Text style={styles.badgeText}>FEATURED</Text>
            </View>
            {machine.photos && machine.photos.length > 0 ? (
              <Image source={{ uri: machine.photos[0] }} style={styles.image} />
            ) : (
              <View style={[styles.image, styles.placeholderImage]}>
                <Text style={styles.placeholderText}>🚜</Text>
              </View>
            )}
            <View style={styles.cardContent}>
              <Text style={styles.machineName} numberOfLines={1}>
                {machine.brand} {machine.model}
              </Text>
              <Text style={styles.category}>{machine.category}</Text>
              <Text style={styles.rate}>
                ${machine.rate}/{machine.rate_type}
              </Text>
              <Text style={styles.region} numberOfLines={1}>
                📍 {machine.region}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    paddingHorizontal: 16,
    color: '#1f2937',
  },
  carousel: {
    paddingLeft: 16,
  },
  carouselContent: {
    paddingRight: 16,
  },
  card: {
    width: 200,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  featuredBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333',
  },
  image: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 32,
  },
  cardContent: {
    padding: 12,
  },
  machineName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#1f2937',
  },
  category: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  rate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 4,
  },
  region: {
    fontSize: 12,
    color: '#999',
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
  },
});