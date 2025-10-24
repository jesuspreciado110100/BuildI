import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { SwipeableHomeView } from './SwipeableHomeView';
import { SiteQuickViewModal } from './SiteQuickViewModal';
import { SmartSearchBar } from './SmartSearchBar';
import { FilterSystem } from './FilterSystem';
import { FloatingActionMenu } from './FloatingActionMenu';

interface Site {
  id: string;
  name: string;
  location: string;
  status: 'Active' | 'Completed' | 'On Hold';
  progress: number;
  budget: number;
  teamSize: number;
  price: number;
  priceChange: number;
  type: 'Residential' | 'Commercial' | 'Industrial';
  lat: number;
  lng: number;
  photos: string[];
}

export const EnhancedHomeScreen: React.FC = () => {
  const [sites, setSites] = useState<Site[]>([
    {
      id: '1',
      name: 'Complejo de Oficinas Centro',
      location: 'Madrid, España',
      status: 'Active',
      progress: 65,
      budget: 2500000,
      teamSize: 24,
      price: 500,
      priceChange: -25,
      type: 'Commercial',
      lat: 40.7128,
      lng: -74.0060,
      photos: ['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop']
    },
    {
      id: '2',
      name: 'Torre Residencial',
      location: 'Barcelona, España',
      status: 'Active',
      progress: 30,
      budget: 1800000,
      teamSize: 18,
      price: 750,
      priceChange: 50,
      type: 'Residential',
      lat: 34.0522,
      lng: -118.2437,
      photos: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop']
    },
    {
      id: '3',
      name: 'Almacén Industrial',
      location: 'Valencia, España',
      status: 'Completed',
      progress: 100,
      budget: 3200000,
      teamSize: 32,
      price: 320,
      priceChange: 15,
      type: 'Industrial',
      lat: 41.8781,
      lng: -87.6298,
      photos: ['https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop']
    }
  ]);
  
  const [filteredSites, setFilteredSites] = useState<Site[]>(sites);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [showSiteModal, setShowSiteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [userLocation] = useState({ lat: 40.7589, lng: -73.9851 });

  // Simulate live price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSites(prevSites => 
        prevSites.map(site => ({
          ...site,
          priceChange: Math.floor(Math.random() * 100) - 50,
          price: site.price + (Math.floor(Math.random() * 20) - 10)
        }))
      );
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Apply filters and search
  useEffect(() => {
    let filtered = sites.filter(site => {
      const matchesSearch = site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           site.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || site.status === statusFilter;
      const matchesType = typeFilter === 'All' || site.type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
    
    setFilteredSites(filtered);
  }, [sites, searchQuery, statusFilter, typeFilter]);

  const handleSitePress = (site: Site) => {
    setSelectedSite(site);
    setShowSiteModal(true);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
  };

  const handleTypeFilter = (type: string) => {
    setTypeFilter(type);
  };

  const handleCostSort = (order: 'asc' | 'desc' | null) => {
    if (order) {
      const sorted = [...filteredSites].sort((a, b) => {
        return order === 'asc' ? a.price - b.price : b.price - a.price;
      });
      setFilteredSites(sorted);
    }
  };

  // FAB Actions
  const handleAddSite = () => {
    Alert.alert('Agregar Sitio', 'Funcionalidad para agregar nuevo sitio de construcción');
  };

  const handleHireLabor = () => {
    Alert.alert('Contratar Mano de Obra', 'Funcionalidad de contratación de mano de obra');
  };

  const handleOrderEquipment = () => {
    Alert.alert('Pedir Equipo', 'Funcionalidad de pedido de equipo');
  };

  const handleViewReports = () => {
    Alert.alert('Ver Reportes', 'Funcionalidad de visualización de reportes');
  };

  const handleRequestMaterials = () => {
    Alert.alert('Solicitar Materiales', 'Funcionalidad de solicitud de materiales');
  };

  const handleRecenter = () => {
    Alert.alert('Recentrar Mapa', 'Mapa recentrado a la ubicación del usuario');
  };

  return (
    <View style={styles.container}>
      <SmartSearchBar onSearch={handleSearch} />
      
      <FilterSystem
        onStatusFilter={handleStatusFilter}
        onTypeFilter={handleTypeFilter}
        onCostSort={handleCostSort}
      />
      
      <SwipeableHomeView
        sites={filteredSites}
        userLocation={userLocation}
        onSitePress={handleSitePress}
        onRecenter={handleRecenter}
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        typeFilter={typeFilter}
      />
      
      <SiteQuickViewModal
        visible={showSiteModal}
        site={selectedSite}
        onClose={() => setShowSiteModal(false)}
        onRequestMaterials={handleRequestMaterials}
        onHireLabor={handleHireLabor}
        onViewReports={handleViewReports}
      />
      
      <FloatingActionMenu
        onAddSite={handleAddSite}
        onHireLabor={handleHireLabor}
        onOrderEquipment={handleOrderEquipment}
        onViewReports={handleViewReports}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  }
});