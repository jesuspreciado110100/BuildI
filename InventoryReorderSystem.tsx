import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { MaterialItem } from '../types';
import { InventoryAnalyticsService, InventoryAnalysis } from '../services/InventoryAnalyticsService';
import { NotificationService } from '../services/NotificationService';

interface InventoryReorderSystemProps {
  supplierId: string;
}

export const InventoryReorderSystem: React.FC<InventoryReorderSystemProps> = ({ supplierId }) => {
  const [analyses, setAnalyses] = useState<InventoryAnalysis[]>([]);
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'safe' | 'low' | 'urgent'>('all');

  useEffect(() => {
    loadInventoryData();
    // Simulate daily check
    NotificationService.checkInventoryDaily(supplierId);
  }, [supplierId]);

  const loadInventoryData = async () => {
    try {
      setLoading(true);
      const inventoryAnalyses = await InventoryAnalyticsService.analyzeInventory(supplierId);
      setAnalyses(inventoryAnalyses);
      
      // Mock materials data
      const mockMaterials: MaterialItem[] = [
        {
          id: 'm1',
          supplier_id: supplierId,
          name: 'Concrete Mix',
          category: 'Building Materials',
          unit_price: 50,
          unit_type: 'cubic_yard',
          stock_quantity: 500,
          perishable: false,
          lead_time_days: 7,
          rating: 4.5,
          created_at: '2024-01-01T00:00:00Z',
          reorder_threshold: 100,
          auto_reorder_enabled: true,
          reorder_prediction: '',
          reorder_status: 'safe'
        },
        {
          id: 'm2',
          supplier_id: supplierId,
          name: 'Steel Rebar',
          category: 'Structural',
          unit_price: 2.5,
          unit_type: 'pound',
          stock_quantity: 50,
          perishable: false,
          lead_time_days: 14,
          rating: 4.8,
          created_at: '2024-01-01T00:00:00Z',
          reorder_threshold: 200,
          auto_reorder_enabled: false,
          reorder_prediction: '',
          reorder_status: 'urgent'
        }
      ];
      setMaterials(mockMaterials);
    } catch (error) {
      console.error('Error loading inventory data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReorder = (material: MaterialItem, analysis: InventoryAnalysis) => {
    const suggestedQty = Math.ceil((analysis.avg_weekly_demand / 7) * 30 + material.reorder_threshold);
    Alert.alert(
      'Create Reorder',
      `Create supplier order for ${suggestedQty} ${material.unit_type} of ${material.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Create', onPress: () => {
          Alert.alert('Success', 'Reorder created successfully!');
        }}
      ]
    );
  };

  const getFilteredData = () => {
    if (filterStatus === 'all') return analyses;
    return analyses.filter(a => a.reorder_status === filterStatus);
  };

  const getStatusColor = (status: 'safe' | 'low' | 'urgent') => {
    switch (status) {
      case 'safe': return '#4CAF50';
      case 'low': return '#FF9800';
      case 'urgent': return '#F44336';
    }
  };

  const renderInventoryItem = ({ item }: { item: InventoryAnalysis }) => {
    const material = materials.find(m => m.id === item.material_id);
    if (!material) return null;

    return (
      <View style={styles.inventoryItem}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemName}>{material.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.reorder_status) }]}>
            <Text style={styles.statusText}>{item.reorder_status.toUpperCase()}</Text>
          </View>
        </View>
        
        <Text style={styles.itemCategory}>{material.category} • {material.unit_type}</Text>
        
        <View style={styles.itemStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Stock</Text>
            <Text style={styles.statValue}>{item.current_stock}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Days Left</Text>
            <Text style={styles.statValue}>{item.predicted_days_left}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Weekly Demand</Text>
            <Text style={styles.statValue}>{item.avg_weekly_demand}</Text>
          </View>
        </View>
        
        <Text style={styles.prediction}>{item.reorder_prediction}</Text>
        
        {item.reorder_status !== 'safe' && (
          <TouchableOpacity
            style={[styles.reorderButton, { backgroundColor: getStatusColor(item.reorder_status) }]}
            onPress={() => handleCreateReorder(material, item)}
          >
            <Text style={styles.reorderButtonText}>Create Reorder</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading inventory analysis...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.filtersContainer}>
        <Text style={styles.filterLabel}>Filter:</Text>
        {(['all', 'urgent', 'low', 'safe'] as const).map(status => (
          <TouchableOpacity
            key={status}
            style={[styles.filterButton, filterStatus === status && styles.activeFilter]}
            onPress={() => setFilterStatus(status)}
          >
            <Text style={[styles.filterText, filterStatus === status && styles.activeFilterText]}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={getFilteredData()}
        renderItem={renderInventoryItem}
        keyExtractor={(item) => item.material_id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  filtersContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  filterLabel: { fontSize: 14, fontWeight: '600', marginRight: 12 },
  filterButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#f0f0f0', marginRight: 8 },
  activeFilter: { backgroundColor: '#2196F3' },
  filterText: { fontSize: 12, color: '#666' },
  activeFilterText: { color: 'white' },
  listContainer: { padding: 16 },
  inventoryItem: { backgroundColor: 'white', padding: 16, borderRadius: 8, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  itemName: { fontSize: 16, fontWeight: '600', flex: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: 'white', fontSize: 10, fontWeight: '600' },
  itemCategory: { fontSize: 12, color: '#666', marginBottom: 12 },
  itemStats: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  statItem: { flex: 1, alignItems: 'center' },
  statLabel: { fontSize: 10, color: '#999', marginBottom: 2 },
  statValue: { fontSize: 14, fontWeight: '600' },
  prediction: { fontSize: 12, color: '#666', fontStyle: 'italic', marginBottom: 12 },
  reorderButton: { padding: 12, borderRadius: 6, alignItems: 'center' },
  reorderButtonText: { color: 'white', fontSize: 14, fontWeight: '600' }
});