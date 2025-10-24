import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { MaterialItem } from '../types';
import { StarRating } from './StarRating';

interface MaterialCardProps {
  material: MaterialItem;
  onPress: () => void;
  onRequestQuote?: () => void;
  showSupplierRating?: boolean;
  supplierRating?: number;
}

export default function MaterialCard({ material, onPress, onRequestQuote, showSupplierRating, supplierRating }: MaterialCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardContent}>
        {material.photo_url && (
          <Image source={{ uri: material.photo_url }} style={styles.image} />
        )}
        
        <View style={styles.details}>
          <Text style={styles.name}>{material.name}</Text>
          <Text style={styles.category}>{material.category}</Text>
          
          <View style={styles.priceRow}>
            <Text style={styles.price}>
              ${material.unit_price.toFixed(2)}/{material.unit_type}
            </Text>
            <Text style={styles.stock}>
              Stock: {material.stock_quantity}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.leadTime}>
              Lead time: {material.lead_time_days} days
            </Text>
            {material.perishable && (
              <Text style={styles.perishable}>Perishable</Text>
            )}
          </View>
          
          <View style={styles.ratingRow}>
            <StarRating rating={material.rating} readonly size={16} showNumber />
          </View>
          
          {showSupplierRating && supplierRating && (
            <View style={styles.supplierRating}>
              <Text style={styles.supplierLabel}>Supplier: </Text>
              <StarRating rating={supplierRating} readonly size={14} showNumber />
            </View>
          )}
        </View>
      </View>
      
      {onRequestQuote && (
        <TouchableOpacity 
          style={styles.quoteButton} 
          onPress={(e) => {
            e.stopPropagation();
            onRequestQuote();
          }}
        >
          <Text style={styles.quoteButtonText}>Request Quote</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  cardContent: {
    flexDirection: 'row'
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12
  },
  details: {
    flex: 1
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4
  },
  category: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007bff'
  },
  stock: {
    fontSize: 14,
    color: '#666'
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  leadTime: {
    fontSize: 14,
    color: '#666'
  },
  perishable: {
    fontSize: 12,
    color: '#ff6b6b',
    backgroundColor: '#ffe0e0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  supplierRating: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  supplierLabel: {
    fontSize: 12,
    color: '#666',
    marginRight: 4
  },
  quoteButton: {
    backgroundColor: '#28a745',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginTop: 12,
    alignSelf: 'flex-end'
  },
  quoteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14
  }
});