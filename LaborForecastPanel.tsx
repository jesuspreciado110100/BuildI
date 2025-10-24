import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { LaborDemandForecast, Concept, Site } from '../types';
import { LaborForecastService } from '../services/LaborForecastService';
import { LaborForecastCard } from './LaborForecastCard';

interface LaborForecastPanelProps {
  sites: Site[];
  concepts: Concept[];
  onPlanHiring: (forecast: LaborDemandForecast) => void;
}

export const LaborForecastPanel: React.FC<LaborForecastPanelProps> = ({ 
  sites, 
  concepts, 
  onPlanHiring 
}) => {
  const [forecasts, setForecasts] = useState<LaborDemandForecast[]>([]);
  const [filteredForecasts, setFilteredForecasts] = useState<LaborDemandForecast[]>([]);
  const [selectedSite, setSelectedSite] = useState<string>('all');
  const [selectedTrade, setSelectedTrade] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    generateForecasts();
  }, [concepts]);

  useEffect(() => {
    applyFilters();
  }, [forecasts, selectedSite, selectedTrade, dateFilter]);

  const generateForecasts = async () => {
    setLoading(true);
    try {
      const allForecasts: LaborDemandForecast[] = [];
      
      for (const site of sites) {
        const siteConcepts = concepts.filter(c => c.site_id === site.id);
        const siteForecasts = await LaborForecastService.generateLaborForecasts(site.id, siteConcepts);
        allForecasts.push(...siteForecasts);
      }
      
      setForecasts(allForecasts);
    } catch (error) {
      console.error('Error generating forecasts:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...forecasts];
    
    if (selectedSite !== 'all') {
      filtered = filtered.filter(f => f.site_id === selectedSite);
    }
    
    if (selectedTrade !== 'all') {
      filtered = filtered.filter(f => f.trade_type === selectedTrade);
    }
    
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      filtered = filtered.filter(f => {
        const forecastDate = new Date(f.forecast_date);
        return forecastDate >= filterDate;
      });
    }
    
    setFilteredForecasts(filtered);
  };

  const getUniqueTrades = () => {
    const trades = [...new Set(forecasts.map(f => f.trade_type))];
    return trades.sort();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Labor Demand Forecast</Text>
      
      <View style={styles.filters}>
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Site:</Text>
          <View style={styles.filterButtons}>
            <TouchableOpacity 
              style={[styles.filterButton, selectedSite === 'all' && styles.activeFilter]}
              onPress={() => setSelectedSite('all')}
            >
              <Text style={[styles.filterButtonText, selectedSite === 'all' && styles.activeFilterText]}>All</Text>
            </TouchableOpacity>
            {sites.map(site => (
              <TouchableOpacity 
                key={site.id}
                style={[styles.filterButton, selectedSite === site.id && styles.activeFilter]}
                onPress={() => setSelectedSite(site.id)}
              >
                <Text style={[styles.filterButtonText, selectedSite === site.id && styles.activeFilterText]}>
                  {site.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Trade:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity 
              style={[styles.filterButton, selectedTrade === 'all' && styles.activeFilter]}
              onPress={() => setSelectedTrade('all')}
            >
              <Text style={[styles.filterButtonText, selectedTrade === 'all' && styles.activeFilterText]}>All</Text>
            </TouchableOpacity>
            {getUniqueTrades().map(trade => (
              <TouchableOpacity 
                key={trade}
                style={[styles.filterButton, selectedTrade === trade && styles.activeFilter]}
                onPress={() => setSelectedTrade(trade)}
              >
                <Text style={[styles.filterButtonText, selectedTrade === trade && styles.activeFilterText]}>
                  {trade.replace('_', ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
      
      <ScrollView style={styles.forecastList}>
        {loading ? (
          <Text style={styles.loadingText}>Generating forecasts...</Text>
        ) : filteredForecasts.length === 0 ? (
          <Text style={styles.emptyText}>No forecasts available</Text>
        ) : (
          filteredForecasts.map(forecast => (
            <LaborForecastCard 
              key={forecast.id}
              forecast={forecast}
              onPlanHiring={onPlanHiring}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  filters: {
    marginBottom: 16,
  },
  filterRow: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#666',
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#e0e0e0',
    marginRight: 8,
    marginBottom: 8,
  },
  activeFilter: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#666',
  },
  activeFilterText: {
    color: '#fff',
  },
  forecastList: {
    flex: 1,
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 32,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 32,
  },
});