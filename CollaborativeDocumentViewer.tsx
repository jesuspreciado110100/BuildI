import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Modal } from 'react-native';
import CollaborativeEditor from './CollaborativeEditor';
import DocumentVersionControl from './DocumentVersionControl';
import DocumentComments from './DocumentComments';
import DocumentSuggestions from './DocumentSuggestions';

interface CollaborativeDocumentViewerProps {
  documentId: string;
  initialContent: string;
  onSave: (content: string) => void;
}

export default function CollaborativeDocumentViewer({
  documentId,
  initialContent,
  onSave
}: CollaborativeDocumentViewerProps) {
  const [content, setContent] = useState(initialContent);
  const [activeTab, setActiveTab] = useState<'editor' | 'versions' | 'comments' | 'suggestions'>('editor');
  const [selectedPosition, setSelectedPosition] = useState<{ line: number; column: number }>();
  const [showVersionModal, setShowVersionModal] = useState(false);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    onSave(newContent);
  };

  const handleApplySuggestion = (suggestion: any) => {
    // Apply suggestion to content
    const { position, suggested_text } = suggestion;
    const lines = content.split('\n');
    const targetLine = lines[position.start] || '';
    const newLine = targetLine.substring(0, position.start) + 
                   suggested_text + 
                   targetLine.substring(position.end);
    lines[position.line] = newLine;
    
    const newContent = lines.join('\n');
    setContent(newContent);
    onSave(newContent);
  };

  const tabs = [
    { key: 'editor', label: 'Editor', icon: '📝' },
    { key: 'versions', label: 'Versions', icon: '📋' },
    { key: 'comments', label: 'Comments', icon: '💬' },
    { key: 'suggestions', label: 'Suggestions', icon: '💡' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && styles.activeTab
            ]}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text style={[
              styles.tabLabel,
              activeTab === tab.key && styles.activeTabLabel
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.content}>
        {activeTab === 'editor' && (
          <CollaborativeEditor
            documentId={documentId}
            initialContent={content}
            onContentChange={handleContentChange}
          />
        )}
        
        {activeTab === 'versions' && (
          <DocumentVersionControl
            documentId={documentId}
            onVersionSelect={(version) => {
              // Load version content
              console.log('Selected version:', version);
            }}
          />
        )}
        
        {activeTab === 'comments' && (
          <DocumentComments
            documentId={documentId}
            selectedPosition={selectedPosition}
          />
        )}
        
        {activeTab === 'suggestions' && (
          <DocumentSuggestions
            documentId={documentId}
            onApplySuggestion={handleApplySuggestion}
          />
        )}
      </View>

      <View style={styles.actionBar}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setShowVersionModal(true)}
        >
          <Text style={styles.actionButtonText}>Save Version</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.primaryButton]}
          onPress={() => onSave(content)}
        >
          <Text style={[styles.actionButtonText, styles.primaryButtonText]}>
            Save Document
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  activeTab: {
    backgroundColor: '#fff',
    borderBottomWidth: 2,
    borderBottomColor: '#1976d2',
  },
  tabIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  tabLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabLabel: {
    color: '#1976d2',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  actionBar: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    marginHorizontal: 4,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#1976d2',
    borderColor: '#1976d2',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  primaryButtonText: {
    color: '#fff',
  },
});