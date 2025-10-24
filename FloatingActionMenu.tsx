import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';

interface Props {
  onAddSite: () => void;
  onHireLabor: () => void;
  onOrderEquipment: () => void;
  onViewReports: () => void;
}

export const FloatingActionMenu: React.FC<Props> = ({
  onAddSite,
  onHireLabor,
  onOrderEquipment,
  onViewReports
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  const toggleMenu = () => {
    const toValue = isOpen ? 0 : 1;
    
    Animated.spring(animation, {
      toValue,
      useNativeDriver: true,
      tension: 100,
      friction: 8
    }).start();
    
    setIsOpen(!isOpen);
  };

  const handleAction = (action: () => void) => {
    action();
    toggleMenu();
  };

  const menuItems = [
    {
      icon: '🏗️',
      label: 'Add Site',
      action: onAddSite,
      color: '#4CAF50'
    },
    {
      icon: '👷',
      label: 'Hire Labor',
      action: onHireLabor,
      color: '#2196F3'
    },
    {
      icon: '🚚',
      label: 'Order Equipment',
      action: onOrderEquipment,
      color: '#FF9800'
    },
    {
      icon: '📊',
      label: 'View Reports',
      action: onViewReports,
      color: '#9C27B0'
    }
  ];

  const renderMenuItem = (item: any, index: number) => {
    const translateY = animation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -(60 * (index + 1))]
    });

    const scale = animation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1]
    });

    const opacity = animation.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 0, 1]
    });

    return (
      <Animated.View
        key={index}
        style={[
          styles.menuItem,
          {
            transform: [{ translateY }, { scale }],
            opacity
          }
        ]}
      >
        <View style={styles.menuItemContent}>
          <Text style={styles.menuLabel}>{item.label}</Text>
          <TouchableOpacity
            style={[styles.menuButton, { backgroundColor: item.color }]}
            onPress={() => handleAction(item.action)}
          >
            <Text style={styles.menuIcon}>{item.icon}</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  const rotation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg']
  });

  return (
    <View style={styles.container}>
      {/* Menu Items */}
      {menuItems.map((item, index) => renderMenuItem(item, index))}
      
      {/* Main FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={toggleMenu}
        activeOpacity={0.8}
      >
        <Animated.Text
          style={[
            styles.fabIcon,
            { transform: [{ rotate: rotation }] }
          ]}
        >
          +
        </Animated.Text>
      </TouchableOpacity>
      
      {/* Backdrop */}
      {isOpen && (
        <TouchableOpacity
          style={styles.backdrop}
          onPress={toggleMenu}
          activeOpacity={1}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    alignItems: 'flex-end'
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000
  },
  fabIcon: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold'
  },
  menuItem: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    zIndex: 999
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  menuLabel: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    color: 'white',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    fontSize: 12,
    fontWeight: '600',
    marginRight: 12,
    overflow: 'hidden'
  },
  menuButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4
  },
  menuIcon: {
    fontSize: 20
  },
  backdrop: {
    position: 'absolute',
    top: -1000,
    left: -1000,
    right: -1000,
    bottom: -1000,
    backgroundColor: 'transparent',
    zIndex: 998
  }
});