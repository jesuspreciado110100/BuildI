import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Site } from '../types';
import { PortfolioDashboardPanel } from './PortfolioDashboardPanel';
import { ExportPanel } from './ExportPanel';

interface PortfolioViewTabProps {
  contractorId: string;
}

const mockSites: Site[] = [
  {
    id: 'site-1',
    name: 'Downtown Plaza',
    location: 'New York, NY',
    region: 'Northeast',
    contractor_id: '1',
    status: 'active',
    total_budget: 2500000,
    spent_budget: 1800000,
    start_date: '2024-01-01',
    end_date: '2024-06-30',
    worker_count: 45,
    created_at: '2024-01-01T00:00:00Z',
    concepts: [
      {
        id: 'c1',
        name: 'Foundation Work',
        description: 'Excavation and concrete foundation',
        trade: 'Concrete',
        tags: ['foundation'],
        phases: [],
        total_volume: 100,
        unit: 'm³',
        estimated_duration: 14,
        created_at: '2024-01-01T00:00:00Z',
        contractor_id: '1',
        status: 'completed',
        benchmarking_metrics: {
          unit_output_rate: 12.5,
          avg_worker_count: 8,
          cost_per_unit: 150,
          material_waste_pct: 3.2,
          completion_duration: 14,
          satisfaction_score: 4.5
        }
      }
    ]
  },
  {
    id: 'site-2',
    name: 'Harbor Bridge',
    location: 'Boston, MA',
    region: 'Northeast',
    contractor_id: '1',
    status: 'active',
    total_budget: 4200000,
    spent_budget: 2100000,
    start_date: '2024-02-01',
    end_date: '2024-12-31',
    worker_count: 62,
    created_at: '2024-02-01T00:00:00Z',
    concepts: [
      {
        id: 'c2',
        name: 'Steel Framework',
        description: 'Structural steel installation',
        trade: 'Steel',
        tags: ['structural'],
        phases: [],
        total_volume: 80,
        unit: 'tons',
        estimated_duration: 21,
        created_at: '2024-02-01T00:00:00Z',
        contractor_id: '1',
        status: 'in_progress',
        delay_info: {
          planned_duration_days: 21,
          actual_duration_days: 25,
          delay_reason: ['Material delay', 'Weather'],
          is_delayed: true,
          delay_days: 4
        },
        benchmarking_metrics: {
          unit_output_rate: 8.2,
          avg_worker_count: 12,
          cost_per_unit: 2800,
          material_waste_pct: 2.1,
          completion_duration: 25,
          satisfaction_score: 4.2
        }
      }
    ]
  },
  {
    id: 'site-3',
    name: 'Westside Mall',
    location: 'Los Angeles, CA',
    region: 'West',
    contractor_id: '1',
    status: 'active',
    total_budget: 3800000,
    spent_budget: 3200000,
    start_date: '2024-03-01',
    end_date: '2024-09-30',
    worker_count: 38,
    created_at: '2024-03-01T00:00:00Z',
    concepts: [
      {
        id: 'c3',
        name: 'Interior Finishing',
        description: 'Drywall and flooring installation',
        trade: 'Finishing',
        tags: ['interior'],
        phases: [],
        total_volume: 5000,
        unit: 'm²',
        estimated_duration: 30,
        created_at: '2024-03-01T00:00:00Z',
        contractor_id: '1',
        status: 'in_progress',
        benchmarking_metrics: {
          unit_output_rate: 45.8,
          avg_worker_count: 15,
          cost_per_unit: 85,
          material_waste_pct: 4.1,
          completion_duration: 28,
          satisfaction_score: 4.7
        }
      }
    ]
  }
];

