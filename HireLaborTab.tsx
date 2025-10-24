import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { ConstructionTradesCarousel } from './ConstructionTradesCarousel';
import { NearbyTradeWorkersList } from './NearbyTradeWorkersList';
import { WorkerCard } from './WorkerCard';
import { WorkerProfileModal } from './WorkerProfileModal';

interface Worker {
  id: string;
  name: string;
  trade: string;
  rating: number;
  hourlyRate: number;
  availability: string;
  photo: string;
  skills: string[];
  completedJobs: number;
}

export default function HireLaborTab() {
  const { theme } = useTheme();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState('all');
  const [filters, setFilters] = useState({
    skill: '',
    availability: '',
    priceRange: { min: 0, max: 100 }
  });

  useEffect(() => {
    loadWorkers();
  }, []);

  const loadWorkers = async () => {
    setLoading(true);
    try {
      // Mock data
      const mockWorkers: Worker[] = [
        {
          id: '1',
          name: 'John Smith',
          trade: 'Carpenter',
          rating: 4.8,
          hourlyRate: 35,
          availability: 'Available now',
          photo: 'https://via.placeholder.com/100',
          skills: ['Framing', 'Finishing', 'Roofing'],
          completedJobs: 156
        },
        {
          id: '2',
          name: 'Maria Garcia',
          trade: 'Electrician',
          rating: 4.9,
          hourlyRate: 42,
          availability: 'Available tomorrow',
          photo: 'https://via.placeholder.com/100',
          skills: ['Wiring', 'Panel Installation', 'Troubleshooting'],
          completedJobs: 203
        },
        {
          id: '3',
          name: 'David Johnson',
          trade: 'Plumber',
          rating: 4.7,
          hourlyRate: 38,
          availability: 'Available now',
          photo: 'https://via.placeholder.com/100',
          skills: ['Pipe Installation', 'Leak Repair', 'Fixture Installation'],
          completedJobs: 89
        }
      ];
      setWorkers(mockWorkers);
    } catch (error) {
      console.error('Error loading workers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWorkerPress = (worker: Worker) => {
    setSelectedWorker(worker);
    setModalVisible(true);
  };

  const handleRequestTask = (worker: Worker) => {
    console.log('Requesting task for:', worker.name);
    setModalVisible(false);
  };

  const getFilteredWorkers = () => {
    return workers.filter(worker => {
      const matchesSearch = worker.name.toLowerCase().includes(searchText.toLowerCase()) ||
                          worker.trade.toLowerCase().includes(searchText.toLowerCase());
      const matchesTrade = selectedTrade === 'all' || worker.trade === selectedTrade;
      const matchesSkill = !filters.skill || worker.skills.includes(filters.skill);
      const matchesAvailability = !filters.availability || worker.availability === filters.availability;
      const matchesPrice = worker.hourlyRate >= filters.priceRange.min && worker.hourlyRate <= filters.priceRange.max;
      
      return matchesSearch && matchesTrade && matchesSkill && matchesAvailability && matchesPrice;
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Construction Trades Carousel */}
      <ConstructionTradesCarousel 
        selectedTrade={selectedTrade}
        onTradeSelect={setSelectedTrade}
      />

      {/* Nearby Trade Workers List */}
      <NearbyTradeWorkersList 
        selectedTrade={selectedTrade}
        onWorkerSelect={(worker) => {
          console.log('Selected worker:', worker);
          // Handle worker selection here
        }}
      />

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: theme.colors.surface }]}>
        <TextInput
          style={[styles.searchInput, { 
            borderColor: theme.colors.border,
            color: theme.colors.text
          }]}
          placeholder="Search workers by name or trade..."
          placeholderTextColor={theme.colors.textSecondary}
          value={searchText}
          onChangeText={setSearchText}
        />
        <TouchableOpacity style={[styles.searchButton, { backgroundColor: theme.colors.primary }]}>
          <Text style={styles.searchButtonText}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
        <TouchableOpacity 
          style={[styles.filterButton, filters.skill && { backgroundColor: theme.colors.primary }]}
          onPress={() => setFilters({...filters, skill: filters.skill ? '' : 'Framing'})}
        >
          <Text style={[styles.filterText, { 
            color: filters.skill ? '#fff' : theme.colors.text 
          }]}>
            {filters.skill || 'Skill Level'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterButton, filters.availability && { backgroundColor: theme.colors.primary }]}
          onPress={() => setFilters({...filters, availability: filters.availability ? '' : 'Available now'})}
        >
          <Text style={[styles.filterText, { 
            color: filters.availability ? '#fff' : theme.colors.text 
          }]}>
            {filters.availability || 'Availability'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.filterButton}>
          <Text style={[styles.filterText, { color: theme.colors.text }]}>Price Range</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.filterButton}>
          <Text style={[styles.filterText, { color: theme.colors.text }]}>Rating</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Workers Grid */}
      <ScrollView style={styles.workersList}>
        {loading ? (
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>Loading workers...</Text>
        ) : getFilteredWorkers().length === 0 ? (
          <Text style={[styles.emptyText, { color: theme.colors.text }]}>No workers found matching your criteria</Text>
        ) : (
          <View style={styles.workersGrid}>
            {getFilteredWorkers().map((worker) => (
              <WorkerCard 
                key={worker.id}
                worker={worker} 
                onPress={() => handleWorkerPress(worker)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Worker Profile Modal */}
      {selectedWorker && (
        <WorkerProfileModal
          worker={selectedWorker}
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onRequestTask={() => handleRequestTask(selectedWorker)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  searchButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
  },
  searchButtonText: {
    fontSize: 16,
    color: '#fff',
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    marginRight: 8,
  },
  filterText: {
    fontSize: 14,
  },
  workersList: {
    flex: 1,
    padding: 16,
  },
  workersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 40,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 40,
  },
});