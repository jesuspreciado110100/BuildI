import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface CompletedJobsTabProps {
  userId: string;
  userRole: string;
}

export const CompletedJobsTab: React.FC<CompletedJobsTabProps> = ({ userId, userRole }) => {
  const { theme } = useTheme();
  
  const completedJobs = [
    { id: '1', title: 'Concrete Pouring', location: 'Site A', completedDate: '2024-01-15', rating: 4.8 },
    { id: '2', title: 'Roofing Installation', location: 'Site B', completedDate: '2024-01-10', rating: 4.9 },
    { id: '3', title: 'Interior Painting', location: 'Site C', completedDate: '2024-01-05', rating: 4.7 }
  ];

  return (
    <ScrollView style={styles.container}>
      {completedJobs.map((job) => (
        <View key={job.id} style={[styles.jobCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Text style={[styles.jobTitle, { color: theme.colors.text }]}>{job.title}</Text>
          <Text style={[styles.jobLocation, { color: theme.colors.textSecondary }]}>{job.location}</Text>
          <View style={styles.footer}>
            <Text style={[styles.completedDate, { color: theme.colors.textSecondary }]}>Completed: {job.completedDate}</Text>
            <View style={styles.rating}>
              <Text style={[styles.ratingText, { color: theme.colors.success }]}>⭐ {job.rating}</Text>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  jobCard: { padding: 16, marginBottom: 12, borderRadius: 8, borderWidth: 1 },
  jobTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  jobLocation: { fontSize: 14, marginBottom: 12 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  completedDate: { fontSize: 12 },
  rating: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { fontSize: 12, fontWeight: 'bold' }
});