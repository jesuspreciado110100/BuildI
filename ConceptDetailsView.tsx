import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

interface ConceptDetailsViewProps {
  siteId: string;
  conceptId: string;
  conceptName: string;
  onClose: () => void;
}

export const ConceptDetailsView: React.FC<ConceptDetailsViewProps> = ({ 
  siteId, 
  conceptId, 
  conceptName, 
  onClose 
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{conceptName}</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Concept Details</Text>
          <Text style={styles.detail}>Name: {conceptName}</Text>
          <Text style={styles.detail}>Site ID: {siteId}</Text>
          <Text style={styles.detail}>Concept ID: {conceptId}</Text>
          <Text style={styles.detail}>Status: In Progress</Text>
          <Text style={styles.detail}>Progress: 45%</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>
            This concept involves the {conceptName.toLowerCase()} work for the construction project. 
            Progress is being tracked and updated regularly.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  title: { fontSize: 20, fontWeight: 'bold' },
  closeButton: { padding: 8 },
  closeText: { fontSize: 18, color: '#666' },
  content: { flex: 1, padding: 16 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  detail: { fontSize: 16, marginBottom: 8, color: '#333' },
  description: { fontSize: 16, color: '#666', lineHeight: 24 }
});