import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  size?: number;
  readonly?: boolean;
  showNumber?: boolean;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  onRatingChange,
  size = 20,
  readonly = false,
  showNumber = false
}) => {
  const handleStarPress = (starRating: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  const renderStar = (index: number) => {
    const filled = index < rating;
    return (
      <TouchableOpacity
        key={index}
        onPress={() => handleStarPress(index + 1)}
        disabled={readonly}
        style={[styles.star, { width: size, height: size }]}
      >
        <Text style={[styles.starText, { fontSize: size, color: filled ? '#FFD700' : '#DDD' }]}>
          ★
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.starsContainer}>
        {[...Array(5)].map((_, index) => renderStar(index))}
      </View>
      {showNumber && (
        <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
  },
  star: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 2,
  },
  starText: {
    fontWeight: 'bold',
  },
  ratingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
});