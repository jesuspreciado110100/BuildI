import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { DocumentViewer } from './DocumentViewer';
import { InvoiceCard } from './InvoiceCard';
import { SafetyLogPanel } from './SafetyLogPanel';

interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'dwg' | 'other';
  size: string;
  uploadedBy: string;
  uploadedAt: string;
  url: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  supplier: string;
  amount: number;
  status: 'pending' | 'paid' | 'overdue';
  dueDate: string;
  items: string[];
}

interface SafetyLog {
  id: string;
  type: 'incident' | 'inspection' | 'compliance';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  reportedBy: string;
  reportedAt: string;
  status: 'open' | 'resolved';
}

interface ConceptRelatedTabsProps {
  conceptId: string;
  documents: Document[];
  invoices: Invoice[];
  safetyLogs: SafetyLog[];
}

export const ConceptRelatedTabs: React.FC<ConceptRelatedTabsProps> = ({
  conceptId,
  documents,
  invoices,
  safetyLogs
}) => {
  const [activeTab, setActiveTab] = useState<'documents' | 'invoices' | 'safety'>('documents');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return '📄';
      case 'image': return '🖼️';
      case 'dwg': return '📐';
      default: return '📁';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return '#F44336';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return '#666';
    }
  };

  const renderDocument = ({ item }: { item: Document }) => (
    <TouchableOpacity 
      style={styles.documentItem}
      onPress={() => setSelectedDocument(item)}
    >
      <View style={styles.documentHeader}>
        <Text style={styles.fileIcon}>{getFileIcon(item.type)}</Text>
        <View style={styles.documentInfo}>
          <Text style={styles.documentName}>{item.name}</Text>
          <Text style={styles.documentMeta}>
            {item.size} • {item.uploadedBy} • {item.uploadedAt}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderInvoice = ({ item }: { item: Invoice }) => (
    <InvoiceCard
      invoice={item}
      onPress={() => {}}
      showActions={false}
    />
  );

  const renderSafetyLog = ({ item }: { item: SafetyLog }) => (
    <View style={styles.safetyItem}>
      <View style={styles.safetyHeader}>
        <View style={styles.safetyInfo}>
          <Text style={styles.safetyTitle}>{item.title}</Text>
          <Text style={styles.safetyDescription}>{item.description}</Text>
          <Text style={styles.safetyMeta}>
            {item.reportedBy} • {item.reportedAt}
          </Text>
        </View>
        <View style={styles.safetyBadges}>
          <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(item.severity) }]}>
            <Text style={styles.severityText}>{item.severity}</Text>
          </View>
          <View style={[styles.statusBadge, item.status === 'resolved' ? styles.resolvedBadge : styles.openBadge]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'documents':
        return (
          <FlatList
            data={documents}
            renderItem={renderDocument}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>📁</Text>
                <Text style={styles.emptyText}>No documents linked</Text>
              </View>
            }
          />
        );
      
      case 'invoices':
        return (
          <FlatList
            data={invoices}
            renderItem={renderInvoice}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>🧾</Text>
                <Text style={styles.emptyText}>No invoices yet</Text>
              </View>
            }
          />
        );
      
      case 'safety':
        return (
          <FlatList
            data={safetyLogs}
            renderItem={renderSafetyLog}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>🦺</Text>
                <Text style={styles.emptyText}>No safety logs</Text>
              </View>
            }
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'documents' && styles.activeTab]}
          onPress={() => setActiveTab('documents')}
        >
          <Text style={[styles.tabText, activeTab === 'documents' && styles.activeTabText]}>
            Documents ({documents.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'invoices' && styles.activeTab]}
          onPress={() => setActiveTab('invoices')}
        >
          <Text style={[styles.tabText, activeTab === 'invoices' && styles.activeTabText]}>
            Invoices ({invoices.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'safety' && styles.activeTab]}
          onPress={() => setActiveTab('safety')}
        >
          <Text style={[styles.tabText, activeTab === 'safety' && styles.activeTabText]}>
            Safety ({safetyLogs.length})
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        {renderTabContent()}
      </View>
      
      {selectedDocument && (
        <DocumentViewer
          visible={!!selectedDocument}
          onClose={() => setSelectedDocument(null)}
          document={selectedDocument}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent'
  },
  activeTab: {
    borderBottomColor: '#007AFF'
  },
  tabText: {
    fontSize: 14,
    color: '#666'
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600'
  },
  content: {
    padding: 16,
    minHeight: 200
  },
  documentItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  fileIcon: {
    fontSize: 24,
    marginRight: 12
  },
  documentInfo: {
    flex: 1
  },
  documentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4
  },
  documentMeta: {
    fontSize: 12,
    color: '#666'
  },
  safetyItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  safetyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  safetyInfo: {
    flex: 1
  },
  safetyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4
  },
  safetyDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4
  },
  safetyMeta: {
    fontSize: 12,
    color: '#999'
  },
  safetyBadges: {
    alignItems: 'flex-end',
    gap: 4
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  severityText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
    textTransform: 'uppercase'
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  resolvedBadge: {
    backgroundColor: '#4CAF50'
  },
  openBadge: {
    backgroundColor: '#FF9800'
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
    textTransform: 'uppercase'
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16
  },
  emptyText: {
    fontSize: 16,
    color: '#666'
  }
});