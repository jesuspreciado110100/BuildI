import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { UserService, WorkConcept } from '../services/UserService';

export const WorkConceptsTab: React.FC = () => {
  const [workConcepts, setWorkConcepts] = useState<WorkConcept[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadWorkConcepts();
  }, []);

  const loadWorkConcepts = async () => {
    const concepts = await UserService.getWorkConcepts('1'); // Alfonso's site
    setWorkConcepts(concepts);
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'in_progress': return '#f59e0b';
      case 'pending': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completado';
      case 'in_progress': return 'En Progreso';
      case 'pending': return 'Pendiente';
      default: return status;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Preliminares': return '📐';
      case 'Cimentación': return '🏗️';
      case 'Albañilería': return '🧱';
      case 'Estructura': return '⚡';
      default: return '📋';
    }
  };

  const categories = ['all', ...Array.from(new Set(workConcepts.map(c => c.category)))];
  const filteredConcepts = selectedCategory === 'all' 
    ? workConcepts 
    : workConcepts.filter(c => c.category === selectedCategory);

  const totalValue = workConcepts.reduce((sum, concept) => sum + concept.total_price_mxn, 0);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando conceptos...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📋 Conceptos de Obra</Text>
        <Text style={styles.subtitle}>Auditorio Cívico</Text>
        <Text style={styles.totalValue}>
          Valor Total: ${totalValue.toLocaleString('es-MX')} MXN
        </Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryFilter}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.categoryButtonActive
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={[
              styles.categoryButtonText,
              selectedCategory === category && styles.categoryButtonTextActive
            ]}>
              {category === 'all' ? 'Todos' : category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.conceptsContainer}>
        {filteredConcepts.map((concept, index) => (
          <View key={index} style={styles.conceptCard}>
            <View style={styles.conceptHeader}>
              <View style={styles.conceptInfo}>
                <Text style={styles.conceptIcon}>
                  {getCategoryIcon(concept.category)}
                </Text>
                <View style={styles.conceptDetails}>
                  <Text style={styles.conceptCode}>{concept.item_code}</Text>
                  <Text style={styles.conceptCategory}>{concept.category}</Text>
                </View>
              </View>
              <View 
                style={[styles.statusBadge, { backgroundColor: getStatusColor(concept.status) }]}
              >
                <Text style={styles.statusText}>
                  {getStatusText(concept.status)}
                </Text>
              </View>
            </View>

            <Text style={styles.conceptDescription} numberOfLines={2}>
              {concept.description}
            </Text>

            <View style={styles.conceptMetrics}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Cantidad</Text>
                <Text style={styles.metricValue}>
                  {concept.quantity.toLocaleString()} {concept.unit}
                </Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Precio Unitario</Text>
                <Text style={styles.metricValue}>
                  ${concept.unit_price_mxn.toLocaleString()} MXN
                </Text>
              </View>
            </View>

            <View style={styles.conceptFooter}>
              <Text style={styles.totalPrice}>
                Total: ${concept.total_price_mxn.toLocaleString('es-MX')} MXN
              </Text>
              <TouchableOpacity style={styles.detailsButton}>
                <Text style={styles.detailsButtonText}>Ver Detalles</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16, color: '#6b7280', fontFamily: 'System' },
  header: { padding: 20, backgroundColor: 'white', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#1f2937', marginBottom: 4, fontFamily: 'System' },
  subtitle: { fontSize: 14, color: '#6b7280', marginBottom: 8, fontFamily: 'System' },
  totalValue: { fontSize: 18, fontWeight: '600', color: '#10b981', fontFamily: 'System' },
  categoryFilter: { paddingHorizontal: 16, marginBottom: 16 },
  categoryButton: { backgroundColor: '#e5e7eb', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
  categoryButtonActive: { backgroundColor: '#3b82f6' },
  categoryButtonText: { fontSize: 14, color: '#374151', fontFamily: 'System' },
  categoryButtonTextActive: { color: 'white' },
  conceptsContainer: { paddingHorizontal: 16 },
  conceptCard: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  conceptHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  conceptInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  conceptIcon: { fontSize: 24, marginRight: 12 },
  conceptDetails: { flex: 1 },
  conceptCode: { fontSize: 16, fontWeight: '600', color: '#1f2937', fontFamily: 'System' },
  conceptCategory: { fontSize: 12, color: '#6b7280', marginTop: 2, fontFamily: 'System' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, color: 'white', fontWeight: '500', fontFamily: 'System' },
  conceptDescription: { fontSize: 14, color: '#374151', marginBottom: 12, lineHeight: 20, fontFamily: 'System' },
  conceptMetrics: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  metricItem: { flex: 1 },
  metricLabel: { fontSize: 12, color: '#6b7280', marginBottom: 4, fontFamily: 'System' },
  metricValue: { fontSize: 14, fontWeight: '500', color: '#1f2937', fontFamily: 'System' },
  conceptFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 12 },
  totalPrice: { fontSize: 16, fontWeight: '600', color: '#10b981', fontFamily: 'System' },
  detailsButton: { backgroundColor: '#3b82f6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  detailsButtonText: { color: 'white', fontSize: 12, fontWeight: '500', fontFamily: 'System' }
});