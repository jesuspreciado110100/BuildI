import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { RoleBasedOnboardingWizard } from './RoleBasedOnboardingWizard';

interface OnboardingDetectorProps {
  children: React.ReactNode;
}

export const OnboardingDetector: React.FC<OnboardingDetectorProps> = ({ children }) => {
  const { user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    // Check if onboarding is completed
    const checkOnboardingStatus = () => {
      try {
        // Check user object first
        if (user.onboarding_completed === true) {
          setShowOnboarding(false);
          setIsLoading(false);
          return;
        }

        // Check localStorage as fallback
        const completed = localStorage.getItem('onboarding_completed');
        if (completed === 'true') {
          setShowOnboarding(false);
        } else {
          // Only show onboarding for supported roles
          const supportedRoles = ['contractor', 'labor_chief'];
          if (supportedRoles.includes(user.role)) {
            setShowOnboarding(true);
          }
        }
      } catch (error) {
        console.log('Storage not available, checking user object only');
        // If no storage, only check user object
        if (user.onboarding_completed !== true) {
          const supportedRoles = ['contractor', 'labor_chief'];
          if (supportedRoles.includes(user.role)) {
            setShowOnboarding(true);
          }
        }
      }
      setIsLoading(false);
    };

    checkOnboardingStatus();
  }, [user]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    // You could also update the user context here if needed
  };

  const handleOnboardingSkip = () => {
    setShowOnboarding(false);
  };

  if (isLoading) {
    return null; // or a loading spinner
  }

  return (
    <>
      {children}
      <RoleBasedOnboardingWizard
        visible={showOnboarding}
        onComplete={handleOnboardingComplete}
        onSkip={handleOnboardingSkip}
      />
    </>
  );
};