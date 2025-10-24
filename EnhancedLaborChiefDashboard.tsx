import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { IncomingLaborRequestsTab } from './IncomingLaborRequestsTab';
import { OpenLaborRequestsTab } from './OpenLaborRequestsTab';
import { LaborRequestHistoryTab } from './LaborRequestHistoryTab';
import { LaborChiefProgressTab } from './LaborChiefProgressTab';
import { LaborPerformanceTab } from './LaborPerformanceTab';
import { TeamPerformanceTab } from './TeamPerformanceTab';
import { WorkerLeaderboardPanel } from './WorkerLeaderboardPanel';
import { LaborAvailabilityHeatmap } from './LaborAvailabilityHeatmap';
import { AvailabilityCalendar } from './AvailabilityCalendar';
import { IncomingMicroJobsTab } from './IncomingMicroJobsTab';
import { MicroJobHistoryTab } from './MicroJobHistoryTab';
import { WalkInJobsTab } from './WalkInJobsTab';
import { SafetyLogTab } from './SafetyLogTab';
import { DailyLogTab } from './DailyLogTab';
import { PaymentHistoryTab } from './PaymentHistoryTab';
import { EnhancedJobBoardPanel } from './EnhancedJobBoardPanel';
import { JobNotificationBell } from './JobNotificationBell';
import { CrewOptimizerService } from '../services/CrewOptimizerService';
import { CrewRecommendation } from '../types';

