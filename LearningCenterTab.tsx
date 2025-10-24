import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LearningModule, LearningProgress } from '../types/Learning';
import { learningCenterService } from '../services/LearningCenterService';

interface LearningCenterTabProps {
  userRole: string;
  userId: string;
}

export const LearningCenterTab: React.FC<LearningCenterTabProps> = ({ userRole, userId }) => {
  const [modules, setModules] = useState<LearningModule[]>([]);
  const [progress, setProgress] = useState<LearningProgress | null>(null);
  const [selectedModule, setSelectedModule] = useState<LearningModule | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [userRole, userId]);

  const loadData = async () => {
    try {
      const [moduleData, progressData] = await Promise.all([
        learningCenterService.getModulesForRole(userRole),
        learningCenterService.getProgress(userRole, userId)
      ]);
      setModules(moduleData);
      setProgress(progressData);
    } catch (error) {
      console.error('Error loading learning data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleModuleComplete = async (moduleId: string) => {
    try {
      await learningCenterService.markStepComplete(moduleId);
      await loadData();
    } catch (error) {
      console.error('Error marking module complete:', error);
    }
  };

  const renderModuleItem = (module: LearningModule) => (
    <TouchableOpacity
      key={module.id}
      style={[styles.moduleCard, module.completed && styles.completedModule]}
      onPress={() => setSelectedModule(module)}
    >
      <View style={styles.moduleHeader}>
        <Text style={styles.moduleTitle}>{module.title}</Text>
        <View style={[styles.statusBadge, module.completed && styles.completedBadge]}>
          <Text style={styles.statusText}>
            {module.completed ? '✓' : module.content_type.toUpperCase()}
          </Text>
        </View>
      </View>
      <Text style={styles.moduleDescription}>{module.description}</Text>
      {module.duration_minutes && (
        <Text style={styles.duration}>{module.duration_minutes} min</Text>
      )}
    </TouchableOpacity>
  );

  const renderModuleContent = () => {
    if (!selectedModule) return null;

    return (
      <View style={styles.contentView}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setSelectedModule(null)}
        >
          <Text style={styles.backText}>← Back to Modules</Text>
        </TouchableOpacity>
        
        <Text style={styles.contentTitle}>{selectedModule.title}</Text>
        
        {selectedModule.content_type === 'video' && (
          <View style={styles.videoPlaceholder}>
            <Text style={styles.videoText}>🎥 Video Player</Text>
            <Text style={styles.videoUrl}>{selectedModule.video_url}</Text>
          </View>
        )}
        
        <ScrollView style={styles.contentScroll}>
          <Text style={styles.contentText}>{selectedModule.content}</Text>
        </ScrollView>
        
        {!selectedModule.completed && (
          <TouchableOpacity
            style={styles.completeButton}
            onPress={() => handleModuleComplete(selectedModule.id)}
          >
            <Text style={styles.completeButtonText}>Mark as Complete</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading learning modules...</Text>
      </View>
    );
  }

  if (selectedModule) {
    return renderModuleContent();
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Learning Center</Text>
        <Text style={styles.roleText}>Role: {userRole.replace('_', ' ').toUpperCase()}</Text>
      </View>
      
      {progress && (
        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>Your Progress</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress.progress_percent}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {progress.progress_percent}% Complete ({progress.completed_modules.length + progress.completed_steps.length} of {progress.total_modules + progress.total_steps})
          </Text>
        </View>
      )}
      
      <View style={styles.modulesSection}>
        <Text style={styles.sectionTitle}>Training Modules</Text>
        {modules.map(renderModuleItem)}
      </View>
      
      {modules.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No modules available for your role</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  roleText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  progressCard: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  progressText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  modulesSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  moduleCard: {
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
  completedModule: {
    backgroundColor: '#f0f8f0',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  moduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedBadge: {
    backgroundColor: '#4CAF50',
  },
  statusText: {
    fontSize: 12,
    color: '#666',
    fontWeight: 'bold',
  },
  moduleDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  duration: {
    fontSize: 12,
    color: '#999',
  },
  contentView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backText: {
    fontSize: 16,
    color: '#007AFF',
  },
  contentTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: 16,
    paddingBottom: 8,
  },
  videoPlaceholder: {
    margin: 16,
    padding: 32,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  videoText: {
    fontSize: 18,
    marginBottom: 8,
  },
  videoUrl: {
    fontSize: 12,
    color: '#666',
  },
  contentScroll: {
    flex: 1,
    padding: 16,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  completeButton: {
    margin: 16,
    padding: 16,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});