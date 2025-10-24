import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions } from 'react-native';

interface AnimatedPortfolioPanelProps {
  isVisible: boolean;
  children: React.ReactNode;
}

export default function AnimatedPortfolioPanel({ isVisible, children }: AnimatedPortfolioPanelProps) {
  const slideAnim = useRef(new Animated.Value(isVisible ? 0 : -300)).current;
  const opacityAnim = useRef(new Animated.Value(isVisible ? 1 : 0)).current;
  const scaleAnim = useRef(new Animated.Value(isVisible ? 1 : 0.8)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 120,
          friction: 7,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -300,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible]);

  if (!isVisible && opacityAnim._value === 0) {
    return null;
  }

  return (
    <Animated.View
      style={{
        transform: [
          { translateY: slideAnim },
          { scale: scaleAnim }
        ],
        opacity: opacityAnim,
      }}
    >
      {children}
    </Animated.View>
  );
}