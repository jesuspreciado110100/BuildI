import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ResponseTimeService } from '../services/ResponseTimeService';

interface ResponseTimeBadgeProps {
  score: 'excellent' | 'good' | 'slow';
  avgResponseTime: number;
}

export const ResponseTimeBadge: React.FC<ResponseTimeBadgeProps> = ({ score, avgResponseTime }) => {
  const responseTimeService = ResponseTimeService.getInstance();
  const badge = responseTimeService.getResponseBadge(score);
  
  const getBadgeStyle = () => {
    switch (score) {
      case 'excellent':
        return { backgroundColor: '#10B981', borderColor: '#059669' };
      case 'good':
        return { backgroundColor: '#F59E0B', borderColor: '#D97706' };
      case 'slow':
        return { backgroundColor: '#EF4444', borderColor: '#DC2626' };
    }
  };

  return (
    <View style={[styles.container, getBadgeStyle()]}>
      <Text style={styles.emoji}>{badge.emoji}</Text>
      <View style={styles.textContainer}>
        <Text style={styles.badgeText}>{badge.text}</Text>
        <Text style={styles.timeText}>
          {responseTimeService.formatResponseTime(avgResponseTime)} avg
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  emoji: {
    fontSize: 16,
    marginRight: 8,
  },
  textContainer: {
    flex: 1,
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  timeText: {
    color: '#FFFFFF',
    fontSize: 12,
    opacity: 0.9,
  },
});