import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProjectStatusUpdater from './ProjectStatusUpdater';

interface Project {
  id?: string;
  project_id?: string;
  title?: string;
  name?: string;
  description: string;
  status: string;
  construction_type: string;
  budget?: number;
  location?: string;
  start_date?: string;
  end_date?: string;
  client_name?: string;
  progress?: number;
  progress_percentage?: number;
  created_at: string;
  image?: string;
  image_url?: string;
}

interface ProjectCardProps {
  project: Project;
  onPress?: (project: Project) => void;
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active': return '#10b981';
    case 'pending': return '#f59e0b';
    case 'completed': return '#3b82f6';
    case 'on_hold': return '#ef4444';
    default: return '#6b7280';
  }
};

const getConstructionTypeIcon = (type: string) => {
  const iconMap: { [key: string]: any } = {
    'residential': 'home',
    'commercial': 'business',
    'infrastructure': 'construct',
    'industrial': 'construct',
    'institutional': 'library',
    'agricultural': 'leaf',
    'warehouse': 'cube',
    'educational': 'school',
    'hospitality': 'bed',
    'healthcare': 'medical'
  };
  return iconMap[type] || 'business-outline';
};

export default function ProjectCard({ project, onPress }: ProjectCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const projectId = project.id || project.project_id || '';
  const projectName = project.title || project.name || 'Untitled Project';
  const projectImage = project.image || project.image_url;
  const progress = project.progress || project.progress_percentage || 0;

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => onPress?.(project)}
      activeOpacity={0.7}
    >
      {projectImage && (
        <Image 
          source={{ uri: projectImage }} 
          style={styles.projectImage}
          resizeMode="cover"
        />
      )}
      
      <View style={styles.cardContent}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons 
              name={getConstructionTypeIcon(project.construction_type)} 
              size={24} 
              color="#3b82f6" 
            />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.projectName} numberOfLines={1}>
              {projectName}
            </Text>
            <View style={styles.statusContainer}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor(project.status) }]} />
              <Text style={styles.statusText}>{project.status}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {project.description || 'No description available'}
        </Text>

        <View style={styles.details}>
          {project.client_name && (
            <View style={styles.detailRow}>
              <Ionicons name="person-outline" size={16} color="#6b7280" />
              <Text style={styles.detailText}>{project.client_name}</Text>
            </View>
          )}
          
          {project.location && (
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={16} color="#6b7280" />
              <Text style={styles.detailText}>{project.location}</Text>
            </View>
          )}

          {project.budget && (
            <View style={styles.detailRow}>
              <Ionicons name="cash-outline" size={16} color="#6b7280" />
              <Text style={styles.detailText}>${project.budget.toLocaleString()}</Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color="#6b7280" />
            <Text style={styles.detailText}>Created: {formatDate(project.created_at)}</Text>
          </View>
        </View>

        {progress !== undefined && (
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Progress</Text>
              <Text style={styles.progressText}>{progress}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${progress}%` }
                ]} 
              />
            </View>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.constructionType}>
            {project.construction_type.charAt(0).toUpperCase() + project.construction_type.slice(1)}
          </Text>
          
          {projectId && (
            <ProjectStatusUpdater
              projectId={projectId}
              currentStatus={project.status}
              currentProgress={progress}
            />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  projectImage: {
    width: '100%',
    height: 160,
  },
  cardContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  projectName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
    textTransform: 'capitalize',
  },
  description: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 16,
  },
  details: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 8,
    flex: 1,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  constructionType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
});