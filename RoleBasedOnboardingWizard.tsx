import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { ContractorStep1, ContractorStep2, ContractorStep3 } from './OnboardingSteps';
import { LaborChiefStep1, LaborChiefStep2, LaborChiefStep3 } from './LaborChiefOnboardingSteps';

interface RoleBasedOnboardingWizardProps {
  visible: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export const RoleBasedOnboardingWizard: React.FC<RoleBasedOnboardingWizardProps> = ({
  visible,
  onComplete,
  onSkip
}) => {
  const { user, updateUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState<any>({});
  const [showStartModal, setShowStartModal] = useState(true);

  const getStepsForRole = () => {
    switch (user?.role) {
      case 'contractor':
        return [
          { title: 'Set Default Site', component: ContractorStep1 },
          { title: 'Walkthrough Tips', component: ContractorStep2 },
          { title: 'First Action', component: ContractorStep3 }
        ];
      case 'labor_chief':
        return [
          { title: 'Set Trade Types', component: LaborChiefStep1 },
          { title: 'Assign Availability', component: LaborChiefStep2 },
          { title: 'Accept Jobs', component: LaborChiefStep3 }
        ];
      default:
        return [];
    }
  };

  const steps = getStepsForRole();

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    try {
      localStorage.setItem('onboarding_completed', 'true');
      localStorage.setItem('onboarding_data', JSON.stringify(onboardingData));
    } catch (error) {
      console.log('Storage not available');
    }
    updateUser({ onboarding_completed: true });
    onComplete();
  };

  const handleSkip = () => {
    try {
      localStorage.setItem('onboarding_completed', 'true');
      localStorage.setItem('onboarding_skipped', 'true');
    } catch (error) {
      console.log('Storage not available');
    }
    updateUser({ onboarding_completed: true });
    onSkip();
  };

  if (!visible || !user || steps.length === 0) {
    return null;
  }

  const CurrentStepComponent = steps[currentStep - 1]?.component;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <View style={{ flex: 1, backgroundColor: '#FFF' }}>
        {showStartModal && (
          <Modal visible={showStartModal} transparent animationType="fade">
            <View style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.5)',
              justifyContent: 'center',
              alignItems: 'center',
              padding: 20
            }}>
              <View style={{
                backgroundColor: '#FFF',
                borderRadius: 12,
                padding: 24,
                width: '100%',
                maxWidth: 400
              }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 }}>
                  Welcome! 👋
                </Text>
                <Text style={{ fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 24 }}>
                  Let's get you set up with a quick {steps.length}-step tour.
                </Text>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      padding: 16,
                      borderWidth: 1,
                      borderColor: '#E5E5E5',
                      borderRadius: 8,
                      alignItems: 'center'
                    }}
                    onPress={handleSkip}
                  >
                    <Text style={{ fontSize: 16, color: '#666' }}>Skip</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      padding: 16,
                      backgroundColor: '#007AFF',
                      borderRadius: 8,
                      alignItems: 'center'
                    }}
                    onPress={() => setShowStartModal(false)}
                  >
                    <Text style={{ fontSize: 16, color: '#FFF', fontWeight: '600' }}>Start Tour</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )}

        {!showStartModal && (
          <>
            <View style={{ padding: 20, borderBottomWidth: 1, borderBottomColor: '#E5E5E5' }}>
              <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center' }}>
                {user.role === 'contractor' ? 'Contractor Setup' : 'Labor Chief Setup'}
              </Text>
              <Text style={{ fontSize: 16, color: '#666', textAlign: 'center', marginTop: 5 }}>
                Step {currentStep} of {steps.length}: {steps[currentStep - 1]?.title}
              </Text>
              
              <View style={{ flexDirection: 'row', marginTop: 15 }}>
                {steps.map((_, index) => (
                  <View
                    key={index}
                    style={{
                      flex: 1,
                      height: 4,
                      backgroundColor: index < currentStep ? '#007AFF' : '#E5E5E5',
                      marginHorizontal: 2,
                      borderRadius: 2
                    }}
                  />
                ))}
              </View>
            </View>

            <View style={{ flex: 1 }}>
              {CurrentStepComponent && (
                <CurrentStepComponent
                  onNext={handleNext}
                  onBack={handleBack}
                  data={onboardingData}
                  setData={setOnboardingData}
                />
              )}
            </View>
          </>
        )}
      </View>
    </Modal>
  );
};