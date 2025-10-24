import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { User } from '../types';
import { MobileTopBar } from './MobileTopBar';
import { MobileBottomTabs } from './MobileBottomTabs';
import { MobileSubTabs } from './MobileSubTabs';
import { RoleBasedFAB } from './RoleBasedFAB';
import { MobileCard } from './MobileCard';
import { SmartHomeScreen } from './SmartHomeScreen';
import { PhotoUploadModal } from './PhotoUploadModal';
import { CrewAssignmentModal } from './CrewAssignmentModal';

interface EnhancedMobileContractorDashboardProps {
  user: User;
  onLogout: () => void;
}

export const EnhancedMobileContractorDashboard: React.FC<EnhancedMobileContractorDashboardProps> = ({
  user,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState('home');
  const [activeSubTab, setActiveSubTab] = useState<string>('');
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [crewModalVisible, setCrewModalVisible] = useState(false);

  const bottomTabs = [
    { key: 'home', label: 'Home', icon: '🏠' },
    { key: 'sites', label: 'Sites', icon: '🏗️' },
    { key: 'machinery', label: 'Machinery', icon: '🚜' },
    { key: 'labor', label: 'Labor', icon: '👷' },
    { key: 'materials', label: 'Materials', icon: '🧱' },
  ];

  const getSubTabs = (tab: string) => {
    switch (tab) {
      case 'machinery':
        return [
          { key: 'requests', label: 'Requests' },
          { key: 'rentals', label: 'Rentals' },
          { key: 'summary', label: 'Summary' }
        ];
      case 'labor':
        return [
          { key: 'hire', label: 'Hire' },
          { key: 'requests', label: 'Requests' },
          { key: 'completed', label: 'Completed' },
          { key: 'microjobs', label: 'MicroJobs' },
          { key: 'performance', label: 'Performance' }
        ];
      case 'materials':
        return [
          { key: 'catalog', label: 'Catalog' },
          { key: 'quotes', label: 'Quotes' },
          { key: 'orders', label: 'Orders' },
          { key: 'inventory', label: 'Inventory' }
        ];
      default:
        return [];
    }
  };

  const handleHomeNavigation = (target: string) => {
    const [mainTab, subTab] = target.split('-');
    setActiveTab(mainTab);
    if (subTab) {
      setActiveSubTab(subTab);
    } else {
      setActiveSubTab('');
    }
  };

  const handleModalOpen = (modalType: string) => {
    switch (modalType) {
      case 'photo-upload':
        setPhotoModalVisible(true);
        break;
      default:
        console.log('Unknown modal type:', modalType);
    }
  };

  const handleAction = (actionType: string) => {
    switch (actionType) {
      case 'assign-crew':
        setCrewModalVisible(true);
        break;
      default:
        console.log('Unknown action type:', actionType);
    }
  };

  // FAB Action Handlers
  const handleBookMachinery = () => {
    setActiveTab('machinery');
    setActiveSubTab('requests');
  };

  const handleHireLabor = () => {
    setActiveTab('labor');
    setActiveSubTab('hire');
  };

  const handleUploadPhoto = () => {
    setPhotoModalVisible(true);
  };

  const handleOrderMaterials = () => {
    setActiveTab('materials');
    setActiveSubTab('catalog');
  };

  const renderHomeContent = () => (
    <SmartHomeScreen
      user={user}
      onNavigate={handleHomeNavigation}
      onModalOpen={handleModalOpen}
      onAction={handleAction}
    />
  );

  const renderSitesContent = () => (
    <ScrollView style={styles.content}>
      <MobileCard
        title="Construction Site A"
        subtitle="Downtown Project • Active"
        showProgress
        progressValue={75}
        onPress={() => console.log('Site A pressed')}
      />
      <MobileCard
        title="Office Building B"
        subtitle="Uptown Development • In Progress"
        showProgress
        progressValue={45}
        onPress={() => console.log('Site B pressed')}
      />
      <MobileCard
        title="Residential Complex C"
        subtitle="Suburban Area • Planning"
        showProgress
        progressValue={15}
        onPress={() => console.log('Site C pressed')}
      />
    </ScrollView>
  );

  const renderMachineryContent = () => {
    const subTabs = getSubTabs('machinery');
    const currentSubTab = activeSubTab || 'requests';

    return (
      <View style={styles.tabContainer}>
        <MobileSubTabs
          tabs={subTabs}
          activeTab={currentSubTab}
          onTabPress={setActiveSubTab}
        />
        <ScrollView style={styles.content}>
          {currentSubTab === 'requests' && (
            <>
              <MobileCard
                title="Excavator Request"
                subtitle="Status: Pending • Date: Tomorrow"
                onPress={() => console.log('Excavator request pressed')}
              />
              <MobileCard
                title="Crane Booking"
                subtitle="Status: Confirmed • Date: Next Week"
                onPress={() => console.log('Crane booking pressed')}
              />
            </>
          )}
          {currentSubTab === 'rentals' && (
            <>
              <MobileCard
                title="Active Rentals"
                subtitle="3 machines • $1,200/day total"
              />
              <MobileCard
                title="Bulldozer #1"
                subtitle="Site A • $400/day • 5 days remaining"
              />
            </>
          )}
          {currentSubTab === 'summary' && (
            <MobileCard
              title="Monthly Summary"
              subtitle="Requests: 12 • Active Rentals: 3 • Total Cost: $8,400"
            />
          )}
        </ScrollView>
      </View>
    );
  };

  const renderLaborContent = () => {
    const subTabs = getSubTabs('labor');
    const currentSubTab = activeSubTab || 'hire';

    return (
      <View style={styles.tabContainer}>
        <MobileSubTabs
          tabs={subTabs}
          activeTab={currentSubTab}
          onTabPress={setActiveSubTab}
          scrollable
        />
        <ScrollView style={styles.content}>
          {currentSubTab === 'hire' && (
            <>
              <MobileCard
                title="Available Workers"
                subtitle="8 workers available today"
              />
              <MobileCard
                title="Skilled Electricians"
                subtitle="3 available • $45/hour"
              />
            </>
          )}
          {currentSubTab === 'requests' && (
            <MobileCard
              title="Labor Requests"
              subtitle="2 pending • 5 confirmed"
            />
          )}
          {currentSubTab === 'completed' && (
            <MobileCard
              title="Completed Jobs"
              subtitle="15 jobs completed this month"
            />
          )}
          {currentSubTab === 'microjobs' && (
            <MobileCard
              title="MicroJobs"
              subtitle="Quick tasks • 3 available"
            />
          )}
          {currentSubTab === 'performance' && (
            <MobileCard
              title="Team Performance"
              subtitle="Efficiency: 92% • Quality: 95%"
            />
          )}
        </ScrollView>
      </View>
    );
  };

  const renderMaterialsContent = () => {
    const subTabs = getSubTabs('materials');
    const currentSubTab = activeSubTab || 'catalog';

    return (
      <View style={styles.tabContainer}>
        <MobileSubTabs
          tabs={subTabs}
          activeTab={currentSubTab}
          onTabPress={setActiveSubTab}
        />
        <ScrollView style={styles.content}>
          {currentSubTab === 'catalog' && (
            <>
              <MobileCard
                title="Cement"
                subtitle="$50/bag • 200 bags available"
              />
              <MobileCard
                title="Steel Rebar"
                subtitle="$2.50/ft • 5000 ft available"
              />
            </>
          )}
          {currentSubTab === 'quotes' && (
            <MobileCard
              title="Quote Requests"
              subtitle="3 pending • 2 received"
            />
          )}
          {currentSubTab === 'orders' && (
            <MobileCard
              title="Recent Orders"
              subtitle="Cement - 50 bags • Delivered • $2,500"
            />
          )}
          {currentSubTab === 'inventory' && (
            <MobileCard
              title="Inventory Status"
              subtitle="85% stocked • 3 items low"
            />
          )}
        </ScrollView>
      </View>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return renderHomeContent();
      case 'sites': return renderSitesContent();
      case 'machinery': return renderMachineryContent();
      case 'labor': return renderLaborContent();
      case 'materials': return renderMaterialsContent();
      default: return renderHomeContent();
    }
  };

  const handleTabPress = (tabKey: string) => {
    setActiveTab(tabKey);
    setActiveSubTab('');
  };

  const getTitle = () => {
    switch (activeTab) {
      case 'home': return 'Home';
      case 'sites': return 'Sites';
      case 'machinery': return 'Machinery';
      case 'labor': return 'Labor';
      case 'materials': return 'Materials';
      default: return 'Dashboard';
    }
  };

  return (
    <View style={styles.container}>
      <MobileTopBar
        title={getTitle()}
        onNotificationPress={() => console.log('Notifications pressed')}
        onSearchPress={() => console.log('Search pressed')}
        onQuickActionPress={() => console.log('Quick action pressed')}
      />
      
      {renderContent()}
      
      <MobileBottomTabs
        tabs={bottomTabs}
        activeTab={activeTab}
        onTabPress={handleTabPress}
      />
      
      <RoleBasedFAB
        userRole="contractor"
        onBookMachinery={handleBookMachinery}
        onHireLabor={handleHireLabor}
        onUploadPhoto={handleUploadPhoto}
        onOrderMaterials={handleOrderMaterials}
      />

      <PhotoUploadModal
        visible={photoModalVisible}
        onClose={() => setPhotoModalVisible(false)}
      />

      <CrewAssignmentModal
        visible={crewModalVisible}
        onClose={() => setCrewModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  tabContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
});