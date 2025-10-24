import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CalendarBadgeProps {
  date: string;
  type: 'milestone' | 'booking' | 'deadline';
}

export const CalendarBadge: React.FC<CalendarBadgeProps> = ({ date, type }) => {
  const getColor = () => {
    switch (type) {
      case 'milestone': return '#10b981';
      case 'booking': return '#3b82f6';
      case 'deadline': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'milestone': return 'flag-outline';
      case 'booking': return 'calendar-outline';
      case 'deadline': return 'time-outline';
      default: return 'calendar-outline';
    }
  };

  return (
    <View style={[styles.badge, { backgroundColor: getColor() + '20' }]}>
      <Ionicons name={getIcon() as any} size={16} color={getColor()} />
      <Text style={[styles.text, { color: getColor() }]}>{date}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
  },
});
