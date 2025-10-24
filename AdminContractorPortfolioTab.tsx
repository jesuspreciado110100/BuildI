import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { PortfolioService } from '../services/PortfolioService';
import { Site } from '../types';

interface ContractorPortfolioData {
  id: string;
  name: string;
  company: string;
  site_count: number;
  efficiency: number;
  labor_utilization: number;
  total_budget: number;
  active_sites: number;
  avg_delay_days: number;
}

const mockContractors: ContractorPortfolioData[] = [
  {
    id: '1',
    name: 'John Smith',
    company: 'Smith Construction',
    site_count: 5,
    efficiency: 94.2,
    labor_utilization: 87.5,
    total_budget: 12500000,
    active_sites: 3,
    avg_delay_days: 2.1
  },
  {
    id: '2',
    name: 'Maria Rodriguez',
    company: 'Rodriguez Builders',
    site_count: 8,
    efficiency: 91.8,
    labor_utilization: 92.3,
    total_budget: 18700000,
    active_sites: 6,
    avg_delay_days: 3.2
  },
  {
    id: '3',
    name: 'David Chen',
    company: 'Chen Development',
    site_count: 3,
    efficiency: 89.5,
    labor_utilization: 85.1,
    total_budget: 8900000,
    active_sites: 2,
    avg_delay_days: 4.5
  },
  {
    id: '4',
    name: 'Sarah Johnson',
    company: 'Johnson Infrastructure',
    site_count: 12,
    efficiency: 96.1,
    labor_utilization: 94.7,
    total_budget: 25300000,
    active_sites: 9,
    avg_delay_days: 1.8
  }
];

