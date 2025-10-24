import React from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { AnimatedButton } from './AnimatedButton';

interface OnboardingStepProps {
  onNext: () => void;
  onBack: () => void;
  data: any;
  setData: (data: any) => void;
}

export const ContractorStep1: React.FC<OnboardingStepProps> = ({ onNext, onBack, data, setData }) => {
  const sites = [
    { id: '1', name: 'Downtown Office Complex', location: 'Main St, City Center' },
    { id: '2', name: 'Residential Tower A', location: 'Oak Avenue, Suburb' },
    { id: '3', name: 'Shopping Mall Renovation', location: 'Commerce Blvd' }
  ];

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20 }}>Set Your Default Site</Text>
      <Text style={{ color: '#666', marginBottom: 20 }}>Choose your primary work site for quick access</Text>
      
      {sites.map((site) => (
        <TouchableOpacity
          key={site.id}
          style={{
            padding: 15,
            borderWidth: 2,
            borderColor: data.defaultSite === site.id ? '#007AFF' : '#E5E5E5',
            borderRadius: 8,
            marginBottom: 10,
            backgroundColor: data.defaultSite === site.id ? '#F0F8FF' : '#FFF'
          }}
          onPress={() => setData({ ...data, defaultSite: site.id })}
        >
          <Text style={{ fontSize: 16, fontWeight: '600' }}>{site.name}</Text>
          <Text style={{ color: '#666', marginTop: 5 }}>{site.location}</Text>
        </TouchableOpacity>
      ))}
      
      <View style={{ flexDirection: 'row', marginTop: 30 }}>
        <TouchableOpacity
          style={{ flex: 1, padding: 15, borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 8, marginRight: 10 }}
          onPress={onBack}
        >
          <Text style={{ textAlign: 'center', fontSize: 16, color: '#666' }}>Back</Text>
        </TouchableOpacity>
        <AnimatedButton
          title="Next"
          onPress={onNext}
          disabled={!data.defaultSite}
          style={{ flex: 1, marginLeft: 10, opacity: data.defaultSite ? 1 : 0.5 }}
        />
      </View>
    </ScrollView>
  );
};

export const ContractorStep2: React.FC<OnboardingStepProps> = ({ onNext, onBack }) => {
  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20 }}>Quick Walkthrough</Text>
      <Text style={{ color: '#666', marginBottom: 20 }}>Learn the key features to get started</Text>
      
      <View style={{ backgroundColor: '#F8F9FA', padding: 15, borderRadius: 8, marginBottom: 15 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 10 }}>📊 Dashboard Tabs</Text>
        <Text style={{ color: '#666' }}>• Active Jobs - Track ongoing projects</Text>
        <Text style={{ color: '#666' }}>• Progress - View completion status</Text>
        <Text style={{ color: '#666' }}>• Team - Manage workers and assignments</Text>
      </View>
      
      <View style={{ backgroundColor: '#F8F9FA', padding: 15, borderRadius: 8, marginBottom: 15 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 10 }}>➕ Floating Action Button</Text>
        <Text style={{ color: '#666' }}>Tap the blue + button to quickly:</Text>
        <Text style={{ color: '#666' }}>• Add new booking</Text>
        <Text style={{ color: '#666' }}>• Upload progress photos</Text>
        <Text style={{ color: '#666' }}>• Create work orders</Text>
      </View>
      
      <View style={{ flexDirection: 'row', marginTop: 30 }}>
        <TouchableOpacity
          style={{ flex: 1, padding: 15, borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 8, marginRight: 10 }}
          onPress={onBack}
        >
          <Text style={{ textAlign: 'center', fontSize: 16, color: '#666' }}>Back</Text>
        </TouchableOpacity>
        <AnimatedButton
          title="Next"
          onPress={onNext}
          style={{ flex: 1, marginLeft: 10 }}
        />
      </View>
    </ScrollView>
  );
};

export const ContractorStep3: React.FC<OnboardingStepProps> = ({ onNext, onBack, data, setData }) => {
  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20 }}>Get Started</Text>
      <Text style={{ color: '#666', marginBottom: 20 }}>Choose your first action to begin using the platform</Text>
      
      <TouchableOpacity
        style={{
          padding: 20,
          borderWidth: 2,
          borderColor: data.firstAction === 'booking' ? '#007AFF' : '#E5E5E5',
          borderRadius: 8,
          marginBottom: 15,
          backgroundColor: data.firstAction === 'booking' ? '#F0F8FF' : '#FFF'
        }}
        onPress={() => setData({ ...data, firstAction: 'booking' })}
      >
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 5 }}>📅 Create First Booking</Text>
        <Text style={{ color: '#666' }}>Schedule equipment or materials for your project</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={{
          padding: 20,
          borderWidth: 2,
          borderColor: data.firstAction === 'invite' ? '#007AFF' : '#E5E5E5',
          borderRadius: 8,
          backgroundColor: data.firstAction === 'invite' ? '#F0F8FF' : '#FFF'
        }}
        onPress={() => setData({ ...data, firstAction: 'invite' })}
      >
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 5 }}>👥 Invite Team Members</Text>
        <Text style={{ color: '#666' }}>Add workers, supervisors, or other contractors</Text>
      </TouchableOpacity>
      
      <View style={{ flexDirection: 'row', marginTop: 30 }}>
        <TouchableOpacity
          style={{ flex: 1, padding: 15, borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 8, marginRight: 10 }}
          onPress={onBack}
        >
          <Text style={{ textAlign: 'center', fontSize: 16, color: '#666' }}>Back</Text>
        </TouchableOpacity>
        <AnimatedButton
          title="Complete Setup"
          onPress={onNext}
          disabled={!data.firstAction}
          style={{ flex: 1, marginLeft: 10, opacity: data.firstAction ? 1 : 0.5 }}
        />
      </View>
    </ScrollView>
  );
};