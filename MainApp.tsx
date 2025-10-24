import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { AppHeader } from './AppHeader';
import { EnhancedHomeScreen } from './EnhancedHomeScreen';
import { MachineryScreen } from './MachineryScreen';
import { LaborAndMaterialsDashboard } from './LaborAndMaterialsDashboard';
import { CommunityScreen } from './CommunityScreen';
import { ProfileScreen } from './ProfileScreen';
import { MockTrialDemo } from './MockTrialDemo';
import { BottomTabHeader } from './BottomTabHeader';

interface MainAppProps {
  userId: string;
  userRole: string;
}

export const MainApp: React.FC<MainAppProps> = ({ userId, userRole }) => {
  const { user } = useAuth();
  const [showDemo, setShowDemo] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  const handleTabPress = (tab: string) => {
    setActiveTab(tab);
    setShowDemo(false);
  };

  const renderContent = () => {
    if (showDemo) {
      return <MockTrialDemo />;
    }

    switch (activeTab) {
      case 'home':
        return <EnhancedHomeScreen userId={userId} userRole={userRole} />;
      case 'machinery':
        return <MachineryScreen />;
      case 'workforce':
        return <LaborAndMaterialsDashboard userId={userId} userRole={userRole} />;
      case 'community':
        return <CommunityScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <EnhancedHomeScreen userId={userId} userRole={userRole} />;
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader 
        user={user}
        onProfilePress={() => setActiveTab('profile')}
        onMenuPress={() => setShowDemo(!showDemo)}
      />
      
      <View style={styles.content}>
        {renderContent()}
      </View>
      
      <BottomTabHeader 
        activeTab={activeTab}
        onTabPress={handleTabPress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
  },
});