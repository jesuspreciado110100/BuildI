import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

interface Site {
  id: string;
  name: string;
  location: string;
  status: string;
  progress: number;
  startDate: string;
  endDate: string;
  budget: string;
  description: string;
  documents: string[];
  concepts: string[];
}

interface SiteTabsViewProps {
  site: Site;
  onClose: () => void;
  onConceptPress: (siteId: string, conceptId: string, conceptName: string) => void;
}

export const SiteTabsView: React.FC<SiteTabsViewProps> = ({ site, onClose, onConceptPress }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{site.name}</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Site Details</Text>
          <Text style={styles.detail}>Location: {site.location}</Text>
          <Text style={styles.detail}>Status: {site.status}</Text>
          <Text style={styles.detail}>Progress: {site.progress}%</Text>
          <Text style={styles.detail}>Budget: {site.budget}</Text>
          <Text style={styles.detail}>Description: {site.description}</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Concepts</Text>
          {site.concepts.map((concept, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.conceptItem}
              onPress={() => onConceptPress(site.id, index.toString(), concept)}
            >
              <Text style={styles.conceptText}>{concept}</Text>
            </TouchableOpacity>
          ))}
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
  conceptItem: { backgroundColor: '#f0f0f0', padding: 12, borderRadius: 8, marginBottom: 8 },
  conceptText: { fontSize: 16, color: '#333' }
});