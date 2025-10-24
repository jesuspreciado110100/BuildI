import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { TradeOffer } from '../types';
import TradeOfferCard from './TradeOfferCard';

interface TradeOfferListProps {
  offers?: TradeOffer[];
  onOfferSelect?: (offer: TradeOffer) => void;
  isContractor?: boolean;
}

const mockOffers: TradeOffer[] = [
  {
    id: '1',
    contractor_id: '1',
    subcontractor_id: '2',
    concept_ids: ['1', '2'],
    total_price: 15000,
    contractor_fee: 600,
    subcontractor_fee: 450,
    deadline: '2024-02-15',
    status: 'pending',
    created_at: '2024-01-10T10:00:00Z'
  },
  {
    id: '2',
    contractor_id: '1',
    subcontractor_id: '3',
    concept_ids: ['3'],
    total_price: 8000,
    contractor_fee: 320,
    subcontractor_fee: 240,
    deadline: '2024-02-20',
    status: 'accepted',
    created_at: '2024-01-12T10:00:00Z'
  }
];

export default function TradeOfferList({ 
  offers = mockOffers, 
  onOfferSelect, 
  isContractor = true 
}: TradeOfferListProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');

  const filteredOffers = offers.filter(offer => 
    filter === 'all' || offer.status === filter
  );

  const renderOffer = ({ item }: { item: TradeOffer }) => (
    <TouchableOpacity
      style={styles.offerItem}
      onPress={() => onOfferSelect?.(item)}
    >
      <TradeOfferCard
        offer={item}
        concepts={[]}
        showActions={item.status === 'pending'}
        isContractor={isContractor}
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trade Offers ({filteredOffers.length})</Text>
      
      <View style={styles.filterContainer}>
        {['all', 'pending', 'accepted', 'rejected'].map(status => (
          <TouchableOpacity
            key={status}
            style={[styles.filterButton, filter === status && styles.activeFilter]}
            onPress={() => setFilter(status as any)}
          >
            <Text style={[styles.filterText, filter === status && styles.activeFilterText]}>
              {status.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredOffers}
        renderItem={renderOffer}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: '#1e293b' },
  filterContainer: { flexDirection: 'row', marginBottom: 16 },
  filterButton: { backgroundColor: '#e5e7eb', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, marginRight: 8 },
  activeFilter: { backgroundColor: '#2563eb' },
  filterText: { fontSize: 12, color: '#6b7280' },
  activeFilterText: { color: 'white' },
  offerItem: { marginBottom: 12 }
});