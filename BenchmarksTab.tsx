import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { ConstructionConcept, BenchmarkingMetrics } from '../types';
import { ConceptBenchmarkService } from '../services/ConceptBenchmarkService';
import { ConceptPerformancePanel } from './ConceptPerformancePanel';

interface BenchmarksTabProps {
  contractorId: string;
}

export const BenchmarksTab: React.FC<BenchmarksTabProps> = ({ contractorId }) => {
  const [concepts, setConcepts] = useState<ConstructionConcept[]>([]);
  const [selectedConcept, setSelectedConcept] = useState<ConstructionConcept | null>(null);
  const [industryAverages, setIndustryAverages] = useState<BenchmarkingMetrics | null>(null);
  const [filters, setFilters] = useState({
    conceptType: '',
    dateRange: '',
    crew: ''
  });
  const [sortBy, setSortBy] = useState<'name' | 'output_rate' | 'cost_per_unit' | 'duration'>('name');

  useEffect(() => {
    loadConcepts();
  }, [contractorId]);

  const loadConcepts = async () => {
    // Mock data - in real app, fetch from API
    const mockConcepts: ConstructionConcept[] = [
      {
        id: '1',
        name: 'Foundation Pour - Building A',
        description: 'Concrete foundation work',
        trade: 'concrete',
        tags: ['foundation', 'concrete'],
        phases: [],
        total_volume: 150,
        unit: 'm²',
        estimated_duration: 10,
        created_at: '2024-01-10',
        contractor_id: contractorId,
        status: 'completed',
        benchmarking_metrics: {
          unit_output_rate: 12.5,
          avg_worker_count: 4.5,
          cost_per_unit: 92.0,
          material_waste_pct: 7.2,
          completion_duration: 12,
          satisfaction_score: 4.2
        }
      },
      {
        id: '2',
        name: 'Framing - Building B',
        description: 'Wood framing construction',
        trade: 'framing',
        tags: ['framing', 'wood'],
        phases: [],
        total_volume: 200,
        unit: 'm²',
        estimated_duration: 8,
        created_at: '2024-01-15',
        contractor_id: contractorId,
        status: 'in_progress',
        benchmarking_metrics: {
          unit_output_rate: 15.2,
          avg_worker_count: 3.8,
          cost_per_unit: 88.5,
          material_waste_pct: 5.1,
          completion_duration: 7,
          satisfaction_score: 4.5
        }
      }
    ];

    setConcepts(mockConcepts);
  };

  const filteredAndSortedConcepts = concepts
    .filter(concept => {
      if (filters.conceptType && !concept.trade.includes(filters.conceptType)) return false;
      if (filters.crew && !concept.name.toLowerCase().includes(filters.crew.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'output_rate':
          return (b.benchmarking_metrics?.unit_output_rate || 0) - (a.benchmarking_metrics?.unit_output_rate || 0);
        case 'cost_per_unit':
          return (a.benchmarking_metrics?.cost_per_unit || 0) - (b.benchmarking_metrics?.cost_per_unit || 0);
        case 'duration':
          return (a.benchmarking_metrics?.completion_duration || 0) - (b.benchmarking_metrics?.completion_duration || 0);
        default:
          return a.name.localeCompare(b.name);
      }
    });

  const handleConceptSelect = async (concept: ConstructionConcept) => {
    setSelectedConcept(concept);
    const averages = await ConceptBenchmarkService.getIndustryAverages(concept.trade);
    setIndustryAverages(averages);
  };

  const renderConceptRow = (concept: ConstructionConcept) => {
    const metrics = concept.benchmarking_metrics;
    const badges = ConceptBenchmarkService.getBenchmarkBadges(concept);

    return (
      <TouchableOpacity
        key={concept.id}
        style={styles.conceptRow}
        onPress={() => handleConceptSelect(concept)}
      >
        <View style={styles.conceptInfo}>
          <Text style={styles.conceptName}>{concept.name}</Text>
          <Text style={styles.conceptTrade}>{concept.trade} • {concept.status}</Text>
          {badges.length > 0 && (
            <View style={styles.badgeRow}>
              {badges.map((badge, index) => (
                <Text key={index} style={styles.badgeText}>{badge}</Text>
              ))}
            </View>
          )}
        </View>
        <View style={styles.conceptMetrics}>
          {metrics && (
            <>
              <Text style={styles.metricText}>{metrics.unit_output_rate.toFixed(1)} {concept.unit}/day</Text>
              <Text style={styles.metricText}>${metrics.cost_per_unit.toFixed(0)}/{concept.unit}</Text>
              <Text style={styles.metricText}>{metrics.completion_duration} days</Text>
            </>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (selectedConcept) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => setSelectedConcept(null)}>
          <Text style={styles.backButtonText}>← Back to List</Text>
        </TouchableOpacity>
        <ConceptPerformancePanel concept={selectedConcept} industryAverages={industryAverages || undefined} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Concept Benchmarks</Text>
      
      {/* Filters */}
      <View style={styles.filtersContainer}>
        <TextInput
          style={styles.filterInput}
          placeholder="Filter by concept type"
          value={filters.conceptType}
          onChangeText={(text) => setFilters({...filters, conceptType: text})}
        />
        <TextInput
          style={styles.filterInput}
          placeholder="Filter by crew"
          value={filters.crew}
          onChangeText={(text) => setFilters({...filters, crew: text})}
        />
      </View>

      {/* Sort Options */}
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        {['name', 'output_rate', 'cost_per_unit', 'duration'].map((option) => (
          <TouchableOpacity
            key={option}
            style={[styles.sortButton, sortBy === option && styles.sortButtonActive]}
            onPress={() => setSortBy(option as any)}
          >
            <Text style={[styles.sortButtonText, sortBy === option && styles.sortButtonTextActive]}>
              {option.replace('_', ' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Concepts List */}
      <ScrollView style={styles.conceptsList}>
        {filteredAndSortedConcepts.map(renderConceptRow)}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333'
  },
  backButton: {
    marginBottom: 16
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600'
  },
  filtersContainer: {
    flexDirection: 'row',
    marginBottom: 16
  },
  filterInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    backgroundColor: 'white'
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  sortLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#e0e0e0',
    marginRight: 8
  },
  sortButtonActive: {
    backgroundColor: '#007AFF'
  },
  sortButtonText: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize'
  },
  sortButtonTextActive: {
    color: 'white'
  },
  conceptsList: {
    flex: 1
  },
  conceptRow: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  conceptInfo: {
    flex: 1
  },
  conceptName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4
  },
  conceptTrade: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  badgeText: {
    fontSize: 10,
    color: '#007AFF',
    marginRight: 8
  },
  conceptMetrics: {
    alignItems: 'flex-end'
  },
  metricText: {
    fontSize: 12,
    color: '#333',
    marginBottom: 2
  }
});