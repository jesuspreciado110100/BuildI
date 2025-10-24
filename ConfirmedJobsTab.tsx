import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

export const ConfirmedJobsTab: React.FC = () => {
  const mockJobs = [
    {
      id: '1',
      title: 'Roofing Project',
      startDate: '2024-01-25',
      duration: '5 days',
      budget: '$12,000'
    },
    {
      id: '2',
      title: 'Plumbing Installation',
      startDate: '2024-01-30',
      duration: '3 days',
      budget: '$6,500'
    }
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Confirmed Jobs</Text>
      <ScrollView style={styles.scrollView}>
        {mockJobs.map(job => (
          <View key={job.id} style={styles.jobCard}>
            <Text style={styles.jobTitle}>{job.title}</Text>
            <Text style={styles.jobDate}>Start: {job.startDate}</Text>
            <Text style={styles.jobDuration}>Duration: {job.duration}</Text>
            <Text style={styles.jobBudget}>Budget: {job.budget}</Text>
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
  jobCard: { backgroundColor: 'white', padding: 15, borderRadius: 8, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  jobTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  jobDate: { color: '#666', marginBottom: 3 },
  jobDuration: { color: '#666', marginBottom: 3 },
  jobBudget: { color: '#2563eb', fontWeight: '600' }
});