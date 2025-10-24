import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { User } from '../types';
import { EnhancedContractorDashboard } from './EnhancedContractorDashboard';
import { EnhancedLaborChiefDashboard } from './EnhancedLaborChiefDashboard';
import { EnhancedMachineryRenterDashboard } from './EnhancedMachineryRenterDashboard';
import { TopNavigation } from './TopNavigation';
import { NotificationCenter } from './NotificationCenter';

interface SimpleAllDashboardsProps {
  user: User;
  onLogout: () => void;
}

export const SimpleAllDashboards: React.FC<SimpleAllDashboardsProps> = ({
  user,
  onLogout
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  const handleNotificationPress = () => {
    setShowNotifications(true);
  };

  const renderDashboard = () => {
    switch (user.role) {
      case 'contractor':
        return (
          <EnhancedContractorDashboard
            user={user}
            onLogout={onLogout}
          />
        );
      case 'labor_chief':
      case 'laborChief':
        return (
          <EnhancedLaborChiefDashboard
            user={user}
            onLogout={onLogout}
          />
        );
      case 'machinery_renter':
      case 'machineryRenter':
        return (
          <EnhancedMachineryRenterDashboard
            user={user}
            onLogout={onLogout}
          />
        );
      default:
        return (
          <View style={styles.container}>
            <TopNavigation
              user={user}
              onLogout={onLogout}
              onNotificationPress={handleNotificationPress}
            />
            <View style={styles.content}>
              {/* Default dashboard content */}
            </View>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      {renderDashboard()}
      
      {showNotifications && (
        <NotificationCenter
          userId={user.id}
          onClose={() => setShowNotifications(false)}
        />
      )}
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
    justifyContent: 'center',
    alignItems: 'center',
  },
});