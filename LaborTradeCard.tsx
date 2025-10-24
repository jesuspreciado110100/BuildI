import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface LaborTradeCardProps {
  trade: {
    id: string;
    name: string;
    icon: string;
    color: string;
    available: boolean;
    official: {
      name: string;
      rating: number;
      completedJobs: number;
    };
    workImage: string;
    pricePerUnit: number;
    unit: string;
    volume: number;
  };
  onPress: (trade: any) => void;
  selected?: boolean;
}

export const LaborTradeCard: React.FC<LaborTradeCardProps> = ({ 
  trade, 
  onPress, 
  selected = false 
}) => {
  return (
    <TouchableOpacity 
      style={[styles.card, selected && styles.selectedCard]}
      onPress={() => onPress(trade)}
      disabled={!trade.available}
    >
      <ImageBackground 
        source={{ uri: trade.workImage }}
        style={styles.backgroundImage}
        imageStyle={styles.imageStyle}
      >
        <View style={styles.overlay}>
          <View style={[styles.iconContainer, { backgroundColor: trade.color }]}>
            <Ionicons name={trade.icon as any} size={20} color="white" />
          </View>
          
          <Text style={styles.tradeName}>{trade.name}</Text>
          
          <View style={styles.officialInfo}>
            <Text style={styles.officialName}>{trade.official.name}</Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={12} color="#FFD700" />
              <Text style={styles.rating}>{trade.official.rating}</Text>
            </View>
          </View>
          
          <View style={styles.priceContainer}>
            <Text style={styles.price}>${trade.pricePerUnit}/{trade.unit}</Text>
            <Text style={styles.volume}>Vol: {trade.volume}</Text>
          </View>
          
          {!trade.available && (
            <View style={styles.unavailableOverlay}>
              <Text style={styles.unavailable}>No disponible</Text>
            </View>
          )}
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 160,
    height: 200,
    borderRadius: 12,
    marginHorizontal: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  imageStyle: {
    borderRadius: 12,
  },
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 12,
    borderRadius: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    alignSelf: 'center',
  },
  tradeName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    color: '#fff',
    marginBottom: 8,
  },
  officialInfo: {
    alignItems: 'center',
    marginBottom: 8,
  },
  officialName: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '500',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  rating: {
    fontSize: 10,
    color: '#fff',
    marginLeft: 2,
  },
  priceContainer: {
    alignItems: 'center',
  },
  price: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4CAF50',
  },
  volume: {
    fontSize: 10,
    color: '#fff',
    marginTop: 2,
  },
  unavailableOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  unavailable: {
    fontSize: 12,
    color: '#ff6b6b',
    fontWeight: '600',
  },
});