import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/app/lib/supabase';
import { ConstructionType } from './ConstructionTypesCarousel';

interface Site {
  project_id: string;
  name: string;
  description: string;
  status: string;
  created_at: string;
  construction_type?: string;
}

interface ClientSitesListProps {
  selectedType?: any;
  constructionType?: ConstructionType | null;
  onSiteSelect: (site: Site) => void;
}

export function ClientSitesList({ selectedType, constructionType, onSiteSelect }: ClientSitesListProps) {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSites = async () => {
    try {
      let query = supabase
        .from('projects')
        .select('project_id, name, description, status, created_at, construction_type')
        .in('status', ['active', 'pending', 'completed']);

      // Filter by construction type if selected
      if (constructionType) {
        query = query.eq('construction_type', constructionType.id);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      setSites(data || []);
    } catch (error) {
      console.error('Error fetching sites:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSites();
  }, [selectedType, constructionType]);
  const renderSiteCard = ({ item }: { item: Site }) => (
    <TouchableOpacity 
      style={styles.siteCard}
      onPress={() => onSiteSelect(item)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.placeholderImage}>
          <Ionicons name="business-outline" size={24} color="#64748b" />
        </View>
        <View style={styles.siteInfo}>
          <Text style={styles.siteName}>{item.name}</Text>
          <Text style={styles.siteDescription}>{item.description || 'No description'}</Text>
        </View>
      </View>
      
      <View style={styles.cardFooter}>
        <Text style={styles.statusText}>Status: {item.status}</Text>
        <Ionicons name="chevron-forward" size={20} color="#64748b" />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading projects...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={sites}
        renderItem={renderSiteCard}
        keyExtractor={(item) => item.project_id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="business-outline" size={48} color="#cbd5e1" />
            <Text style={styles.emptyText}>No projects available</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { paddingVertical: 8 },
  siteCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: { flexDirection: 'row', marginBottom: 12 },
  placeholderImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  siteInfo: { flex: 1 },
  siteName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  siteDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  statusText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: { fontSize: 16, color: '#64748b' },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#475569',
    marginTop: 16,
  },
});