export function EnhancedLaborChiefDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [recommendedJobs, setRecommendedJobs] = useState<CrewRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecommendedJobs();
  }, []);

  const loadRecommendedJobs = async () => {
    try {
      setLoading(true);
      const mockRecommendations: CrewRecommendation[] = [
        {
          labor_chief_id: 'current_user',
          labor_chief_name: 'You',
          match_score: 95,
          expected_completion_time: 7,
          ai_rationale: 'Perfect match for foundation work - your specialty',
          crew_size: 8,
          rating: 4.8,
          availability: true,
          distance_km: 5
        },
        {
          labor_chief_id: 'current_user',
          labor_chief_name: 'You',
          match_score: 88,
          expected_completion_time: 10,
          ai_rationale: 'Good fit for concrete work based on your recent projects',
          crew_size: 6,
          rating: 4.8,
          availability: true,
          distance_km: 12
        }
      ];
      setRecommendedJobs(mockRecommendations);
    } catch (error) {
      console.error('Error loading recommended jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'job-board', label: 'Job Board', icon: '📋' },
    { id: 'incoming-requests', label: 'Incoming Requests', icon: '📥' },
    { id: 'open-requests', label: 'Open Requests', icon: '📋' },
    { id: 'request-history', label: 'Request History', icon: '📜' },
    { id: 'progress', label: 'Progress', icon: '📈' },
    { id: 'performance', label: 'Performance', icon: '🎯' },
    { id: 'team-performance', label: 'Team Performance', icon: '👥' },
    { id: 'leaderboard', label: 'Leaderboard', icon: '🏆' },
    { id: 'availability', label: 'Availability', icon: '📅' },
    { id: 'calendar', label: 'Calendar', icon: '🗓️' },
    { id: 'micro-jobs', label: 'Micro Jobs', icon: '⚡' },
    { id: 'micro-history', label: 'Micro History', icon: '📝' },
    { id: 'walk-ins', label: 'Walk-ins', icon: '🚶' },
    { id: 'safety', label: 'Safety Log', icon: '🦺' },
    { id: 'daily-log', label: 'Daily Log', icon: '📓' },
    { id: 'payments', label: 'Payments', icon: '💳' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>Labor Chief Overview</Text>
            
            {recommendedJobs.length > 0 && (
              <View style={styles.recommendationsSection}>
                <Text style={styles.recommendationsTitle}>
                  🤖 You've been recommended for {recommendedJobs.length} open requests
                </Text>
                <Text style={styles.recommendationsSubtitle}>
                  AI matched you based on your skills and availability
                </Text>
                
                {recommendedJobs.map((job, index) => (
                  <TouchableOpacity key={index} style={styles.recommendationCard}>
                    <View style={styles.recommendationHeader}>
                      <Text style={styles.recommendationTitle}>Trade Request #{index + 1}</Text>
                      <View style={styles.matchBadge}>
                        <Text style={styles.matchBadgeText}>{job.match_score}% Match</Text>
                      </View>
                    </View>
                    <Text style={styles.recommendationReason}>{job.ai_rationale}</Text>
                    <Text style={styles.recommendationDuration}>
                      Expected: {job.expected_completion_time} days
                    </Text>
                    <TouchableOpacity style={styles.prioritizeButton}>
                      <Text style={styles.prioritizeButtonText}>Prioritize for Quote</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            
            <View style={styles.statsGrid}>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Active Workers</Text>
                <Text style={styles.cardValue}>45</Text>
              </View>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Pending Requests</Text>
                <Text style={styles.cardValue}>12</Text>
              </View>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Completed Jobs</Text>
                <Text style={styles.cardValue}>234</Text>
              </View>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>AI Match Score</Text>
                <Text style={styles.cardValue}>4.8⭐</Text>
              </View>
            </View>
          </View>
        );
      case 'job-board': 
        return (
          <EnhancedJobBoardPanel 
            isOfflineMode={true} 
            userType="labor_chief"
          />
        );
      case 'incoming-requests': return <IncomingLaborRequestsTab />;
      case 'open-requests': return <OpenLaborRequestsTab />;
      case 'request-history': return <LaborRequestHistoryTab />;
      case 'progress': return <LaborChiefProgressTab />;
      case 'performance': return <LaborPerformanceTab />;
      case 'team-performance': return <TeamPerformanceTab />;
      case 'leaderboard': return <WorkerLeaderboardPanel />;
      case 'availability': return <LaborAvailabilityHeatmap />;
      case 'calendar': return <AvailabilityCalendar />;
      case 'micro-jobs': return <IncomingMicroJobsTab />;
      case 'micro-history': return <MicroJobHistoryTab />;
      case 'walk-ins': return <WalkInJobsTab />;
      case 'safety': return <SafetyLogTab />;
      case 'daily-log': return <DailyLogTab />;
      case 'payments': return <PaymentHistoryTab />;
      default: return <View><Text>Select a tab</Text></View>;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Labor Chief Dashboard</Text>
        <JobNotificationBell userType="labor_chief" userId="labor_chief_1" />
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
        <View style={styles.tabs}>
          {tabs.map(tab => (
            <TouchableOpacity 
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.activeTab]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text style={styles.tabIcon}>{tab.icon}</Text>
              <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      
      <ScrollView style={styles.scrollView}>
        {renderContent()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  title: { fontSize: 24, fontWeight: 'bold' },
  tabsContainer: { backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  tabs: { flexDirection: 'row', paddingHorizontal: 10 },
  tab: { padding: 15, alignItems: 'center', minWidth: 80 },
  activeTab: { borderBottomWidth: 2, borderBottomColor: '#2563eb' },
  tabIcon: { fontSize: 20, marginBottom: 4 },
  tabText: { fontSize: 12, color: '#666', textAlign: 'center' },
  activeTabText: { color: '#2563eb', fontWeight: '600' },
  scrollView: { flex: 1 },
  content: { padding: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  recommendationsSection: { marginBottom: 20, padding: 16, backgroundColor: '#f0f9ff', borderRadius: 8, borderWidth: 1, borderColor: '#0ea5e9' },
  recommendationsTitle: { fontSize: 18, fontWeight: 'bold', color: '#0369a1', marginBottom: 4 },
  recommendationsSubtitle: { fontSize: 14, color: '#0369a1', marginBottom: 12 },
  recommendationCard: { backgroundColor: 'white', padding: 12, borderRadius: 6, marginBottom: 8, borderWidth: 1, borderColor: '#e0e7ff' },
  recommendationHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  recommendationTitle: { fontSize: 16, fontWeight: 'bold', flex: 1 },
  matchBadge: { backgroundColor: '#10b981', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  matchBadgeText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  recommendationReason: { fontSize: 14, color: '#6b7280', marginBottom: 4 },
  recommendationDuration: { fontSize: 14, color: '#059669', fontWeight: '600', marginBottom: 8 },
  prioritizeButton: { backgroundColor: '#3b82f6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4, alignSelf: 'flex-start' },
  prioritizeButtonText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { backgroundColor: 'white', padding: 15, borderRadius: 8, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2, width: '48%' },
  cardTitle: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  cardValue: { fontSize: 20, fontWeight: 'bold', color: '#2563eb', marginTop: 8 }
});
