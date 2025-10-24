import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ConceptListView } from '@/app/components/ConceptListView';
import { ConceptJobsView } from '@/app/components/ConceptJobsView';
import { JobCatalogUploader } from '@/app/components/JobCatalogUploader';
import { ParsedJobCatalog } from '@/app/services/JobCatalogParser';

interface Concept {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  progress: number;
}

export default function SiteDetailsScreen() {
  const { siteId } = useLocalSearchParams<{ siteId: string }>();
  const [concepts, setConcepts] = useState<Concept[]>([
    {
      id: 'cimentacion-principal',
      name: 'Cimentación Principal',
      description: 'Trabajos de cimentación y excavación',
      status: 'in_progress',
      progress: 65
    },
    {
      id: 'estructura-principal', 
      name: 'Estructura Principal',
      description: 'Estructura de concreto y acero',
      status: 'pending',
      progress: 0
    }
  ]);
  const [selectedConcept, setSelectedConcept] = useState<Concept | null>(null);
  const [showUploader, setShowUploader] = useState(false);

  const handleConceptPress = (concept: Concept) => {
    setSelectedConcept(concept);
  };

  const handleBackPress = () => {
    setSelectedConcept(null);
    setShowUploader(false);
  };

  const handleJobsUploaded = (parsedData: ParsedJobCatalog) => {
    console.log('Jobs uploaded:', parsedData);
    setShowUploader(false);
  };

  if (showUploader) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Text style={styles.backText}>← Volver</Text>
          </TouchableOpacity>
        </View>
        <JobCatalogUploader
          siteId={siteId || ''}
          onJobsUploaded={handleJobsUploaded}
        />
      </View>
    );
  }

  if (selectedConcept) {
    return (
      <ConceptJobsView
        concept={selectedConcept}
        siteId={siteId || ''}
        onBack={handleBackPress}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.siteHeader}>
        <Text style={styles.siteTitle}>Detalles del Sitio</Text>
        <TouchableOpacity 
          onPress={() => setShowUploader(true)}
          style={styles.uploadButton}
        >
          <Text style={styles.uploadButtonText}>Subir Catálogo</Text>
        </TouchableOpacity>
      </View>
      
      <ConceptListView
        concepts={concepts}
        onConceptPress={handleConceptPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  siteHeader: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  siteTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  uploadButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  backText: {
    color: '#007AFF',
    fontSize: 16,
  },
});