import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { HomeCard } from '../services/HomeCardsService';

interface ActionCardProps {
  card: HomeCard;
  onPress: (card: HomeCard) => void;
}

export const ActionCard: React.FC<ActionCardProps> = ({ card, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(card)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{card.icon}</Text>
          {card.badge && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{card.badge}</Text>
            </View>
          )}
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>{card.title}</Text>
          <Text style={styles.subtitle}>{card.subtitle}</Text>
          {card.progress !== undefined && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[styles.progressFill, { width: `${card.progress}%` }]}
                />
              </View>
              <Text style={styles.progressText}>{card.progress}%</Text>
            </View>
          )}
        </View>
        <View style={styles.arrow}>
          <Text style={styles.arrowText}>›</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    position: 'relative',
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  arrow: {
    marginLeft: 8,
  },
  arrowText: {
    fontSize: 20,
    color: '#9ca3af',
  },
});