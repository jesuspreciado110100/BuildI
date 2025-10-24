import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FABAction {
  label: string;
  icon: string;
  onPress: () => void;
}

interface FABCreateMenuProps {
  visible: boolean;
  onToggle: () => void;
  actions: FABAction[];
}

export const FABCreateMenu: React.FC<FABCreateMenuProps> = ({
  visible,
  onToggle,
  actions
}) => {
  return (
    <View style={styles.container}>
      {visible && (
        <View style={styles.actionsContainer}>
          {actions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={styles.actionButton}
              onPress={action.onPress}
            >
              <Ionicons name={action.icon as any} size={20} color="white" />
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      
      <TouchableOpacity
        style={[styles.fab, visible && styles.fabRotated]}
        onPress={onToggle}
      >
        <Ionicons 
          name={visible ? 'close' : 'add'} 
          size={24} 
          color="white" 
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    alignItems: 'flex-end',
  },
  actionsContainer: {
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  actionLabel: {
    color: 'white',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  fabRotated: {
    backgroundColor: '#FF3B30',
  },
});