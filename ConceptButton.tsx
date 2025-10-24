import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ImageBackground, View } from 'react-native';

interface ConceptButtonProps {
  concept: string;
  onPress: () => void;
}

export const ConceptButton: React.FC<ConceptButtonProps> = ({ concept, onPress }) => {
  const imageMap: { [key: string]: { uri: string } } = {
    'Foundation': { uri: 'https://via.placeholder.com/300x200/8B4513/FFFFFF?text=Foundation' },
    'Framing': { uri: 'https://via.placeholder.com/300x200/D2691E/FFFFFF?text=Framing' },
    'Electrical': { uri: 'https://via.placeholder.com/300x200/FFD700/000000?text=Electrical' },
    'Plumbing': { uri: 'https://via.placeholder.com/300x200/4682B4/FFFFFF?text=Plumbing' },
  };

  const imageSource = imageMap[concept] || { uri: 'https://via.placeholder.com/300x200/6B7280/FFFFFF?text=Construction' };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.6}
    >
      <ImageBackground
        source={imageSource}
        style={styles.imageBackground}
        imageStyle={styles.image}
      >
        <View style={styles.overlay}>
          <Text style={styles.conceptText}>{concept}</Text>
          <Text style={styles.tapHint}>Tap to view works</Text>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageBackground: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    borderRadius: 12,
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  conceptText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 4,
  },
  tapHint: {
    fontSize: 12,
    color: '#ffffff',
    textAlign: 'center',
    opacity: 0.9,
    fontWeight: '500',
  },
});