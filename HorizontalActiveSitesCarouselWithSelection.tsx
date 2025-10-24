import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WorkerCarousel } from './WorkerCarousel';
import SiteConceptCard from './SiteConceptCard';

interface Site {
  id: string;
  name: string;
  location: string;
  status: string;
  progress: number;
  workers: any[];
  concepts: any[];
}

interface HorizontalActiveSitesCarouselWithSelectionProps {
  selectedSiteId?: string;
  onSiteSelect?: (site: Site) => void;
}

export default function HorizontalActiveSitesCarouselWithSelection({ 
  selectedSiteId, 
  onSiteSelect 
}: HorizontalActiveSitesCarouselWithSelectionProps) {
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);

  const sites: Site[] = [
    {
      id: '1',
      name: 'Auditorio Cívico',
      location: 'Magdalena de Kino, Sonora',
      status: 'En Progreso',
      progress: 65,
      workers: [
        { id: '1', name: 'Martin Albelais', role: 'Supervisor', status: 'active' },
        { id: '2', name: 'Felipe Miranda', role: 'Maestro', status: 'active' }
      ],
      concepts: [
        {
          code: 'PRE-001',
          description: 'Trazo y nivelación del terreno',
          quantity: 1300,
          unit: 'M2',
          unitPrice: 13.13,
          total: 17069,
          status: 'completed',
          photoEvidence: ['https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=300'],
          workerName: 'Martin Albelais'
        }
      ]
    },
    {
      id: '2',
      name: 'Plaza Comercial',
      location: 'Hermosillo, Sonora',
      status: 'Iniciando',
      progress: 15,
      workers: [
        { id: '3', name: 'Carlos Rodriguez', role: 'Supervisor', status: 'active' }
      ],
      concepts: [
        {
          code: 'LIM-001',
          description: 'Limpieza del terreno',
          quantity: 500,
          unit: 'M2',
          unitPrice: 8.50,
          total: 4250,
          status: 'pending',
          workerName: 'Carlos Rodriguez'
        }
      ]
    }
  ];

  useEffect(() => {
    if (selectedSiteId) {
      const site = sites.find(s => s.id === selectedSiteId);
      if (site) {
        setSelectedSite(site);
        onSiteSelect?.(site);
      }
    }
  }, [selectedSiteId]);

  const handleSitePress = (site: Site) => {
    setSelectedSite(site);
    // Always call the parent handler to render in community component
    onSiteSelect?.(site);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'En Progreso': return '#F59E0B';
      case 'Completado': return '#10B981';
      case 'Iniciando': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  const renderSiteCard = ({ item }: { item: Site }) => (
    <TouchableOpacity
      style={[
        styles.siteCard,
        selectedSite?.id === item.id && styles.selectedSiteCard
      ]}
      onPress={() => handleSitePress(item)}
    >
      <View style={styles.siteHeader}>
        <Text style={styles.siteName}>{item.name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.siteLocation}>📍 {item.location}</Text>
      <View style={styles.progressSection}>
        <Text style={styles.progressText}>{item.progress}% completado</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${item.progress}%` }]} />
        </View>
      </View>
      <View style={styles.portfolioButton}>
        <Ionicons name="briefcase-outline" size={16} color="#3B82F6" />
        <Text style={styles.portfolioText}>Ver Portfolio</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sitios Activos</Text>
      <FlatList
        data={sites}
        renderItem={renderSiteCard}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carouselContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8FAFC',
    paddingVertical: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  carouselContainer: {
    paddingHorizontal: 16,
  },
  siteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedSiteCard: {
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  siteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  siteName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '500',
  },
  siteLocation: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
  },
  progressSection: {
    marginTop: 8,
  },
  progressText: {
    fontSize: 12,
    color: '#374151',
    marginBottom: 4,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 3,
  },
  portfolioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 8,
    backgroundColor: '#EFF6FF',
    borderRadius: 6,
  },
  portfolioText: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '500',
    marginLeft: 4,
  },
});