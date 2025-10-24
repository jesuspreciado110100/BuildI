import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '../../lib/supabase';
import ProjectOverviewSection from '../../components/project-details/ProjectOverviewSection';
import ProjectTimelineSection from '../../components/project-details/ProjectTimelineSection';
import ProjectBudgetSection from '../../components/project-details/ProjectBudgetSection';
import ProjectTeamSection from '../../components/project-details/ProjectTeamSection';
import ProjectPhotosSection from '../../components/project-details/ProjectPhotosSection';
import ProjectDocumentsSection from '../../components/project-details/ProjectDocumentsSection';
import ProjectActionButtons from '../../components/project-details/ProjectActionButtons';

export default function ProjectDetail() {
  const { projectId } = useLocalSearchParams();
  const [project, setProject] = useState(null);
  const [site, setSite] = useState(null);
  const [budgetBreakdown, setBudgetBreakdown] = useState({ labor: 0, materials: 0, equipment: 0, other: 0 });
  const [teamMembers, setTeamMembers] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!projectId) {
      setError('No project ID provided');
      setLoading(false);
      return;
    }

    async function fetchProjectData() {
      try {
        setLoading(true);

        // Fetch project from projects table
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('project_id, name, description, status, image_url, start_date, end_date, progress, budget, location')
          .eq('project_id', projectId)
          .single();

        if (projectError) throw new Error(`Project fetch error: ${projectError.message}`);
        setProject(projectData);

        // Fetch site from sites table
        const { data: siteData, error: siteError } = await supabase
          .from('sites')
          .select('id, project_id, location, name')
          .eq('project_id', projectId)
          .maybeSingle();

        if (siteError && siteError.code !== 'PGRST116') throw new Error(`Site fetch error: ${siteError.message}`);
        setSite(siteData);

        // Fetch budget breakdown from catalog_items
        const { data: itemsData, error: itemsError } = await supabase
          .from('catalog_items')
          .select('total_cost, category')
          .eq('project_id', projectId);

        if (itemsError) console.warn('Catalog items error:', itemsError.message);
        const breakdown = { labor: 0, materials: 0, equipment: 0, other: 0 };
        itemsData?.forEach(item => {
          const category = item.category?.toLowerCase() || 'other';
          if (breakdown.hasOwnProperty(category)) {
            breakdown[category] += item.total_cost || 0;
          } else {
            breakdown.other += item.total_cost || 0;
          }
        });
        setBudgetBreakdown(breakdown);

        // Fetch team members
        const { data: teamData, error: teamError } = await supabase
          .from('team_members')
          .select('*')
          .eq('project_id', projectId);

        if (teamError) console.warn('Team fetch error:', teamError.message);
        setTeamMembers(teamData || []);

        // Fetch photos
        const { data: photosData, error: photosError } = await supabase
          .from('project_photos')
          .select('*')
          .eq('project_id', projectId)
          .order('uploaded_at', { ascending: false });

        if (photosError) console.warn('Photos fetch error:', photosError.message);
        setPhotos(photosData || []);

        // Fetch documents
        const { data: docsData, error: docsError } = await supabase
          .from('project_documents')
          .select('*')
          .eq('project_id', projectId)
          .order('uploaded_at', { ascending: false });

        if (docsError) console.warn('Documents fetch error:', docsError.message);
        setDocuments(docsData || []);

        // Fetch materials for proposals
        const { data: materialsData, error: materialsError } = await supabase
          .rpc('get_materials_by_trade', { trade_name: 'Concrete' });

        if (materialsError) console.warn('Materials fetch error:', materialsError.message);
        setMaterials(materialsData || []);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProjectData();
  }, [projectId]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Error loading project: {error}</Text>
      </View>
    );
  }

  if (!project) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Project not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <ProjectOverviewSection project={project} site={site} />
      <ProjectTimelineSection project={project} />
      <ProjectBudgetSection budget={project.budget} breakdown={budgetBreakdown} />
      <ProjectTeamSection teamMembers={teamMembers} />
      <ProjectPhotosSection photos={photos} projectId={projectId} />
      <ProjectDocumentsSection documents={documents} />
      <ProjectActionButtons projectId={projectId} materials={materials} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ff3b30',
    textAlign: 'center',
  },
});
