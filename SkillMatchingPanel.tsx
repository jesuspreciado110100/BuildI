import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { EnhancedWorkerService, SkillMatchResult } from '../services/EnhancedWorkerService';

interface SkillMatchingPanelProps {
  requiredSkills: string[];
  tradeType: string;
  startDate: string;
  endDate: string;
  onWorkerSelect: (workerId: string) => void;
}

export const SkillMatchingPanel: React.FC<SkillMatchingPanelProps> = ({
  requiredSkills,
  tradeType,
  startDate,
  endDate,
  onWorkerSelect
}) => {
  const [matchResults, setMatchResults] = useState<SkillMatchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMatchingWorkers();
  }, [requiredSkills, tradeType, startDate, endDate]);

  const loadMatchingWorkers = async () => {
    if (!requiredSkills.length || !tradeType) return;
    
    setLoading(true);
    try {
      const results = await EnhancedWorkerService.findMatchingWorkers(
        requiredSkills,
        tradeType,
        startDate,
        endDate
      );
      setMatchResults(results);
    } catch (error) {
      console.error('Error loading matching workers:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMatchColor = (score: number) => {
    if (score >= 0.8) return '#10B981';
    if (score >= 0.6) return '#F59E0B';
    return '#EF4444';
  };

  const getMatchLabel = (score: number) => {
    if (score >= 0.8) return 'Excellent Match';
    if (score >= 0.6) return 'Good Match';
    return 'Partial Match';
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Finding matching workers...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Skill-Matched Workers</Text>
      
      {matchResults.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No matching workers found</Text>
          <Text style={styles.emptySubtext}>Try adjusting your requirements</Text>
        </View>
      ) : (
        matchResults.map((result) => (
          <TouchableOpacity
            key={result.worker.id}
            style={styles.workerCard}
            onPress={() => onWorkerSelect(result.worker.id)}
          >
            <View style={styles.workerHeader}>
              <Text style={styles.workerName}>{result.worker.name}</Text>
              <View style={[styles.matchBadge, { backgroundColor: getMatchColor(result.match_score) }]}>
                <Text style={styles.matchText}>{Math.round(result.match_score * 100)}%</Text>
              </View>
            </View>
            
            <Text style={styles.workerDetails}>
              {result.worker.skill_level} • ${result.worker.hourly_rate}/hr • ⭐ {result.worker.rating}
            </Text>
            
            <Text style={[styles.matchLabel, { color: getMatchColor(result.match_score) }]}>
              {getMatchLabel(result.match_score)}
            </Text>
            
            <View style={styles.skillsContainer}>
              <Text style={styles.skillsTitle}>Matching Skills:</Text>
              <View style={styles.skillsList}>
                {result.matching_skills.map((skill, index) => (
                  <View key={index} style={styles.skillTag}>
                    <Text style={styles.skillText}>{skill}</Text>
                  </View>
                ))}
              </View>
            </View>
            
            {result.missing_skills.length > 0 && (
              <View style={styles.missingSkillsContainer}>
                <Text style={styles.missingSkillsTitle}>Missing Skills:</Text>
                <View style={styles.skillsList}>
                  {result.missing_skills.map((skill, index) => (
                    <View key={index} style={styles.missingSkillTag}>
                      <Text style={styles.missingSkillText}>{skill}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1F2937',
  },
  loadingText: {
    textAlign: 'center',
    color: '#6B7280',
    marginTop: 32,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  workerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  workerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  workerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  matchBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  matchText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  workerDetails: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  matchLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 12,
  },
  skillsContainer: {
    marginBottom: 8,
  },
  skillsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  skillsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillTag: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 4,
    marginBottom: 4,
  },
  skillText: {
    fontSize: 11,
    color: '#1E40AF',
  },
  missingSkillsContainer: {
    marginTop: 8,
  },
  missingSkillsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  missingSkillTag: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 4,
    marginBottom: 4,
  },
  missingSkillText: {
    fontSize: 11,
    color: '#DC2626',
  },
});