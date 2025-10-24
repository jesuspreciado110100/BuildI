import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LaborSmartSearchBar } from './LaborSmartSearchBar';
import { ConstructionTradesCarousel } from './ConstructionTradesCarousel';
import { TradeJobsFilter } from './TradeJobsFilter';
import { LaborSupabaseService, LaborRequest, Worker } from '../services/LaborSupabaseService';
const handleSearch = (query: string) => {
  console.log('Searching for:', query);
  // Implement search logic here
};

interface JobCard {
  id: string;
  title: string;
  description: string;
  price: number;
  distance: number;
  workerSkill: number;
  location: string;
  trade: string;
}

interface LaborRequest {
  id: string;
  trade: string;
  description: string;
  workers: number;
  duration: string;
  location: string;
  status: 'pending' | 'matched' | 'active';
}

export const LaborRequestScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrade, setSelectedTrade] = useState<string>('all');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [showJobCards, setShowJobCards] = useState(false);
  const [laborRequests, setLaborRequests] = useState<LaborRequest[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);

  // Load labor requests and set up real-time subscription
  useEffect(() => {
    const loadLaborRequests = async () => {
      setLoading(true);
      const data = await LaborSupabaseService.getLaborRequests();
      setLaborRequests(data);
      setLoading(false);
    };

    loadLaborRequests();

    // Set up real-time subscription
    const subscription = LaborSupabaseService.subscribeLaborRequests((data) => {
      setLaborRequests(data);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Handle search with real-time data
  useEffect(() => {
    if (searchQuery.trim()) {
      const searchRequests = async () => {
        const results = await LaborSupabaseService.searchLaborRequests(searchQuery);
        setLaborRequests(results);
      };
      searchRequests();
    } else {
      const loadRequests = async () => {
        const data = await LaborSupabaseService.getLaborRequests();
        setLaborRequests(data);
      };
      loadRequests();
    }
  }, [searchQuery]);

  const handleTradeSelect = async (tradeId: string) => {
    setSelectedTrade(tradeId);
    setShowJobCards(tradeId !== 'all');
    
    if (tradeId !== 'all') {
      const tradeWorkers = await LaborSupabaseService.getWorkersByTrade(tradeId);
      setWorkers(tradeWorkers);
    }
  };
  const getFilteredLaborRequests = () => {
    let filtered = laborRequests.filter(request => 
      selectedTrade === 'all' || request.trade === selectedTrade
    );
    return filtered;
  };

  const renderJobCard = (job: JobCard) => (
    <View key={job.id} style={styles.jobCard}>
      <View style={styles.jobHeader}>
        <Text style={styles.jobTitle}>{job.title}</Text>
        <Text style={styles.jobPrice}>${job.price.toLocaleString()}</Text>
      </View>
      <Text style={styles.jobDescription}>{job.description}</Text>
      <View style={styles.jobDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="location" size={14} color="#64748B" />
          <Text style={styles.detailText}>{job.distance}km</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="star" size={14} color="#F59E0B" />
          <Text style={styles.detailText}>{job.workerSkill}%</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="location-outline" size={14} color="#64748B" />
          <Text style={styles.detailText}>{job.location}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <LaborSmartSearchBar
        onSearch={handleSearch}
        placeholder="Buscar trabajos por descripción..."
      />

      <ConstructionTradesCarousel 
        selectedTrade={selectedTrade}
        onTradeSelect={handleTradeSelect}
      />

      {showJobCards && (
        <>
          <TradeJobsFilter 
            onFilterChange={setActiveFilter}
            activeFilter={activeFilter}
          />
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Trabajos Disponibles {selectedTrade !== 'all' && `- ${selectedTrade}`}
            </Text>
            {getFilteredLaborRequests().map(request => (
              <View key={request.id} style={styles.jobCard}>
                <Text style={styles.jobTitle}>{request.title}</Text>
                <Text style={styles.jobDescription}>{request.description}</Text>
                <Text style={styles.detailText}>{request.location}</Text>
              </View>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  searchContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
    fontFamily: 'System',
    fontWeight: '400',
  },
  filterButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    fontFamily: 'System',
  },
  newRequestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0EA5E9',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  newRequestText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 6,
    fontWeight: '600',
    fontFamily: 'System',
  },
  requestCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  requestTrade: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    fontFamily: 'System',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
    fontFamily: 'System',
  },
  requestDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
    lineHeight: 20,
    fontFamily: 'System',
  },
  requestDetails: {
    flexDirection: 'row',
    gap: 20,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: '#64748B',
    fontFamily: 'System',
  },
  jobCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
    marginRight: 12,
  },
  jobPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#059669',
  },
  jobDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
    lineHeight: 20,
  },
  jobDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});