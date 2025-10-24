import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ConceptCatalogModal from './ConceptCatalogModal';
import { supabase } from '@/app/lib/supabase';

interface CostBreakdown {
  labor: number;
  machinery: number;
  materials: number;
  total: number;
}

export default function ConceptCostCalculator() {
  const [showCatalog, setShowCatalog] = useState(false);
  const [selectedConcept, setSelectedConcept] = useState<any>(null);
  const [costBreakdown, setCostBreakdown] = useState<CostBreakdown>({
    labor: 0,
    machinery: 0,
    materials: 0,
    total: 0
  });
  const [loading, setLoading] = useState(false);

  const calculateDirectCosts = async (catalogItemId: string) => {
    setLoading(true);
    try {
      // Fetch costs from all three tables
      const [laborResult, machineryResult, materialResult] = await Promise.all([
        supabase.from('labor_cost').select('total_cost').eq('catalog_item_id', catalogItemId),
        supabase.from('machinery_cost').select('total_cost').eq('catalog_item_id', catalogItemId),
        supabase.from('material_cost').select('total_cost').eq('catalog_item_id', catalogItemId)
      ]);

      const laborTotal = laborResult.data?.reduce((sum, item) => sum + (item.total_cost || 0), 0) || 0;
      const machineryTotal = machineryResult.data?.reduce((sum, item) => sum + (item.total_cost || 0), 0) || 0;
      const materialTotal = materialResult.data?.reduce((sum, item) => sum + (item.total_cost || 0), 0) || 0;

      const breakdown = {
        labor: laborTotal,
        machinery: machineryTotal,
        materials: materialTotal,
        total: laborTotal + machineryTotal + materialTotal
      };

      setCostBreakdown(breakdown);
    } catch (error) {
      console.error('Error calculating costs:', error);
      Alert.alert('Error', 'Failed to calculate direct costs');
    } finally {
      setLoading(false);
    }
  };

  const handleConceptSelect = (concept: any) => {
    setSelectedConcept(concept);
    calculateDirectCosts(concept.item_id);
  };
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="calculator" size={20} color="#2196F3" />
        <Text style={styles.title}>Concept Cost Calculator</Text>
        <TouchableOpacity 
          style={styles.catalogButton}
          onPress={() => setShowCatalog(true)}
        >
          <Ionicons name="list" size={16} color="#2196F3" />
          <Text style={styles.catalogButtonText}>Browse Catalog</Text>
        </TouchableOpacity>
      </View>

      {selectedConcept ? (
        <View style={styles.costBreakdown}>
          <View style={styles.conceptInfo}>
            <Text style={styles.conceptName}>{selectedConcept.name || selectedConcept.description}</Text>
            <Text style={styles.conceptUnit}>Unit: {selectedConcept.unit}</Text>
            <Text style={styles.conceptQuantity}>Quantity: {selectedConcept.quantity}</Text>
          </View>

          <View style={styles.costSection}>
            <Text style={styles.sectionTitle}>Direct Costs Breakdown</Text>
            <View style={styles.costItem}>
              <Text style={styles.costLabel}>Labor Costs</Text>
              <Text style={styles.costValue}>${costBreakdown.labor.toFixed(2)}</Text>
            </View>
            <View style={styles.costItem}>
              <Text style={styles.costLabel}>Machinery Costs</Text>
              <Text style={styles.costValue}>${costBreakdown.machinery.toFixed(2)}</Text>
            </View>
            <View style={styles.costItem}>
              <Text style={styles.costLabel}>Material Costs</Text>
              <Text style={styles.costValue}>${costBreakdown.materials.toFixed(2)}</Text>
            </View>
          </View>

          <View style={styles.totalSection}>
            <Text style={styles.totalLabel}>Total Direct Cost</Text>
            <Text style={styles.totalValue}>${costBreakdown.total.toFixed(2)}</Text>
          </View>

          {loading && (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Calculating costs...</Text>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="calculator-outline" size={48} color="#ccc" />
          <Text style={styles.emptyStateText}>Select a concept to calculate costs</Text>
          <TouchableOpacity 
            style={styles.browseCatalogButton}
            onPress={() => setShowCatalog(true)}
          >
            <Text style={styles.browseCatalogButtonText}>Browse Catalog</Text>
          </TouchableOpacity>
        </View>
      )}

      <ConceptCatalogModal
        visible={showCatalog}
        onClose={() => setShowCatalog(false)}
        onConceptSelect={handleConceptSelect}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  title: { fontSize: 16, fontWeight: '600', color: '#333', marginLeft: 8, flex: 1 },
  catalogButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e3f2fd', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  catalogButtonText: { fontSize: 12, color: '#2196F3', marginLeft: 4, fontWeight: '500' },
  costBreakdown: { padding: 16 },
  conceptInfo: { backgroundColor: '#f8f9fa', padding: 12, borderRadius: 8, marginBottom: 16 },
  conceptName: { fontSize: 16, fontWeight: '600', color: '#333' },
  conceptUnit: { fontSize: 12, color: '#666', marginTop: 4 },
  conceptQuantity: { fontSize: 12, color: '#666', marginTop: 2 },
  costSection: { marginBottom: 16 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 12 },
  costItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#f9f9f9', borderRadius: 6, marginBottom: 4 },
  costLabel: { fontSize: 13, color: '#555' },
  costValue: { fontSize: 13, fontWeight: '500', color: '#333' },
  totalSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#e8f5e8', borderRadius: 8 },
  totalLabel: { fontSize: 14, fontWeight: '600', color: '#2e7d32' },
  totalValue: { fontSize: 16, fontWeight: '700', color: '#2e7d32' },
  loadingContainer: { alignItems: 'center', padding: 20 },
  loadingText: { fontSize: 12, color: '#666' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyStateText: { fontSize: 14, color: '#999', marginTop: 16, textAlign: 'center' },
  browseCatalogButton: { backgroundColor: '#2196F3', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, marginTop: 16 },
  browseCatalogButtonText: { color: '#fff', fontSize: 14, fontWeight: '500' }
});