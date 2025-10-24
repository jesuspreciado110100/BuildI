import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { CrewRecommendation } from '../types';
import { CrewOptimizerService } from '../services/CrewOptimizerService';
import { AINotificationService } from '../services/AINotificationService';

interface AICrewOptimizerTestProps {
  conceptId?: string;
  conceptType?: string;
  contractorId?: string;
}

export const AICrewOptimizerTest: React.FC<AICrewOptimizerTestProps> = ({
  conceptId = 'test-concept-1',
  conceptType = 'Foundation Work',
  contractorId = 'contractor-123'
}) => {
  const [recommendations, setRecommendations] = useState<CrewRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  const runTest = async () => {
    setLoading(true);
    setTestResults([]);
    const results: string[] = [];

    try {
      results.push('✅ Starting AI Crew Optimizer test...');
      
      // Test 1: Get recommendations
      results.push('📊 Fetching crew recommendations...');
      const crews = await CrewOptimizerService.getRecommendedCrews(conceptId);
      setRecommendations(crews);
      results.push(`✅ Found ${crews.length} crew recommendations`);
      
      // Test 2: Verify best match
      const topCrew = crews[0];
      if (topCrew && topCrew.match_score >= 90) {
        results.push(`🏆 Best match: ${topCrew.labor_chief_name} (${topCrew.match_score}% match)`);
        results.push(`⚡ Expected completion: ${topCrew.expected_completion_time} days`);
        results.push(`👥 Crew size: ${topCrew.crew_size} workers`);
        results.push(`⭐ Rating: ${topCrew.rating}/5.0`);
        results.push(`📍 Distance: ${topCrew.distance_km}km away`);
      } else {
        results.push('⚠️ No high-quality matches found (>90% score)');
      }

      // Test 3: Test notifications
      results.push('📱 Testing notification system...');
      await AINotificationService.sendBulkRecommendations(contractorId, conceptId, crews);
      results.push('✅ Bulk recommendations sent');
      
      await AINotificationService.sendCrewOptimizationComplete(contractorId, conceptId, crews.length);
      results.push('✅ Completion notification sent');

      // Test 4: Verify availability
      const availableCrews = crews.filter(crew => crew.availability);
      results.push(`✅ ${availableCrews.length}/${crews.length} crews are available`);

      results.push('🎉 AI Crew Optimizer test completed successfully!');
      
    } catch (error) {
      results.push(`❌ Test failed: ${error}`);
    } finally {
      setLoading(false);
      setTestResults(results);
    }
  };

  const selectCrew = (crew: CrewRecommendation) => {
    Alert.alert(
      'Crew Selected',
      `You selected ${crew.labor_chief_name} with ${crew.match_score}% match score. This is the best option for your ${conceptType} project.`,
      [{ text: 'OK' }]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>AI Crew Optimizer Test</Text>
      <Text style={styles.subtitle}>Testing for: {conceptType}</Text>
      
      <TouchableOpacity style={styles.testButton} onPress={runTest} disabled={loading}>
        <Text style={styles.testButtonText}>
          {loading ? 'Running Test...' : 'Run AI Crew Test'}
        </Text>
      </TouchableOpacity>

      {testResults.length > 0 && (
        <View style={styles.resultsSection}>
          <Text style={styles.resultsTitle}>Test Results:</Text>
          {testResults.map((result, index) => (
            <Text key={index} style={styles.resultText}>{result}</Text>
          ))}
        </View>
      )}

      {recommendations.length > 0 && (
        <View style={styles.recommendationsSection}>
          <Text style={styles.sectionTitle}>Top Crew Recommendations:</Text>
          {recommendations.slice(0, 3).map((crew, index) => (
            <TouchableOpacity
              key={crew.labor_chief_id}
              style={styles.crewCard}
              onPress={() => selectCrew(crew)}
            >
              <View style={styles.crewHeader}>
                <Text style={styles.crewName}>{crew.labor_chief_name}</Text>
                {index === 0 && <Text style={styles.bestMatch}>BEST MATCH</Text>}
                <Text style={styles.matchScore}>{crew.match_score}%</Text>
              </View>
              <Text style={styles.rationale}>{crew.ai_rationale}</Text>
              <View style={styles.crewStats}>
                <Text style={styles.statText}>⭐ {crew.rating}</Text>
                <Text style={styles.statText}>👥 {crew.crew_size}</Text>
                <Text style={styles.statText}>📅 {crew.expected_completion_time}d</Text>
                <Text style={[styles.statText, { 
                  color: crew.availability ? '#4CAF50' : '#F44336' 
                }]}>
                  {crew.availability ? '✅ Available' : '❌ Busy'}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 16 },
  testButton: { backgroundColor: '#2196F3', padding: 16, borderRadius: 8, marginBottom: 16 },
  testButtonText: { color: 'white', textAlign: 'center', fontWeight: 'bold' },
  resultsSection: { backgroundColor: 'white', padding: 16, borderRadius: 8, marginBottom: 16 },
  resultsTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  resultText: { fontSize: 14, marginBottom: 4, fontFamily: 'monospace' },
  recommendationsSection: { backgroundColor: 'white', padding: 16, borderRadius: 8 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  crewCard: { backgroundColor: '#f9f9f9', padding: 12, borderRadius: 8, marginBottom: 8 },
  crewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  crewName: { fontSize: 16, fontWeight: 'bold', flex: 1 },
  bestMatch: { backgroundColor: '#4CAF50', color: 'white', padding: 4, borderRadius: 4, fontSize: 10 },
  matchScore: { fontSize: 16, fontWeight: 'bold', color: '#2196F3', marginLeft: 8 },
  rationale: { fontSize: 14, fontStyle: 'italic', marginBottom: 8 },
  crewStats: { flexDirection: 'row', justifyContent: 'space-between' },
  statText: { fontSize: 12, color: '#666' }
});