export const PortfolioViewTab: React.FC<PortfolioViewTabProps> = ({ contractorId }) => {
  const [sites, setSites] = useState<Site[]>(mockSites);
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedSite, setSelectedSite] = useState<string>('all');
  const [showExportPanel, setShowExportPanel] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedSitesForComparison, setSelectedSitesForComparison] = useState<string[]>([]);

  const regions = ['all', ...Array.from(new Set(sites.map(site => site.region)))];
  const siteOptions = ['all', ...sites.map(site => ({ id: site.id, name: site.name }))];

  const handleExport = (format: 'pdf' | 'excel') => {
    Alert.alert('Export', `Exporting portfolio data as ${format.toUpperCase()}...`);
    setShowExportPanel(false);
  };

  const toggleSiteComparison = (siteId: string) => {
    if (selectedSitesForComparison.includes(siteId)) {
      setSelectedSitesForComparison(prev => prev.filter(id => id !== siteId));
    } else if (selectedSitesForComparison.length < 4) {
      setSelectedSitesForComparison(prev => [...prev, siteId]);
    } else {
      Alert.alert('Limit Reached', 'You can compare up to 4 sites at once.');
    }
  };

  const renderFilterControls = () => (
    <View style={styles.filterContainer}>
      <Text style={styles.filterLabel}>Region:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        {regions.map(region => (
          <TouchableOpacity
            key={region}
            style={[styles.filterButton, selectedRegion === region && styles.activeFilter]}
            onPress={() => setSelectedRegion(region)}
          >
            <Text style={[styles.filterText, selectedRegion === region && styles.activeFilterText]}>
              {region === 'all' ? 'All Regions' : region}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <Text style={styles.filterLabel}>Site:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        {siteOptions.map(option => {
          const siteId = typeof option === 'string' ? option : option.id;
          const siteName = typeof option === 'string' ? 'All Sites' : option.name;
          return (
            <TouchableOpacity
              key={siteId}
              style={[styles.filterButton, selectedSite === siteId && styles.activeFilter]}
              onPress={() => setSelectedSite(siteId)}
            >
              <Text style={[styles.filterText, selectedSite === siteId && styles.activeFilterText]}>
                {siteName}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  const renderComparisonControls = () => (
    <View style={styles.comparisonContainer}>
      <View style={styles.comparisonHeader}>
        <TouchableOpacity
          style={[styles.toggleButton, compareMode && styles.activeToggle]}
          onPress={() => setCompareMode(!compareMode)}
        >
          <Text style={[styles.toggleText, compareMode && styles.activeToggleText]}>Compare Sites</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.exportButton} onPress={() => setShowExportPanel(true)}>
          <Text style={styles.exportText}>Export</Text>
        </TouchableOpacity>
      </View>
      
      {compareMode && (
        <View style={styles.siteSelectionContainer}>
          <Text style={styles.comparisonLabel}>Select sites to compare (max 4):</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {sites.map(site => (
              <TouchableOpacity
                key={site.id}
                style={[
                  styles.siteComparisonButton,
                  selectedSitesForComparison.includes(site.id) && styles.selectedSiteButton
                ]}
                onPress={() => toggleSiteComparison(site.id)}
              >
                <Text style={[
                  styles.siteComparisonText,
                  selectedSitesForComparison.includes(site.id) && styles.selectedSiteText
                ]}>
                  {site.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );

  const getFilteredSites = () => {
    if (compareMode && selectedSitesForComparison.length > 0) {
      return sites.filter(site => selectedSitesForComparison.includes(site.id));
    }
    return sites;
  };

  return (
    <View style={styles.container}>
      {renderFilterControls()}
      {renderComparisonControls()}
      
      <PortfolioDashboardPanel
        sites={getFilteredSites()}
        selectedRegion={selectedRegion}
        selectedSite={selectedSite}
      />
      
      {showExportPanel && (
        <ExportPanel
          visible={showExportPanel}
          onClose={() => setShowExportPanel(false)}
          onExport={handleExport}
          title="Portfolio Performance Report"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  filterContainer: { backgroundColor: 'white', padding: 16, marginBottom: 8 },
  filterLabel: { fontSize: 14, fontWeight: 'bold', marginBottom: 8, color: '#333' },
  filterScroll: { marginBottom: 12 },
  filterButton: { backgroundColor: '#f0f0f0', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginRight: 8 },
  activeFilter: { backgroundColor: '#007AFF' },
  filterText: { fontSize: 12, color: '#666' },
  activeFilterText: { color: 'white' },
  comparisonContainer: { backgroundColor: 'white', padding: 16, marginBottom: 8 },
  comparisonHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  toggleButton: { backgroundColor: '#f0f0f0', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  activeToggle: { backgroundColor: '#007AFF' },
  toggleText: { fontSize: 14, color: '#666' },
  activeToggleText: { color: 'white' },
  exportButton: { backgroundColor: '#28a745', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  exportText: { fontSize: 14, color: 'white', fontWeight: 'bold' },
  siteSelectionContainer: { marginTop: 12 },
  comparisonLabel: { fontSize: 12, color: '#666', marginBottom: 8 },
  siteComparisonButton: { backgroundColor: '#f0f0f0', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginRight: 8 },
  selectedSiteButton: { backgroundColor: '#007AFF' },
  siteComparisonText: { fontSize: 12, color: '#666' },
  selectedSiteText: { color: 'white' }
});