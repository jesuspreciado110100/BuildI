import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface FABOption {
  id: string;
  title: string;
  icon: string;
  route: string;
  color: string;
}

export default function HomeFAB() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  const fabOptions: FABOption[] = [
    {
      id: 'materials',
      title: 'Request Materials',
      icon: 'cube-outline',
      route: '/contractor/workforce/materials/request',
      color: '#10B981'
    },
    {
      id: 'machinery',
      title: 'Request Machinery',
      icon: 'construct-outline',
      route: '/contractor/machinery/requests',
      color: '#F59E0B'
    },
    {
      id: 'labor',
      title: 'Request Labor',
      icon: 'people-outline',
      route: '/contractor/workforce/hire',
      color: '#3B82F6'
    }
  ];

  const toggleFAB = () => {
    const toValue = isExpanded ? 0 : 1;
    
    Animated.spring(animation, {
      toValue,
      useNativeDriver: true,
      tension: 100,
      friction: 8
    }).start();
    
    setIsExpanded(!isExpanded);
  };

  const handleOptionPress = (route: string) => {
    setIsExpanded(false);
    Animated.spring(animation, {
      toValue: 0,
      useNativeDriver: true
    }).start();
    router.push(route);
  };

  return (
    <View style={styles.container}>
      {/* FAB Options */}
      {fabOptions.map((option, index) => {
        const translateY = animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -(70 * (index + 1))]
        });
        
        const scale = animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1]
        });

        return (
          <Animated.View
            key={option.id}
            style={[
              styles.fabOption,
              {
                transform: [{ translateY }, { scale }]
              }
            ]}
          >
            <TouchableOpacity
              style={[styles.optionButton, { backgroundColor: option.color }]}
              onPress={() => handleOptionPress(option.route)}
            >
              <View style={styles.optionContent}>
                <Ionicons name={option.icon} size={20} color="white" />
                <Text style={styles.optionText}>{option.title}</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        );
      })}

      {/* Main FAB Button */}
      <TouchableOpacity
        style={[styles.mainFAB, isExpanded && styles.mainFABExpanded]}
        onPress={toggleFAB}
      >
        <Animated.View
          style={{
            transform: [{
              rotate: animation.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '45deg']
              })
            }]
          }}
        >
          <Ionicons 
            name={isExpanded ? 'close' : 'add'} 
            size={28} 
            color="white" 
          />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    alignItems: 'center'
  },
  fabOption: {
    position: 'absolute',
    bottom: 0,
    right: 0
  },
  optionButton: {
    minWidth: 180,
    height: 50,
    borderRadius: 25,
    marginBottom: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    justifyContent: 'center',
    alignItems: 'center'
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16
  },
  optionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8
  },
  mainFAB: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5
  },
  mainFABExpanded: {
    backgroundColor: '#FF3B30'
  }
});
