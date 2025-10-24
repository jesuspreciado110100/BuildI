import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MachinerySupabaseService, MachineryItem } from '../services/MachinerySupabaseService';

interface Props {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export const MachinerySmartSearchBar: React.FC<Props> = ({
  onSearch,
  placeholder = "Buscar maquinaria..."
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<MachineryItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length > 0) {
        setLoading(true);
        const results = await MachinerySupabaseService.searchMachinery(query);
        setSuggestions(results.slice(0, 5));
        setShowSuggestions(true);
        setLoading(false);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    onSearch(searchQuery);
    setShowSuggestions(false);
  };

  const handleSuggestionPress = (suggestion: MachineryItem) => {
    handleSearch(suggestion.name);
  };

  const clearSearch = () => {
    setQuery('');
    onSearch('');
    setShowSuggestions(false);
  };

  const renderSuggestion = ({ item }: { item: MachineryItem }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleSuggestionPress(item)}
    >
      <Ionicons name="construct-outline" size={16} color="#64748B" style={styles.suggestionIcon} />
      <View style={styles.suggestionContent}>
        <Text style={styles.suggestionText}>{item.name}</Text>
        <Text style={styles.suggestionType}>{item.type}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.searchContainer, isFocused && styles.searchContainerFocused]}>
        <Ionicons name="search-outline" size={20} color={isFocused ? "#0EA5E9" : "#64748B"} />
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          onSubmitEditing={() => handleSearch(query)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>
      
      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={suggestions}
            renderItem={renderSuggestion}
            keyExtractor={(item) => item.id}
            style={styles.suggestionsList}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  searchContainerFocused: {
    borderColor: '#0EA5E9',
    shadowColor: '#0EA5E9',
    shadowOpacity: 0.15,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
    paddingVertical: 0,
    marginLeft: 12,
    fontWeight: '500',
  },
  clearButton: {
    padding: 4,
    marginLeft: 8
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 64,
    left: 8,
    right: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    maxHeight: 240,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  suggestionsList: {
    borderRadius: 16
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC'
  },
  suggestionIcon: {
    marginRight: 12
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionText: {
    fontSize: 15,
    color: '#475569',
    fontWeight: '600',
    marginBottom: 2,
  },
  suggestionType: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '400',
  }
});
