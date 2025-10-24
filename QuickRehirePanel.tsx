import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { FavoriteRenterService } from '../services/FavoriteRenterService';
import { RentalHistoryService } from '../services/RentalHistoryService';

interface FavoriteRenter {
  id: string;
  name: string;
  rating: number;
  lastMachineType: string;
  lastBudget: number;
  totalRentals: number;
  responseTime: string;
}

interface QuickRehirePanelProps {
  contractorId: string;
  onRehire: (renterId: string, renterName: string) => void;
}

export function QuickRehirePanel({ contractorId, onRehire }: QuickRehirePanelProps) {
  const [favoriteRenters, setFavoriteRenters] = useState<FavoriteRenter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavoriteRenters();
  }, [contractorId]);

  const loadFavoriteRenters = async () => {
    try {
      setLoading(true);
      const renters = await FavoriteRenterService.getFavoriteRenters(contractorId);
      setFavoriteRenters(renters);
    } catch (error) {
      console.error('Error loading favorite renters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRehire = (renter: FavoriteRenter) => {
    onRehire(renter.id, renter.name);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Text key={i} style={[styles.star, i < rating && styles.starFilled]}>★</Text>
    ));
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading favorite renters...</Text>
      </View>
    );
  }

  if (favoriteRenters.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>⚡</Text>
        <Text style={styles.emptyTitle}>No Favorite Renters</Text>
        <Text style={styles.emptyText}>Complete a few rentals to see quick rehire options here</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Quick Rehire</Text>
        <Text style={styles.subtitle}>One-click rebooking from your favorite renters</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
        {favoriteRenters.map((renter) => (
          <View key={renter.id} style={styles.renterCard}>
            <View style={styles.renterHeader}>
              <Text style={styles.renterName}>{renter.name}</Text>
              <View style={styles.ratingContainer}>
                <View style={styles.stars}>
                  {renderStars(renter.rating)}
                </View>
                <Text style={styles.ratingText}>({renter.rating})</Text>
              </View>
            </View>

            <View style={styles.renterInfo}>
              <Text style={styles.infoLabel}>Last Machine:</Text>
              <Text style={styles.infoValue}>{renter.lastMachineType}</Text>
            </View>

            <View style={styles.renterInfo}>
              <Text style={styles.infoLabel}>Last Budget:</Text>
              <Text style={styles.infoValue}>${renter.lastBudget}/day</Text>
            </View>

            <View style={styles.renterInfo}>
              <Text style={styles.infoLabel}>Response Time:</Text>
              <Text style={styles.infoValue}>{renter.responseTime}</Text>
            </View>

            <View style={styles.renterStats}>
              <Text style={styles.statsText}>{renter.totalRentals} rentals completed</Text>
            </View>

            <TouchableOpacity
              style={styles.rehireButton}
              onPress={() => handleRehire(renter)}
            >
              <Text style={styles.rehireButtonText}>⚡ Quick Rehire</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 16
  },
  header: {
    marginBottom: 16
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280'
  },
  scrollView: {
    flexDirection: 'row'
  },
  renterCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 240,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  renterHeader: {
    marginBottom: 12
  },
  renterName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  stars: {
    flexDirection: 'row',
    marginRight: 4
  },
  star: {
    fontSize: 12,
    color: '#d1d5db'
  },
  starFilled: {
    color: '#fbbf24'
  },
  ratingText: {
    fontSize: 12,
    color: '#6b7280'
  },
  renterInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  infoLabel: {
    fontSize: 12,
    color: '#6b7280'
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151'
  },
  renterStats: {
    marginTop: 8,
    marginBottom: 12
  },
  statsText: {
    fontSize: 11,
    color: '#6b7280',
    textAlign: 'center'
  },
  rehireButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center'
  },
  rehireButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600'
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center'
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280'
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center'
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center'
  }
});