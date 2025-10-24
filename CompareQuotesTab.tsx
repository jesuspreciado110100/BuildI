import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';

interface Quote {
  id: string;
  supplier: string;
  material: string;
  price: number;
  quantity: number;
  deliveryTime: string;
  rating: number;
}

interface CompareQuotesTabProps {
  contractorId?: string;
}

export default function CompareQuotesTab({ contractorId }: CompareQuotesTabProps) {
  const [quotes] = useState<Quote[]>([
    {
      id: '1',
      supplier: 'ABC Materials',
      material: 'Concrete Mix',
      price: 120,
      quantity: 50,
      deliveryTime: '2 days',
      rating: 4.5
    },
    {
      id: '2',
      supplier: 'XYZ Supply Co',
      material: 'Concrete Mix',
      price: 115,
      quantity: 50,
      deliveryTime: '3 days',
      rating: 4.2
    },
    {
      id: '3',
      supplier: 'BuildRight Materials',
      material: 'Concrete Mix',
      price: 125,
      quantity: 50,
      deliveryTime: '1 day',
      rating: 4.8
    }
  ]);

  const [selectedQuote, setSelectedQuote] = useState<string | null>(null);

  const handleSelectQuote = (quoteId: string) => {
    setSelectedQuote(quoteId);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Compare Material Quotes</Text>
        <Text style={styles.subtitle}>Select the best quote for your project</Text>
      </View>

      {quotes.map((quote) => (
        <TouchableOpacity
          key={quote.id}
          style={[
            styles.quoteCard,
            selectedQuote === quote.id && styles.selectedCard
          ]}
          onPress={() => handleSelectQuote(quote.id)}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.supplierName}>{quote.supplier}</Text>
            <Text style={styles.rating}>★ {quote.rating}</Text>
          </View>
          
          <Text style={styles.material}>{quote.material}</Text>
          
          <View style={styles.details}>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Price per unit:</Text>
              <Text style={styles.price}>${quote.price}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.label}>Quantity:</Text>
              <Text style={styles.value}>{quote.quantity} units</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.label}>Delivery:</Text>
              <Text style={styles.value}>{quote.deliveryTime}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.label}>Total:</Text>
              <Text style={styles.totalPrice}>${quote.price * quote.quantity}</Text>
            </View>
          </View>
          
          {selectedQuote === quote.id && (
            <View style={styles.selectedBadge}>
              <Text style={styles.selectedText}>Selected</Text>
            </View>
          )}
        </TouchableOpacity>
      ))}
      
      {selectedQuote && (
        <TouchableOpacity style={styles.acceptButton}>
          <Text style={styles.acceptButtonText}>Accept Selected Quote</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  quoteCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCard: {
    borderColor: '#007AFF',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  supplierName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  rating: {
    fontSize: 16,
    color: '#FF9500',
    fontWeight: '600',
  },
  material: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  details: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  value: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  price: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  totalPrice: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  selectedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  selectedText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  acceptButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  acceptButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});