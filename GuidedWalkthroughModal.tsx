import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Dimensions } from 'react-native';
import { OnboardingStep, WalkthroughStep } from '../types/Learning';
import { learningCenterService } from '../services/LearningCenterService';

interface GuidedWalkthroughModalProps {
  visible: boolean;
  userRole: string;
  userId: string;
  onComplete: () => void;
  onSkip: () => void;
}

export const GuidedWalkthroughModal: React.FC<GuidedWalkthroughModalProps> = ({
  visible,
  userRole,
  userId,
  onComplete,
  onSkip
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<OnboardingStep[]>([]);
  const [loading, setLoading] = useState(true);

  const walkthroughSteps: WalkthroughStep[] = [
    {
      id: '1',
      title: 'Welcome to Your Dashboard',
      description: 'This is your main control center where you can see all your active projects and key metrics.',
      target_element: '.dashboard-overview',
      position: 'bottom',
      action_text: 'Got it!',
      order: 1
    },
    {
      id: '2',
      title: 'Navigation Tabs',
      description: 'Use these tabs to navigate between different sections like Active Jobs, Materials, and Reports.',
      target_element: '.tab-navigation',
      position: 'bottom',
      action_text: 'Next',
      order: 2
    },
    {
      id: '3',
      title: 'Quick Actions',
      description: 'Access frequently used actions like creating new projects or requesting materials.',
      target_element: '.quick-actions',
      position: 'top',
      action_text: 'Next',
      order: 3
    },
    {
      id: '4',
      title: 'Notifications',
      description: 'Stay updated with important alerts and messages from your team.',
      target_element: '.notification-bell',
      position: 'left',
      action_text: 'Next',
      order: 4
    },
    {
      id: '5',
      title: 'Help & Learning',
      description: 'Access the Learning Center and Help resources whenever you need assistance.',
      target_element: '.help-buttons',
      position: 'top',
      action_text: 'Finish Tour',
      order: 5
    }
  ];

  useEffect(() => {
    if (visible) {
      loadOnboardingSteps();
    }
  }, [visible, userRole]);

  const loadOnboardingSteps = async () => {
    try {
      const onboardingSteps = await learningCenterService.getOnboardingSteps(userRole);
      setSteps(onboardingSteps);
    } catch (error) {
      console.error('Error loading onboarding steps:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (currentStep < walkthroughSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      await handleComplete();
    }
  };

  const handleComplete = async () => {
    try {
      // Mark all onboarding steps as complete
      for (const step of steps) {
        await learningCenterService.markStepComplete(step.id);
      }
      onComplete();
    } catch (error) {
      console.error('Error completing walkthrough:', error);
      onComplete();
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  if (!visible || loading) {
    return null;
  }

  const currentWalkthroughStep = walkthroughSteps[currentStep];
  const progress = ((currentStep + 1) / walkthroughSteps.length) * 100;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleSkip}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Getting Started</Text>
            <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
              <Text style={styles.skipText}>Skip Tour</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>
              Step {currentStep + 1} of {walkthroughSteps.length}
            </Text>
          </View>
          
          <View style={styles.content}>
            <View style={styles.stepIndicator}>
              <Text style={styles.stepNumber}>{currentStep + 1}</Text>
            </View>
            
            <Text style={styles.stepTitle}>{currentWalkthroughStep.title}</Text>
            <Text style={styles.stepDescription}>{currentWalkthroughStep.description}</Text>
            
            {currentWalkthroughStep.target_element && (
              <View style={styles.targetInfo}>
                <Text style={styles.targetText}>Look for: {currentWalkthroughStep.target_element}</Text>
              </View>
            )}
          </View>
          
          <View style={styles.actions}>
            {currentStep > 0 && (
              <TouchableOpacity
                style={[styles.actionButton, styles.backButton]}
                onPress={() => setCurrentStep(currentStep - 1)}
              >
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[styles.actionButton, styles.nextButton]}
              onPress={handleNext}
            >
              <Text style={styles.nextButtonText}>
                {currentWalkthroughStep.action_text}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.9,
    maxHeight: height * 0.8,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 0,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  skipButton: {
    padding: 8,
  },
  skipText: {
    color: '#666',
    fontSize: 14,
  },
  progressContainer: {
    padding: 20,
    paddingBottom: 10,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  progressText: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  stepIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepNumber: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  targetInfo: {
    backgroundColor: '#f0f8ff',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  targetText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: '#f0f0f0',
  },
  nextButton: {
    backgroundColor: '#007AFF',
    flex: 1,
    marginLeft: 12,
  },
  backButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});