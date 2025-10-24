import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const siteTypes = [
  { id: 1, name: 'Residential', icon: 'home-outline', color: '#3B82F6' },
  { id: 2, name: 'Commercial', icon: 'business-outline', color: '#10B981' },
  { id: 3, name: 'Industrial', icon: 'construct-outline', color: '#F59E0B' },
  { id: 4, name: 'Infrastructure', icon: 'trail-sign-outline', color: '#8B5CF6' },
  { id: 5, name: 'Mixed Use', icon: 'layers-outline', color: '#EF4444' },
];

interface SiteTypesCarouselProps {
  onTypeSelect?: (type: any) => void;
}

export function SiteTypesCarousel({ onTypeSelect }: SiteTypesCarouselProps) {
  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {siteTypes.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[styles.typeCard, { backgroundColor: type.color }]}
            onPress={() => onTypeSelect?.(type)}
          >
            <Ionicons name={type.icon as any} size={24} color="white" />
            <Text style={styles.typeName}>{type.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  typeCard: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  typeName: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});