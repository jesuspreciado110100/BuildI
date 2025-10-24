import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { CrewRecommendation } from '../types';
import { CrewOptimizerService } from '../services/CrewOptimizerService';

interface AIRecommendationPanelProps {
  conceptId: string;
  conceptType: string;
  onSelectCrew?: (crew: CrewRecommendation) => void;
}

export const AIRecommendationPanel: React.FC<AIRecommendationPanelProps> = ({
  conceptId,
  conceptType,
  onSelectCrew
}) => {
  const [recommendations, setRecommendations] = useState<CrewRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecommendations();
  }, [conceptId]);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      const crews = await CrewOptimizerService.getRecommendedCrews(conceptId);
      setRecommendations(crews.slice(0, 5)); // Top 5 recommendations
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#4CAF50';
    if (score >= 80) return '#FF9800';
    if (score >= 70) return '#FFC107';
    return '#9E9E9E';
  };

  const getAvailabilityText = (available: boolean) => {
    return available ? 'Available' : 'Busy';
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>AI Crew Recommendations</Text>
        <Text style={styles.loading}>Loading recommendations...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI Crew Recommendations</Text>
      <Text style={styles.subtitle}>Best matches for {conceptType}</Text>
      
      <ScrollView style={styles.scrollView}>
        {recommendations.map((crew, index) => (
          <TouchableOpacity
            key={crew.labor_chief_id}
            style={styles.crewCard}
            onPress={() => onSelectCrew?.(crew)}
          >
            <View style={styles.cardHeader}>
              <View style={styles.nameSection}>
                <Text style={styles.crewName}>{crew.labor_chief_name}</Text>
                <View style={styles.badgeContainer}>
                  {index === 0 && (
                    <View style={styles.topMatchBadge}>
                      <Text style={styles.topMatchText}>TOP MATCH</Text>
                    </View>
                  )}
                  <View style={[styles.scoreBadge, { backgroundColor: getScoreColor(crew.match_score) }]}>
                    <Text style={styles.scoreText}>{crew.match_score}%</Text>
                  </View>
                </View>
              </View>
            </View>
            
            <View style={styles.cardBody}>
              <Text style={styles.rationale}>{crew.ai_rationale}</Text>
              
              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>Crew Size</Text>
                  <Text style={styles.statValue}>{crew.crew_size}</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>Rating</Text>
                  <Text style={styles.statValue}>⭐ {crew.rating}</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>Distance</Text>
                  <Text style={styles.statValue}>{crew.distance_km}km</Text>
                </View>
              </View>
              
              <View style={styles.bottomRow}>
                <Text style={styles.completionTime}>
                  Expected: {crew.expected_completion_time} days
                </Text>
                <Text style={[styles.availability, { 
                  color: crew.availability ? '#4CAF50' : '#F44336' 
                }]}>
                  {getAvailabilityText(crew.availability)}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
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
    marginBottom: 4
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16
  },
  loading: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20
  },
  scrollView: {
    flex: 1
  },
  crewCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  cardHeader: {
    marginBottom: 12
  },
  nameSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  crewName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  topMatchBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4
  },
  topMatchText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold'
  },
  scoreBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4
  },
  scoreText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold'
  },
  cardBody: {
    gap: 12
  },
  rationale: {
    fontSize: 14,
    color: '#333',
    fontStyle: 'italic'
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  stat: {
    alignItems: 'center'
  },
  statLabel: {
    fontSize: 12,
    color: '#666'
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 2
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  completionTime: {
    fontSize: 14,
    color: '#333'
  },
  availability: {
    fontSize: 14,
    fontWeight: 'bold'
  }
});