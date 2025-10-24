import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import ConstructionTypesCarousel, { ConstructionType } from '@/app/components/ConstructionTypesCarousel';
import ProjectCard from '@/app/components/ProjectCard';
import { ProjectService, Project as ProjectData } from '@/app/services/ProjectService';
import { LocationService, UserLocation } from '@/app/services/LocationService';


interface Project {
  id: string;
  title: string;
  description: string;
  image_url: string;
  location: string;
  budget: number;
  status: string;
  progress: number;
  start_date: string;
  end_date: string;
  construction_type: string;
  client_name: string;
  contractor_name?: string;
  created_at: string;
  updated_at: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const [selectedConstructionType, setSelectedConstructionType] = useState<ConstructionType | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    loadProjects();
  }, [selectedConstructionType, locationEnabled]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      
      // First, try to fetch the 3 specific project IDs
      const specificProjectIds = [
        '02467be4-8500-4bed-8066-5c967e454c6b',
        '21fe53d7-0d93-4901-b76d-575611e160b7',
        '5043c4ce-a8e8-4ce0-9165-14e578aa36b0'
      ];
      
      let allProjects: ProjectData[] = [];
      
      // Try to fetch specific projects first
      const specificProjects = await ProjectService.getProjectsByIds(specificProjectIds);
      
      if (specificProjects.length > 0) {
        // If we have specific projects, use them
        allProjects = specificProjects;
        
        // Filter by construction type if selected
        if (selectedConstructionType && selectedConstructionType.id !== 'all') {
          allProjects = allProjects.filter(p => p.construction_type === selectedConstructionType.id);
        }
      } else {
        // Fallback to fetching all projects
        if (locationEnabled && userLocation) {
          allProjects = await ProjectService.getNearbyProjects(
            { 
              latitude: userLocation.latitude, 
              longitude: userLocation.longitude,
              radiusKm: 50 
            },
            selectedConstructionType?.id
          );
        } else {
          allProjects = await ProjectService.getProjects(
            selectedConstructionType?.id
          );
        }
      }

      const mappedProjects = allProjects.map(p => ({
        id: p.project_id,
        title: p.name,
        description: p.description,
        image_url: p.image_url || p.image || '',
        location: p.location || '',
        budget: p.budget || 0,
        status: p.status,
        progress: p.progress || 0,
        start_date: p.start_date || '',
        end_date: p.end_date || '',
        construction_type: p.construction_type,
        client_name: '',
        created_at: p.created_at,
        updated_at: p.updated_at || p.created_at,
      }));


      setProjects(mappedProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProjects();
    setRefreshing(false);
  };

  const handleConstructionTypeSelect = (type: ConstructionType | null) => {
    setSelectedConstructionType(type);
  };

  const handleProjectPress = (project: Project) => {
    router.push(`/builder/projects/${project.id}`);
  };

  const toggleLocation = async () => {
    if (!locationEnabled) {
      setLocationLoading(true);
      const location = await LocationService.getCurrentLocation();
      setLocationLoading(false);
      
      if (location) {
        setUserLocation(location);
        setLocationEnabled(true);
      } else {
        alert('Unable to get your location. Please enable location services.');
      }
    } else {
      setLocationEnabled(false);
      setUserLocation(null);
    }
  };


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#3b82f6']}
            tintColor="#3b82f6"
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Find Projects</Text>
          <TouchableOpacity 
            style={[styles.locationButton, locationEnabled && styles.locationButtonActive]}
            onPress={toggleLocation}
            disabled={locationLoading}
          >
            {locationLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons 
                name={locationEnabled ? "location" : "location-outline"} 
                size={20} 
                color="#fff" 
              />
            )}
            <Text style={styles.locationButtonText}>
              {locationEnabled ? 'Nearby' : 'All'}
            </Text>
          </TouchableOpacity>
        </View>

        <ConstructionTypesCarousel 
          onTypeSelect={handleConstructionTypeSelect}
          selectedType={selectedConstructionType}
        />
        
        <View style={styles.projectsSection}>
          <Text style={styles.sectionTitle}>
            {locationEnabled ? 'Nearby ' : ''}
            {selectedConstructionType 
              ? `${selectedConstructionType.name} Projects` 
              : 'All Projects'}
          </Text>
          
          {loading ? (
            <ActivityIndicator size="large" color="#3b82f6" style={styles.loader} />
          ) : projects.length === 0 ? (
            <Text style={styles.emptyText}>No projects found</Text>
          ) : (
            projects.map(project => (
              <View key={project.id} style={styles.projectCard}>
                <ProjectCard
                  project={project}
                  onPress={() => handleProjectPress(project)}
                />
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#64748b',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  locationButtonActive: {
    backgroundColor: '#3b82f6',
  },
  locationButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  projectsSection: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1e293b',
  },
  loader: {
    marginVertical: 32,
  },
  emptyText: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: 14,
    marginVertical: 32,
  },
  projectCard: {
    marginBottom: 16,
  },
});
