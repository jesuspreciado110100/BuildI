import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';

interface FABActionProps {
  icon: string;
  label: string;
  onPress: () => void;
  animatedValue: Animated.Value;
  index: number;
}

export const FABAction: React.FC<FABActionProps> = ({
  icon,
  label,
  onPress,
  animatedValue,
  index
}) => {
  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -(60 * (index + 1))]
  });

  const opacity = animatedValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.5, 1]
  });

  const scale = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1]
  });

  return (
    <Animated.View
      style={[
        styles.actionContainer,
        {
          transform: [{ translateY }, { scale }],
          opacity
        }
      ]}
    >
      <TouchableOpacity
        style={styles.actionButton}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Text style={styles.actionIcon}>{icon}</Text>
      </TouchableOpacity>
      <Text style={styles.actionLabel}>{label}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  actionContainer: {
    position: 'absolute',
    alignItems: 'center',
    right: 0,
    bottom: 0
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  actionIcon: {
    fontSize: 20,
    color: '#fff'
  },
  actionLabel: {
    fontSize: 12,
    color: '#333',
    marginTop: 4,
    fontWeight: '500'
  }
});