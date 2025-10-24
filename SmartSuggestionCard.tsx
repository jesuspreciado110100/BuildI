import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { SmartSuggestion } from '../services/SmartSuggestionsService';

interface SmartSuggestionCardProps {
  suggestion: SmartSuggestion;
  onAction: (suggestion: SmartSuggestion) => void;
  onDismiss: (suggestionId: string) => void;
}

export const SmartSuggestionCard: React.FC<SmartSuggestionCardProps> = ({
  suggestion,
  onAction,
  onDismiss
}) => {
  const { theme } = useTheme();

  const getIcon = () => {
    switch (suggestion.type) {
      case 'equipment': return '🚜';
      case 'material': return '🧱';
      case 'concept': return '🏗️';
      case 'labor': return '👷';
      case 'booking': return '📅';
      default: return '💡';
    }
  };

  const getPriorityColor = () => {
    switch (suggestion.priority) {
      case 'high': return theme.colors.error;
      case 'medium': return theme.colors.warning;
      case 'low': return theme.colors.success;
      default: return theme.colors.primary;
    }
  };

  const getActionText = () => {
    switch (suggestion.actionType) {
      case 'book': return 'Book Now';
      case 'order': return 'Order';
      case 'start': return 'Start';
      case 'invite': return 'Invite';
      case 'view': return 'View';
      default: return 'Action';
    }
  };

  return (
    <View style={[
      styles.container,
      { 
        backgroundColor: theme.colors.card,
        borderColor: theme.colors.border,
        borderLeftColor: getPriorityColor()
      }
    ]}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{getIcon()}</Text>
        </View>
        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {suggestion.title}
          </Text>
          <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
            {suggestion.description}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.dismissButton}
          onPress={() => onDismiss(suggestion.id)}
        >
          <Text style={[styles.dismissText, { color: theme.colors.textSecondary }]}>×</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: getPriorityColor() }
          ]}
          onPress={() => onAction(suggestion)}
        >
          <Text style={styles.actionButtonText}>{getActionText()}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    borderLeftWidth: 4,
    marginVertical: 8,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
  },
  iconContainer: {
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  dismissButton: {
    padding: 4,
  },
  dismissText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  actions: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});