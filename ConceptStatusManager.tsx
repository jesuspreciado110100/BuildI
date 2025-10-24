import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface WorkConcept {
  name: string;
  description: string;
  materials: any[];
  labor: any[];
  machinery: any[];
}

interface ConceptStatusManagerProps {
  concept: WorkConcept;
  siteId: string;
  userId: string;
}

export const ConceptStatusManager: React.FC<ConceptStatusManagerProps> = ({ 
  concept 
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.name}>{concept.name}</Text>
      <Text style={styles.description}>{concept.description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937'
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4
  }
});