import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { CrewOptimizerService } from '../services/CrewOptimizerService';
import { AINotificationService } from '../services/AINotificationService';
import { CrewRecommendation } from '../types';

interface SimpleAICrewOptimizerProps {
  conceptId: string;
  conceptType: string;
  contractorId?: string;
  isLaborChief?: boolean;
}

export const SimpleAICrewOptimizer: React.FC<SimpleAICrewOptimizerProps> = ({
  conceptId,
  conceptType,
  contractorId,
  isLaborChief = false
}) => {
  const [recommendations, setRecommendations] = useState<CrewRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCrew, setSelectedCrew] = useState<string | null>(null);

  useEffect(() => {
    loadRecommendations();
  }, [conceptId]);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      const crews = await CrewOptimizerService.getRecommendedCrews(conceptId);
      setRecommendations(crews.slice(0, 3));
      
      // Send notifications if contractor
      if (contractorId && !isLaborChief) {
        await AINotificationService.sendBulkRecommendations(contractorId, conceptId, crews);
      }
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCrew = (crewId: string) => {
    setSelectedCrew(crewId);
    Alert.alert('Crew Selected', 'AI recommendation applied successfully');
  };

  const handlePrioritizeQuote = (crew: CrewRecommendation) => {
    Alert.alert('Quote Prioritized', `You've prioritized quoting for this ${crew.match_score}% match job`);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>🤖 AI Crew Optimizer</Text>
        <Text style={styles.loading}>Analyzing crews...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🤖 AI Crew Optimizer</Text>
      <Text style={styles.subtitle}>
        {isLaborChief ? 'Your Match Opportunities' : `Best matches for ${conceptType}`}
      </Text>
      
      <ScrollView style={styles.scrollView}>
        {recommendations.map((crew, index) => (
          <View key={crew.labor_chief_id} style={styles.crewCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.crewName}>{crew.labor_chief_name}</Text>
              <View style={styles.badges}>
                {index === 0 && (
                  <View style={styles.topBadge}>
                    <Text style={styles.topBadgeText}>TOP MATCH</Text>
                  </View>
                )}
                <View style={styles.scoreBadge}>
                  <Text style={styles.scoreText}>{crew.match_score}%</Text>
                </View>
              </View>
            </View>
            
            <Text style={styles.rationale}>{crew.ai_rationale}</Text>
            
            <View style={styles.stats}>
              <Text style={styles.stat}>⭐ {crew.rating}</Text>
              <Text style={styles.stat}>👥 {crew.crew_size}</Text>
              <Text style={styles.stat}>📍 {crew.distance_km}km</Text>
              <Text style={styles.stat}>⏱️ {crew.expected_completion_time}d</Text>
            </View>
            
            <View style={styles.actions}>
              {isLaborChief ? (
                <TouchableOpacity 
                  style={styles.prioritizeButton}
                  onPress={() => handlePrioritizeQuote(crew)}
                >
                  <Text style={styles.buttonText}>Prioritize Quote</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={[
                    styles.selectButton,
                    selectedCrew === crew.labor_chief_id && styles.selectedButton
                  ]}
                  onPress={() => handleSelectCrew(crew.labor_chief_id)}
                >
                  <Text style={styles.buttonText}>
                    {selectedCrew === crew.labor_chief_id ? 'Selected' : 'Select Crew'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
      
      {isLaborChief && recommendations.length > 0 && (
        <View style={styles.summary}>
          <Text style={styles.summaryText}>
            You've been recommended for {recommendations.length} open requests
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 16 },
  loading: { textAlign: 'center', color: '#666', marginTop: 20 },
  scrollView: { flex: 1 },
  crewCard: { backgroundColor: 'white', borderRadius: 8, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  crewName: { fontSize: 18, fontWeight: 'bold', flex: 1 },
  badges: { flexDirection: 'row', gap: 4 },
  topBadge: { backgroundColor: '#4CAF50', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  topBadgeText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  scoreBadge: { backgroundColor: '#2196F3', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  scoreText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  rationale: { fontSize: 14, color: '#333', fontStyle: 'italic', marginBottom: 12 },
  stats: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  stat: { fontSize: 12, color: '#666' },
  actions: { alignItems: 'center' },
  selectButton: { backgroundColor: '#2196F3', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 4 },
  selectedButton: { backgroundColor: '#4CAF50' },
  prioritizeButton: { backgroundColor: '#FF9800', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 4 },
  buttonText: { color: 'white', fontSize: 14, fontWeight: 'bold' },
  summary: { backgroundColor: '#E3F2FD', padding: 12, borderRadius: 8, marginTop: 16 },
  summaryText: { textAlign: 'center', color: '#1976D2', fontWeight: 'bold' }
});