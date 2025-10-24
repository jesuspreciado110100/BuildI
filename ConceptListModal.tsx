import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/app/lib/supabase';

interface Concept {
  item_id: string;
  name: string;
  description: string;
  total_cost: number;
  status: string;
  unit: string;
  quantity: number;
}

interface ConceptListModalProps {
  visible: boolean;
  onClose: () => void;
  projectId?: string;
  projectName: string;
}

export default function ConceptListModal({ visible, onClose, projectId, projectName }: ConceptListModalProps) {
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && projectId) {
      fetchConcepts();
    }
  }, [visible, projectId]);

  const fetchConcepts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('catalog_items')
        .select('*')
        .order('name');

      if (error) throw error;
      setConcepts(data || []);
    } catch (error) {
      console.error('Error fetching concepts:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderConcept = ({ item }: { item: Concept }) => (
    <View style={styles.conceptCard}>
      <View style={styles.conceptHeader}>
        <Text style={styles.conceptName}>{item.name || item.description}</Text>
        <Text style={styles.conceptCost}>${item.total_cost?.toFixed(2) || '0.00'}</Text>
      </View>
      <Text style={styles.conceptDescription}>{item.description}</Text>
      <View style={styles.conceptFooter}>
        <Text style={styles.conceptQuantity}>{item.quantity} {item.unit}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
    </View>
  );

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return '#4CAF50';
      case 'in_progress': return '#FF9800';
      case 'pending': return '#9E9E9E';
      default: return '#2196F3';
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{projectName} Concepts</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={concepts}
          renderItem={renderConcept}
          keyExtractor={(item) => item.item_id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  title: { fontSize: 18, fontWeight: '600', color: '#333' },
  closeButton: { padding: 8 },
  listContainer: { padding: 16 },
  conceptCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  conceptHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  conceptName: { fontSize: 16, fontWeight: '600', color: '#333', flex: 1 },
  conceptCost: { fontSize: 16, fontWeight: '700', color: '#2196F3' },
  conceptDescription: { fontSize: 14, color: '#666', marginBottom: 12 },
  conceptFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  conceptQuantity: { fontSize: 12, color: '#999' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 10, fontWeight: '600', color: '#fff' }
});