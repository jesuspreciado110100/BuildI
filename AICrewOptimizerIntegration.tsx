import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface AICrewOptimizerIntegrationProps {
  conceptId: string;
  conceptType: string;
  contractorId: string;
  onRecommendationsLoaded?: (recommendations: any) => void;
}

export const AICrewOptimizerIntegration: React.FC<AICrewOptimizerIntegrationProps> = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI Crew Optimizer</Text>
      <Text style={styles.subtitle}>Optimización de cuadrilla disponible próximamente</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F3F4F6',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center'
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center'
  }
});