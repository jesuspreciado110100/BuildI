import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface JobSuggestion {
  id: string;
  text: string;
  type: 'job' | 'trade' | 'skill';
}

interface Props {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export const LaborSmartSearchBar: React.FC<Props> = ({
  onSearch,
  placeholder = "Buscar trabajos por descripción..."
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<JobSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Mock job description suggestions
  const allSuggestions: JobSuggestion[] = [
    { id: '1', text: 'Instalación eléctrica residencial', type: 'job' },
    { id: '2', text: 'Plomería y fontanería', type: 'job' },
    { id: '3', text: 'Albañilería y construcción', type: 'job' },
    { id: '4', text: 'Carpintería de acabados', type: 'job' },
    { id: '5', text: 'Pintura y decoración', type: 'job' },
    { id: '6', text: 'Electricista', type: 'trade' },
    { id: '7', text: 'Plomero', type: 'trade' },
    { id: '8', text: 'Albañil', type: 'trade' },
    { id: '9', text: 'Carpintero', type: 'trade' },
    { id: '10', text: 'Soldadura especializada', type: 'skill' },
    { id: '11', text: 'Instalación de pisos', type: 'skill' },
    { id: '12', text: 'Reparación de techos', type: 'job' }
  ];

  useEffect(() => {
    if (query.length > 0) {
      const filtered = allSuggestions.filter(suggestion =>
        suggestion.text.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6);
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

  const handleSuggestionPress = (suggestion: JobSuggestion) => {
    handleSearch(suggestion.text);
  };

  const clearSearch = () => {
    setQuery('');
    onSearch('');
    setShowSuggestions(false);
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'job': return '🔨';
      case 'trade': return '👷';
      case 'skill': return '⚡';
      default: return '🔍';
    }
  };

  const renderSuggestion = ({ item }: { item: JobSuggestion }) => (
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
        <Ionicons name="search" size={20} color="#94A3B8" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          onSubmitEditing={() => handleSearch(query)}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
            <Ionicons name="close" size={18} color="#94A3B8" />
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
    marginBottom: 16
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
    fontFamily: 'System',
    fontWeight: '400',
  },
  clearButton: {
    padding: 4,
    marginLeft: 8
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    maxHeight: 240
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
    color: '#1E293B'
  },
  suggestionType: {
    fontSize: 12,
    color: '#64748B',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  }
});