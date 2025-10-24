import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { HapticFeedbackService } from '../services/HapticFeedbackService';

interface GoToTopButtonProps {
  scrollY: Animated.Value;
  onPress: () => void;
}

export const GoToTopButton: React.FC<GoToTopButtonProps> = ({ scrollY, onPress }) => {
  const { theme } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const opacity = new Animated.Value(0);

  useEffect(() => {
    const listener = scrollY.addListener(({ value }) => {
      const shouldShow = value > 200;
      if (shouldShow !== isVisible) {
        setIsVisible(shouldShow);
        Animated.timing(opacity, {
          toValue: shouldShow ? 1 : 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }
    });

    return () => scrollY.removeListener(listener);
  }, [scrollY, isVisible, opacity]);

  const handlePress = () => {
    HapticFeedbackService.onButtonPress();
    onPress();
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          backgroundColor: theme.colors.primary,
        }
      ]}
      pointerEvents={isVisible ? 'auto' : 'none'}
    >
      <TouchableOpacity
        style={styles.button}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <Text style={styles.icon}>↑</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
});