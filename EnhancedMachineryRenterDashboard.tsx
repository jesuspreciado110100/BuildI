import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { User } from '../types';
import { MobileTopBar } from './MobileTopBar';
import AnimatedTabBar from './AnimatedTabBar';
import RoleBasedFAB from './RoleBasedFAB';
import { MobileCard } from './MobileCard';
import { MachineryUploadWizard } from './MachineryUploadWizard';

interface EnhancedMachineryRenterDashboardProps {
  user: User;
  onLogout: () => void;
}

export const EnhancedMachineryRenterDashboard: React.FC<EnhancedMachineryRenterDashboardProps> = ({
  user,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState('fleet');
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [pendingBookings] = useState(2);

  const tabs = [
    { id: 'fleet', label: 'Fleet', icon: '🚜' },
    { 
      id: 'bookings', 
      label: 'Bookings', 
      icon: '📅',
      hasPendingItems: pendingBookings > 0,
      badge: pendingBookings > 0 ? `${pendingBookings} new` : undefined
    },
    { id: 'earnings', label: 'Earnings', icon: '💰' },
    { id: 'maintenance', label: 'Maintenance', icon: '🔧', isNew: true },
  ];

  const handleFABAction = (action: string) => {
    switch (action) {
      case 'upload_machine':
        setUploadModalVisible(true);
        break;
      case 'mark_available':
        console.log('Mark machine as available');
        break;
    }
  };

  const renderFleetContent = () => (
    <ScrollView style={styles.content}>
      <MobileCard
        title="Excavator CAT 320"
        subtitle="Available • $200/day • 4.9★"
        showProgress
        progressValue={85}
      />
      <MobileCard
        title="Bulldozer D6T"
        subtitle="Rented • Returns tomorrow • $300/day"
      />
      <MobileCard
        title="Crane 50T"
        subtitle="Maintenance • Back in 3 days"
      />
    </ScrollView>
  );

  const renderBookingsContent = () => (
    <ScrollView style={styles.content}>
      <MobileCard
        title="New Booking Request"
        subtitle="Excavator needed for 3 days • $600 total"
        onPress={() => console.log('View booking')}
      />
      <MobileCard
        title="Confirmed Booking"
        subtitle="Bulldozer • Site A • Starts tomorrow"
      />
    </ScrollView>
  );

  const renderEarningsContent = () => (
    <ScrollView style={styles.content}>
      <MobileCard
        title="This Month"
        subtitle="$12,400 earned • 15 bookings"
      />
      <MobileCard
        title="Pending Payments"
        subtitle="$3,200 • 3 completed rentals"
      />
    </ScrollView>
  );

  const renderMaintenanceContent = () => (
    <ScrollView style={styles.content}>
      <MobileCard
        title="Scheduled Maintenance"
        subtitle="2 machines due this week"
      />
      <MobileCard
        title="Service History"
        subtitle="All machines up to date"
      />
    </ScrollView>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'fleet': return renderFleetContent();
      case 'bookings': return renderBookingsContent();
      case 'earnings': return renderEarningsContent();
      case 'maintenance': return renderMaintenanceContent();
      default: return renderFleetContent();
    }
  };

  return (
    <View style={styles.container}>
      <MobileTopBar
        title="Machinery Renter"
        onNotificationPress={() => console.log('Notifications')}
        onSearchPress={() => console.log('Search')}
        onQuickActionPress={() => console.log('Quick action')}
      />
      
      <AnimatedTabBar
        tabs={tabs}
        activeTab={activeTab}
        onTabPress={setActiveTab}
      />
      
      {renderContent()}
      
      <RoleBasedFAB
        userRole="machineryRenter"
        onActionPress={handleFABAction}
      />

      <MachineryUploadWizard
        visible={uploadModalVisible}
        onClose={() => setUploadModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
});