export const AdminContractorPortfolioTab: React.FC = () => {
  const [contractors, setContractors] = useState<ContractorPortfolioData[]>(mockContractors);
  const [sortBy, setSortBy] = useState<'site_count' | 'efficiency' | 'labor_utilization' | 'total_budget'>('efficiency');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContractor, setSelectedContractor] = useState<string | null>(null);

  const filteredContractors = contractors
    .filter(contractor => 
      contractor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contractor.company.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 95) return '#28a745';
    if (efficiency >= 90) return '#ffc107';
    return '#dc3545';
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return '#28a745';
    if (utilization >= 80) return '#ffc107';
    return '#dc3545';
  };

  const renderSortButton = (field: typeof sortBy, label: string) => (
    <TouchableOpacity
      style={[styles.sortButton, sortBy === field && styles.activeSortButton]}
      onPress={() => handleSort(field)}
    >
      <Text style={[styles.sortButtonText, sortBy === field && styles.activeSortButtonText]}>
        {label} {sortBy === field && (sortOrder === 'asc' ? '↑' : '↓')}
      </Text>
    </TouchableOpacity>
  );

  const renderContractorCard = (contractor: ContractorPortfolioData) => (
    <TouchableOpacity
      key={contractor.id}
      style={[
        styles.contractorCard,
        selectedContractor === contractor.id && styles.selectedContractorCard
      ]}
      onPress={() => setSelectedContractor(
        selectedContractor === contractor.id ? null : contractor.id
      )}
    >
      <View style={styles.contractorHeader}>
        <View style={styles.contractorInfo}>
          <Text style={styles.contractorName}>{contractor.name}</Text>
          <Text style={styles.contractorCompany}>{contractor.company}</Text>
        </View>
        <View style={styles.contractorMetrics}>
          <View style={styles.metricBadge}>
            <Text style={styles.metricValue}>{contractor.site_count}</Text>
            <Text style={styles.metricLabel}>Sites</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.contractorStats}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Efficiency</Text>
          <Text style={[styles.statValue, { color: getEfficiencyColor(contractor.efficiency) }]}>
            {contractor.efficiency.toFixed(1)}%
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Labor Utilization</Text>
          <Text style={[styles.statValue, { color: getUtilizationColor(contractor.labor_utilization) }]}>
            {contractor.labor_utilization.toFixed(1)}%
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Total Budget</Text>
          <Text style={styles.statValue}>
            ${(contractor.total_budget / 1000000).toFixed(1)}M
          </Text>
        </View>
      </View>
      
      {selectedContractor === contractor.id && (
        <View style={styles.contractorDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Active Sites:</Text>
            <Text style={styles.detailValue}>{contractor.active_sites}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Avg Delay Days:</Text>
            <Text style={[styles.detailValue, { color: contractor.avg_delay_days > 3 ? '#dc3545' : '#28a745' }]}>
              {contractor.avg_delay_days.toFixed(1)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Performance Rank:</Text>
            <Text style={styles.detailValue}>
              #{filteredContractors.findIndex(c => c.id === contractor.id) + 1}
            </Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderTopPerformers = () => {
    const topPerformers = filteredContractors.slice(0, 3);
    return (
      <View style={styles.topPerformersContainer}>
        <Text style={styles.sectionTitle}>🏆 Top Performers</Text>
        <View style={styles.topPerformersRow}>
          {topPerformers.map((contractor, index) => (
            <View key={contractor.id} style={styles.topPerformerCard}>
              <Text style={styles.topPerformerRank}>#{index + 1}</Text>
              <Text style={styles.topPerformerName}>{contractor.name}</Text>
              <Text style={styles.topPerformerCompany}>{contractor.company}</Text>
              <Text style={styles.topPerformerEfficiency}>
                {contractor.efficiency.toFixed(1)}% efficiency
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Contractor Portfolio Overview</Text>
      
      <TextInput
        style={styles.searchInput}
        placeholder="Search contractors..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {renderSortButton('site_count', 'Site Count')}
          {renderSortButton('efficiency', 'Efficiency')}
          {renderSortButton('labor_utilization', 'Labor Utilization')}
          {renderSortButton('total_budget', 'Total Budget')}
        </ScrollView>
      </View>
      
      <ScrollView style={styles.content}>
        {renderTopPerformers()}
        
        <View style={styles.contractorListContainer}>
          <Text style={styles.sectionTitle}>All Contractors ({filteredContractors.length})</Text>
          {filteredContractors.map(renderContractorCard)}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: '#333' },
  searchInput: { backgroundColor: 'white', padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 16 },
  sortContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  sortLabel: { fontSize: 14, fontWeight: 'bold', marginRight: 12, color: '#333' },
  sortButton: { backgroundColor: '#f0f0f0', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginRight: 8 },
  activeSortButton: { backgroundColor: '#007AFF' },
  sortButtonText: { fontSize: 12, color: '#666' },
  activeSortButtonText: { color: 'white' },
  content: { flex: 1 },
  topPerformersContainer: { backgroundColor: 'white', padding: 16, borderRadius: 8, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#333' },
  topPerformersRow: { flexDirection: 'row', justifyContent: 'space-between' },
  topPerformerCard: { flex: 1, backgroundColor: '#f8f9fa', padding: 12, borderRadius: 8, marginHorizontal: 4, alignItems: 'center' },
  topPerformerRank: { fontSize: 20, fontWeight: 'bold', color: '#007AFF', marginBottom: 4 },
  topPerformerName: { fontSize: 14, fontWeight: 'bold', color: '#333', textAlign: 'center' },
  topPerformerCompany: { fontSize: 12, color: '#666', textAlign: 'center', marginBottom: 4 },
  topPerformerEfficiency: { fontSize: 12, color: '#28a745', fontWeight: 'bold' },
  contractorListContainer: { backgroundColor: 'white', padding: 16, borderRadius: 8 },
  contractorCard: { backgroundColor: '#f8f9fa', padding: 16, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#e9ecef' },
  selectedContractorCard: { borderColor: '#007AFF', backgroundColor: '#f0f8ff' },
  contractorHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  contractorInfo: { flex: 1 },
  contractorName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  contractorCompany: { fontSize: 14, color: '#666' },
  contractorMetrics: { flexDirection: 'row' },
  metricBadge: { alignItems: 'center', backgroundColor: '#007AFF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  metricValue: { fontSize: 16, fontWeight: 'bold', color: 'white' },
  metricLabel: { fontSize: 10, color: 'white' },
  contractorStats: { flexDirection: 'row', justifyContent: 'space-between' },
  statItem: { alignItems: 'center' },
  statLabel: { fontSize: 12, color: '#666', marginBottom: 4 },
  statValue: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  contractorDetails: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#e9ecef' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  detailLabel: { fontSize: 14, color: '#666' },
  detailValue: { fontSize: 14, fontWeight: 'bold', color: '#333' }
});