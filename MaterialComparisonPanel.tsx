import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { MaterialQuoteRequest, MaterialItem } from '../types';
import { MaterialCatalogService } from '../services/MaterialCatalogService';

interface MaterialComparisonPanelProps {
  contractorId: string;
}

interface QuoteComparison {
  quote: MaterialQuoteRequest;
  material: MaterialItem;
  supplierName: string;
  isCompetitive: boolean;
}

export default function MaterialComparisonPanel({ contractorId }: MaterialComparisonPanelProps) {
  const [step, setStep] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialItem | null>(null);
  const [quotes, setQuotes] = useState<QuoteComparison[]>([]);
  const [sortBy, setSortBy] = useState<'price' | 'lead_time' | 'rating'>('price');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchTerm.length > 2) {
      searchMaterials();
    }
  }, [searchTerm]);

  const searchMaterials = async () => {
    try {
      const results = await MaterialCatalogService.searchMaterials(searchTerm);
      setMaterials(results);
    } catch (error) {
      console.error('Error searching materials:', error);
    }
  };

  const selectMaterial = async (material: MaterialItem) => {
    setSelectedMaterial(material);
    setStep(2);
    await loadQuotes(material.name);
  };

  const loadQuotes = async (materialName: string) => {
    setLoading(true);
    try {
      const quoteData = await MaterialCatalogService.getQuotesByMaterial(materialName, contractorId);
      const comparisons = quoteData.map(item => ({
        ...item,
        isCompetitive: item.quote.counter_offer_price === Math.min(...quoteData.map(q => q.quote.counter_offer_price || q.material.unit_price))
      }));
      setQuotes(comparisons);
    } catch (error) {
      console.error('Error loading quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  const acceptOffer = async (quoteId: string) => {
    try {
      await MaterialCatalogService.acceptQuote(quoteId, contractorId);
      await loadQuotes(selectedMaterial!.name);
    } catch (error) {
      console.error('Error accepting offer:', error);
    }
  };

  const sendBatchRequest = async () => {
    if (!selectedMaterial) return;
    try {
      await MaterialCatalogService.sendBatchQuoteRequest(selectedMaterial.name, contractorId);
      await loadQuotes(selectedMaterial.name);
    } catch (error) {
      console.error('Error sending batch request:', error);
    }
  };

  const sortedQuotes = [...quotes].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return (a.quote.counter_offer_price || a.material.unit_price) - (b.quote.counter_offer_price || b.material.unit_price);
      case 'lead_time':
        return a.material.lead_time_days - b.material.lead_time_days;
      case 'rating':
        return b.material.rating - a.material.rating;
      default:
        return 0;
    }
  });

  if (step === 1) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Compare Material Quotes</Text>
        <Text style={styles.subtitle}>Step 1: Search and select material</Text>
        
        <TextInput
          style={styles.searchInput}
          placeholder="Search materials..."
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        
        <ScrollView style={styles.materialList}>
          {materials.map(material => (
            <TouchableOpacity
              key={material.id}
              style={styles.materialItem}
              onPress={() => selectMaterial(material)}
            >
              <Text style={styles.materialName}>{material.name}</Text>
              <Text style={styles.materialCategory}>{material.category}</Text>
              <Text style={styles.materialPrice}>${material.unit_price}/{material.unit_type}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setStep(1)} style={styles.backButton}>
        <Text style={styles.backText}>← Back to Search</Text>
      </TouchableOpacity>
      
      <Text style={styles.title}>Compare Quotes: {selectedMaterial?.name}</Text>
      
      <View style={styles.actions}>
        <TouchableOpacity style={styles.batchButton} onPress={sendBatchRequest}>
          <Text style={styles.batchButtonText}>Send Batch Request</Text>
        </TouchableOpacity>
        
        <View style={styles.sortContainer}>
          <Text>Sort by:</Text>
          {['price', 'lead_time', 'rating'].map(option => (
            <TouchableOpacity
              key={option}
              style={[styles.sortButton, sortBy === option && styles.sortButtonActive]}
              onPress={() => setSortBy(option as any)}
            >
              <Text style={[styles.sortButtonText, sortBy === option && styles.sortButtonTextActive]}>
                {option.replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <ScrollView style={styles.quotesList}>
        {sortedQuotes.map(comparison => (
          <View key={comparison.quote.id} style={[styles.quoteCard, comparison.isCompetitive && styles.competitiveCard]}>
            <View style={styles.quoteHeader}>
              <Text style={styles.supplierName}>{comparison.supplierName}</Text>
              <Text style={styles.quoteStatus}>{comparison.quote.status}</Text>
            </View>
            
            <View style={styles.quoteDetails}>
              <Text>Unit Price: ${comparison.quote.counter_offer_price || comparison.material.unit_price}/{comparison.material.unit_type}</Text>
              <Text>Stock: {comparison.material.stock_quantity}</Text>
              <Text>Lead Time: {comparison.material.lead_time_days} days</Text>
              <Text>Rating: {comparison.material.rating}/5</Text>
            </View>
            
            {comparison.quote.status === 'pending' && (
              <TouchableOpacity
                style={styles.acceptButton}
                onPress={() => acceptOffer(comparison.quote.id)}
              >
                <Text style={styles.acceptButtonText}>Accept Offer</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: 'white'
  },
  materialList: {
    flex: 1
  },
  materialItem: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  materialName: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  materialCategory: {
    fontSize: 14,
    color: '#666'
  },
  materialPrice: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: 'bold'
  },
  backButton: {
    marginBottom: 16
  },
  backText: {
    fontSize: 16,
    color: '#007AFF'
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  batchButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8
  },
  batchButtonText: {
    color: 'white',
    fontWeight: 'bold'
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  sortButton: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: '#e0e0e0'
  },
  sortButtonActive: {
    backgroundColor: '#007AFF'
  },
  sortButtonText: {
    fontSize: 12
  },
  sortButtonTextActive: {
    color: 'white'
  },
  quotesList: {
    flex: 1
  },
  quoteCard: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  competitiveCard: {
    borderColor: '#4CAF50',
    backgroundColor: '#f8fff8'
  },
  quoteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  supplierName: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  quoteStatus: {
    fontSize: 14,
    color: '#666',
    textTransform: 'capitalize'
  },
  quoteDetails: {
    marginBottom: 12
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  acceptButtonText: {
    color: 'white',
    fontWeight: 'bold'
  }
});