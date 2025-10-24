import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { SmartSuggestionCard } from './SmartSuggestionCard';
import { smartSuggestionsService, SmartSuggestion } from '../services/SmartSuggestionsService';

interface SmartSuggestionsPanelProps {
  userId: string;
  siteId?: string;
  conceptId?: string;
  progress?: number;
  phase?: string;
  type: 'dashboard' | 'concept';
}

export const SmartSuggestionsPanel: React.FC<SmartSuggestionsPanelProps> = ({
  userId,
  siteId,
  conceptId,
  progress,
  phase,
  type
}) => {
  const { theme } = useTheme();
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([]);

  useEffect(() => {
    loadSuggestions();
  }, [userId, siteId, conceptId, progress, phase, type]);

  const loadSuggestions = () => {
    let newSuggestions: SmartSuggestion[] = [];
    
    if (type === 'dashboard' && siteId) {
      newSuggestions = smartSuggestionsService.getContractorSuggestions(userId, siteId);
    } else if (type === 'concept' && conceptId && progress !== undefined && phase) {
      newSuggestions = smartSuggestionsService.getConceptSuggestions(conceptId, progress, phase);
    }
    
    setSuggestions(newSuggestions);
  };

  const handleAction = (suggestion: SmartSuggestion) => {
    // Track the action
    smartSuggestionsService.trackAction('suggestion_action', {
      suggestionId: suggestion.id,
      actionType: suggestion.actionType,
      actionData: suggestion.actionData
    });

    // Handle different action types
    switch (suggestion.actionType) {
      case 'book':
        console.log('Navigate to booking:', suggestion.actionData);
        // Navigate to booking screen
        break;
      case 'order':
        console.log('Navigate to order:', suggestion.actionData);
        // Navigate to material order
        break;
      case 'start':
        console.log('Start concept:', suggestion.actionData);
        // Navigate to concept creation
        break;
      case 'invite':
        console.log('Navigate to invite:', suggestion.actionData);
        // Navigate to invite screen
        break;
      case 'view':
        console.log('View details:', suggestion.actionData);
        // Navigate to details
        break;
    }

    // Remove suggestion after action
    handleDismiss(suggestion.id);
  };

  const handleDismiss = (suggestionId: string) => {
    smartSuggestionsService.dismissSuggestion(suggestionId);
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
  };

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {type === 'dashboard' && (
        <Text style={[styles.header, { color: theme.colors.text }]}>
          💡 Smart Suggestions
        </Text>
      )}
      
      {suggestions.map(suggestion => (
        <SmartSuggestionCard
          key={suggestion.id}
          suggestion={suggestion}
          onAction={handleAction}
          onDismiss={handleDismiss}
        />
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
    marginHorizontal: 16,
    marginBottom: 8,
  },
});