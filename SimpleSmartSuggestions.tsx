import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface SimpleSmartSuggestionsProps {
  userId: string;
  siteId?: string;
  type: 'dashboard' | 'concept';
}

export const SimpleSmartSuggestions: React.FC<SimpleSmartSuggestionsProps> = ({
  userId,
  siteId,
  type
}) => {
  const suggestions = [
    {
      id: '1',
      title: 'Book Equipment',
      description: 'Concrete mixer suggested for Phase 2',
      icon: '🚜',
      priority: 'high'
    },
    {
      id: '2', 
      title: 'Order Materials',
      description: 'Rebar needed for next phase',
      icon: '🧱',
      priority: 'medium'
    }
  ];

  if (type !== 'dashboard') return null;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>💡 Smart Suggestions</Text>
      {suggestions.map(suggestion => (
        <View key={suggestion.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.icon}>{suggestion.icon}</Text>
            <View style={styles.content}>
              <Text style={styles.title}>{suggestion.title}</Text>
              <Text style={styles.description}>{suggestion.description}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionText}>Take Action</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  header: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#111827',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
  },
  actionButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});