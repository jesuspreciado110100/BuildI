import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';

interface FloatingActionButtonProps {
  icon: string;
  label: string;
  onPress: () => void;
  position?: 'bottom-right' | 'bottom-left';
  backgroundColor?: string;
}

export function FloatingActionButton({ 
  icon, 
  label, 
  onPress, 
  position = 'bottom-right',
  backgroundColor = '#2563eb'
}: FloatingActionButtonProps) {
  const scaleValue = new Animated.Value(1);

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true
    }).start();
  };

  const positionStyle = position === 'bottom-right' 
    ? { bottom: 20, right: 20 }
    : { bottom: 20, left: 20 };

  return (
    <Animated.View 
      style={[
        styles.container, 
        positionStyle,
        { transform: [{ scale: scaleValue }] }
      ]}
    >
      <TouchableOpacity
        style={[styles.button, { backgroundColor }]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
      >
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.label}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 1000
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8
  },
  icon: {
    fontSize: 20,
    marginRight: 8
  },
  label: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600'
  }
});