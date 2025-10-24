import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';

interface Rating {
  id: string;
  clientName: string;
  projectName: string;
  rating: number;
  comment: string;
  date: string;
  category: string;
}

interface MyRatingsTabProps {
  ratings: Rating[];
  averageRating: number;
  totalRatings: number;
}

export default function MyRatingsTab({ ratings, averageRating, totalRatings }: MyRatingsTabProps) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const categories = ['All', 'Quality', 'Timeliness', 'Communication', 'Value'];

  const filteredRatings = selectedCategory === 'All' 
    ? ratings 
    : ratings.filter(rating => rating.category === selectedCategory);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Text key={index} style={[styles.star, index < rating && styles.filledStar]}>
        ★
      </Text>
    ));
  };

  const renderRatingItem = ({ item }: { item: Rating }) => (
    <View style={styles.ratingCard}>
      <View style={styles.ratingHeader}>
        <View style={styles.clientInfo}>
          <Text style={styles.clientName}>{item.clientName}</Text>
          <Text style={styles.projectName}>{item.projectName}</Text>
        </View>
        <View style={styles.ratingInfo}>
          <View style={styles.starsContainer}>
            {renderStars(item.rating)}
          </View>
          <Text style={styles.ratingNumber}>{item.rating}/5</Text>
        </View>
      </View>
      
      <Text style={styles.category}>{item.category}</Text>
      
      {item.comment && (
        <Text style={styles.comment}>"{item.comment}"</Text>
      )}
      
      <Text style={styles.date}>{item.date}</Text>
    </View>
  );

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    ratings.forEach(rating => {
      distribution[rating.rating as keyof typeof distribution]++;
    });
    return distribution;
  };

  const distribution = getRatingDistribution();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Text style={styles.averageRating}>{averageRating.toFixed(1)}</Text>
          <View style={styles.summaryInfo}>
            <View style={styles.starsContainer}>
              {renderStars(Math.round(averageRating))}
            </View>
            <Text style={styles.totalRatings}>{totalRatings} reviews</Text>
          </View>
        </View>
        
        <View style={styles.distributionContainer}>
          {Object.entries(distribution).reverse().map(([stars, count]) => (
            <View key={stars} style={styles.distributionRow}>
              <Text style={styles.distributionStars}>{stars}★</Text>
              <View style={styles.distributionBar}>
                <View 
                  style={[styles.distributionFill, { width: `${(count / totalRatings) * 100}%` }]}
                />
              </View>
              <Text style={styles.distributionCount}>{count}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.filterButton,
                selectedCategory === category && styles.activeFilterButton
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[
                styles.filterButtonText,
                selectedCategory === category && styles.activeFilterButtonText
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.ratingsContainer}>
        <Text style={styles.ratingsTitle}>Recent Reviews</Text>
        <FlatList
          data={filteredRatings}
          renderItem={renderRatingItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  summaryCard: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  averageRating: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#007AFF',
    marginRight: 16,
  },
  summaryInfo: {
    flex: 1,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  star: {
    fontSize: 20,
    color: '#ddd',
    marginRight: 2,
  },
  filledStar: {
    color: '#FFD700',
  },
  totalRatings: {
    fontSize: 14,
    color: '#666',
  },
  distributionContainer: {
    marginTop: 16,
  },
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  distributionStars: {
    width: 30,
    fontSize: 12,
    color: '#666',
  },
  distributionBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginHorizontal: 8,
  },
  distributionFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  distributionCount: {
    width: 20,
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  filtersContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'white',
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  activeFilterButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
  },
  activeFilterButtonText: {
    color: 'white',
  },
  ratingsContainer: {
    paddingHorizontal: 16,
  },
  ratingsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  ratingCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  ratingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  projectName: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  ratingInfo: {
    alignItems: 'flex-end',
  },
  ratingNumber: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  category: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: 8,
  },
  comment: {
    fontSize: 14,
    color: '#333',
    fontStyle: 'italic',
    marginBottom: 8,
    lineHeight: 20,
  },
  date: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
});
