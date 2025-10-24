import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { realtimeService } from '../services/RealtimeService';
import { ProjectService } from '../services/ProjectService';
import ProjectCard from './ProjectCard';

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

interface RealtimeProjectListProps {
  constructionType?: string;
  onProjectPress?: (project: Project) => void;
}

export const RealtimeProjectList: React.FC<RealtimeProjectListProps> = ({
  constructionType,
  onProjectPress
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadProjects();
    subscribeToProjects();
    
    return () => {
      realtimeService.unsubscribe('projects');
    };
  }, [constructionType]);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const allProjects = await ProjectService.getProjects();
      const filteredProjects = constructionType 
        ? allProjects.filter(p => p.construction_type === constructionType)
        : allProjects;
      setProjects(filteredProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToProjects = () => {
    realtimeService.subscribeToProjects((payload) => {
      const { eventType, new: newRecord, old: oldRecord } = payload;
      
      switch (eventType) {
        case 'INSERT':
          if (!constructionType || newRecord.construction_type === constructionType) {
            setProjects(prev => [newRecord, ...prev]);
          }
          break;
          
        case 'UPDATE':
          setProjects(prev => prev.map(project => 
            project.id === newRecord.id ? newRecord : project
          ));
          break;
          
        case 'DELETE':
          setProjects(prev => prev.filter(project => project.id !== oldRecord.id));
          break;
      }
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProjects();
    setRefreshing(false);
  };

  const renderProject = ({ item }: { item: Project }) => (
    <ProjectCard
      project={item}
      onPress={() => onProjectPress?.(item)}
    />
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={projects}
        keyExtractor={(item) => item.id}
        renderItem={renderProject}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#2196F3']}
            tintColor="#2196F3"
          />
        }
        numColumns={1}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  separator: {
    height: 12,
  },
});

export default RealtimeProjectList;