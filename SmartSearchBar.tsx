import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, FlatList } from 'react-native';

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'site' | 'location' | 'type';
}

interface Props {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export const SmartSearchBar: React.FC<Props> = ({
  onSearch,
  placeholder = "Search sites by name, location, or type..."
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Mock suggestions data
  const allSuggestions: SearchSuggestion[] = [
    { id: '1', text: 'Downtown Office Complex', type: 'site' },
    { id: '2', text: 'Residential Tower', type: 'site' },
    { id: '3', text: 'New York, NY', type: 'location' },
    { id: '4', text: 'Los Angeles, CA', type: 'location' },
    { id: '5', text: 'Commercial', type: 'type' },
    { id: '6', text: 'Residential', type: 'type' },
    { id: '7', text: 'Industrial', type: 'type' },
    { id: '8', text: 'Shopping Mall Project', type: 'site' },
    { id: '9', text: 'Miami, FL', type: 'location' },
    { id: '10', text: 'Chicago, IL', type: 'location' }
  ];

  useEffect(() => {
    if (query.length > 0) {
      const filtered = allSuggestions.filter(suggestion =>
        suggestion.text.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query]);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    onSearch(searchQuery);
    setShowSuggestions(false);
  };

  const handleSuggestionPress = (suggestion: SearchSuggestion) => {
    handleSearch(suggestion.text);
  };

  const clearSearch = () => {
    setQuery('');
    onSearch('');
    setShowSuggestions(false);
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'site': return '🏗️';
      case 'location': return '📍';
      case 'type': return '🏢';
      default: return '🔍';
    }
  };

  const renderSuggestion = ({ item }: { item: SearchSuggestion }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleSuggestionPress(item)}
    >
      <Text style={styles.suggestionIcon}>{getSuggestionIcon(item.type)}</Text>
      <Text style={styles.suggestionText}>{item.text}</Text>
      <Text style={styles.suggestionType}>{item.type}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder={placeholder}
          placeholderTextColor="#999"
          onSubmitEditing={() => handleSearch(query)}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
            <Text style={styles.clearText}>✕</Text>
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
    zIndex: 1000
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    margin: 16
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
    color: '#666'
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 0
  },
  clearButton: {
    padding: 4,
    marginLeft: 8
  },
  clearText: {
    fontSize: 16,
    color: '#999'
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    maxHeight: 200
  },
  suggestionsList: {
    borderRadius: 12
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  suggestionIcon: {
    fontSize: 16,
    marginRight: 12
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    color: '#333'
  },
  suggestionType: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  }
});