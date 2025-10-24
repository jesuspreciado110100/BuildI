import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { HomeCardsService, HomeCard } from '../services/HomeCardsService';
import { ActionCard } from './ActionCard';
import { User } from '../types';

interface SmartHomeScreenProps {
  user: User;
  onNavigate: (target: string) => void;
  onModalOpen: (modalType: string) => void;
  onAction: (actionType: string) => void;
}

export const SmartHomeScreen: React.FC<SmartHomeScreenProps> = ({
  user,
  onNavigate,
  onModalOpen,
  onAction,
}) => {
  const [cards, setCards] = useState<HomeCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadCards = async () => {
    try {
      setLoading(true);
      const userCards = await HomeCardsService.getCardsForUser(user.id, user.role);
      setCards(userCards.sort((a, b) => a.priority - b.priority));
    } catch (error) {
      console.error('Failed to load home cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshCards = async () => {
    try {
      setRefreshing(true);
      const userCards = await HomeCardsService.refreshCards(user.id, user.role);
      setCards(userCards.sort((a, b) => a.priority - b.priority));
    } catch (error) {
      console.error('Failed to refresh home cards:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCards();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(refreshCards, 30000);
    
    return () => clearInterval(interval);
  }, [user.id, user.role]);

  const handleCardPress = (card: HomeCard) => {
    switch (card.actionType) {
      case 'navigate':
        onNavigate(card.actionTarget);
        break;
      case 'modal':
        onModalOpen(card.actionTarget);
        break;
      case 'action':
        onAction(card.actionTarget);
        break;
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'contractor': return 'Contractor';
      case 'laborChief': return 'Labor Chief';
      case 'materialSupplier': return 'Material Supplier';
      default: return role;
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refreshCards} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>
          {getGreeting()}, {user.name.split(' ')[0]}!
        </Text>
        <Text style={styles.roleText}>{getRoleDisplayName(user.role)}</Text>
      </View>

      <View style={styles.cardsContainer}>
        <Text style={styles.sectionTitle}>Your Action Items</Text>
        {cards.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>✅</Text>
            <Text style={styles.emptyTitle}>All caught up!</Text>
            <Text style={styles.emptySubtitle}>
              No urgent actions needed right now.
            </Text>
          </View>
        ) : (
          cards.map((card) => (
            <ActionCard
              key={card.id}
              card={card}
              onPress={handleCardPress}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  roleText: {
    fontSize: 16,
    color: '#6b7280',
  },
  cardsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});