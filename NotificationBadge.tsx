import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface NotificationBadgeProps {
  count: number;
  size?: 'small' | 'medium' | 'large';
  color?: string;
  textColor?: string;
  style?: any;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  size = 'medium',
  color = '#FF4444',
  textColor = '#FFFFFF',
  style
}) => {
  if (count === 0) return null;

  const displayCount = count > 99 ? '99+' : count.toString();
  
  const sizeStyles = {
    small: { width: 16, height: 16, borderRadius: 8 },
    medium: { width: 20, height: 20, borderRadius: 10 },
    large: { width: 24, height: 24, borderRadius: 12 }
  };

  const textSizes = {
    small: 10,
    medium: 12,
    large: 14
  };

  return (
    <View style={[
      styles.badge,
      sizeStyles[size],
      { backgroundColor: color },
      style
    ]}>
      <Text style={[
        styles.text,
        { color: textColor, fontSize: textSizes[size] }
      ]}>
        {displayCount}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  text: {
    fontWeight: 'bold',
    textAlign: 'center',
  }
});

export default NotificationBadge;