import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function MarketInsightScreen() {
  const [selectedMarket, setSelectedMarket] = useState('Residential');

  const marketData = [
    { label: 'Market Growth', value: '+15.2%', trend: 'up' },
    { label: 'Avg. Project Cost', value: '$1.2M', trend: 'up' },
    { label: 'Competition Index', value: '7.4/10', trend: 'stable' },
    { label: 'ROI Potential', value: '18.5%', trend: 'up' },
  ];

  const trendingProjects = [
    { type: 'Sustainable Housing', demand: 'High', growth: '+22%' },
    { type: 'Mixed-Use Development', demand: 'Medium', growth: '+8%' },
    { type: 'Smart Buildings', demand: 'High', growth: '+35%' },
    { type: 'Renovation Projects', demand: 'Medium', growth: '+12%' },
  ];

  const marketSegments = ['Residential', 'Commercial', 'Industrial', 'Infrastructure'];

  const insights = [
    {
      title: 'Rising Material Costs',
      description: 'Steel and concrete prices up 12% this quarter',
      impact: 'High',
      color: '#EF4444'
    },
    {
      title: 'Labor Shortage',
      description: 'Skilled workers in high demand, wages increasing',
      impact: 'Medium',
      color: '#F59E0B'
    },
    {
      title: 'Green Building Incentives',
      description: 'New tax credits for sustainable construction',
      impact: 'Positive',
      color: '#10B981'
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Market Insights</Text>
          <Text style={styles.subtitle}>Construction industry trends and analysis</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.segmentSelector}>
          {marketSegments.map((segment) => (
            <TouchableOpacity
              key={segment}
              style={[
                styles.segmentButton,
                selectedMarket === segment && styles.selectedSegment
              ]}
              onPress={() => setSelectedMarket(segment)}
            >
              <Text style={[
                styles.segmentText,
                selectedMarket === segment && styles.selectedSegmentText
              ]}>
                {segment}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.metricsGrid}>
          {marketData.map((metric, index) => (
            <View key={index} style={styles.metricCard}>
              <Text style={styles.metricLabel}>{metric.label}</Text>
              <Text style={styles.metricValue}>{metric.value}</Text>
              <View style={styles.trendIndicator}>
                <Text style={[
                  styles.trendText,
                  { color: metric.trend === 'up' ? '#10B981' : metric.trend === 'down' ? '#EF4444' : '#6B7280' }
                ]}>
                  {metric.trend === 'up' ? '↗' : metric.trend === 'down' ? '↘' : '→'} {metric.trend}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trending Project Types</Text>
          {trendingProjects.map((project, index) => (
            <View key={index} style={styles.trendCard}>
              <View style={styles.trendInfo}>
                <Text style={styles.trendType}>{project.type}</Text>
                <Text style={styles.trendDemand}>Demand: {project.demand}</Text>
              </View>
              <Text style={styles.trendGrowth}>{project.growth}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Market Insights</Text>
          {insights.map((insight, index) => (
            <View key={index} style={styles.insightCard}>
              <View style={[styles.impactIndicator, { backgroundColor: insight.color }]} />
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>{insight.title}</Text>
                <Text style={styles.insightDescription}>{insight.description}</Text>
                <Text style={[styles.impactText, { color: insight.color }]}>
                  Impact: {insight.impact}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  segmentSelector: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  segmentButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedSegment: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  segmentText: {
    fontSize: 14,
    color: '#6B7280',
  },
  selectedSegmentText: {
    color: 'white',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
  },
  metricCard: {
    width: (width - 50) / 2,
    backgroundColor: 'white',
    padding: 16,
    margin: 5,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  trendIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  trendCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  trendInfo: {
    flex: 1,
  },
  trendType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  trendDemand: {
    fontSize: 14,
    color: '#6B7280',
  },
  trendGrowth: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
  },
  insightCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  impactIndicator: {
    width: 4,
    borderRadius: 2,
    marginRight: 12,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  insightDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  impactText: {
    fontSize: 12,
    fontWeight: '600',
  },
});