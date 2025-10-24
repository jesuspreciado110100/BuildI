import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { FavoriteRenter } from '../types';
import { FavoriteRenterService } from '../services/FavoriteRenterService';
import FavoriteRenterCard from './FavoriteRenterCard';

interface FavoriteRentersPanelProps {
  contractorId: string;
  onQuickRehire: (favorite: FavoriteRenter) => void;
}

export default function FavoriteRentersPanel({ contractorId, onQuickRehire }: FavoriteRentersPanelProps) {
  const [favorites, setFavorites] = useState<FavoriteRenter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, [contractorId]);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const favoriteRenters = await FavoriteRenterService.getFavorites(contractorId);
      setFavorites(favoriteRenters);
    } catch (error) {
      Alert.alert('Error', 'Failed to load favorite renters');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ padding: 20 }}>
        <Text>Loading favorite renters...</Text>
      </View>
    );
  }

  if (favorites.length === 0) {
    return (
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 16, color: '#6b7280', textAlign: 'center' }}>
          No favorite renters yet. Mark renters as favorites from your rental history.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', padding: 15, color: '#374151' }}>
        Favorite Renters
      </Text>
      
      {favorites.map((favorite) => (
        <View key={favorite.id} style={{ paddingHorizontal: 15 }}>
          <FavoriteRenterCard
            favorite={favorite}
            onQuickRehire={onQuickRehire}
          />
        </View>
      ))}
    </ScrollView>
  );
}