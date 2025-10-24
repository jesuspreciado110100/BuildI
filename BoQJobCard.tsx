import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface BoQJobCardProps {
  job: {
    id: string;
    title: string;
    status: string;
    labor: { crew: number; cost: number };
    materials: Array<{ name: string; quantity: number; cost: number }>;
    machinery: Array<{ name: string; hours: number; cost: number }>;
  };
  onComplete: () => void;
  onStatusChange: () => void;
}

export const BoQJobCard: React.FC<BoQJobCardProps> = ({ 
  job, 
  onComplete, 
  onStatusChange 
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'in_progress': return '#FF9800';
      default: return '#757575';
    }
  };

  const totalCost = job.labor.cost + 
    job.materials.reduce((sum, m) => sum + m.cost, 0) +
    job.machinery.reduce((sum, m) => sum + m.cost, 0);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{job.title}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(job.status) }]}>
          <Text style={styles.statusText}>{job.status}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="engineering" size={20} color="#666" />
          <Text style={styles.sectionTitle}>Labor</Text>
        </View>
        <Text style={styles.detail}>{job.labor.crew} crew • ${job.labor.cost}</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="inventory" size={20} color="#666" />
          <Text style={styles.sectionTitle}>Materials</Text>
        </View>
        <Text style={styles.detail}>
          {job.materials.length} items • ${job.materials.reduce((sum, m) => sum + m.cost, 0)}
        </Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="construction" size={20} color="#666" />
          <Text style={styles.sectionTitle}>Machinery</Text>
        </View>
        <Text style={styles.detail}>
          {job.machinery.length} items • ${job.machinery.reduce((sum, m) => sum + m.cost, 0)}
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.totalCost}>Total: ${totalCost}</Text>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={onStatusChange}>
            <MaterialIcons name="edit" size={18} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={onComplete}>
            <MaterialIcons name="check-circle" size={18} color="#4CAF50" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
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
    fontWeight: '500',
  },
  section: {
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  detail: {
    fontSize: 13,
    color: '#666',
    marginLeft: 28,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  totalCost: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 8,
  },
});