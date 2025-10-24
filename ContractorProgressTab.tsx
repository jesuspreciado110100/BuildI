import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

export const ContractorProgressTab: React.FC = () => {
  const mockProgress = [
    {
      id: '1',
      project: 'Foundation Work',
      phase: 'Excavation',
      progress: 85,
      lastUpdate: '2024-01-18'
    },
    {
      id: '2',
      project: 'Framing',
      phase: 'Wall Assembly',
      progress: 45,
      lastUpdate: '2024-01-17'
    }
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Project Progress</Text>
      <ScrollView style={styles.scrollView}>
        {mockProgress.map(item => (
          <View key={item.id} style={styles.progressCard}>
            <Text style={styles.projectTitle}>{item.project}</Text>
            <Text style={styles.phase}>Phase: {item.phase}</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${item.progress}%` }]} />
            </View>
            <Text style={styles.progressText}>{item.progress}% Complete</Text>
            <Text style={styles.lastUpdate}>Updated: {item.lastUpdate}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  scrollView: { flex: 1 },
  progressCard: { backgroundColor: 'white', padding: 15, borderRadius: 8, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  projectTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  phase: { color: '#666', marginBottom: 8 },
  progressBar: { height: 8, backgroundColor: '#e5e7eb', borderRadius: 4, marginBottom: 5 },
  progressFill: { height: '100%', backgroundColor: '#10b981', borderRadius: 4 },
  progressText: { color: '#10b981', fontWeight: '600', marginBottom: 3 },
  lastUpdate: { color: '#666', fontSize: 12 }
});