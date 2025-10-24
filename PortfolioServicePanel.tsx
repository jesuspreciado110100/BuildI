import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ConceptCostCalculator from './ConceptCostCalculator';
import ConceptListModal from './ConceptListModal';
import { supabase } from '@/app/lib/supabase';

const { width } = Dimensions.get('window');

interface Project {
  id: string;
  name: string;
  status: string;
  progress: number;
  conceptCount: number;
}

export default function PortfolioServicePanel() {
  const [activeTab, setActiveTab] = useState('overview');
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showConceptList, setShowConceptList] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const projectsWithCounts = data?.map(project => ({
        ...project,
        conceptCount: Math.floor(Math.random() * 50) + 10
      })) || [];
      
      setProjects(projectsWithCounts);
      if (projectsWithCounts.length > 0) {
        setSelectedProject(projectsWithCounts[0]);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'analytics-outline' },
    { id: 'concepts', label: 'Concepts', icon: 'layers-outline' },
    { id: 'calculator', label: 'Calculator', icon: 'calculator-outline' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <View style={styles.contentContainer}>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{projects.length}</Text>
                <Text style={styles.statLabel}>Active Projects</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{selectedProject?.conceptCount || 0}</Text>
                <Text style={styles.statLabel}>Total Concepts</Text>
              </View>
            </View>
            
            {selectedProject && (
              <View style={styles.projectCard}>
                <View style={styles.projectHeader}>
                  <TouchableOpacity 
                    onPress={() => setShowConceptList(true)}
                    style={styles.projectNameButton}
                  >
                    <Text style={styles.projectName}>{selectedProject.name}</Text>
                    <Ionicons name="chevron-forward" size={16} color="#2196F3" />
                  </TouchableOpacity>
                </View>
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${selectedProject.progress || 45}%` }]} />
                  </View>
                  <Text style={styles.progressText}>{selectedProject.progress || 45}%</Text>
                </View>
              </View>
            )}
          </View>
        );
      case 'concepts':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.sectionTitle}>Project Concepts</Text>
            {projects.map(project => (
              <TouchableOpacity 
                key={project.id} 
                style={styles.conceptProjectCard}
                onPress={() => {
                  setSelectedProject(project);
                  setShowConceptList(true);
                }}
              >
                <Text style={styles.conceptProjectName}>{project.name}</Text>
                <View style={styles.conceptProjectMeta}>
                  <Text style={styles.conceptCount}>{project.conceptCount} concepts</Text>
                  <Ionicons name="chevron-forward" size={16} color="#666" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        );
      case 'calculator':
        return <ConceptCostCalculator />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.activeTab]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Ionicons 
              name={tab.icon as any} 
              size={18} 
              color={activeTab === tab.id ? '#2196F3' : '#666'} 
            />
            <Text style={[styles.tabLabel, activeTab === tab.id && styles.activeTabLabel]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.content}>
        {renderTabContent()}
      </View>

      <ConceptListModal
        visible={showConceptList}
        onClose={() => setShowConceptList(false)}
        projectId={selectedProject?.id}
        projectName={selectedProject?.name || ''}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  tabContainer: { flexDirection: 'row', backgroundColor: '#fff', paddingHorizontal: 4, paddingTop: 8 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, paddingHorizontal: 8, borderRadius: 8, marginHorizontal: 2 },
  activeTab: { backgroundColor: '#e3f2fd' },
  tabLabel: { fontSize: 12, fontWeight: '500', color: '#666', marginLeft: 4 },
  activeTabLabel: { color: '#2196F3', fontWeight: '600' },
  content: { flex: 1 },
  contentContainer: { padding: 16 },
  statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  statValue: { fontSize: 24, fontWeight: '700', color: '#333', marginBottom: 4 },
  statLabel: { fontSize: 11, color: '#666', textAlign: 'center' },
  projectCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  projectHeader: { marginBottom: 12 },
  projectNameButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  projectName: { fontSize: 16, fontWeight: '600', color: '#2196F3' },
  progressContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  progressBar: { flex: 1, height: 6, backgroundColor: '#e0e0e0', borderRadius: 3 },
  progressFill: { height: '100%', backgroundColor: '#4CAF50', borderRadius: 3 },
  progressText: { fontSize: 12, fontWeight: '600', color: '#666' },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 16 },
  conceptProjectCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  conceptProjectName: { fontSize: 14, fontWeight: '600', color: '#333', flex: 1 },
  conceptProjectMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  conceptCount: { fontSize: 12, color: '#666' }
});