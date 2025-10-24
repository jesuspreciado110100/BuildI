import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { searchService, SearchResult } from '../services/SearchService';
import { SearchResultCard } from './SearchResultCard';
import { User } from '../types';

interface GlobalSearchModalProps {
  visible: boolean;
  onClose: () => void;
  user: User;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ visible, onClose, user }) => {
  const { theme } = useTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const searchResults = await searchService.searchAll(searchQuery, user.role);
      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [user.role]);

  const handleQueryChange = useCallback((text: string) => {
    setQuery(text);
    
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      performSearch(text);
    }, 300);
    
    setDebounceTimer(timer);
  }, [debounceTimer, performSearch]);

  const handleResultPress = (result: SearchResult) => {
    console.log('Selected result:', result);
    // Handle navigation based on result type
    onClose();
  };

  const handleClose = () => {
    setQuery('');
    setResults([]);
    setLoading(false);
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    onClose();
  };

  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            Searching...
          </Text>
        </View>
      );
    }

    if (query.trim() && results.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            No results found for "{query}"
          </Text>
        </View>
      );
    }

    if (!query.trim()) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            Search across workers, machines, materials, concepts, and bookings
          </Text>
        </View>
      );
    }

    return null;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.header, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={[styles.searchInput, { color: theme.colors.text }]}
              placeholder="Search everything..."
              placeholderTextColor={theme.colors.textSecondary}
              value={query}
              onChangeText={handleQueryChange}
              autoFocus
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => handleQueryChange('')}>
                <Text style={[styles.clearButton, { color: theme.colors.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity onPress={handleClose}>
            <Text style={[styles.cancelButton, { color: theme.colors.primary }]}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {results.length > 0 ? (
            <FlatList
              data={results}
              keyExtractor={(item) => `${item.type}-${item.id}`}
              renderItem={({ item }) => (
                <SearchResultCard result={item} onPress={handleResultPress} />
              )}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.resultsList}
            />
          ) : (
            renderEmptyState()
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
    borderBottomWidth: 1,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
  },
  clearButton: {
    fontSize: 16,
    padding: 4,
  },
  cancelButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  resultsList: {
    paddingVertical: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});