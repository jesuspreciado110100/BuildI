import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SimpleProgressBar } from './SimpleProgressBar';

interface ProgressGraphProps {
  siteId: string;
}

interface TaskProgress {
  id: string;
  name: string;
  progress: number;
  status: 'completed' | 'in-progress' | 'pending';
}

export const SimpleProgressGraph: React.FC<ProgressGraphProps> = ({ siteId }) => {
  const tasks: TaskProgress[] = [
    { id: '1', name: 'Foundation', progress: 100, status: 'completed' },
    { id: '2', name: 'Framing', progress: 75, status: 'in-progress' },
    { id: '3', name: 'Electrical', progress: 30, status: 'in-progress' },
    { id: '4', name: 'Plumbing', progress: 0, status: 'pending' },
    { id: '5', name: 'HVAC', progress: 0, status: 'pending' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10B981';
      case 'in-progress': return '#3B82F6';
      case 'pending': return '#9CA3AF';
      default: return '#9CA3AF';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Task Progress</Text>
      <ScrollView style={styles.taskList}>
        {tasks.map((task) => (
          <View key={task.id} style={styles.taskItem}>
            <View style={styles.taskHeader}>
              <Text style={styles.taskName}>{task.name}</Text>
              <Text style={styles.taskProgress}>{task.progress}%</Text>
            </View>
            <SimpleProgressBar 
              progress={task.progress}
              color={getStatusColor(task.status)}
              height={6}
            />
            <Text style={[styles.taskStatus, { color: getStatusColor(task.status) }]}>
              {task.status.replace('-', ' ').toUpperCase()}
            </Text>
          </View>
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
  taskList: {
    maxHeight: 300,
  },
  taskItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  taskProgress: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  taskStatus: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
});