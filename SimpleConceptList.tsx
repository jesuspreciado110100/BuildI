import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

interface SimpleConceptListProps {
  siteId: string;
  concepts: string[];
  onConceptPress: (siteId: string, conceptId: string, conceptName: string) => void;
}

export const SimpleConceptList: React.FC<SimpleConceptListProps> = ({ 
  siteId, 
  concepts, 
  onConceptPress 
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Concepts</Text>
      <ScrollView style={styles.conceptList}>
        {concepts.map((concept, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.conceptItem}
            onPress={() => onConceptPress(siteId, index.toString(), concept)}
          >
            <Text style={styles.conceptName}>{concept}</Text>
            <Text style={styles.conceptStatus}>Active</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  conceptList: {
    maxHeight: 200,
  },
  conceptItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 8,
  },
  conceptName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  conceptStatus: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '500',
  },
});