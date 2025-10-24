import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { LaborTradeCard } from './LaborTradeCard';

interface LaborTradesCarouselProps {
  onTradeSelect?: (trade: any) => void;
  selectedTradeId?: string;
}

const CONSTRUCTION_TRADES = [
  { 
    id: '1', 
    name: 'Albañilería\n(Masonry)', 
    icon: 'hammer-outline', 
    color: '#8B4513', 
    available: true,
    official: { name: 'Carlos Mendez', rating: 4.8, completedJobs: 45 },
    workImage: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400',
    pricePerUnit: 25,
    unit: 'm²',
    volume: 150
  },
  { 
    id: '2', 
    name: 'Carpintería\n(Carpentry)', 
    icon: 'construct-outline', 
    color: '#D2691E', 
    available: true,
    official: { name: 'Miguel Torres', rating: 4.9, completedJobs: 38 },
    workImage: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
    pricePerUnit: 35,
    unit: 'm²',
    volume: 80
  },
  { 
    id: '3', 
    name: 'Fierrería\n(Ironwork)', 
    icon: 'build-outline', 
    color: '#708090', 
    available: true,
    official: { name: 'Roberto Silva', rating: 4.7, completedJobs: 52 },
    workImage: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400',
    pricePerUnit: 45,
    unit: 'kg',
    volume: 2500
  },
  { 
    id: '4', 
    name: 'Concreting\n(Concrete Work)', 
    icon: 'cube-outline', 
    color: '#696969', 
    available: true,
    official: { name: 'Juan Ramirez', rating: 4.6, completedJobs: 41 },
    workImage: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400',
    pricePerUnit: 120,
    unit: 'm³',
    volume: 200
  },
  { 
    id: '5', 
    name: 'Plomería\n(Plumbing)', 
    icon: 'water-outline', 
    color: '#4682B4', 
    available: true,
    official: { name: 'Luis Garcia', rating: 4.8, completedJobs: 67 },
    workImage: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400',
    pricePerUnit: 40,
    unit: 'punto',
    volume: 25
  },
  { 
    id: '6', 
    name: 'Electricidad\n(Electrical Work)', 
    icon: 'flash-outline', 
    color: '#FFD700', 
    available: true,
    official: { name: 'Pedro Martinez', rating: 4.9, completedJobs: 73 },
    workImage: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400',
    pricePerUnit: 50,
    unit: 'punto',
    volume: 30
  },
  { 
    id: '7', 
    name: 'Pintura\n(Painting)', 
    icon: 'brush-outline', 
    color: '#FF6347', 
    available: true,
    official: { name: 'Antonio Lopez', rating: 4.5, completedJobs: 89 },
    workImage: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400',
    pricePerUnit: 15,
    unit: 'm²',
    volume: 300
  },
  { 
    id: '8', 
    name: 'Cubiertas\n(Roofing)', 
    icon: 'home-outline', 
    color: '#8B0000', 
    available: true,
    official: { name: 'Francisco Ruiz', rating: 4.7, completedJobs: 34 },
    workImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    pricePerUnit: 60,
    unit: 'm²',
    volume: 120
  },
  { 
    id: '9', 
    name: 'Acabados\n(Finishing)', 
    icon: 'color-palette-outline', 
    color: '#9370DB', 
    available: true,
    official: { name: 'Diego Morales', rating: 4.8, completedJobs: 56 },
    workImage: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400',
    pricePerUnit: 30,
    unit: 'm²',
    volume: 180
  },
  { 
    id: '10', 
    name: 'Excavación\n(Excavation)', 
    icon: 'trail-sign-outline', 
    color: '#8B4513', 
    available: true,
    official: { name: 'Ricardo Vega', rating: 4.6, completedJobs: 28 },
    workImage: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400',
    pricePerUnit: 80,
    unit: 'm³',
    volume: 500
  }
];

export const LaborTradesCarousel: React.FC<LaborTradesCarouselProps> = ({ 
  onTradeSelect,
  selectedTradeId 
}) => {
  const [selectedTrade, setSelectedTrade] = useState<string | null>(selectedTradeId || null);

  const handleTradePress = (trade: any) => {
    setSelectedTrade(trade.id);
    onTradeSelect?.(trade);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Oficios de Construcción</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {CONSTRUCTION_TRADES.map((trade) => (
          <LaborTradeCard
            key={trade.id}
            trade={trade}
            onPress={handleTradePress}
            selected={selectedTrade === trade.id}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    marginHorizontal: 16,
    color: '#333',
  },
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: 8,
  },
});