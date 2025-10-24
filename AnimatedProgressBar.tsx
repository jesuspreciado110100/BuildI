import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface AnimatedProgressBarProps {
  progress: number; // 0-100
  label?: string;
  color?: string;
  height?: number;
  delay?: number;
  showPercentage?: boolean;
}

export function AnimatedProgressBar({ 
  progress, 
  label, 
  color = '#2563eb', 
  height = 8, 
  delay = 0,
  showPercentage = true 
}: AnimatedProgressBarProps) {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in the component first
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      delay: delay,
      useNativeDriver: true
    }).start();

    // Then animate the progress bar
    setTimeout(() => {
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 1000,
        useNativeDriver: false
      }).start();
    }, delay + 200);
  }, [progress, delay]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp'
  });

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{label}</Text>
          {showPercentage && (
            <Text style={styles.percentage}>{Math.round(progress)}%</Text>
          )}
        </View>
      )}
      <View style={[styles.track, { height }]}>
        <Animated.View 
          style={[
            styles.fill, 
            { 
              width: progressWidth, 
              backgroundColor: color,
              height 
            }
          ]} 
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  label: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500'
  },
  percentage: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600'
  },
  track: {
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden'
  },
  fill: {
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2
  }
});