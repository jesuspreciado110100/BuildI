import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { CostComparison } from '../types';
import { CostAnalysisService } from '../services/CostAnalysisService';

interface CostComparisonPanelProps {
  siteId: string;
}

type SortField = 'concept_id' | 'actual_cost' | 'forecasted_cost' | 'variance_percent';

export const CostComparisonPanel: React.FC<CostComparisonPanelProps> = ({ siteId }) => {
  const [comparisons, setComparisons] = useState<CostComparison[]>([]);
  const [sortField, setSortField] = useState<SortField>('concept_id');
  const [sortAsc, setSortAsc] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComparisons();
  }, [siteId]);

  const loadComparisons = async () => {
    try {
      setLoading(true);
      const data = await CostAnalysisService.getCostComparisons(siteId);
      setComparisons(data);
    } catch (error) {
      console.error('Error loading cost comparisons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const sortedComparisons = [...comparisons].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    const multiplier = sortAsc ? 1 : -1;
    
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return aVal.localeCompare(bVal) * multiplier;
    }
    return (Number(aVal) - Number(bVal)) * multiplier;
  });

  const getVarianceColor = (variance: number) => {
    if (variance > 0) return '#ff4444'; // Over budget - red
    if (variance < 0) return '#44aa44'; // Under budget - green
    return '#666666'; // On budget - gray
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString()}`;
  };

  const formatPercent = (percent: number) => {
    return `${percent > 0 ? '+' : ''}${percent.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading cost comparisons...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cost vs Forecast Comparison</Text>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.table}>
          <View style={styles.headerRow}>
            <TouchableOpacity 
              style={styles.headerCell} 
              onPress={() => handleSort('concept_id')}
            >
              <Text style={styles.headerText}>Concept ID</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerCell} 
              onPress={() => handleSort('forecasted_cost')}
            >
              <Text style={styles.headerText}>Forecasted</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerCell} 
              onPress={() => handleSort('actual_cost')}
            >
              <Text style={styles.headerText}>Actual</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerCell} 
              onPress={() => handleSort('variance_percent')}
            >
              <Text style={styles.headerText}>Variance %</Text>
            </TouchableOpacity>
          </View>
          
          {sortedComparisons.map((comparison, index) => (
            <View key={comparison.concept_id} style={styles.dataRow}>
              <View style={styles.dataCell}>
                <Text style={styles.dataText}>{comparison.concept_id}</Text>
              </View>
              <View style={styles.dataCell}>
                <Text style={styles.dataText}>{formatCurrency(comparison.forecasted_cost)}</Text>
              </View>
              <View style={styles.dataCell}>
                <Text style={styles.dataText}>{formatCurrency(comparison.actual_cost)}</Text>
              </View>
              <View style={styles.dataCell}>
                <Text style={[styles.dataText, { color: getVarianceColor(comparison.variance) }]}>
                  {formatPercent(comparison.variance_percent)}
                </Text>
              </View>
            </View>
          ))}
        </View>
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
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333'
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 50
  },
  table: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden'
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#007bff'
  },
  headerCell: {
    width: 120,
    padding: 12,
    borderRightWidth: 1,
    borderRightColor: '#fff'
  },
  headerText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center'
  },
  dataRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  dataCell: {
    width: 120,
    padding: 12,
    borderRightWidth: 1,
    borderRightColor: '#eee'
  },
  dataText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#333'
  }
});