import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { CostForecast, Concept, Site } from '../types';
import CostRiskCard from './CostRiskCard';
import CostForecastService from '../services/CostForecastService';

interface CostForecastPanelProps {
  concepts: Concept[];
  sites: Site[];
}

const CostForecastPanel: React.FC<CostForecastPanelProps> = ({ concepts, sites }) => {
  const [forecasts, setForecasts] = useState<CostForecast[]>([]);
  const [selectedSite, setSelectedSite] = useState<string>('all');
  const [selectedTrade, setSelectedTrade] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadForecasts();
  }, [concepts, sites, selectedSite]);

  const loadForecasts = async () => {
    setLoading(true);
    try {
      const allForecasts: CostForecast[] = [];
      
      for (const site of sites) {
        if (selectedSite === 'all' || site.id === selectedSite) {
          const siteForecasts = await CostForecastService.getCostForecasts(site.id, concepts, site);
          allForecasts.push(...siteForecasts);
        }
      }
      
      setForecasts(allForecasts);
    } catch (error) {
      console.error('Error loading forecasts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredForecasts = () => {
    return forecasts.filter(forecast => {
      const concept = concepts.find(c => c.id === forecast.concept_id);
      if (!concept) return false;
      
      if (selectedTrade !== 'all') {
        const conceptType = getConceptType(concept.name);
        if (conceptType !== selectedTrade) return false;
      }
      
      return true;
    });
  };

  const getConceptType = (conceptName: string): string => {
    const name = conceptName.toLowerCase();
    if (name.includes('foundation') || name.includes('concrete')) return 'foundation';
    if (name.includes('frame') || name.includes('wall')) return 'framing';
    if (name.includes('roof')) return 'roofing';
    if (name.includes('electric')) return 'electrical';
    if (name.includes('plumb')) return 'plumbing';
    return 'general';
  };

  const getBudgetRiskSummary = () => {
    const filteredForecasts = getFilteredForecasts();
    if (filteredForecasts.length === 0) return null;
    
    return CostForecastService.assessBudgetRisk(filteredForecasts);
  };

  const getConceptName = (conceptId: string) => {
    const concept = concepts.find(c => c.id === conceptId);
    return concept?.name || 'Unknown Concept';
  };

  const filteredForecasts = getFilteredForecasts();
  const riskSummary = getBudgetRiskSummary();
  const trades = ['all', 'foundation', 'framing', 'roofing', 'electrical', 'plumbing', 'general'];

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading cost forecasts...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI Cost Forecasting</Text>
      
      {/* Filters */}
      <View style={styles.filtersContainer}>
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Site:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[styles.filterButton, selectedSite === 'all' && styles.activeFilter]}
              onPress={() => setSelectedSite('all')}
            >
              <Text style={[styles.filterText, selectedSite === 'all' && styles.activeFilterText]}>All Sites</Text>
            </TouchableOpacity>
            {sites.map(site => (
              <TouchableOpacity
                key={site.id}
                style={[styles.filterButton, selectedSite === site.id && styles.activeFilter]}
                onPress={() => setSelectedSite(site.id)}
              >
                <Text style={[styles.filterText, selectedSite === site.id && styles.activeFilterText]}>{site.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Trade:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {trades.map(trade => (
              <TouchableOpacity
                key={trade}
                style={[styles.filterButton, selectedTrade === trade && styles.activeFilter]}
                onPress={() => setSelectedTrade(trade)}
              >
                <Text style={[styles.filterText, selectedTrade === trade && styles.activeFilterText]}>
                  {trade.charAt(0).toUpperCase() + trade.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Risk Summary */}
      {riskSummary && (
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Budget Risk Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Forecasted:</Text>
            <Text style={styles.summaryValue}>${riskSummary.totalForecast.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Budgeted:</Text>
            <Text style={styles.summaryValue}>${riskSummary.totalBudget.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Overall Risk:</Text>
            <View style={[styles.riskBadge, { backgroundColor: getRiskColor(riskSummary.overallRisk) }]}>
              <Text style={styles.riskText}>{riskSummary.overallRisk.toUpperCase()}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Forecast Cards */}
      <ScrollView style={styles.forecastList}>
        {filteredForecasts.map(forecast => (
          <CostRiskCard
            key={forecast.id}
            forecast={forecast}
            conceptName={getConceptName(forecast.concept_id)}
          />
        ))}
        {filteredForecasts.length === 0 && (
          <Text style={styles.emptyText}>No cost forecasts available for selected filters</Text>
        )}
      </ScrollView>
    </View>
  );
};

const getRiskColor = (riskLevel: string) => {
  switch (riskLevel) {
    case 'high': return '#ff4444';
    case 'medium': return '#ff8800';
    case 'low': return '#44aa44';
    default: return '#666';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  loadingText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filterGroup: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  activeFilter: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    fontSize: 12,
    color: '#666',
  },
  activeFilterText: {
    color: '#fff',
  },
  summaryContainer: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  riskText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  forecastList: {
    flex: 1,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    marginTop: 32,
  },
});

export default CostForecastPanel;