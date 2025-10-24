import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface TradeWorker {
  id: string;
  name: string;
  profileImage: string;
  workImage: string;
  trade: string;
  pricePerUnit: number;
  unit: string;
  rating: number;
  distance: number;
  completedJobs: number;
  description: string;
}

interface NearbyTradeWorkersListProps {
  selectedTrade: string;
  onWorkerSelect: (worker: TradeWorker) => void;
}

export const NearbyTradeWorkersList: React.FC<NearbyTradeWorkersListProps> = ({
  selectedTrade,
  onWorkerSelect
}) => {
  const { theme } = useTheme();

  const getWorkersForTrade = (trade: string): TradeWorker[] => {
    const workersData: { [key: string]: TradeWorker[] } = {
      'albañilería': [
        {
          id: '1',
          name: 'Carlos Mendez',
          profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
          workImage: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&h=300&fit=crop',
          trade: 'Albañilería',
          pricePerUnit: 45,
          unit: 'por m²',
          rating: 4.8,
          distance: 2.5,
          completedJobs: 127,
          description: 'Muro de ladrillo con acabado profesional'
        },
        {
          id: '2',
          name: 'Miguel Torres',
          profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
          workImage: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop',
          trade: 'Albañilería',
          pricePerUnit: 42,
          unit: 'por m²',
          rating: 4.6,
          distance: 3.8,
          completedJobs: 89,
          description: 'Construcción de muros y estructuras'
        }
      ],
      'carpintería': [
        {
          id: '3',
          name: 'Ana Rodriguez',
          profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b1c5?w=100&h=100&fit=crop&crop=face',
          workImage: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=300&fit=crop',
          trade: 'Carpintería',
          pricePerUnit: 350,
          unit: 'por pieza',
          rating: 4.9,
          distance: 1.8,
          completedJobs: 156,
          description: 'Muebles de cocina en madera de roble'
        }
      ],
      'electricidad': [
        {
          id: '4',
          name: 'Luis Martinez',
          profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
          workImage: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=300&fit=crop',
          trade: 'Electricidad',
          pricePerUnit: 25,
          unit: 'por punto',
          rating: 4.7,
          distance: 3.2,
          completedJobs: 203,
          description: 'Instalación eléctrica completa'
        }
      ]
    };

    return workersData[selectedTrade] || [];
  };

  const workers = getWorkersForTrade(selectedTrade);

  if (!selectedTrade || selectedTrade === 'all' || workers.length === 0) {
    return null;
  }

  const renderStars = (rating: number) => {
    return '⭐'.repeat(Math.floor(rating)) + (rating % 1 >= 0.5 ? '⭐' : '');
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        Trabajadores de {selectedTrade} cerca de ti
      </Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {workers.map((worker) => (
          <TouchableOpacity
            key={worker.id}
            style={[styles.workerCard, { backgroundColor: theme.colors.card }]}
            onPress={() => onWorkerSelect(worker)}
          >
            <Image source={{ uri: worker.workImage }} style={styles.workImage} />
            
            <View style={styles.workerInfo}>
              <View style={styles.profileSection}>
                <Image source={{ uri: worker.profileImage }} style={styles.profileImage} />
                <View style={styles.nameSection}>
                  <Text style={[styles.workerName, { color: theme.colors.text }]}>
                    {worker.name}
                  </Text>
                  <Text style={styles.rating}>
                    {renderStars(worker.rating)} {worker.rating}
                  </Text>
                </View>
              </View>
              
              <Text style={[styles.description, { color: theme.colors.text }]}>
                {worker.description}
              </Text>
              
              <View style={styles.detailsRow}>
                <Text style={[styles.price, { color: '#2196F3' }]}>
                  ${worker.pricePerUnit} {worker.unit}
                </Text>
                <Text style={styles.distance}>
                  📍 {worker.distance} km
                </Text>
              </View>
              
              <Text style={styles.completedJobs}>
                {worker.completedJobs} trabajos completados
              </Text>
            </View>
          </TouchableOpacity>
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
    fontWeight: '600',
    marginBottom: 12,
    marginHorizontal: 16,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  workerCard: {
    width: 280,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  workImage: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
  },
  workerInfo: {
    padding: 12,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  nameSection: {
    flex: 1,
  },
  workerName: {
    fontSize: 16,
    fontWeight: '600',
  },
  rating: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  description: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 18,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
  },
  distance: {
    fontSize: 12,
    color: '#666',
  },
  completedJobs: {
    fontSize: 12,
    color: '#666',
  },
});