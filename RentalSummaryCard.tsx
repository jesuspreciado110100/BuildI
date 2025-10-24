import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface RentalSummaryCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number;
  onPress?: () => void;
}

export const RentalSummaryCard: React.FC<RentalSummaryCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  onPress
}) => {
  const getTrendColor = (trend: number) => {
    if (trend > 0) return '#4CAF50';
    if (trend < 0) return '#F44336';
    return '#757575';
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return '↗';
    if (trend < 0) return '↘';
    return '→';
  };

  const CardContent = (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.value}>{value}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {trend !== undefined && (
        <View style={styles.trendContainer}>
          <Text style={[styles.trend, { color: getTrendColor(trend) }]}>
            {getTrendIcon(trend)} {Math.abs(trend)}%
          </Text>
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} style={styles.container}>
        {CardContent}
      </TouchableOpacity>
    );
  }

  return <View style={styles.container}>{CardContent}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 120,
  },
  title: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
  },
  trendContainer: {
    marginTop: 'auto',
  },
  trend: {
    fontSize: 12,
    fontWeight: '600',
  },
});