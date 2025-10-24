import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import MachineryBookingScreen from './MachineryBookingScreen';
import MachineryRequestForm from './MachineryRequestForm';
import MachineryRequestsTab from './MachineryRequestsTab';
import { MachineryTypeSelector } from './MachineryTypeSelector';
import { MachineryCarousel } from './machinery/MachineryCarousel';

import { SmartFiltersPanel } from './SmartFiltersPanel';
import { MachinerySmartSearchBar } from './MachinerySmartSearchBar';
import { FeaturedMachineryBanner } from './machinery/FeaturedMachineryBanner';
import { EquipmentTypesCarousel } from './machinery/EquipmentTypesCarousel';
import { FeaturedEquipmentBanner } from './machinery/FeaturedEquipmentBanner';
import { NearbyMachineryList } from './machinery/NearbyMachineryList';
import { MachinerySupabaseService, MachineryItem } from '../services/MachinerySupabaseService';
interface MachineryType {
  id: string;
  name: string;
  imageUrl: string;
}

interface FilterState {
  jobTypes: string[];
  digDepth: number;
  sizeWeight: string;
  techCost: string[];
}

export const MachineryScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState('browse');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedEquipmentType, setSelectedEquipmentType] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [machinery, setMachinery] = useState<MachineryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    jobTypes: [],
    digDepth: 15,
    sizeWeight: '',
    techCost: []
  });

  // Load machinery data and set up real-time subscription
  useEffect(() => {
    const loadMachinery = async () => {
      setLoading(true);
      const data = await MachinerySupabaseService.getMachinery();
      setMachinery(data);
      setLoading(false);
    };

    loadMachinery();

    // Set up real-time subscription
    const subscription = MachinerySupabaseService.subscribeMachinery((data) => {
      setMachinery(data);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Handle search with real-time data
  useEffect(() => {
    if (searchQuery.trim()) {
      const searchMachinery = async () => {
        const results = await MachinerySupabaseService.searchMachinery(searchQuery);
        setMachinery(results);
      };
      searchMachinery();
    } else {
      const loadMachinery = async () => {
        const data = await MachinerySupabaseService.getMachinery();
        setMachinery(data);
      };
      loadMachinery();
    }
  }, [searchQuery]);
  const handleBookingSubmit = (request: Omit<BookingRequest, 'id' | 'created_at'>) => {
    console.log('Booking submitted:', request);
  };

  const handleRequestSubmit = (request: any) => {
    console.log('Request submitted:', request);
  };

  const getMachineryByType = (type: string) => {
    return machinery.filter(item => 
      item.machinery_type?.toLowerCase() === type.toLowerCase()
    );
  };

  const handleTypeSelect = (type: MachineryType) => {
    console.log('Selected machinery type:', type);
    setSelectedCategory(selectedCategory === type.id ? null : type.id);
    setFilters({
      jobTypes: [],
      digDepth: 15,
      sizeWeight: '',
      techCost: []
    });
  };


  const handleEquipmentTypeSelect = (type: any) => {
    console.log('Selected equipment type:', type);
    setSelectedEquipmentType(selectedEquipmentType === type.id ? null : type.id);
  };

  const handleModelSelect = (model: any) => {
    console.log('Selected machinery model:', model);
  };

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    console.log('Search query:', query);
  };

  const renderBrowseTab = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.whiteSection}>
        <MachinerySmartSearchBar
          onSearch={handleSearch}
          placeholder="Buscar maquinaria..."
        />

        <MachineryCarousel 
          onTypeSelect={handleTypeSelect}
          selectedCategory={selectedCategory}
        />
      </View>

      <FeaturedMachineryBanner />

      <EquipmentTypesCarousel 
        onTypeSelect={handleEquipmentTypeSelect}
        selectedType={selectedEquipmentType}
      />

      {selectedEquipmentType && (
        <NearbyMachineryList 
          equipmentType={selectedEquipmentType.toUpperCase()}
          listings={getMachineryByType(selectedEquipmentType)}
        />
      )}

      <FeaturedEquipmentBanner />

      <SmartFiltersPanel
        onFiltersChange={handleFiltersChange}
        selectedCategory={selectedCategory}
      />

      <View style={styles.actionContainer}>
        {/* Removed "Ver todo" button as requested */}
      </View>


    </ScrollView>

  );

  const renderContent = () => {
    switch (activeTab) {
      case 'browse':
        return renderBrowseTab();
      case 'book':
        return <MachineryBookingScreen onBookingSubmit={handleBookingSubmit} />;
      case 'request':
        return (
          <MachineryRequestForm
            onSubmit={handleRequestSubmit}
            onCancel={() => setActiveTab('browse')}
          />
        );
      case 'requests':
        return <MachineryRequestsTab contractorId="contractor1" />;
      case 'types':
        return <MachineryTypeSelector />;
      default:
        return renderBrowseTab();
    }
  };

  return (
    <View style={styles.container}>
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingTop: 16,
  },
  content: {
    flex: 1,
  },
  whiteSection: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 16,
  },
  actionContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  clearButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  clearButtonActive: {
    backgroundColor: '#0EA5E9',
    borderColor: '#0EA5E9',
    shadowColor: '#0EA5E9',
    shadowOpacity: 0.2,
  },
  clearButtonText: {
    color: '#64748B',
    fontWeight: '600',
    fontSize: 12,
  },
  clearButtonTextActive: {
    color: '#FFFFFF',
  },
});
