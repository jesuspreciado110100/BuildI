import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Concept, BookingRequest, MaterialBooking, LaborRequest } from '../types';

interface BudgetTrackerProps {
  concepts: Concept[];
  bookings: BookingRequest[];
  materialBookings: MaterialBooking[];
  laborRequests: LaborRequest[];
}

interface ConceptBudget {
  concept: Concept;
  plannedCost: number;
  bookedCost: number;
  progress: number;
  status: 'on_track' | 'under_progress' | 'over_budget';
}

export default function BudgetTracker({ concepts, bookings, materialBookings, laborRequests }: BudgetTrackerProps) {
  const [sortBy, setSortBy] = useState<'name' | 'cost' | 'progress'>('name');

  const calculateConceptBudgets = (): ConceptBudget[] => {
    return concepts.map(concept => {
      const plannedCost = concept.planned_quantity * concept.unit_price;
      
      // Calculate booked costs from all booking types
      const conceptBookings = bookings.filter(b => b.concept_id === concept.id);
      const conceptMaterials = materialBookings.filter(m => m.concept_id === concept.id);
      const conceptLabor = laborRequests.filter(l => l.concept_id === concept.id);
      
      const bookedCost = 
        conceptBookings.reduce((sum, b) => sum + b.price, 0) +
        conceptMaterials.reduce((sum, m) => sum + m.totalPrice, 0) +
        conceptLabor.reduce((sum, l) => sum + (l.dailyRate * l.workersNeeded), 0);
      
      const progress = concept.progress;
      
      let status: 'on_track' | 'under_progress' | 'over_budget' = 'on_track';
      if (bookedCost > plannedCost) {
        status = 'over_budget';
      } else if (progress < 50) {
        status = 'under_progress';
      }
      
      return {
        concept,
        plannedCost,
        bookedCost,
        progress,
        status
      };
    });
  };

  const budgets = calculateConceptBudgets();
  
  const sortedBudgets = [...budgets].sort((a, b) => {
    switch (sortBy) {
      case 'name': return a.concept.name.localeCompare(b.concept.name);
      case 'cost': return b.plannedCost - a.plannedCost;
      case 'progress': return b.progress - a.progress;
      default: return 0;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on_track': return '#16a34a';
      case 'under_progress': return '#ca8a04';
      case 'over_budget': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'on_track': return 'On Track';
      case 'under_progress': return 'Under Progress';
      case 'over_budget': return 'Over Budget';
      default: return 'Unknown';
    }
  };

  const exportToCSV = () => {
    const csvData = [
      ['Concept Name', 'Planned Cost', 'Booked Cost', 'Progress %', 'Status'],
      ...budgets.map(b => [
        b.concept.name,
        b.plannedCost.toFixed(2),
        b.bookedCost.toFixed(2),
        b.progress.toFixed(1),
        getStatusText(b.status)
      ])
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    Alert.alert('Export Ready', `CSV data prepared:\n${csvContent.substring(0, 200)}...`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Budget Tracker</Text>
        <TouchableOpacity style={styles.exportButton} onPress={exportToCSV}>
          <Text style={styles.exportButtonText}>📊 Export CSV</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        {['name', 'cost', 'progress'].map(option => (
          <TouchableOpacity
            key={option}
            style={[styles.sortButton, sortBy === option && styles.activeSortButton]}
            onPress={() => setSortBy(option as any)}
          >
            <Text style={[styles.sortButtonText, sortBy === option && styles.activeSortButtonText]}>
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content}>
        {sortedBudgets.map((budget) => (
          <View key={budget.concept.id} style={styles.budgetCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.conceptName}>{budget.concept.name}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(budget.status) }]}>
                <Text style={styles.statusText}>{getStatusText(budget.status)}</Text>
              </View>
            </View>
            
            <View style={styles.budgetRow}>
              <Text style={styles.budgetLabel}>Planned Cost:</Text>
              <Text style={styles.budgetValue}>${budget.plannedCost.toLocaleString()}</Text>
            </View>
            
            <View style={styles.budgetRow}>
              <Text style={styles.budgetLabel}>Booked Cost:</Text>
              <Text style={[styles.budgetValue, { color: budget.bookedCost > budget.plannedCost ? '#dc2626' : '#16a34a' }]}>
                ${budget.bookedCost.toLocaleString()}
              </Text>
            </View>
            
            <View style={styles.progressContainer}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Progress</Text>
                <Text style={styles.progressPercent}>{budget.progress.toFixed(1)}%</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${Math.min(budget.progress, 100)}%` }]} />
              </View>
            </View>
            
            {(budget.status === 'over_budget' || budget.progress < 50) && (
              <View style={styles.alertContainer}>
                <Text style={styles.alertText}>⚠️ 
                  {budget.status === 'over_budget' ? 'Budget exceeded!' : 'Progress below 50%'}
                </Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingBottom: 10 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1e293b' },
  exportButton: { backgroundColor: '#16a34a', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 },
  exportButtonText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  sortContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 16 },
  sortLabel: { fontSize: 14, color: '#6b7280', marginRight: 12 },
  sortButton: { backgroundColor: '#e5e7eb', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4, marginRight: 8 },
  activeSortButton: { backgroundColor: '#2563eb' },
  sortButtonText: { fontSize: 12, color: '#6b7280' },
  activeSortButtonText: { color: 'white' },
  content: { flex: 1, paddingHorizontal: 20 },
  budgetCard: { backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  conceptName: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', flex: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  budgetRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  budgetLabel: { fontSize: 14, color: '#6b7280' },
  budgetValue: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
  progressContainer: { marginTop: 12 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressLabel: { fontSize: 14, color: '#6b7280' },
  progressPercent: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
  progressBar: { height: 8, backgroundColor: '#e5e7eb', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#16a34a' },
  alertContainer: { marginTop: 12, padding: 8, backgroundColor: '#fef3c7', borderRadius: 6 },
  alertText: { fontSize: 12, color: '#92400e', fontWeight: '500' }
});