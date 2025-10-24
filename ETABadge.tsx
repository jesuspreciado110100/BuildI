import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ETABadgeProps {
  initialMinutes: number;
  operatorName?: string;
  onETAExpired?: () => void;
}

export const ETABadge: React.FC<ETABadgeProps> = ({ 
  initialMinutes, 
  operatorName = 'Operator',
  onETAExpired 
}) => {
  const [minutesLeft, setMinutesLeft] = useState(initialMinutes);

  useEffect(() => {
    if (minutesLeft <= 0) {
      onETAExpired?.();
      return;
    }

    const timer = setInterval(() => {
      setMinutesLeft(prev => {
        if (prev <= 1) {
          onETAExpired?.();
          return 0;
        }
        return prev - 1;
      });
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [minutesLeft, onETAExpired]);

  const getStatusColor = () => {
    if (minutesLeft <= 5) return '#ff4444';
    if (minutesLeft <= 15) return '#ff8800';
    return '#00aa44';
  };

  const getStatusText = () => {
    if (minutesLeft <= 0) return 'Arrived';
    if (minutesLeft === 1) return `${operatorName} 1 min away`;
    return `${operatorName} ${minutesLeft} min away`;
  };

  return (
    <View style={[styles.container, { backgroundColor: getStatusColor() }]}>
      <Text style={styles.text}>{getStatusText()}</Text>
      {minutesLeft > 0 && (
        <View style={styles.pulse} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  text: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  pulse: {
    position: 'absolute',
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
});