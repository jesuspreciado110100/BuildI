import React, { useEffect } from 'react';
import { learningCenterService } from '../services/LearningCenterService';
import { notificationService } from '../services/NotificationService';

interface LearningCenterIntegrationProps {
  userId: string;
  userRole: string;
  isFirstLogin?: boolean;
}

export const LearningCenterIntegration: React.FC<LearningCenterIntegrationProps> = ({
  userId,
  userRole,
  isFirstLogin = false
}) => {
  useEffect(() => {
    if (isFirstLogin) {
      initializeUserLearning();
    }
  }, [userId, userRole, isFirstLogin]);

  const initializeUserLearning = async () => {
    try {
      // Send welcome notification
      await notificationService.sendWelcomeTrainingNotification(userId, userRole);
      
      // Check if user has completed onboarding
      const progress = await learningCenterService.getProgress(userRole, userId);
      
      if (progress.progress_percent === 100 && !progress.onboarding_completed) {
        // Send completion notification
        await notificationService.sendOnboardingCompletedNotification(userId, userRole);
      } else if (progress.progress_percent > 0 && progress.progress_percent < 100) {
        // Send progress notification
        await notificationService.sendLearningProgressNotification(
          userId,
          progress.progress_percent,
          userRole
        );
      }
    } catch (error) {
      console.error('Error initializing user learning:', error);
    }
  };

  const handleModuleCompletion = async (moduleId: string, moduleTitle: string) => {
    try {
      await learningCenterService.markStepComplete(moduleId);
      await notificationService.sendModuleCompletedNotification(userId, moduleTitle, moduleId);
      
      // Check if onboarding is now complete
      const progress = await learningCenterService.getProgress(userRole, userId);
      if (progress.onboarding_completed) {
        await notificationService.sendOnboardingCompletedNotification(userId, userRole);
      }
    } catch (error) {
      console.error('Error handling module completion:', error);
    }
  };

  // This component doesn't render anything - it's just for integration logic
  return null;
};

export const useLearningCenter = (userId: string, userRole: string) => {
  const [progress, setProgress] = React.useState<any>(null);
  const [modules, setModules] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadLearningData();
  }, [userId, userRole]);

  const loadLearningData = async () => {
    try {
      const [progressData, moduleData] = await Promise.all([
        learningCenterService.getProgress(userRole, userId),
        learningCenterService.getModulesForRole(userRole)
      ]);
      setProgress(progressData);
      setModules(moduleData);
    } catch (error) {
      console.error('Error loading learning data:', error);
    } finally {
      setLoading(false);
    }
  };

  const completeModule = async (moduleId: string) => {
    try {
      const module = modules.find(m => m.id === moduleId);
      if (module) {
        await learningCenterService.markStepComplete(moduleId);
        await notificationService.sendModuleCompletedNotification(userId, module.title, moduleId);
        await loadLearningData();
      }
    } catch (error) {
      console.error('Error completing module:', error);
    }
  };

  return {
    progress,
    modules,
    loading,
    completeModule,
    refresh: loadLearningData
  };
};