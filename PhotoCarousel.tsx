import React, { useState } from 'react';
import { View, Image, TouchableOpacity, Text, StyleSheet, ScrollView } from 'react-native';

interface PhotoCarouselProps {
  photos: string[];
  height?: number;
}

export const PhotoCarousel: React.FC<PhotoCarouselProps> = ({ 
  photos, 
  height = 200 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!photos || photos.length === 0) {
    return (
      <View style={[styles.container, { height }]}>
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>No photos available</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { height }]}>
      <ScrollView 
        horizontal 
        pagingEnabled 
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width);
          setCurrentIndex(index);
        }}
      >
        {photos.map((photo, index) => (
          <Image 
            key={index} 
            source={{ uri: photo }} 
            style={[styles.photo, { height }]} 
          />
        ))}
      </ScrollView>
      
      {photos.length > 1 && (
        <View style={styles.indicators}>
          {photos.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.indicator,
                index === currentIndex && styles.activeIndicator
              ]}
              onPress={() => setCurrentIndex(index)}
            />
          ))}
        </View>
      )}
      
      {photos.length > 1 && (
        <View style={styles.counter}>
          <Text style={styles.counterText}>
            {currentIndex + 1} / {photos.length}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
  },
  photo: {
    width: 300,
    resizeMode: 'cover',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  placeholderText: {
    color: '#666',
    fontSize: 14,
  },
  indicators: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  activeIndicator: {
    backgroundColor: 'white',
  },
  counter: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  counterText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
});