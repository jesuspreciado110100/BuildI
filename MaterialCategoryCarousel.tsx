import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';

interface MaterialCategoryCarouselProps {
  categories: string[];
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
}

export const MaterialCategoryCarousel: React.FC<MaterialCategoryCarouselProps> = ({
  categories,
  selectedCategory,
  onCategorySelect
}) => {
  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((category, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.selectedCategory
            ]}
            onPress={() => onCategorySelect(category)}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === category && styles.selectedCategoryText
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center'
  },
  selectedCategory: {
    backgroundColor: '#007AFF'
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500'
  },
  selectedCategoryText: {
    color: 'white'
  }
});