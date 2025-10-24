import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface EmptyStateCardProps {
  title: string;
  description: string;
  icon: string;
  actionText: string;
  onActionPress: () => void;
  suggestion?: string;
}

export function EmptyStateCard({ title, description, icon, actionText, onActionPress, suggestion }: EmptyStateCardProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {suggestion && (
        <Text style={styles.suggestion}>💡 {suggestion}</Text>
      )}
      <TouchableOpacity style={styles.actionButton} onPress={onActionPress}>
        <Text style={styles.actionText}>{actionText}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  icon: {
    fontSize: 64,
    marginBottom: 16
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center'
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22
  },
  suggestion: {
    fontSize: 14,
    color: '#8B5CF6',
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic'
  },
  actionButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8
  },
  actionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  }
});