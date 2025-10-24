import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { MaterialDisciplinesCarousel } from './MaterialDisciplinesCarousel';
import { MaterialCard } from './MaterialCard';

interface Material {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  rating: number;
  supplier: string;
  leadTime: string;
  tags: string[];
  description: string;
}

export default function MaterialCatalogView() {
  const { theme } = useTheme();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedDiscipline, setSelectedDiscipline] = useState('all');
  const [sortBy, setSortBy] = useState('featured');

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    setLoading(true);
    try {
      const mockMaterials: Material[] = [
        {
          id: '1',
          name: 'Portland Cement',
          category: 'Concrete',
          price: 12.50,
          unit: 'Bag',
          rating: 4.8,
          supplier: 'BuildCorp Materials',
          leadTime: '2-3 days',
          tags: ['High Strength', 'Weather Resistant'],
          description: 'Premium portland cement for construction projects'
        },
        {
          id: '2',
          name: 'Steel Rebar #4',
          category: 'Steel',
          price: 0.85,
          unit: 'Linear Foot',
          rating: 4.9,
          supplier: 'Metro Steel Supply',
          leadTime: '1-2 days',
          tags: ['Grade 60', 'Epoxy Coated'],
          description: 'High-grade steel reinforcement bars'
        },
        {
          id: '3',
          name: '2x4 Lumber',
          category: 'Wood',
          price: 4.25,
          unit: 'Piece',
          rating: 4.6,
          supplier: 'Forest Products Inc',
          leadTime: 'Same day',
          tags: ['Kiln Dried', 'Grade A'],
          description: 'Premium construction lumber'
        },
        {
          id: '4',
          name: 'Concrete Blocks',
          category: 'Masonry',
          price: 1.85,
          unit: 'Block',
          rating: 4.7,
          supplier: 'Mason Supply Co',
          leadTime: '1 day',
          tags: ['Standard', '8x8x16'],
          description: 'Standard concrete masonry units'
        }
      ];
      setMaterials(mockMaterials);
    } catch (error) {
      console.error('Error loading materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredMaterials = () => {
    return materials.filter(material => {
      const matchesSearch = material.name.toLowerCase().includes(searchText.toLowerCase()) ||
                          material.category.toLowerCase().includes(searchText.toLowerCase());
      const matchesDiscipline = selectedDiscipline === 'all' || material.category === selectedDiscipline;
      return matchesSearch && matchesDiscipline;
    });
  };

  const getSortedMaterials = () => {
    const filtered = getFilteredMaterials();
    switch (sortBy) {
      case 'price-low':
        return filtered.sort((a, b) => a.price - b.price);
      case 'price-high':
        return filtered.sort((a, b) => b.price - a.price);
      case 'rating':
        return filtered.sort((a, b) => b.rating - a.rating);
      case 'name':
        return filtered.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return filtered;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Material Disciplines Carousel */}
      <MaterialDisciplinesCarousel 
        selectedDiscipline={selectedDiscipline}
        onDisciplineSelect={setSelectedDiscipline}
      />

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: theme.colors.surface }]}>
        <TextInput
          style={[styles.searchInput, { 
            borderColor: theme.colors.border,
            color: theme.colors.text
          }]}
          placeholder="Search materials..."
          placeholderTextColor={theme.colors.textSecondary}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Sort Options */}
      <View style={[styles.sortContainer, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sortLabel, { color: theme.colors.text }]}>Sort by:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { key: 'featured', label: 'Featured' },
            { key: 'price-low', label: 'Price: Low to High' },
            { key: 'price-high', label: 'Price: High to Low' },
            { key: 'rating', label: 'Rating' },
            { key: 'name', label: 'Name' }
          ].map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[styles.sortButton, 
                sortBy === option.key && { backgroundColor: theme.colors.primary }
              ]}
              onPress={() => setSortBy(option.key)}
            >
              <Text style={[styles.sortButtonText, {
                color: sortBy === option.key ? '#fff' : theme.colors.text
              }]}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Materials List */}
      <ScrollView style={styles.materialsList}>
        {loading ? (
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>Loading materials...</Text>
        ) : getSortedMaterials().length === 0 ? (
          <Text style={[styles.emptyText, { color: theme.colors.text }]}>No materials found</Text>
        ) : (
          <View style={styles.materialsGrid}>
            {getSortedMaterials().map((material) => (
              <MaterialCard 
                key={material.id}
                material={material}
                onPress={() => console.log('Material pressed:', material.name)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchContainer: { padding: 16 },
  searchInput: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 16 },
  sortContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  sortLabel: { fontSize: 14, marginRight: 12 },
  sortButton: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#f0f0f0', borderRadius: 16, marginRight: 8 },
  sortButtonText: { fontSize: 12 },
  materialsList: { flex: 1, padding: 16 },
  materialsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  loadingText: { textAlign: 'center', fontSize: 16, marginTop: 40 },
  emptyText: { textAlign: 'center', fontSize: 16, marginTop: 40 }
});