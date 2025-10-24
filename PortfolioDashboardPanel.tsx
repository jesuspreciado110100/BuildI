import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Site, PortfolioKPIs, SitePerformance } from '../types';
import { PortfolioService } from '../services/PortfolioService';

interface PortfolioDashboardPanelProps {
  sites: Site[];
  selectedRegion?: string;
  selectedSite?: string;
}

export const PortfolioDashboardPanel: React.FC<PortfolioDashboardPanelProps> = ({
  sites,
  selectedRegion,
  selectedSite
}) => {
  const [kpis, setKpis] = useState<PortfolioKPIs | null>(null);
  const [sitePerformance, setSitePerformance] = useState<SitePerformance[]>([]);
  const [regionDelays, setRegionDelays] = useState<{ [region: string]: number }>({});
  const [costOverruns, setCostOverruns] = useState<{ site_id: string; site_name: string; overrun_pct: number }[]>([]);

  useEffect(() => {
    let filteredSites = sites;
    
    if (selectedRegion && selectedRegion !== 'all') {
      filteredSites = sites.filter(site => site.region === selectedRegion);
    }
    
    if (selectedSite && selectedSite !== 'all') {
      filteredSites = sites.filter(site => site.id === selectedSite);
    }
    
    const calculatedKpis = PortfolioService.calculatePortfolioKPIs(filteredSites);
    const performanceData = PortfolioService.getSitePerformanceData(filteredSites);
    const delayData = PortfolioService.getRegionDelayDistribution(filteredSites);
    const overrunData = PortfolioService.getCostOverrunData(filteredSites);
    
    setKpis(calculatedKpis);
    setSitePerformance(performanceData);
    setRegionDelays(delayData);
    setCostOverruns(overrunData);
  }, [sites, selectedRegion, selectedSite]);

  const renderKPICard = (title: string, value: string | number, subtitle?: string) => (
    <View style={styles.kpiCard}>
      <Text style={styles.kpiTitle}>{title}</Text>
      <Text style={styles.kpiValue}>{value}</Text>
      {subtitle && <Text style={styles.kpiSubtitle}>{subtitle}</Text>}
    </View>
  );

  const renderSitePerformanceChart = () => (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Site Performance Comparison</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {sitePerformance.map(site => (
          <View key={site.site_id} style={styles.barChartItem}>
            <View style={[styles.bar, { height: Math.max(20, site.output_rate * 2) }]} />
            <Text style={styles.barLabel}>{site.site_name}</Text>
            <Text style={styles.barValue}>{site.output_rate.toFixed(1)}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderDelayDistribution = () => (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Delay Distribution by Region</Text>
      {Object.entries(regionDelays).map(([region, delays]) => (
        <View key={region} style={styles.delayItem}>
          <Text style={styles.delayRegion}>{region}</Text>
          <View style={styles.delayBar}>
            <View style={[styles.delayFill, { width: `${Math.min(100, delays * 2)}%` }]} />
          </View>
          <Text style={styles.delayValue}>{delays} days</Text>
        </View>
      ))}
    </View>
  );

  const renderCostOverrunHeatmap = () => (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Cost Overrun Heatmap</Text>
      <View style={styles.heatmapGrid}>
        {costOverruns.map(site => (
          <View key={site.site_id} style={[
            styles.heatmapCell,
            { backgroundColor: site.overrun_pct > 10 ? '#ff4444' : site.overrun_pct > 5 ? '#ffaa44' : '#44ff44' }
          ]}>
            <Text style={styles.heatmapLabel}>{site.site_name}</Text>
            <Text style={styles.heatmapValue}>{site.overrun_pct.toFixed(1)}%</Text>
          </View>
        ))}
      </View>
    </View>
  );

  if (!kpis) return <Text>Loading...</Text>;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Portfolio Dashboard</Text>
      
      <View style={styles.kpiContainer}>
        {renderKPICard('Active Sites', kpis.active_sites)}
        {renderKPICard('Avg Delay Days', kpis.avg_delay_days_per_site.toFixed(1), 'per site')}
        {renderKPICard('Budget Utilization', `${((kpis.spent_budget / kpis.total_budget) * 100).toFixed(1)}%`)}
        {renderKPICard('On-Time Completion', `${kpis.concepts_completed_on_time_pct.toFixed(1)}%`)}
        {renderKPICard('Worker Utilization', `${kpis.worker_utilization_rate.toFixed(1)}%`)}
      </View>
      
      <View style={styles.tradeOutputContainer}>
        <Text style={styles.sectionTitle}>Average Output Rate by Trade</Text>
        {Object.entries(kpis.avg_output_rate).map(([trade, rate]) => (
          <View key={trade} style={styles.tradeItem}>
            <Text style={styles.tradeName}>{trade}</Text>
            <Text style={styles.tradeRate}>{rate.toFixed(2)} units/day</Text>
          </View>
        ))}
      </View>
      
      {renderSitePerformanceChart()}
      {renderDelayDistribution()}
      {renderCostOverrunHeatmap()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: '#333' },
  kpiContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 },
  kpiCard: { backgroundColor: 'white', padding: 16, margin: 4, borderRadius: 8, minWidth: 120, alignItems: 'center' },
  kpiTitle: { fontSize: 12, color: '#666', marginBottom: 4 },
  kpiValue: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  kpiSubtitle: { fontSize: 10, color: '#999' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#333' },
  tradeOutputContainer: { backgroundColor: 'white', padding: 16, borderRadius: 8, marginBottom: 16 },
  tradeItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
  tradeName: { fontSize: 14, color: '#333' },
  tradeRate: { fontSize: 14, fontWeight: 'bold', color: '#007AFF' },
  chartContainer: { backgroundColor: 'white', padding: 16, borderRadius: 8, marginBottom: 16 },
  chartTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12, color: '#333' },
  barChartItem: { alignItems: 'center', marginRight: 16 },
  bar: { width: 30, backgroundColor: '#007AFF', marginBottom: 8 },
  barLabel: { fontSize: 10, color: '#666', textAlign: 'center', maxWidth: 40 },
  barValue: { fontSize: 12, fontWeight: 'bold', color: '#333' },
  delayItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  delayRegion: { width: 80, fontSize: 12, color: '#333' },
  delayBar: { flex: 1, height: 20, backgroundColor: '#eee', borderRadius: 10, marginHorizontal: 8 },
  delayFill: { height: '100%', backgroundColor: '#ff6b6b', borderRadius: 10 },
  delayValue: { width: 60, fontSize: 12, color: '#333', textAlign: 'right' },
  heatmapGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  heatmapCell: { width: 100, height: 60, margin: 4, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  heatmapLabel: { fontSize: 10, color: 'white', fontWeight: 'bold' },
  heatmapValue: { fontSize: 12, color: 'white', fontWeight: 'bold' }
});