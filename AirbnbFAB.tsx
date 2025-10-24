import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { HapticFeedbackService } from '../services/HapticFeedbackService';

interface QuickAction {
  key: string;
  label: string;
  icon: string;
  onPress: () => void;
}

interface AirbnbFABProps {
  quickActions: QuickAction[];
}

export const AirbnbFAB: React.FC<AirbnbFABProps> = ({ quickActions }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  const toggleExpanded = () => {
    HapticFeedbackService.onButtonPress();
    const toValue = isExpanded ? 0 : 1;
    setIsExpanded(!isExpanded);
    
    Animated.spring(animation, {
      toValue,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const handleActionPress = (action: QuickAction) => {
    HapticFeedbackService.onSuccess();
    action.onPress();
    toggleExpanded();
  };

  const fabRotation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  return (
    <View style={styles.container}>
      {/* Quick Actions */}
      {quickActions.map((action, index) => {
        const translateY = animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -(60 * (index + 1))],
        });
        
        const opacity = animation.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0, 0, 1],
        });

        return (
          <Animated.View
            key={action.key}
            style={[
              styles.quickAction,
              {
                transform: [{ translateY }],
                opacity,
              },
            ]}
          >
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleActionPress(action)}
              activeOpacity={0.8}
            >
              <Text style={styles.actionIcon}>{action.icon}</Text>
            </TouchableOpacity>
            <Text style={styles.actionLabel}>{action.label}</Text>
          </Animated.View>
        );
      })}

      {/* Main FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={toggleExpanded}
        activeOpacity={0.8}
      >
        <Animated.Text
          style={[
            styles.fabIcon,
            { transform: [{ rotate: fabRotation }] },
          ]}
        >
          ➕
        </Animated.Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    alignItems: 'center',
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 24,
    color: '#ffffff',
  },
  quickAction: {
    position: 'absolute',
    alignItems: 'center',
    bottom: 0,
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    marginBottom: 8,
  },
  actionIcon: {
    fontSize: 20,
  },
  actionLabel: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
    textAlign: 'center',
  },
});