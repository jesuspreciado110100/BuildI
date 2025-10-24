import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { JobSupabaseService, Job } from '../services/JobSupabaseService';

interface Concept {
  id: string;
  name: string;
  description: string;
}

interface ConceptJobsViewProps {
  concept: Concept;
  siteId: string;
  onBack: () => void;
}

export const ConceptJobsView: React.FC<ConceptJobsViewProps> = ({
  concept,
  siteId,
  onBack,
}) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState({
    totalValue: 0,
    completedJobs: 0,
    pendingJobs: 0
  });

  useEffect(() => {
    loadJobs();
  }, [concept.id, siteId]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const conceptJobs = await JobSupabaseService.getJobsByConcept(siteId, concept.id);
      setJobs(conceptJobs || []);
      
      // Calculate statistics
      const validJobs = conceptJobs || [];
      const totalValue = validJobs.reduce((sum, job) => sum + (job.quantity * job.unit_price), 0);
      const completedJobs = validJobs.filter(job => job.status === 'completed').length;
      const pendingJobs = validJobs.filter(job => job.status === 'pending').length;
      setStatistics({ totalValue, completedJobs, pendingJobs });
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'in_progress': return '#FF9800';
      default: return '#9E9E9E';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completado';
      case 'in_progress': return 'En Progreso';
      default: return 'Pendiente';
    }
  };

  const handleStatusChange = async (jobId: string, newStatus: string) => {
    const success = await JobSupabaseService.updateJobStatus(jobId, newStatus);
    if (success) {
      loadJobs(); // Reload jobs to reflect changes
    }
  };

  const renderJob = ({ item }: { item: Job }) => (
    <View style={styles.jobCard}>
      <View style={styles.jobHeader}>
        <Text style={styles.jobCode}>{item.job_id}</Text>
        <TouchableOpacity 
          style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status || 'pending') }]}
          onPress={() => {
            const nextStatus = item.status === 'pending' ? 'in_progress' : 
                             item.status === 'in_progress' ? 'completed' : 'pending';
            handleStatusChange(item.id!, nextStatus);
          }}
        >
          <Text style={styles.statusText}>{getStatusText(item.status || 'pending')}</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.jobDescription} numberOfLines={3}>
        {item.description}
      </Text>
      
      <View style={styles.jobDetails}>
        <Text style={styles.detailText}>
          Cantidad: {item.quantity} {item.unit}
        </Text>
        <Text style={styles.detailText}>
          Precio Unit.: ${item.unit_price.toLocaleString()}
        </Text>
        <Text style={styles.totalPrice}>
          Total: ${(item.quantity * item.unit_price).toLocaleString()}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Cargando trabajos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.conceptTitle}>{concept.name}</Text>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{jobs.length}</Text>
          <Text style={styles.statLabel}>Trabajos</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{statistics.completedJobs}</Text>
          <Text style={styles.statLabel}>Completados</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>${statistics.totalValue.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Valor Total</Text>
        </View>
      </View>
      
      {jobs.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No hay trabajos en este concepto</Text>
          <Text style={styles.emptySubtext}>
            Los trabajos aparecerán aquí cuando se suban al catálogo
          </Text>
        </View>
      ) : (
        <FlatList
          data={jobs}
          renderItem={renderJob}
          keyExtractor={(item) => item.id!}
          style={styles.jobsList}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginBottom: 8,
  },
  backText: {
    color: '#2196F3',
    fontSize: 16,
  },
  conceptTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  jobsList: {
    flex: 1,
    padding: 16,
  },
  jobCard: {
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
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  jobCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  jobDescription: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 12,
  },
  jobDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 12,
    color: '#666',
  },
  totalPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});