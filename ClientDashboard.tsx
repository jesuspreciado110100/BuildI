import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AnimatedTabBar } from './AnimatedTabBar';
import { MySitesTab } from './MySitesTab';
import { ClientReportsTab } from './ClientReportsTab';
import { ClientInvoicesTab } from './ClientInvoicesTab';
import { ClientPhotoGalleryTab } from './ClientPhotoGalleryTab';
import { ReadOnlyConceptDetailsModal } from './ReadOnlyConceptDetailsModal';
import { ConceptTimeLapseTab } from './ConceptTimeLapseTab';
import { Concept } from '../types';

interface ClientDashboardProps {
  userId: string;
  userName: string;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({ userId, userName }) => {
  const [activeTab, setActiveTab] = useState('sites');
  const [conceptModalVisible, setConceptModalVisible] = useState(false);
  const [timeLapseModalVisible, setTimeLapseModalVisible] = useState(false);
  const [selectedSiteId, setSelectedSiteId] = useState<string>('');
  const [selectedConcepts, setSelectedConcepts] = useState<Concept[]>([]);
  const [selectedConceptId, setSelectedConceptId] = useState<string>('');
  const [selectedConceptName, setSelectedConceptName] = useState<string>('');

  const tabs = [
    { id: 'sites', label: 'My Sites', icon: '🏗️' },
    { id: 'reports', label: 'Reports', icon: '📊' },
    { id: 'invoices', label: 'Invoices', icon: '💰' },
    { id: 'photos', label: 'Photos', icon: '📸' },
  ];

  const handleViewConcepts = (siteId: string, concepts: Concept[]) => {
    setSelectedSiteId(siteId);
    setSelectedConcepts(concepts);
    setConceptModalVisible(true);
  };

  const handleViewTimeLapse = (conceptId: string, conceptName: string, siteId: string) => {
    setSelectedConceptId(conceptId);
    setSelectedConceptName(conceptName);
    setSelectedSiteId(siteId);
    setTimeLapseModalVisible(true);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'sites':
        return (
          <MySitesTab 
            userId={userId} 
            onViewConcepts={handleViewConcepts}
            onViewTimeLapse={handleViewTimeLapse}
          />
        );
      case 'reports':
        return <ClientReportsTab userId={userId} />;
      case 'invoices':
        return <ClientInvoicesTab userId={userId} />;
      case 'photos':
        return <ClientPhotoGalleryTab userId={userId} />;
      default:
        return (
          <View style={styles.defaultContent}>
            <Text style={styles.defaultText}>Select a tab to view content</Text>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.userName}>{userName}</Text>
        <Text style={styles.roleText}>Client Portal</Text>
      </View>

      <View style={styles.tabContainer}>
        <AnimatedTabBar
          tabs={tabs}
          activeTab={activeTab}
          onTabPress={setActiveTab}
        />
      </View>

      <View style={styles.content}>
        {renderTabContent()}
      </View>

      <ReadOnlyConceptDetailsModal
        visible={conceptModalVisible}
        concepts={selectedConcepts}
        siteId={selectedSiteId}
        onClose={() => setConceptModalVisible(false)}
        onViewTimeLapse={handleViewTimeLapse}
      />

      {/* Time-Lapse Modal */}
      {timeLapseModalVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ConceptTimeLapseTab
              conceptId={selectedConceptId}
              siteId={selectedSiteId}
              conceptName={selectedConceptName}
              isReadOnly={true}
            />
            <View style={styles.modalCloseButton}>
              <Text 
                style={styles.modalCloseText}
                onPress={() => setTimeLapseModalVisible(false)}
              >
                Close
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    paddingTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  roleText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '600',
  },
  tabContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  content: {
    flex: 1,
  },
  defaultContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultText: {
    fontSize: 16,
    color: '#666',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    width: '90%',
    height: '80%',
    borderRadius: 10,
    overflow: 'hidden',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 5,
  },
  modalCloseText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});