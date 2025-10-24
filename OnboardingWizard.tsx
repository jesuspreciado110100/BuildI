import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import { OnboardingData } from '../types';
import { FileUploader } from './FileUploader';
import { AnimatedButton } from './AnimatedButton';

interface OnboardingWizardProps {
  onComplete: (data: OnboardingData) => void;
  onCancel: () => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<OnboardingData>({
    role: 'client',
    name: '',
    email: '',
    password: '',
  });

  const steps = [
    'Role Selection',
    'Invite Code',
    'Personal Info',
    'Account Setup',
    'Avatar Upload'
  ];

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(formData);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      onCancel();
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={{ padding: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20 }}>Select Your Role</Text>
            <TouchableOpacity
              style={{
                padding: 15,
                borderWidth: 2,
                borderColor: formData.role === 'client' ? '#007AFF' : '#E5E5E5',
                borderRadius: 8,
                marginBottom: 10,
                backgroundColor: formData.role === 'client' ? '#F0F8FF' : '#FFF'
              }}
              onPress={() => setFormData({ ...formData, role: 'client' })}
            >
              <Text style={{ fontSize: 16, fontWeight: '600' }}>Client</Text>
              <Text style={{ color: '#666', marginTop: 5 }}>View project progress and reports</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                padding: 15,
                borderWidth: 2,
                borderColor: formData.role === 'investor' ? '#007AFF' : '#E5E5E5',
                borderRadius: 8,
                backgroundColor: formData.role === 'investor' ? '#F0F8FF' : '#FFF'
              }}
              onPress={() => setFormData({ ...formData, role: 'investor' })}
            >
              <Text style={{ fontSize: 16, fontWeight: '600' }}>Investor</Text>
              <Text style={{ color: '#666', marginTop: 5 }}>Track investments and payouts</Text>
            </TouchableOpacity>
          </View>
        );
      case 2:
        return (
          <View style={{ padding: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20 }}>Enter Invite Code or Project ID</Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: '#E5E5E5',
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                marginBottom: 10
              }}
              placeholder="Invite Code"
              value={formData.invite_code || ''}
              onChangeText={(text) => setFormData({ ...formData, invite_code: text })}
            />
            <Text style={{ textAlign: 'center', color: '#666', marginVertical: 10 }}>OR</Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: '#E5E5E5',
                borderRadius: 8,
                padding: 12,
                fontSize: 16
              }}
              placeholder="Project ID"
              value={formData.project_id || ''}
              onChangeText={(text) => setFormData({ ...formData, project_id: text })}
            />
          </View>
        );
      case 3:
        return (
          <View style={{ padding: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20 }}>Personal Information</Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: '#E5E5E5',
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                marginBottom: 15
              }}
              placeholder="Full Name"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: '#E5E5E5',
                borderRadius: 8,
                padding: 12,
                fontSize: 16
              }}
              placeholder="Email Address"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        );
      case 4:
        return (
          <View style={{ padding: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20 }}>Create Password</Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: '#E5E5E5',
                borderRadius: 8,
                padding: 12,
                fontSize: 16
              }}
              placeholder="Password"
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              secureTextEntry
            />
          </View>
        );
      case 5:
        return (
          <View style={{ padding: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20 }}>
              {formData.role === 'client' ? 'Upload Avatar' : 'Upload Logo'}
            </Text>
            <FileUploader
              onFileSelect={(url) => {
                if (formData.role === 'client') {
                  setFormData({ ...formData, avatar: url });
                } else {
                  setFormData({ ...formData, logo: url });
                }
              }}
              acceptedTypes={['image/*']}
              maxSize={5}
            />
            {(formData.avatar || formData.logo) && (
              <Image
                source={{ uri: formData.avatar || formData.logo }}
                style={{ width: 100, height: 100, borderRadius: 50, marginTop: 15, alignSelf: 'center' }}
              />
            )}
          </View>
        );
      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return true;
      case 2:
        return formData.invite_code || formData.project_id;
      case 3:
        return formData.name && formData.email;
      case 4:
        return formData.password.length >= 6;
      case 5:
        return true;
      default:
        return false;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FFF' }}>
      <View style={{ padding: 20, borderBottomWidth: 1, borderBottomColor: '#E5E5E5' }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center' }}>Welcome to ConstructionHub</Text>
        <Text style={{ fontSize: 16, color: '#666', textAlign: 'center', marginTop: 5 }}>
          Step {currentStep} of {steps.length}: {steps[currentStep - 1]}
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
        {renderStep()}
      </View>

      <View style={{ flexDirection: 'row', padding: 20, borderTopWidth: 1, borderTopColor: '#E5E5E5' }}>
        <TouchableOpacity
          style={{
            flex: 1,
            padding: 15,
            borderWidth: 1,
            borderColor: '#E5E5E5',
            borderRadius: 8,
            marginRight: 10
          }}
          onPress={handleBack}
        >
          <Text style={{ textAlign: 'center', fontSize: 16, color: '#666' }}>Back</Text>
        </TouchableOpacity>
        <AnimatedButton
          title={currentStep === 5 ? 'Complete' : 'Next'}
          onPress={handleNext}
          disabled={!canProceed()}
          style={{
            flex: 1,
            marginLeft: 10,
            opacity: canProceed() ? 1 : 0.5
          }}
        />
      </View>
    </View>
  );
};