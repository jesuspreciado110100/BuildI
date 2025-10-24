import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { AnimatedButton } from './AnimatedButton';

interface OnboardingStepProps {
  onNext: () => void;
  onBack: () => void;
  data: any;
  setData: (data: any) => void;
}

export const LaborChiefStep1: React.FC<OnboardingStepProps> = ({ onNext, onBack, data, setData }) => {
  const trades = [
    { id: 'electrical', name: 'Electrical', icon: '⚡' },
    { id: 'plumbing', name: 'Plumbing', icon: '🔧' },
    { id: 'carpentry', name: 'Carpentry', icon: '🔨' },
    { id: 'masonry', name: 'Masonry', icon: '🧱' },
    { id: 'painting', name: 'Painting', icon: '🎨' },
    { id: 'roofing', name: 'Roofing', icon: '🏠' },
    { id: 'hvac', name: 'HVAC', icon: '❄️' },
    { id: 'flooring', name: 'Flooring', icon: '📐' }
  ];

  const toggleTrade = (tradeId: string) => {
    const currentTrades = data.tradeTypes || [];
    const newTrades = currentTrades.includes(tradeId)
      ? currentTrades.filter((id: string) => id !== tradeId)
      : [...currentTrades, tradeId];
    setData({ ...data, tradeTypes: newTrades });
  };

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20 }}>Select Your Trade Types</Text>
      <Text style={{ color: '#666', marginBottom: 20 }}>Choose the trades you specialize in (select multiple)</Text>
      
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {trades.map((trade) => {
          const isSelected = (data.tradeTypes || []).includes(trade.id);
          return (
            <TouchableOpacity
              key={trade.id}
              style={{
                padding: 15,
                borderWidth: 2,
                borderColor: isSelected ? '#007AFF' : '#E5E5E5',
                borderRadius: 8,
                backgroundColor: isSelected ? '#F0F8FF' : '#FFF',
                width: '48%',
                alignItems: 'center'
              }}
              onPress={() => toggleTrade(trade.id)}
            >
              <Text style={{ fontSize: 24, marginBottom: 5 }}>{trade.icon}</Text>
              <Text style={{ fontSize: 14, fontWeight: '600', textAlign: 'center' }}>{trade.name}</Text>
            </TouchableOpacity>
          );
        })}
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
          disabled={!data.tradeTypes || data.tradeTypes.length === 0}
          style={{ flex: 1, marginLeft: 10, opacity: (data.tradeTypes && data.tradeTypes.length > 0) ? 1 : 0.5 }}
        />
      </View>
    </ScrollView>
  );
};

export const LaborChiefStep2: React.FC<OnboardingStepProps> = ({ onNext, onBack, data, setData }) => {
  const timeSlots = [
    { id: 'morning', label: 'Morning (6AM - 12PM)', hours: '6:00 - 12:00' },
    { id: 'afternoon', label: 'Afternoon (12PM - 6PM)', hours: '12:00 - 18:00' },
    { id: 'evening', label: 'Evening (6PM - 10PM)', hours: '18:00 - 22:00' },
    { id: 'night', label: 'Night Shift (10PM - 6AM)', hours: '22:00 - 6:00' }
  ];

  const days = [
    { id: 'monday', label: 'Mon' },
    { id: 'tuesday', label: 'Tue' },
    { id: 'wednesday', label: 'Wed' },
    { id: 'thursday', label: 'Thu' },
    { id: 'friday', label: 'Fri' },
    { id: 'saturday', label: 'Sat' },
    { id: 'sunday', label: 'Sun' }
  ];

  const toggleAvailability = (day: string, timeSlot: string) => {
    const current = data.availability || {};
    const daySlots = current[day] || [];
    const newSlots = daySlots.includes(timeSlot)
      ? daySlots.filter((slot: string) => slot !== timeSlot)
      : [...daySlots, timeSlot];
    setData({ ...data, availability: { ...current, [day]: newSlots } });
  };

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20 }}>Set Your Availability</Text>
      <Text style={{ color: '#666', marginBottom: 20 }}>Choose when you're available for work assignments</Text>
      
      {days.map((day) => (
        <View key={day.id} style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 10 }}>{day.label}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {timeSlots.map((slot) => {
              const isSelected = (data.availability?.[day.id] || []).includes(slot.id);
              return (
                <TouchableOpacity
                  key={slot.id}
                  style={{
                    padding: 8,
                    borderWidth: 1,
                    borderColor: isSelected ? '#007AFF' : '#E5E5E5',
                    borderRadius: 6,
                    backgroundColor: isSelected ? '#F0F8FF' : '#FFF',
                    minWidth: 80
                  }}
                  onPress={() => toggleAvailability(day.id, slot.id)}
                >
                  <Text style={{ fontSize: 12, textAlign: 'center', color: isSelected ? '#007AFF' : '#666' }}>
                    {slot.hours}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
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
          style={{ flex: 1, marginLeft: 10 }}
        />
      </View>
    </ScrollView>
  );
};

export const LaborChiefStep3: React.FC<OnboardingStepProps> = ({ onNext, onBack }) => {
  const mockJobs = [
    { id: '1', title: 'Electrical Installation - Office Complex', location: 'Downtown', urgency: 'High', pay: '$450/day' },
    { id: '2', title: 'Plumbing Repair - Residential', location: 'Suburb Area', urgency: 'Medium', pay: '$380/day' },
    { id: '3', title: 'Carpentry Work - Shopping Mall', location: 'Commerce District', urgency: 'Low', pay: '$420/day' }
  ];

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20 }}>Accept Your First Job</Text>
      <Text style={{ color: '#666', marginBottom: 20 }}>Review available jobs that match your skills and availability</Text>
      
      {mockJobs.map((job) => (
        <View key={job.id} style={{
          padding: 15,
          borderWidth: 1,
          borderColor: '#E5E5E5',
          borderRadius: 8,
          marginBottom: 15,
          backgroundColor: '#FFF'
        }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 5 }}>{job.title}</Text>
          <Text style={{ color: '#666', marginBottom: 5 }}>📍 {job.location}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: '#666' }}>💰 {job.pay}</Text>
            <View style={{
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 4,
              backgroundColor: job.urgency === 'High' ? '#FFE5E5' : job.urgency === 'Medium' ? '#FFF3E0' : '#E8F5E8'
            }}>
              <Text style={{
                fontSize: 12,
                color: job.urgency === 'High' ? '#D32F2F' : job.urgency === 'Medium' ? '#F57C00' : '#388E3C'
              }}>
                {job.urgency} Priority
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={{
              marginTop: 10,
              padding: 10,
              backgroundColor: '#007AFF',
              borderRadius: 6,
              alignItems: 'center'
            }}
          >
            <Text style={{ color: '#FFF', fontWeight: '600' }}>Accept Job</Text>
          </TouchableOpacity>
        </View>
      ))}
      
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
          style={{ flex: 1, marginLeft: 10 }}
        />
      </View>
    </ScrollView>
  );
};