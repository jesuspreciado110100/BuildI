import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ConstructionTypesCarousel, { ConstructionType } from '@/app/components/ConstructionTypesCarousel';
import AddSiteModal from '@/app/components/AddSiteModal';
import { DocumentManagementPanel } from '@/app/components/DocumentManagementPanel';
export default function ClientHomeScreen() {
  const [selectedConstructionType, setSelectedConstructionType] = useState<ConstructionType | null>(null);
  const [showAddSiteModal, setShowAddSiteModal] = useState(false);
  const [showDocuments, setShowDocuments] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const handleConstructionTypeSelect = (type: ConstructionType | null) => {
    setSelectedConstructionType(type);
  };

  const handleProjectAdded = () => {
    // Refresh the projects list when a new project is added
    // This will trigger a re-render of the ConstructionTypesCarousel
    setSelectedConstructionType(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      {showDocuments && selectedProjectId ? (
        <DocumentManagementPanel
          projectId={selectedProjectId}
          userId="current-user-id"
        />
      ) : (
        <>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>My Construction Projects</Text>
            <TouchableOpacity
              style={styles.documentsButton}
              onPress={() => {
                setSelectedProjectId('demo-project-1');
                setShowDocuments(true);
              }}
            >
              <Ionicons name="folder-outline" size={20} color="#3b82f6" />
              <Text style={styles.documentsButtonText}>Documents</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.scrollView}>
            <ConstructionTypesCarousel 
              onTypeSelect={handleConstructionTypeSelect}
              selectedType={selectedConstructionType}
            />
          </ScrollView>
        </>
      )}

      {showDocuments && (
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => setShowDocuments(false)}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
      )}

      {!showDocuments && (
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddSiteModal(true)}
        >
          <Ionicons name="add" size={28} color="white" />
        </TouchableOpacity>
      )}

      <AddSiteModal
        visible={showAddSiteModal}
        onClose={() => setShowAddSiteModal(false)}
        onProjectAdded={handleProjectAdded}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827'
  },
  documentsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6
  },
  documentsButtonText: {
    color: '#3b82f6',
    fontWeight: '600',
    marginLeft: 4
  },
  scrollView: {
    flex: 1,
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  backButton: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6B7280',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});