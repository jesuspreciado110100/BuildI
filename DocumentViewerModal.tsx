import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CollaborativeDocumentViewer } from './CollaborativeDocumentViewer';
import { OfflineSyncIndicator } from './OfflineSyncIndicator';
import { ConflictResolutionModal } from './ConflictResolutionModal';
import { DocumentTemplateManager } from './DocumentTemplateManager';
import { offlineDocumentService, OfflineDocument } from '../services/OfflineDocumentService';

interface DocumentViewerModalProps {
  visible: boolean;
  onClose: () => void;
  document: any;
  onEdit?: () => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  visible,
  onClose,
  document,
  onEdit
}) => {
  const [offlineDoc, setOfflineDoc] = useState<OfflineDocument | null>(null);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [remoteDocument, setRemoteDocument] = useState<any>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  useEffect(() => {
    if (document && visible) {
      loadOfflineDocument();
    }
  }, [document, visible]);

  const loadOfflineDocument = async () => {
    if (document) {
      const offline = await offlineDocumentService.getOfflineDocument(document.id);
      setOfflineDoc(offline);
    }
  };

  const handleDownloadForOffline = async () => {
    if (!document) return;
    
    setIsDownloading(true);
    const success = await offlineDocumentService.downloadForOffline(document.id);
    setIsDownloading(false);
    
    if (success) {
      Alert.alert('Success', 'Document downloaded for offline access');
      loadOfflineDocument();
    } else {
      Alert.alert('Error', 'Failed to download document');
    }
  };

  const handleConflictResolve = async (resolution: 'local' | 'remote' | 'merge') => {
    // Handle conflict resolution logic here
    Alert.alert('Conflict Resolved', `Document resolved using ${resolution} version`);
    setShowConflictModal(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return '#10B981';
      case 'rejected': return '#EF4444';
      case 'review': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const [activeTab, setActiveTab] = useState<'view' | 'annotate' | 'workflow'>('view');
  const [annotations, setAnnotations] = useState([]);

  const handleStatusUpdate = async (newStatus: string, approvedBy?: string) => {
    Alert.alert('Status Updated', `Document status changed to ${newStatus}`);
  };

  const handleShare = () => {
    Alert.alert('Share Document', 'Sharing functionality would be implemented here');
  };

  const handleDownload = () => {
    if (offlineDoc) {
      Alert.alert('Available Offline', 'This document is already available offline');
    } else {
      handleDownloadForOffline();
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'view':
        return (
          <View style={styles.viewerContent}>
            <View style={styles.documentPreview}>
              <Text style={styles.previewText}>📄</Text>
              <Text style={styles.previewLabel}>Document Preview</Text>
              <Text style={styles.previewSubtext}>
                {document.type.includes('image') ? 'Image viewer would render here' : 'PDF/Document viewer would render here'}
              </Text>
            </View>
            
            <View style={styles.documentDetails}>
              <Text style={styles.detailsTitle}>Document Information</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Category:</Text>
                <Text style={styles.detailValue}>{document.category}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Version:</Text>
                <Text style={styles.detailValue}>v{document.version}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Size:</Text>
                <Text style={styles.detailValue}>{formatFileSize(document.size)}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Uploaded:</Text>
                <Text style={styles.detailValue}>{new Date(document.uploaded_at).toLocaleString()}</Text>
              </View>
              {document.tags && document.tags.length > 0 && (
                <View style={styles.tagsSection}>
                  <Text style={styles.detailLabel}>Tags:</Text>
                  <View style={styles.tagsContainer}>
                    {document.tags.map((tag, index) => (
                      <View key={index} style={styles.tag}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </View>
        );
      
      case 'annotate':
        return (
          <DocumentAnnotationTool
            document={document}
            annotations={annotations}
            onAnnotationsChange={setAnnotations}
          />
        );
      
      case 'workflow':
        return (
          <DocumentApprovalWorkflow
            document={document}
            onStatusUpdate={handleStatusUpdate}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <>
      <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <TouchableOpacity onPress={onClose} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#111827" />
              </TouchableOpacity>
              <View>
                <Text style={styles.title} numberOfLines={1}>{document.name}</Text>
                <View style={styles.statusContainer}>
                  <OfflineSyncIndicator documentId={document.id} showDetails={false} />
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(document.status), marginLeft: 8 }]}>
                    <Text style={styles.statusText}>{document.status}</Text>
                  </View>
                </View>
              </View>
            </View>
            
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={() => setShowTemplateManager(true)} style={styles.actionButton}>
                <Ionicons name="document-text-outline" size={20} color="#6B7280" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleShare} style={styles.actionButton}>
                <Ionicons name="share-outline" size={20} color="#6B7280" />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleDownload} 
                style={[styles.actionButton, isDownloading && { opacity: 0.5 }]}
                disabled={isDownloading}
              >
                <Ionicons 
                  name={offlineDoc ? "cloud-done" : "cloud-download-outline"} 
                  size={20} 
                  color={offlineDoc ? "#10B981" : "#6B7280"} 
                />
              </TouchableOpacity>
            </View>
          </View>

        <View style={styles.tabBar}>
          {[
            { key: 'view', label: 'View', icon: 'eye-outline' },
            { key: 'annotate', label: 'Annotate', icon: 'create-outline' },
            { key: 'workflow', label: 'Workflow', icon: 'checkmark-circle-outline' }
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.activeTab]}
              onPress={() => setActiveTab(tab.key as any)}
            >
              <Ionicons 
                name={tab.icon as any} 
                size={20} 
                color={activeTab === tab.key ? '#3B82F6' : '#6B7280'} 
              />
              <Text style={[
                styles.tabText,
                activeTab === tab.key && styles.activeTabText
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView style={styles.content}>
          {renderTabContent()}
        </ScrollView>
      </View>
      </Modal>

      {/* Conflict Resolution Modal */}
      {showConflictModal && offlineDoc && remoteDocument && (
        <ConflictResolutionModal
          visible={showConflictModal}
          onClose={() => setShowConflictModal(false)}
          localDocument={offlineDoc}
          remoteDocument={remoteDocument}
          onResolve={handleConflictResolve}
        />
      )}

      {/* Document Template Manager */}
      <DocumentTemplateManager
        visible={showTemplateManager}
        onClose={() => setShowTemplateManager(false)}
        onDocumentCreated={(data, template) => {
          Alert.alert('Document Created', `${template.name} document created successfully`);
          setShowTemplateManager(false);
        }}
      />
    </>
  );
};

import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  backButton: {
    marginRight: 12
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    maxWidth: 200
  },
  statusContainer: {
    marginTop: 4
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start'
  },
  statusText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  headerActions: {
    flexDirection: 'row'
  },
  actionButton: {
    padding: 8,
    marginLeft: 8
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent'
  },
  activeTab: {
    borderBottomColor: '#3B82F6'
  },
  tabText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4
  },
  activeTabText: {
    color: '#3B82F6',
    fontWeight: '600'
  },
  content: {
    flex: 1
  },
  viewerContent: {
    padding: 16
  },
  documentPreview: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 40,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  previewText: {
    fontSize: 48,
    marginBottom: 8
  },
  previewLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4
  },
  previewSubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center'
  },
  documentDetails: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280'
  },
  detailValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500'
  },
  tagsSection: {
    marginTop: 8
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4
  },
  tagText: {
    fontSize: 12,
    color: '#6B7280'
  }
});