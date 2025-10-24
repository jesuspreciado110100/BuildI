import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FavoriteRenter } from '../types';

interface FavoriteRenterCardProps {
  favorite: FavoriteRenter;
  onQuickRehire: (favorite: FavoriteRenter) => void;
}

export default function FavoriteRenterCard({ favorite, onQuickRehire }: FavoriteRenterCardProps) {
  const renderStars = (rating: number) => {
    return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.name}>★ {favorite.renter_name}</Text>
        <Text style={styles.rating}>{renderStars(favorite.average_rating)}</Text>
      </View>
      
      <Text style={styles.details}>
        Last: {favorite.last_machine_type} • ${favorite.last_price}
      </Text>
      <Text style={styles.stats}>
        {favorite.total_bookings} bookings • Last: {favorite.last_booking_date}
      </Text>
      
      <TouchableOpacity
        style={styles.rehireButton}
        onPress={() => onQuickRehire(favorite)}
      >
        <Text style={styles.rehireButtonText}>Quick Rehire</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fef3c7',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#f59e0b'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400e'
  },
  rating: {
    fontSize: 14,
    color: '#d97706'
  },
  details: {
    fontSize: 14,
    color: '#78716c',
    marginBottom: 4
  },
  stats: {
    fontSize: 12,
    color: '#a8a29e',
    marginBottom: 12
  },
  rehireButton: {
    backgroundColor: '#f59e0b',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center'
  },
  rehireButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600'
  }
});