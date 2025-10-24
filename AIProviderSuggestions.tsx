import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import ProviderSuggestion, { Provider } from './ProviderSuggestion';

interface AIProviderSuggestionsProps {
  resourceType: 'labor' | 'machinery' | 'materials';
  location: string;
  budget: number;
  onSelectProvider: (provider: Provider) => void;
  onClose: () => void;
}

export default function AIProviderSuggestions({ 
  resourceType, 
  location, 
  budget, 
  onSelectProvider, 
  onClose 
}: AIProviderSuggestionsProps) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Provider[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const generateSuggestions = () => {
    setLoading(true);
    
    // Simulate AI processing delay
    setTimeout(() => {
      const mockProviders = getMockProviders(resourceType, location, budget);
      setSuggestions(mockProviders);
      setLoading(false);
      setHasSearched(true);
    }, 1500);
  };

  const getMockProviders = (type: string, loc: string, budgetAmount: number): Provider[] => {
    const baseProviders = {
      labor: [
        { name: 'Elite Construction Crew', category: 'General Labor', basePrice: 350, rating: 4.8, distance: 2.5 },
        { name: 'Skilled Builders Co.', category: 'Specialized Labor', basePrice: 420, rating: 4.6, distance: 5.2 },
        { name: 'Metro Labor Solutions', category: 'General Labor', basePrice: 280, rating: 4.3, distance: 8.1 },
        { name: 'Professional Contractors', category: 'Specialized Labor', basePrice: 480, rating: 4.9, distance: 12.3 },
      ],
      machinery: [
        { name: 'Heavy Equipment Rentals', category: 'Excavator Rental', basePrice: 450, rating: 4.7, distance: 3.2 },
        { name: 'Construction Machine Co.', category: 'Multi-Equipment', basePrice: 380, rating: 4.5, distance: 6.8 },
        { name: 'Industrial Machinery Ltd.', category: 'Crane Services', basePrice: 650, rating: 4.8, distance: 9.5 },
        { name: 'Site Equipment Pros', category: 'Bulldozer Rental', basePrice: 320, rating: 4.4, distance: 15.2 },
      ],
      materials: [
        { name: 'Premium Building Supply', category: 'Concrete & Steel', basePrice: 180, rating: 4.6, distance: 4.1 },
        { name: 'Construction Materials Hub', category: 'General Materials', basePrice: 150, rating: 4.4, distance: 7.3 },
        { name: 'Quality Stone & Cement', category: 'Masonry Materials', basePrice: 220, rating: 4.7, distance: 11.8 },
        { name: 'Bulk Materials Direct', category: 'Aggregates', basePrice: 120, rating: 4.2, distance: 18.5 },
      ]
    };

    return baseProviders[type as keyof typeof baseProviders]
      .map(provider => ({
        id: Math.random().toString(36).substr(2, 9),
        ...provider,
        estimatedPrice: Math.round(provider.basePrice * (0.8 + Math.random() * 0.4)),
        availability: Math.random() > 0.3 ? 'Available' : 'Busy'
      }))
      .sort((a, b) => {
        // AI scoring: proximity (40%), price vs budget (30%), rating (30%)
        const scoreA = (1 / a.distance) * 0.4 + (budgetAmount / a.estimatedPrice) * 0.3 + (a.rating / 5) * 0.3;
        const scoreB = (1 / b.distance) * 0.4 + (budgetAmount / b.estimatedPrice) * 0.3 + (b.rating / 5) * 0.3;
        return scoreB - scoreA;
      })
      .slice(0, 4);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🤖 AI Provider Suggestions</Text>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.closeButton}>✕</Text>
        </TouchableOpacity>
      </View>

      {!hasSearched ? (
        <View style={styles.searchPrompt}>
          <Text style={styles.searchText}>
            Find the best {resourceType} providers for your project
          </Text>
          <Text style={styles.searchSubtext}>
            📍 Location: {location}\n💰 Budget: ${budget}/day
          </Text>
          <TouchableOpacity style={styles.searchButton} onPress={generateSuggestions}>
            <Text style={styles.searchButtonText}>🔍 Find Providers</Text>
          </TouchableOpacity>
        </View>
      ) : loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Analyzing providers...</Text>
        </View>
      ) : (
        <ScrollView style={styles.suggestionsContainer}>
          <Text style={styles.resultsHeader}>
            Top {suggestions.length} matches for {resourceType}:
          </Text>
          {suggestions.map((provider) => (
            <ProviderSuggestion
              key={provider.id}
              provider={provider}
              onSelect={onSelectProvider}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  closeButton: {
    fontSize: 24,
    color: '#6b7280',
    padding: 5,
  },
  searchPrompt: {
    padding: 20,
    alignItems: 'center',
  },
  searchText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 10,
  },
  searchSubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  searchButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  searchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  suggestionsContainer: {
    flex: 1,
    padding: 20,
  },
  resultsHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
});