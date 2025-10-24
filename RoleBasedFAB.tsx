import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { FABAction } from './FABAction';
import { HapticFeedbackService } from '../services/HapticFeedbackService';

interface RoleBasedFABProps {
  userRole: 'contractor' | 'laborChief' | 'machineryRenter';
  onBookMachinery?: () => void;
  onHireLabor?: () => void;
  onUploadPhoto?: () => void;
  onOrderMaterials?: () => void;
  onLogProgress?: () => void;
  onUploadEvidence?: () => void;
  onAssignCrew?: () => void;
  onUploadMachine?: () => void;
  onMarkAvailable?: () => void;
}

export const RoleBasedFAB: React.FC<RoleBasedFABProps> = ({
  userRole,
  onBookMachinery,
  onHireLabor,
  onUploadPhoto,
  onOrderMaterials,
  onLogProgress,
  onUploadEvidence,
  onAssignCrew,
  onUploadMachine,
  onMarkAvailable
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const animatedValue = useRef(new Animated.Value(0)).current;
  const rotateValue = useRef(new Animated.Value(0)).current;

  const toggleExpanded = () => {
    HapticFeedbackService.onButtonPress();
    
    const toValue = isExpanded ? 0 : 1;
    setIsExpanded(!isExpanded);

    Animated.parallel([
      Animated.spring(animatedValue, {
        toValue,
        useNativeDriver: true,
        tension: 100,
        friction: 8
      }),
      Animated.spring(rotateValue, {
        toValue,
        useNativeDriver: true,
        tension: 100,
        friction: 8
      })
    ]).start();
  };

  const handleActionPress = (action: () => void | undefined) => {
    if (action) {
      HapticFeedbackService.onSuccess();
      action();
      toggleExpanded();
    }
  };

  const getActionsForRole = () => {
    switch (userRole) {
      case 'contractor':
        return [
          { icon: '🏗️', label: 'Book Machinery', onPress: () => handleActionPress(onBookMachinery) },
          { icon: '👷', label: 'Hire Labor', onPress: () => handleActionPress(onHireLabor) },
          { icon: '📸', label: 'Upload Photo', onPress: () => handleActionPress(onUploadPhoto) },
          { icon: '📦', label: 'Order Materials', onPress: () => handleActionPress(onOrderMaterials) }
        ];
      case 'laborChief':
        return [
          { icon: '📊', label: 'Log Progress', onPress: () => handleActionPress(onLogProgress) },
          { icon: '📷', label: 'Upload Evidence', onPress: () => handleActionPress(onUploadEvidence) },
          { icon: '👥', label: 'Assign Crew', onPress: () => handleActionPress(onAssignCrew) }
        ];
      case 'machineryRenter':
        return [
          { icon: '🚜', label: 'Upload Machine', onPress: () => handleActionPress(onUploadMachine) },
          { icon: '✅', label: 'Mark Available', onPress: () => handleActionPress(onMarkAvailable) }
        ];
      default:
        return [];
    }
  };

  const rotation = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg']
  });

  return (
    <View style={styles.container}>
      {getActionsForRole().map((action, index) => (
        <FABAction
          key={index}
          icon={action.icon}
          label={action.label}
          onPress={action.onPress}
          animatedValue={animatedValue}
          index={index}
        />
      ))}
      
      <TouchableOpacity
        style={styles.mainFAB}
        onPress={toggleExpanded}
        activeOpacity={0.8}
      >
        <Animated.Text
          style={[
            styles.mainIcon,
            { transform: [{ rotate: rotation }] }
          ]}
        >
          +
        </Animated.Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 1000
  },
  mainFAB: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8
  },
  mainIcon: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold'
  }
});