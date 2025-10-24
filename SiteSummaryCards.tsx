import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SummaryCardProps {
  title: string;
  value: string;
  icon: string;
  color: string;
  onPress?: () => void;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  icon,
  color,
  onPress
}) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={[styles.iconContainer, { backgroundColor: color }]}>
        <Ionicons name={icon as any} size={24} color="#ffffff" />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardValue}>{value}</Text>
      </View>
    </TouchableOpacity>
  );
};

interface SiteSummaryCardsProps {
  totalConcepts: number;
  budgetUsed: number;
  totalBudget: number;
  progressPercent: number;
  nextMilestone: string;
}

export const SiteSummaryCards: React.FC<SiteSummaryCardsProps> = ({
  totalConcepts,
  budgetUsed,
  totalBudget,
  progressPercent,
  nextMilestone
}) => {
  const budgetPercent = Math.round((budgetUsed / totalBudget) * 100);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <SummaryCard
          title="Total Concepts"
          value={totalConcepts.toString()}
          icon="layers-outline"
          color="#3b82f6"
        />
        <SummaryCard
          title="Budget Used"
          value={`${budgetPercent}%`}
          icon="wallet-outline"
          color="#10b981"
        />
      </View>
      <View style={styles.row}>
        <SummaryCard
          title="Progress"
          value={`${progressPercent}%`}
          icon="trending-up-outline"
          color="#f59e0b"
        />
        <SummaryCard
          title="Next Milestone"
          value={nextMilestone}
          icon="flag-outline"
          color="#8b5cf6"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  card: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
});
