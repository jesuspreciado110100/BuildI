import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ImageBackground, Modal } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { TradeJobsView } from './TradeJobsView';

interface Trade {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface ConstructionTradesCarouselProps {
  selectedTrade?: string;
  onTradeSelect: (tradeId: string) => void;
}

export const ConstructionTradesCarousel: React.FC<ConstructionTradesCarouselProps> = ({
  selectedTrade,
  onTradeSelect
}) => {
  const { theme } = useTheme();
  const [showJobsView, setShowJobsView] = useState(false);
  const [selectedTradeForJobs, setSelectedTradeForJobs] = useState<string>('');


  const trades: Trade[] = [
    { id: 'all', name: 'Todos', icon: '🔨', color: '#007AFF' },
    { id: 'albañilería', name: 'Albañilería', icon: '🧱', color: '#8B4513' },
    { id: 'carpintería', name: 'Carpintería', icon: '🪚', color: '#D2691E' },
    { id: 'electricidad', name: 'Electricidad', icon: '⚡', color: '#FFD700' },
    { id: 'plomería', name: 'Plomería', icon: '🔧', color: '#4682B4' },
    { id: 'herrería', name: 'Herrería', icon: '⚒️', color: '#696969' },
    { id: 'acabados', name: 'Acabados', icon: '🎨', color: '#FF69B4' },
    { id: 'excavación', name: 'Excavación', icon: '🚜', color: '#8B4513' },
    { id: 'demolición', name: 'Demolición', icon: '🔨', color: '#DC143C' },
    { id: 'cubiertas', name: 'Cubiertas', icon: '🏠', color: '#8B0000' },
    { id: 'impermeabilización', name: 'Impermeabilización', icon: '💧', color: '#4169E1' },
    { id: 'aislamiento', name: 'Aislamiento', icon: '🧊', color: '#20B2AA' },
    { id: 'vidriería', name: 'Vidriería', icon: '🪟', color: '#87CEEB' },
    { id: 'jardinería', name: 'Jardinería', icon: '🌱', color: '#32CD32' },
    { id: 'topografía', name: 'Topografía', icon: '📐', color: '#FF8C00' },
    { id: 'seguridad', name: 'Gestión de Seguridad', icon: '🦺', color: '#FF4500' },
    { id: 'hvac', name: 'HVAC', icon: '❄️', color: '#20B2AA' }
  ];

  const getTradeImage = (tradeId: string): string => {
    const imageMap: { [key: string]: string } = {
      'albañilería': 'https://d64gsuwffb70l.cloudfront.net/682b9339d741dd6bcf28bb65_1754073524543_d8b59189.jpeg',
      'carpintería': 'https://d64gsuwffb70l.cloudfront.net/682b9339d741dd6bcf28bb65_1754073526944_e02469ea.jpeg',
      'electricidad': 'https://d64gsuwffb70l.cloudfront.net/682b9339d741dd6bcf28bb65_1754073528773_6c9bf14e.jpeg',
      'plomería': 'https://d64gsuwffb70l.cloudfront.net/682b9339d741dd6bcf28bb65_1754073530663_af47cfe1.jpeg',
      'herrería': 'https://d64gsuwffb70l.cloudfront.net/682b9339d741dd6bcf28bb65_1754073531961_b409dca3.jpeg',
      'acabados': 'https://d64gsuwffb70l.cloudfront.net/682b9339d741dd6bcf28bb65_1754073534371_48fefe5c.jpeg'
    };
    return imageMap[tradeId] || 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=200&h=200&fit=crop';
  };

  const handleTradePress = (trade: Trade) => {
    onTradeSelect(trade.id);
    // Remove the modal functionality - let parent handle the display
  };

  return (
    <View style={styles.container}>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {trades.map((trade) => (
          <TouchableOpacity
            key={trade.id}
            style={[
              styles.tradeCard,
              { backgroundColor: theme.colors.card },
              selectedTrade === trade.id && { 
                backgroundColor: trade.color + '20',
                borderColor: trade.color,
                borderWidth: 2
              }
            ]}
            onPress={() => handleTradePress(trade)}
          >
            <ImageBackground
              source={{ uri: getTradeImage(trade.id) }}
              style={styles.backgroundImage}
              imageStyle={styles.backgroundImageStyle}
            >
              <View style={styles.overlay}>
                <Text style={[
                  styles.tradeName,
                  { color: '#FFFFFF' },
                  selectedTrade === trade.id && { fontWeight: '700' }
                ]}>
                  {trade.name}
                </Text>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        ))}
      </ScrollView>


      <Modal
        visible={showJobsView}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <TradeJobsView
          trade={selectedTradeForJobs}
          onBack={() => setShowJobsView(false)}
        />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    marginHorizontal: 16,
    fontFamily: 'System',
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  tradeCard: {
    borderRadius: 16,
    overflow: 'hidden',
    width: 105,
    height: 75,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundImageStyle: {
    borderRadius: 16,
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  tradeIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  tradeName: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
    fontWeight: '600',
    fontFamily: 'System',
  },
});