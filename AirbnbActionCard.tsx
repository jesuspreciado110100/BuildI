import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AnimatedProgressBar } from './AnimatedProgressBar';

interface AirbnbActionCardProps {
  title: string;
  subtitle?: string;
  icon: string;
  iconColor: string;
  onPress: () => void;
  progress?: number;
  showWarning?: boolean;
  priority?: 'high' | 'medium' | 'low';
}

export const AirbnbActionCard: React.FC<AirbnbActionCardProps> = ({
  title,
  subtitle,
  icon,
  iconColor,
  onPress,
  progress,
  showWarning,
  priority = 'medium'
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.card,
        priority === 'high' && styles.highPriority
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        <View style={styles.leftSection}>
          {showWarning && (
            <View style={styles.warningIcon}>
              <Text style={styles.warningText}>⚠️</Text>
            </View>
          )}
          <View style={[styles.iconContainer, { backgroundColor: iconColor }]}>
            <Text style={styles.iconText}>{icon}</Text>
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            {progress !== undefined && (
              <View style={styles.progressContainer}>
                <AnimatedProgressBar progress={progress} height={4} />
                <Text style={styles.progressText}>{Math.round(progress)}% complete</Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.chevron}>
          <Text style={styles.chevronText}>›</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  highPriority: {
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  warningIcon: {
    marginRight: 8,
  },
  warningText: {
    fontSize: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 20,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  chevron: {
    marginLeft: 8,
  },
  chevronText: {
    fontSize: 20,
    color: '#9CA3AF',
    fontWeight: '300',
  },
});