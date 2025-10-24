import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { Site } from '../types';
import { ConceptButton } from './ConceptButton';
import { ConceptWorksModal } from './ConceptWorksModal';
import { DocumentViewer } from './DocumentViewer';

interface SiteDetailsModalProps {
  visible: boolean;
  site: Site | null;
  onClose: () => void;
}

export const SiteDetailsModal: React.FC<SiteDetailsModalProps> = ({ visible, site, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'concepts'>('overview');
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null);
  const [worksModalVisible, setWorksModalVisible] = useState(false);

  if (!site) return null;

  const handleConceptPress = (concept: string) => {
    setSelectedConcept(concept);
    setWorksModalVisible(true);
  };

  const renderOverview = () => (
    <View style={styles.tabContent}>
      <View style={styles.infoCard}>
        <Text style={styles.cardTitle}>Site Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Location:</Text>
          <Text style={styles.infoValue}>{site.location}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Status:</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(site.status) }]}>
            <Text style={styles.statusText}>{site.status}</Text>
          </View>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Start Date:</Text>
          <Text style={styles.infoValue}>{site.startDate}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Budget:</Text>
          <Text style={styles.infoValue}>${site.budget?.toLocaleString()}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Progress:</Text>
          <Text style={styles.infoValue}>{site.progress}%</Text>
        </View>
      </View>
      
      {site.description && (
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Description</Text>
          <Text style={styles.description}>{site.description}</Text>
        </View>
      )}
    </View>
  );

  const renderDocuments = () => (
    <View style={styles.tabContent}>
      {site.documents && site.documents.length > 0 ? (
        <FlatList
          data={site.documents}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <DocumentViewer document={item} />
          )}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No documents uploaded</Text>
          <Text style={styles.emptyStateSubtext}>Documents will appear here when uploaded</Text>
        </View>
      )}
    </View>
  );

  const renderConcepts = () => {
    const concepts = ['Foundation', 'Framing', 'Electrical', 'Plumbing'];
    
    return (
      <View style={styles.tabContent}>
        <Text style={styles.conceptsTitle}>Construction Concepts</Text>
        <Text style={styles.conceptsSubtitle}>Tap a concept to view its works</Text>
        
        {concepts.map((concept) => (
          <ConceptButton
            key={concept}
            concept={concept}
            onPress={() => handleConceptPress(concept)}
          />
        ))}
      </View>
    );
  };

  return (
    <>
      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>Close</Text>
            </TouchableOpacity>
            <Text style={styles.title}>{site.name}</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
              onPress={() => setActiveTab('overview')}
            >
              <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>Overview</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'documents' && styles.activeTab]}
              onPress={() => setActiveTab('documents')}
            >
              <Text style={[styles.tabText, activeTab === 'documents' && styles.activeTabText]}>Documents</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'concepts' && styles.activeTab]}
              onPress={() => setActiveTab('concepts')}
            >
              <Text style={[styles.tabText, activeTab === 'concepts' && styles.activeTabText]}>Concepts</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'documents' && renderDocuments()}
            {activeTab === 'concepts' && renderConcepts()}
          </ScrollView>
        </View>
      </Modal>

      <ConceptWorksModal
        visible={worksModalVisible}
        concept={selectedConcept || ''}
        onClose={() => setWorksModalVisible(false)}
      />
    </>
  );
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Active': return '#10B981';
    case 'Planning': return '#F59E0B';
    case 'Completed': return '#6B7280';
    default: return '#EF4444';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    fontSize: 16,
    color: '#3B82F6',
  },
  placeholder: {
    width: 50,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#3B82F6',
  },
  tabText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#3B82F6',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 20,
  },
  infoCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#ffffff',
  },
  description: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  conceptsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  conceptsSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
});