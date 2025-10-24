import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import ConceptGenerationWizard from './ConceptGenerationWizard';

interface ConceptListProps {
  siteId: string;
  onConceptPress: (conceptId: string) => void;
  showCreateButton?: boolean;
}

interface Concept {
  id: string;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  group?: string;
  progress: number;
  status: 'not_started' | 'in_progress' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export const ConceptList: React.FC<ConceptListProps> = ({ 
  siteId, 
  onConceptPress, 
  showCreateButton = false 
}) => {
  const router = useRouter();
  const [concepts, setConcepts] = useState<Concept[]>([
    {
      id: 'concept_1',
      description: 'Foundation Excavation',
      unit: 'CY',
      quantity: 50,
      unitPrice: 125,
      group: 'Foundation',
      progress: 75,
      status: 'in_progress',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-20T14:30:00Z'
    },
    {
      id: 'concept_2',
      description: 'Concrete Pour',
      unit: 'CY',
      quantity: 25,
      unitPrice: 150,
      group: 'Foundation',
      progress: 0,
      status: 'not_started',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z'
    }
  ]);
  const [showWizard, setShowWizard] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not_started': return '#ff6b6b';
      case 'in_progress': return '#ffa726';
      case 'completed': return '#4caf50';
      default: return '#666';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'not_started': return 'Not Started';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      default: return 'Unknown';
    }
  };

  const handleConceptsGenerated = (newConcepts: any[]) => {
    if (newConcepts && Array.isArray(newConcepts)) {
      setConcepts(prev => [...prev, ...newConcepts]);
    }
  };

  const handleUploadConcepts = () => {
    router.push(`/contractor/sites/${siteId}/upload-concepts`);
  };

  const calculateTotal = (concept: Concept) => {
    return ((concept.quantity || 0) * (concept.unitPrice || 0)).toFixed(2);
  };

  const groupedConcepts = (concepts || []).reduce((groups, concept) => {
    const group = concept.group || 'Ungrouped';
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(concept);
    return groups;
  }, {} as Record<string, Concept[]>);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Construction Concepts</Text>
        {showCreateButton && (
          <TouchableOpacity 
            style={styles.createButton}
            onPress={handleUploadConcepts}
          >
            <Text style={styles.createButtonText}>+ Upload Concept File</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <ScrollView style={styles.scrollView}>
        {Object.entries(groupedConcepts).map(([groupName, groupConcepts]) => (
          <View key={groupName} style={styles.group}>
            <Text style={styles.groupTitle}>{groupName}</Text>
            {(groupConcepts || []).map((concept) => (
              <TouchableOpacity
                key={concept.id}
                style={styles.conceptCard}
                onPress={() => onConceptPress(concept.id)}
              >
                <View style={styles.conceptHeader}>
                  <Text style={styles.conceptName}>{concept.description || 'Unnamed Concept'}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(concept.status) }]}>
                    <Text style={styles.statusText}>{getStatusLabel(concept.status)}</Text>
                  </View>
                </View>
                
                <View style={styles.conceptDetails}>
                  <Text style={styles.detailText}>Qty: {concept.quantity || 0} {concept.unit || ''}</Text>
                  <Text style={styles.detailText}>Unit Price: ${concept.unitPrice || 0}</Text>
                  <Text style={styles.totalText}>Total: ${calculateTotal(concept)}</Text>
                </View>
                
                <View style={styles.progressContainer}>
                  <Text style={styles.progressText}>Progress: {concept.progress || 0}%</Text>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${concept.progress || 0}%` }]} />
                  </View>
                </View>
                
                <View style={styles.conceptActions}>
                  <Text style={styles.actionHint}>Tap to view details and update progress</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))}
        
        {(!concepts || concepts.length === 0) && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No Concepts Yet</Text>
            <Text style={styles.emptyText}>Upload a concept file to get started</Text>
          </View>
        )}
      </ScrollView>

      <ConceptGenerationWizard
        visible={showWizard}
        onClose={() => setShowWizard(false)}
        siteId={siteId}
        onConceptsGenerated={handleConceptsGenerated}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  createButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    maxHeight: 600,
  },
  group: {
    marginBottom: 20,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 8,
    paddingLeft: 4,
  },
  conceptCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  conceptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  conceptName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  conceptDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
  },
  totalText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  conceptActions: {
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingTop: 8,
  },
  actionHint: {
    fontSize: 12,
    color: '#007AFF',
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});