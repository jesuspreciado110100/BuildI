import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';

interface Job {
  id: string;
  code: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  progress: number;
}

interface Concept {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  progress: number;
  jobs?: Job[];
}

interface ConceptListViewProps {
  concepts: Concept[];
  onConceptPress: (concept: Concept) => void;
}

export const ConceptListView: React.FC<ConceptListViewProps> = ({
  concepts,
  onConceptPress,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'in_progress': return '#FF9800';
      default: return '#9E9E9E';
    }
  };

  const renderConcept = ({ item }: { item: Concept }) => (
    <TouchableOpacity
      style={styles.conceptCard}
      onPress={() => onConceptPress(item)}
    >
      <View style={styles.conceptHeader}>
        <Text style={styles.conceptName}>{item.name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.progress}%</Text>
        </View>
      </View>
      <Text style={styles.conceptDescription} numberOfLines={2}>
        {item.description}
      </Text>
      <Text style={styles.jobCount}>{(item.jobs || []).length} trabajos</Text>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={concepts}
      renderItem={renderConcept}
      keyExtractor={(item) => item.id}
      style={styles.container}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  conceptCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  conceptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  conceptName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  conceptDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  jobCount: {
    fontSize: 12,
    color: '#999',
  },
});