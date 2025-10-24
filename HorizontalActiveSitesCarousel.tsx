import React, { useState } from 'react';
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

export default function HorizontalActiveSitesCarousel() {
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

  const handleSitePress = (site: Site) => {
    setSelectedSite(site);
  };

  const handleConceptConfirm = (conceptCode: string) => {
    console.log('Concept confirmed:', conceptCode);
  };

  const handleConceptReject = (conceptCode: string) => {
    console.log('Concept rejected:', conceptCode);
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
      style={styles.siteCard}
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
    </TouchableOpacity>
  );

  if (selectedSite) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setSelectedSite(null)}
          >
            <Ionicons name="arrow-back" size={24} color="#3B82F6" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{selectedSite.name}</Text>
        </View>

        <ScrollView style={styles.content}>
          <Text style={styles.sectionTitle}>Equipo de Trabajo</Text>
          <WorkerCarousel
            workers={selectedSite.workers}
            onAddWorker={() => {}}
            onWorkerPress={() => {}}
          />

          <View style={styles.conceptsHeader}>
            <Text style={styles.sectionTitle}>Conceptos de Obra</Text>
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>Ver todos</Text>
              <Ionicons name="chevron-forward" size={16} color="#3B82F6" />
            </TouchableOpacity>
          </View>

          {selectedSite.concepts.map((concept, index) => (
            <SiteConceptCard
              key={index}
              concept={concept}
              onConfirm={handleConceptConfirm}
              onReject={handleConceptReject}
            />
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Ionicons name="business" size={20} color="#3B82F6" />
        <Text style={styles.title}>Sitios Activos</Text>
      </View>
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
    marginLeft: 8,
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  conceptsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    color: '#3B82F6',
    marginRight: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
});
