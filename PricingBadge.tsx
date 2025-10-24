import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface PricingBadgeProps {
  score: 'low' | 'fair' | 'high';
  marketAvgPrice: number;
}

export default function PricingBadge({ score, marketAvgPrice }: PricingBadgeProps) {
  const getBadgeStyle = () => {
    switch (score) {
      case 'low':
        return { backgroundColor: '#dc2626', text: 'Below Market' };
      case 'fair':
        return { backgroundColor: '#16a34a', text: 'Fair Price' };
      case 'high':
        return { backgroundColor: '#ea580c', text: 'Above Market' };
      default:
        return { backgroundColor: '#6b7280', text: 'Unknown' };
    }
  };

  const badgeStyle = getBadgeStyle();

  return (
    <View style={styles.container}>
      <View style={[styles.badge, { backgroundColor: badgeStyle.backgroundColor }]}>
        <Text style={styles.badgeText}>{badgeStyle.text}</Text>
      </View>
      <Text style={styles.marketPrice}>Market Avg: ${marketAvgPrice}/day</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
    marginTop: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  marketPrice: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
});