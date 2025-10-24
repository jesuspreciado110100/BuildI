import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { PortalAccessScreen } from './PortalAccessScreen';
import { AirbnbContractorDashboard } from './AirbnbContractorDashboard';
import BIMViewer from './BIMViewer';
import BimTimelineViewer from './BimTimelineViewer';
import BimAnimationPanel from './BimAnimationPanel';
import { SmartContractIntegration } from './SmartContractIntegration';
import { AdminSmartContractsTab } from './AdminSmartContractsTab';
import { ClientDashboard } from './ClientDashboard';
import { InvestorDashboard } from './InvestorDashboard';

export const EnhancedContractorDashboard: React.FC = () => {
  const mockSiteId = 'site_001';
  const mockConcepts = [
    {
      id: '1',
      name: 'Foundation',
      description: 'Foundation work',
      trade: 'concrete',
      tags: ['foundation'],
      phases: [{ id: '1', title: 'Foundation', progress_percent: 75 } as any],
      total_volume: 100,
      unit: 'm³',
      estimated_duration: 14,
      created_at: '2024-01-01',
      contractor_id: 'contractor_001',
      status: 'in_progress' as const,
      planned_start_date: '2024-01-15',
      planned_end_date: '2024-01-30',
      bim_object_ids: ['bim_001', 'bim_002']
    }
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Enhanced Contractor Dashboard with Airbnb-Style UI</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏠 Airbnb-Style Contractor Dashboard</Text>
        <AirbnbContractorDashboard 
          userId="contractor_001"
          userRole="contractor"
        />
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔗 Smart Contract Integration</Text>
        <SmartContractIntegration 
          bookingId="booking_001"
          userId="contractor_001"
          onContractCreated={(contractId) => console.log('Contract created:', contractId)}
        />
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>4D Timeline View</Text>
        <BimTimelineViewer siteId={mockSiteId} />
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>4D Animation Control</Text>
        <BimAnimationPanel siteId={mockSiteId} />
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>BIM Viewer with Object Linking</Text>
        <BIMViewer 
          siteId={mockSiteId} 
          concepts={mockConcepts}
          onClose={() => console.log('Close BIM viewer')}
        />
      </View>
    </ScrollView>
  );
};

export const MachineryRenterDashboard: React.FC = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Machinery Renter Dashboard</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔗 Smart Contract for Rentals</Text>
        <SmartContractIntegration 
          bookingId="rental_001"
          userId="renter_001"
          onContractCreated={(contractId) => console.log('Rental contract created:', contractId)}
        />
      </View>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Active Rentals</Text>
        <Text style={styles.cardValue}>8</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Monthly Revenue</Text>
        <Text style={styles.cardValue}>$25,000</Text>
      </View>
    </ScrollView>
  );
};

export const MaterialSupplierDashboard: React.FC = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Material Supplier Dashboard</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔗 Smart Contract for Orders</Text>
        <SmartContractIntegration 
          quoteId="quote_001"
          userId="supplier_001"
          onContractCreated={(contractId) => console.log('Material contract created:', contractId)}
        />
      </View>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Active Orders</Text>
        <Text style={styles.cardValue}>12</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Monthly Sales</Text>
        <Text style={styles.cardValue}>$35,000</Text>
      </View>
    </ScrollView>
  );
};

export const LaborChiefDashboard: React.FC = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Labor Chief Dashboard</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔗 Smart Contract for Labor</Text>
        <SmartContractIntegration 
          proposalId="proposal_001"
          userId="labor_chief_001"
          onContractCreated={(contractId) => console.log('Labor contract created:', contractId)}
        />
      </View>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Active Workers</Text>
        <Text style={styles.cardValue}>15</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Jobs This Month</Text>
        <Text style={styles.cardValue}>7</Text>
      </View>
    </ScrollView>
  );
};

export const AdminDashboard: React.FC = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔗 Smart Contracts Management</Text>
        <AdminSmartContractsTab />
      </View>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Total Users</Text>
        <Text style={styles.cardValue}>1,245</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Platform Revenue</Text>
        <Text style={styles.cardValue}>$125,000</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Smart Contracts</Text>
        <Text style={styles.cardValue}>156</Text>
      </View>
    </ScrollView>
  );
};

export const AdminDashboardPanel: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Super Admin Panel</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>System Health</Text>
        <Text style={styles.cardValue}>98%</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Active Sessions</Text>
        <Text style={styles.cardValue}>234</Text>
      </View>
    </View>
  );
};

export const ClientPortalDashboard: React.FC = () => {
  return (
    <ClientDashboard 
      userId="client_001"
      userName="John Smith"
    />
  );
};

export const InvestorPortalDashboard: React.FC = () => {
  return (
    <InvestorDashboard 
      investorId="investor_001"
    />
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  section: { marginBottom: 20, backgroundColor: 'white', borderRadius: 8, padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#333' },
  card: { backgroundColor: 'white', padding: 15, borderRadius: 8, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  cardValue: { fontSize: 24, fontWeight: 'bold', color: '#2563eb', marginTop: 8 }
});