import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { TradesmanJobCard } from './TradesmanJobCard';

interface TradesmanJob {
  id: string;
  tradesmanName: string;
  profilePicture: string;
  workImage: string;
  price: number;
  trade: string;
  rating: number;
  location: string;
  description: string;
  distance?: number;
}

interface TradeJobsViewProps {
  trade: string;
  onBack: () => void;
}

const MOCK_JOBS: TradesmanJob[] = [
  {
    id: '1',
    tradesmanName: 'Carlos Mendez',
    profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    workImage: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&h=300&fit=crop',
    price: 1200,
    trade: 'Albañilería',
    rating: 4.8,
    location: 'Centro, CDMX',
    description: 'Construcción de muro de ladrillo con acabado profesional',
    distance: 2.5,
  },
  {
    id: '2',
    tradesmanName: 'Ana Rodriguez',
    profilePicture: 'https://images.unsplash.com/photo-1494790108755-2616b612b1c5?w=100&h=100&fit=crop&crop=face',
    workImage: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=300&fit=crop',
    price: 800,
    trade: 'Carpintería',
    rating: 4.9,
    location: 'Roma Norte, CDMX',
    description: 'Muebles de cocina en madera de roble',
    distance: 1.8,
  },
  {
    id: '3',
    tradesmanName: 'Luis Martinez',
    profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    workImage: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=300&fit=crop',
    price: 950,
    trade: 'Electricidad',
    rating: 4.7,
    location: 'Polanco, CDMX',
    description: 'Instalación eléctrica completa para oficina',
    distance: 3.2,
  },
  {
    id: '4',
    tradesmanName: 'Maria Gonzalez',
    profilePicture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    workImage: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400&h=300&fit=crop',
    price: 750,
    trade: 'Plomería',
    rating: 4.6,
    location: 'Condesa, CDMX',
    description: 'Reparación de tuberías y instalación de baño',
    distance: 2.1,
  },
  {
    id: '5',
    tradesmanName: 'Roberto Silva',
    profilePicture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    workImage: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop',
    price: 1100,
    trade: 'Herrería',
    rating: 4.5,
    location: 'Doctores, CDMX',
    description: 'Fabricación de puertas y ventanas de hierro',
    distance: 4.1,
  },
  {
    id: '6',
    tradesmanName: 'Patricia Lopez',
    profilePicture: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
    workImage: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop',
    price: 900,
    trade: 'Acabados',
    rating: 4.8,
    location: 'Del Valle, CDMX',
    description: 'Pintura y acabados decorativos de alta calidad',
    distance: 2.8,
  },
];

type SortOption = 'relevant' | 'nearby' | 'price';

export const TradeJobsView: React.FC<TradeJobsViewProps> = ({ trade, onBack }) => {
  const [sortBy, setSortBy] = useState<SortOption>('relevant');

  const filteredJobs = useMemo(() => {
    let jobs = MOCK_JOBS.filter(job => job.trade === trade);
    
    switch (sortBy) {
      case 'nearby':
        return jobs.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      case 'price':
        return jobs.sort((a, b) => a.price - b.price);
      case 'relevant':
      default:
        return jobs.sort((a, b) => b.rating - a.rating);
    }
  }, [trade, sortBy]);

  const handleJobPress = (job: TradesmanJob) => {
    Alert.alert(
      'Solicitar Trabajo',
      `¿Deseas solicitar el trabajo de ${job.tradesmanName}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Solicitar', onPress: () => console.log('Job requested:', job) }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{trade}</Text>
      </View>

      <View style={styles.filterContainer}>
        {(['relevant', 'nearby', 'price'] as SortOption[]).map((option) => (
          <TouchableOpacity
            key={option}
            style={[styles.filterButton, sortBy === option && styles.activeFilter]}
            onPress={() => setSortBy(option)}
          >
            <Text style={[styles.filterText, sortBy === option && styles.activeFilterText]}>
              {option === 'relevant' ? 'Relevante' : 
               option === 'nearby' ? 'Cercano' : 'Precio'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.jobsList}>
        {filteredJobs.map((job) => (
          <TradesmanJobCard key={job.id} job={job} onPress={handleJobPress} />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
  },
  backButton: {
    marginRight: 16,
  },
  backText: {
    fontSize: 16,
    color: '#2196F3',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  activeFilter: {
    backgroundColor: '#2196F3',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
  },
  activeFilterText: {
    color: 'white',
  },
  jobsList: {
    padding: 16,
  },
});