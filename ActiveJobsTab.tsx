import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface ActiveJobsTabProps {
  userId: string;
  userRole: string;
}

export const ActiveJobsTab: React.FC<ActiveJobsTabProps> = ({ userId, userRole }) => {
  const { theme } = useTheme();
  
  const jobs = [
    { id: '1', title: 'Foundation Work', location: 'Site A', progress: 75, status: 'active' },
    { id: '2', title: 'Electrical Installation', location: 'Site B', progress: 45, status: 'active' },
    { id: '3', title: 'Plumbing', location: 'Site C', progress: 90, status: 'active' }
  ];

  return (
    <ScrollView style={styles.container}>
      {jobs.map((job) => (
        <View key={job.id} style={[styles.jobCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Text style={[styles.jobTitle, { color: theme.colors.text }]}>{job.title}</Text>
          <Text style={[styles.jobLocation, { color: theme.colors.textSecondary }]}>{job.location}</Text>
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
              <View style={[styles.progressFill, { width: `${job.progress}%`, backgroundColor: theme.colors.primary }]} />
            </View>
            <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>{job.progress}%</Text>
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
  progressContainer: { flexDirection: 'row', alignItems: 'center' },
  progressBar: { flex: 1, height: 6, borderRadius: 3, marginRight: 8 },
  progressFill: { height: '100%', borderRadius: 3 },
  progressText: { fontSize: 12, minWidth: 35 }
});