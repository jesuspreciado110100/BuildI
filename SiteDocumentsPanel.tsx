import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CollaborativeDocumentViewer from './CollaborativeDocumentViewer';
import DocumentApprovalWorkflow from './DocumentApprovalWorkflow';
import { MaterialUsageAnalyticsModal } from './MaterialUsageAnalyticsModal';

interface SiteDocumentsPanelProps {
  siteId: string;
}

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  date: string;
  status: 'approved' | 'pending' | 'expired' | 'in_review';
  requiresApproval: boolean;
  collaborators: number;
  version: string;
}

export default function SiteDocumentsPanel({ siteId }: SiteDocumentsPanelProps) {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showCollaborativeEditor, setShowCollaborativeEditor] = useState(false);
  const [showApprovalWorkflow, setShowApprovalWorkflow] = useState(false);
  const [showMaterialAnalytics, setShowMaterialAnalytics] = useState(false);

  const mockDocuments: Document[] = [
    {
      id: '1',
      name: 'Building Permit',
      type: 'permit',
      size: '2.1 MB',
      date: '2024-01-10',
      status: 'approved',
      requiresApproval: true,
      collaborators: 3,
      version: '1.2'
    },
    {
      id: '2',
      name: 'Construction Contract',
      type: 'contract',
      size: '1.8 MB',
      date: '2024-01-08',
      status: 'in_review',
      requiresApproval: true,
      collaborators: 5,
      version: '2.1'
    },
    {
      id: '3',
      name: 'Site Plan',
      type: 'plan',
      size: '5.2 MB',
      date: '2024-01-12',
      status: 'pending',
      requiresApproval: true,
      collaborators: 2,
      version: '1.0'
    }
  ];

  const getStatusColor = (status: Document['status']) => {
    switch (status) {
      case 'approved': return '#10B981';
      case 'pending': return '#F59E0B';
      case 'in_review': return '#3B82F6';
      case 'expired': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const handleDocumentPress = (document: Document) => {
    setSelectedDocument(document);
    setShowCollaborativeEditor(true);
  };

  const handleApprovalPress = (document: Document) => {
    setSelectedDocument(document);
    setShowApprovalWorkflow(true);
  };

  const renderDocument = ({ item }: { item: Document }) => (
    <TouchableOpacity 
      style={styles.documentItem}
      onPress={() => handleDocumentPress(item)}
    >
      <View style={styles.documentIcon}>
        <Ionicons name="document" size={24} color="#3B82F6" />
      </View>
      <View style={styles.documentContent}>
        <Text style={styles.documentName}>{item.name}</Text>
        <Text style={styles.documentDetails}>
          {item.size} • v{item.version} • {item.collaborators} collaborators
        </Text>
      </View>
      <View style={styles.documentActions}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
        {item.requiresApproval && (
          <TouchableOpacity 
            style={styles.approvalButton}
            onPress={() => handleApprovalPress(item)}
          >
            <Ionicons name="checkmark-circle" size={16} color="#3B82F6" />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Collaborative Documents</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.analyticsButton}
            onPress={() => setShowMaterialAnalytics(true)}
          >
            <Ionicons name="analytics" size={16} color="#3B82F6" />
            <Text style={styles.analyticsButtonText}>Analytics</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.uploadButton}>
            <Ionicons name="add" size={20} color="white" />
            <Text style={styles.uploadButtonText}>Upload</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={mockDocuments}
        renderItem={renderDocument}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
      />

      <Modal
        visible={showCollaborativeEditor}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <CollaborativeDocumentViewer
          documentId={selectedDocument?.id || ''}
          siteId={siteId}
          onClose={() => setShowCollaborativeEditor(false)}
        />
      </Modal>

      <Modal
        visible={showApprovalWorkflow}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <DocumentApprovalWorkflow
          documentId={selectedDocument?.id || ''}
          siteId={siteId}
          onClose={() => setShowApprovalWorkflow(false)}
        />
      </Modal>

      <MaterialUsageAnalyticsModal
        visible={showMaterialAnalytics}
        onClose={() => setShowMaterialAnalytics(false)}
        projectId={siteId}
        projectName="Site Materials"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  analyticsButton: {
    backgroundColor: '#EBF4FF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  analyticsButtonText: {
    color: '#3B82F6',
    fontSize: 12,
    fontWeight: '600',
  },
  uploadButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  documentIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#EBF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  documentContent: {
    flex: 1,
  },
  documentName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  documentDetails: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  documentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  approvalButton: {
    padding: 4,
  },
});