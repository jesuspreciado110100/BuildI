import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { supabase } from '@/app/lib/supabase';

interface Suggestion {
  id: string;
  original_text: string;
  suggested_text: string;
  position: { start: number; end: number };
  status: 'pending' | 'accepted' | 'rejected';
  user_id: string;
  created_at: string;
}

interface DocumentSuggestionsProps {
  documentId: string;
  onApplySuggestion: (suggestion: Suggestion) => void;
}

export default function DocumentSuggestions({ 
  documentId, 
  onApplySuggestion 
}: DocumentSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('pending');

  useEffect(() => {
    loadSuggestions();
    
    // Subscribe to real-time suggestion updates
    const channel = supabase
      .channel(`suggestions:${documentId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'document_suggestions' },
        () => loadSuggestions()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [documentId]);

  const loadSuggestions = async () => {
    const { data, error } = await supabase
      .from('document_suggestions')
      .select('*')
      .eq('document_id', documentId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading suggestions:', error);
      return;
    }

    setSuggestions(data || []);
  };

  const updateSuggestionStatus = async (suggestionId: string, status: 'accepted' | 'rejected') => {
    const { error } = await supabase
      .from('document_suggestions')
      .update({ status })
      .eq('id', suggestionId);

    if (error) {
      console.error('Error updating suggestion:', error);
      return;
    }

    if (status === 'accepted') {
      const suggestion = suggestions.find(s => s.id === suggestionId);
      if (suggestion) {
        onApplySuggestion(suggestion);
      }
    }
  };

  const filteredSuggestions = suggestions.filter(s => 
    filter === 'all' || s.status === filter
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return '#4caf50';
      case 'rejected': return '#f44336';
      default: return '#ff9800';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Suggestions</Text>
        <View style={styles.filterButtons}>
          {['all', 'pending', 'accepted', 'rejected'].map((filterOption) => (
            <TouchableOpacity
              key={filterOption}
              style={[
                styles.filterButton,
                filter === filterOption && styles.activeFilter
              ]}
              onPress={() => setFilter(filterOption as any)}
            >
              <Text style={[
                styles.filterButtonText,
                filter === filterOption && styles.activeFilterText
              ]}>
                {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView style={styles.suggestionsList}>
        {filteredSuggestions.map((suggestion) => (
          <View key={suggestion.id} style={styles.suggestionItem}>
            <View style={styles.suggestionHeader}>
              <View style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(suggestion.status) }
              ]}>
                <Text style={styles.statusText}>
                  {suggestion.status.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.suggestionDate}>
                {new Date(suggestion.created_at).toLocaleDateString()}
              </Text>
            </View>

            <View style={styles.textComparison}>
              <View style={styles.originalText}>
                <Text style={styles.textLabel}>Original:</Text>
                <Text style={styles.textContent}>{suggestion.original_text}</Text>
              </View>
              
              <View style={styles.suggestedText}>
                <Text style={styles.textLabel}>Suggested:</Text>
                <Text style={styles.textContent}>{suggestion.suggested_text}</Text>
              </View>
            </View>

            {suggestion.status === 'pending' && (
              <View style={styles.suggestionActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.rejectButton]}
                  onPress={() => {
                    Alert.alert(
                      'Reject Suggestion',
                      'Are you sure you want to reject this suggestion?',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { 
                          text: 'Reject', 
                          style: 'destructive',
                          onPress: () => updateSuggestionStatus(suggestion.id, 'rejected')
                        }
                      ]
                    );
                  }}
                >
                  <Text style={styles.rejectButtonText}>Reject</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.actionButton, styles.acceptButton]}
                  onPress={() => updateSuggestionStatus(suggestion.id, 'accepted')}
                >
                  <Text style={styles.acceptButtonText}>Accept</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  filterButtons: {
    flexDirection: 'row',
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: '#f1f3f4',
  },
  activeFilter: {
    backgroundColor: '#1976d2',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#666',
  },
  activeFilterText: {
    color: '#fff',
  },
  suggestionsList: {
    flex: 1,
  },
  suggestionItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  suggestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  suggestionDate: {
    fontSize: 12,
    color: '#666',
  },
  textComparison: {
    marginBottom: 16,
  },
  originalText: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#ffebee',
    borderRadius: 4,
  },
  suggestedText: {
    padding: 12,
    backgroundColor: '#e8f5e8',
    borderRadius: 4,
  },
  textLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#666',
  },
  textContent: {
    fontSize: 14,
  },
  suggestionActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  rejectButton: {
    backgroundColor: '#f44336',
  },
  acceptButton: {
    backgroundColor: '#4caf50',
  },
  rejectButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});