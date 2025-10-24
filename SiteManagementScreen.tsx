import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AddSiteModal } from './modals/AddSiteModal';
import { EditSiteDetailsModal } from './EditSiteDetailsModal';
import { EnhancedTeamMembersTab } from './EnhancedTeamMembersTab';
import { ConceptManagementModal } from './ConceptManagementModal';
import { EnhancedConceptProgressTracker } from './EnhancedConceptProgressTracker';
import { router } from 'expo-router';
interface Site {
  id: string;
  name: string;
  location: string;
  description?: string;
  status: 'active' | 'completed' | 'planning';
  budget?: number;
  region?: string;
}

export const SiteManagementScreen: React.FC = () => {
  const [sites, setSites] = useState<Site[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showConceptModal, setShowConceptModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAddSite = (siteData: Partial<Site>) => {
    const newSite: Site = {
      id: Date.now().toString(),
      name: siteData.name || '',
      location: siteData.location || '',
      description: siteData.description,
      status: 'planning',
      budget: siteData.budget,
      region: siteData.region,
    };
    setSites([...sites, newSite]);
    setShowAddModal(false);
    Alert.alert('Éxito', 'Sitio creado exitosamente');
  };

  const handleEditSite = (updatedSite: Site) => {
    setSites(prev => prev.map(site => 
      site.id === updatedSite.id ? updatedSite : site
    ));
    setShowEditModal(false);
    Alert.alert('Éxito', 'Sitio actualizado exitosamente');
  };

  const openEditModal = (site: Site) => {
    setSelectedSite(site);
    setShowEditModal(true);
  };

  const handleSitePress = (siteId: string) => {
    router.push(`/contractor/sites/${siteId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'completed': return '#3b82f6';
      case 'planning': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'completed': return 'Completado';
      case 'planning': return 'Planificación';
      default: return status;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando sitios...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🏗️ Mis Sitios</Text>
        <Text style={styles.subtitle}>Gestiona todos tus proyectos de construcción</Text>
        
        <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
          <Text style={styles.addButtonIcon}>➕</Text>
          <Text style={styles.addButtonText}>Nuevo Sitio</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{sites.length}</Text>
          <Text style={styles.statLabel}>Total Sitios</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{sites.filter(s => s.status === 'active').length}</Text>
          <Text style={styles.statLabel}>Activos</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{sites.filter(s => s.status === 'completed').length}</Text>
          <Text style={styles.statLabel}>Completados</Text>
        </View>
      </View>

      <ScrollView style={styles.sitesList}>
        {sites.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🏗️</Text>
            <Text style={styles.emptyTitle}>No hay sitios aún</Text>
            <Text style={styles.emptyText}>Crea tu primer sitio para comenzar a gestionar tus proyectos</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={() => setShowAddModal(true)}>
              <Text style={styles.emptyButtonText}>Crear Primer Sitio</Text>
            </TouchableOpacity>
          </View>
        ) : (
          sites.map((site) => (
            <View key={site.id} style={styles.siteCard}>
              <TouchableOpacity onPress={() => handleSitePress(site.id)}>
                <View style={styles.siteHeader}>
                  <View style={styles.siteInfo}>
                    <Text style={styles.siteName}>{site.name}</Text>
                    <Text style={styles.siteLocation}>📍 {site.location}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(site.status) }]}>
                    <Text style={styles.statusText}>{getStatusLabel(site.status)}</Text>
                  </View>
                </View>
                
                {site.description && (
                  <Text style={styles.siteDescription}>{site.description}</Text>
                )}
                
                <View style={styles.siteFooter}>
                  <View style={styles.siteDetails}>
                    {site.budget && (
                      <Text style={styles.budget}>💰 ${site.budget.toLocaleString()}</Text>
                    )}
                    {site.region && (
                      <Text style={styles.region}>🌍 {site.region}</Text>
                    )}
                  </View>
                  <Text style={styles.viewMore}>Ver detalles →</Text>
                </View>
              </TouchableOpacity>

              <View style={styles.quickActions}>
                <TouchableOpacity
                  onPress={() => openEditModal(site)}
                  style={styles.actionButton}
                >
                  <Ionicons name="pencil" size={16} color="#0ea5e9" />
                  <Text style={styles.actionButtonText}>Editar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setShowTeamModal(true)}
                  style={[styles.actionButton, styles.teamButton]}
                >
                  <Ionicons name="people" size={16} color="#16a34a" />
                  <Text style={[styles.actionButtonText, styles.teamButtonText]}>Equipo</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setShowConceptModal(true)}
                  style={[styles.actionButton, styles.conceptButton]}
                >
                  <Ionicons name="list" size={16} color="#d97706" />
                  <Text style={[styles.actionButtonText, styles.conceptButtonText]}>Conceptos</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <AddSiteModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddSite}
      />

      <EditSiteDetailsModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        site={selectedSite}
        onSave={handleEditSite}
      />

      <ConceptManagementModal
        visible={showConceptModal}
        onClose={() => setShowConceptModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16, color: '#6b7280' },
  header: { padding: 20, backgroundColor: 'white', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#1f2937', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#6b7280', marginBottom: 16 },
  addButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#3b82f6', padding: 12, borderRadius: 8 },
  addButtonIcon: { fontSize: 16, marginRight: 8, color: 'white' },
  addButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  statsContainer: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: 'white', padding: 16, borderRadius: 12, marginHorizontal: 4, alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: '700', color: '#3b82f6' },
  statLabel: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  sitesList: { flex: 1, paddingHorizontal: 16 },
  siteCard: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  siteHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  siteInfo: { flex: 1 },
  siteName: { fontSize: 18, fontWeight: '600', color: '#1f2937', marginBottom: 4 },
  siteLocation: { fontSize: 14, color: '#6b7280' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, color: 'white', fontWeight: '500' },
  siteDescription: { fontSize: 14, color: '#374151', marginBottom: 12, lineHeight: 20 },
  siteFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  siteDetails: { flex: 1 },
  budget: { fontSize: 14, color: '#10b981', fontWeight: '500', marginBottom: 2 },
  region: { fontSize: 14, color: '#6b7280' },
  viewMore: { fontSize: 14, color: '#3b82f6', fontWeight: '500' },
  emptyState: { alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: '#1f2937', marginBottom: 8 },
  emptyText: { fontSize: 16, color: '#6b7280', textAlign: 'center', marginBottom: 24, lineHeight: 24 },
  emptyButton: { backgroundColor: '#3b82f6', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  emptyButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  quickActions: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  actionButton: { flexDirection: 'row', alignItems: 'center', padding: 8, backgroundColor: '#f0f9ff', borderRadius: 6 },
  actionButtonText: { marginLeft: 4, color: '#0ea5e9', fontSize: 12, fontWeight: '600' },
  teamButton: { backgroundColor: '#f0fdf4' },
  teamButtonText: { color: '#16a34a' },
  conceptButton: { backgroundColor: '#fef3c7' },
  conceptButtonText: { color: '#d97706' }
});