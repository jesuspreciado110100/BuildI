import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface FABAction {
  label: string;
  icon: string;
  route: string;
}

interface ContractorFABProps {
  selectedSiteId?: string;
}

export const ContractorFAB: React.FC<ContractorFABProps> = ({ selectedSiteId }) => {
  const [isOpen, setIsOpen] = useState(false);

  const actions: FABAction[] = [
    {
      label: 'Book Machinery',
      icon: 'construct-outline',
      route: '/contractor/machinery/requests'
    },
    {
      label: 'Hire Labor',
      icon: 'people-outline',
      route: '/contractor/workforce/hire'
    },
    {
      label: 'Order Materials',
      icon: 'cube-outline',
      route: '/contractor/workforce/materials/request'
    },
    {
      label: 'Create Concept',
      icon: 'bulb-outline',
      route: selectedSiteId ? `/contractor/sites/${selectedSiteId}/concepts/new` : '/contractor/sites/1/concepts/new'
    }
  ];

  const handleActionPress = (route: string) => {
    setIsOpen(false);
    router.push(route);
  };

  const toggleFAB = () => {
    setIsOpen(!isOpen);
  };

  return (
    <View style={styles.container}>
      {isOpen && (
        <View style={styles.actionsContainer}>
          {actions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={styles.actionButton}
              onPress={() => handleActionPress(action.route)}
            >
              <View style={styles.actionContent}>
                <Ionicons name={action.icon as any} size={20} color="white" />
                <Text style={styles.actionLabel}>{action.label}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
      
      <TouchableOpacity
        style={[styles.fab, isOpen && styles.fabOpen]}
        onPress={toggleFAB}
      >
        <Ionicons 
          name={isOpen ? 'close' : 'add'} 
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
    zIndex: 1000,
  },
  actionsContainer: {
    marginBottom: 16,
  },
  actionButton: {
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
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
  fabOpen: {
    backgroundColor: '#FF3B30',
  },
});