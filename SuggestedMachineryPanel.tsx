import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MachinerySuggestionService } from '../services/MachinerySuggestionService';

interface Concept {
  id: string;
  name: string;
  description?: string;
}

interface SuggestedMachineryPanelProps {
  concept: Concept;
  onRequestMachinery: (category: string, conceptId: string) => void;
}

const MACHINERY_ICONS: { [key: string]: string } = {
  'Excavator': '⛏️',
  'Loader': '🚜',
  'Bulldozer': '🚜',
  'Compactor': '🔨',
  'Crane': '🏗️',
  'Grader': '🛤️',
  'Paver': '🛣️',
  'Dump Truck': '🚛',
  'Concrete Mixer': '🚚',
  'Backhoe': '🚧'
};

export function SuggestedMachineryPanel({ concept, onRequestMachinery }: SuggestedMachineryPanelProps) {
  const suggestedCategories = MachinerySuggestionService.getSuggestedCategories(concept.name);
  const suggestions = MachinerySuggestionService.getSuggestionsForConcept(concept.name);

  if (suggestedCategories.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>💡</Text>
        <Text style={styles.emptyTitle}>No Suggestions Available</Text>
        <Text style={styles.emptyText}>Select a concept to see machinery suggestions</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Suggested for {concept.name}</Text>
        <Text style={styles.subtitle}>Smart machinery recommendations based on your concept</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
        {suggestions.map((suggestion, index) => (
          <TouchableOpacity
            key={index}
            style={styles.suggestionCard}
            onPress={() => onRequestMachinery(suggestion.category, concept.id)}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.machineIcon}>{MACHINERY_ICONS[suggestion.category] || '🚜'}</Text>
              <View style={styles.priorityBadge}>
                <Text style={styles.priorityText}>{suggestion.priority}</Text>
              </View>
            </View>
            
            <Text style={styles.machineName}>{suggestion.category}</Text>
            <Text style={styles.machineReason}>{suggestion.reason}</Text>
            
            <View style={styles.estimateContainer}>
              <Text style={styles.estimateLabel}>Est. Cost:</Text>
              <Text style={styles.estimateValue}>${suggestion.estimatedCost}/day</Text>
            </View>
            
            <View style={styles.durationContainer}>
              <Text style={styles.durationLabel}>Typical Duration:</Text>
              <Text style={styles.durationValue}>{suggestion.typicalDuration}</Text>
            </View>
            
            <TouchableOpacity
              style={styles.requestButton}
              onPress={() => onRequestMachinery(suggestion.category, concept.id)}
            >
              <Text style={styles.requestButtonText}>Request Quote</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 16
  },
  header: {
    marginBottom: 16
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280'
  },
  scrollView: {
    flexDirection: 'row'
  },
  suggestionCard: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 220,
    borderWidth: 1,
    borderColor: '#0ea5e9'
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  machineIcon: {
    fontSize: 32
  },
  priorityBadge: {
    backgroundColor: '#0ea5e9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  priorityText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  machineName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8
  },
  machineReason: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 16
  },
  estimateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  estimateLabel: {
    fontSize: 12,
    color: '#6b7280'
  },
  estimateValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669'
  },
  durationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  durationLabel: {
    fontSize: 12,
    color: '#6b7280'
  },
  durationValue: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151'
  },
  requestButton: {
    backgroundColor: '#0ea5e9',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center'
  },
  requestButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600'
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center'
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center'
  }
});