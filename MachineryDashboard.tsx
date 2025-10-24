import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import MachineryRequestsTab from './MachineryRequestsTab';
import MachineryBookingForm from './MachineryBookingForm';
import { ContractorRentalsTab } from './ContractorRentalsTab';
import RentalHistoryTab from './RentalHistoryTab';
import { RentalSummaryTab } from './RentalSummaryTab';
import SuggestedMachineryPanel from './SuggestedMachineryPanel';
import QuickRehirePanel from './QuickRehirePanel';
import { Concept, BookingRequest } from '../types';

interface MachineryDashboardProps {
  userId: string;
  userRole: string;
  concepts?: Concept[];
}

const tabs = [
  { id: 'requests', label: 'Requests', icon: '📋' },
  { id: 'rentals', label: 'Active Rentals', icon: '🚜' },
  { id: 'history', label: 'History', icon: '📚' },
  { id: 'summary', label: 'Summary', icon: '📊' },
  { id: 'suggestions', label: 'Suggestions', icon: '💡' },
  { id: 'rehire', label: 'Quick Rehire', icon: '⚡' }
];

export function MachineryDashboard({ userId, userRole, concepts = [] }: MachineryDashboardProps) {
  const [activeTab, setActiveTab] = useState('requests');
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedConcept, setSelectedConcept] = useState<Concept | null>(null);

  const handleRequestMachinery = (category?: string, conceptId?: string) => {
    if (conceptId && concepts.length > 0) {
      const concept = concepts.find(c => c.id === conceptId);
      setSelectedConcept(concept || null);
    }
    setShowBookingForm(true);
  };

  const handleBookingSubmit = (request: Omit<BookingRequest, 'id' | 'created_at'>) => {
    console.log('Booking submitted:', request);
    setShowBookingForm(false);
    setSelectedConcept(null);
  };

  const handleRehire = (renterId: string, renterName: string) => {
    console.log('Rehiring from:', renterName);
    setShowBookingForm(true);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'requests':
        return (
          <MachineryRequestsTab 
            contractorId={userId}
            showResponseTimes={true}
          />
        );
      case 'rentals':
        return (
          <ContractorRentalsTab 
            userId={userId}
            userRole={userRole}
          />
        );
      case 'history':
        return (
          <RentalHistoryTab 
            contractorId={userId}
          />
        );
      case 'summary':
        return (
          <RentalSummaryTab 
            userId={userId}
            role={userRole}
          />
        );
      case 'suggestions':
        return (
          <SuggestedMachineryPanel
            concept={concepts[0] || null}
            onRequestMachinery={handleRequestMachinery}
          />
        );
      case 'rehire':
        return (
          <QuickRehirePanel
            contractorId={userId}
            onRehire={handleRehire}
          />
        );
      default:
        return null;
    }
  };

  if (showBookingForm) {
    return (
      <MachineryBookingForm
        onSubmit={handleBookingSubmit}
        onCancel={() => {
          setShowBookingForm(false);
          setSelectedConcept(null);
        }}
        concepts={concepts}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Tab Navigator */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.tabs}>
            {tabs.map(tab => (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tab, activeTab === tab.id && styles.activeTab]}
                onPress={() => setActiveTab(tab.id)}
              >
                <Text style={styles.tabIcon}>{tab.icon}</Text>
                <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Tab Content */}
      <View style={styles.content}>
        {renderTabContent()}
      </View>
      
      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => handleRequestMachinery()}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  tabContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingTop: 8
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16
  },
  tab: {
    padding: 12,
    alignItems: 'center',
    marginRight: 16,
    minWidth: 80
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#dc2626'
  },
  tabIcon: {
    fontSize: 16,
    marginBottom: 4
  },
  tabText: {
    fontSize: 12,
    color: '#666'
  },
  activeTabText: {
    color: '#dc2626',
    fontWeight: 'bold'
  },
  content: {
    flex: 1
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4
  },
  fabText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold'
  }
});