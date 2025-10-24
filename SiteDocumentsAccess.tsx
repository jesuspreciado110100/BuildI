import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SiteDocumentsPanel from './SiteDocumentsPanel';

interface SiteDocumentsAccessProps {
  siteId: string;
  siteName: string;
}

export default function SiteDocumentsAccess({ siteId, siteName }: SiteDocumentsAccessProps) {
  const [showDocuments, setShowDocuments] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={styles.documentsAccessCard}
        onPress={() => setShowDocuments(true)}
      >
        <View style={styles.iconContainer}>
          <Ionicons name="document-text" size={24} color="#3B82F6" />
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>Collaborative Documents</Text>
          <Text style={styles.subtitle}>
            Access site documents with real-time editing and approval workflows
          </Text>
          <View style={styles.features}>
            <View style={styles.feature}>
              <Ionicons name="people" size={12} color="#10B981" />
              <Text style={styles.featureText}>Multi-user editing</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="checkmark-circle" size={12} color="#10B981" />
              <Text style={styles.featureText}>Approval workflows</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="chatbubbles" size={12} color="#10B981" />
              <Text style={styles.featureText}>Comments & suggestions</Text>
            </View>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#6B7280" />
      </TouchableOpacity>

      <Modal
        visible={showDocuments}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{siteName} - Documents</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowDocuments(false)}
            >
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <SiteDocumentsPanel siteId={siteId} />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  documentsAccessCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EBF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
    lineHeight: 16,
  },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  featureText: {
    fontSize: 10,
    color: '#10B981',
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
});