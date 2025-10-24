import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { supabase } from '@/app/lib/supabase';

interface DocumentVersion {
  id: string;
  version_number: number;
  created_at: string;
  created_by: string;
  change_summary: string;
  is_current: boolean;
}

interface DocumentVersionControlProps {
  documentId: string;
  onVersionSelect: (version: DocumentVersion) => void;
}

export default function DocumentVersionControl({ 
  documentId, 
  onVersionSelect 
}: DocumentVersionControlProps) {
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<string>('');

  useEffect(() => {
    loadVersions();
  }, [documentId]);

  const loadVersions = async () => {
    const { data, error } = await supabase
      .from('document_versions')
      .select('*')
      .eq('document_id', documentId)
      .order('version_number', { ascending: false });

    if (error) {
      console.error('Error loading versions:', error);
      return;
    }

    setVersions(data || []);
    const current = data?.find(v => v.is_current);
    if (current) setSelectedVersion(current.id);
  };

  const createNewVersion = async (content: any, summary: string) => {
    const maxVersion = Math.max(...versions.map(v => v.version_number), 0);
    
    const { error } = await supabase
      .from('document_versions')
      .insert({
        document_id: documentId,
        version_number: maxVersion + 1,
        content,
        change_summary: summary,
        is_current: true
      });

    if (error) {
      Alert.alert('Error', 'Failed to create new version');
      return;
    }

    // Mark previous version as not current
    await supabase
      .from('document_versions')
      .update({ is_current: false })
      .eq('document_id', documentId)
      .neq('version_number', maxVersion + 1);

    loadVersions();
  };

  const rollbackToVersion = async (versionId: string) => {
    Alert.alert(
      'Rollback Version',
      'Are you sure you want to rollback to this version?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Rollback', 
          style: 'destructive',
          onPress: async () => {
            await supabase
              .from('document_versions')
              .update({ is_current: false })
              .eq('document_id', documentId);

            await supabase
              .from('document_versions')
              .update({ is_current: true })
              .eq('id', versionId);

            loadVersions();
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Document Versions</Text>
      
      <ScrollView style={styles.versionList}>
        {versions.map((version) => (
          <TouchableOpacity
            key={version.id}
            style={[
              styles.versionItem,
              version.is_current && styles.currentVersion,
              selectedVersion === version.id && styles.selectedVersion
            ]}
            onPress={() => {
              setSelectedVersion(version.id);
              onVersionSelect(version);
            }}
          >
            <View style={styles.versionHeader}>
              <Text style={styles.versionNumber}>
                Version {version.version_number}
              </Text>
              {version.is_current && (
                <Text style={styles.currentBadge}>CURRENT</Text>
              )}
            </View>
            
            <Text style={styles.versionDate}>
              {new Date(version.created_at).toLocaleDateString()}
            </Text>
            
            <Text style={styles.changeSummary}>
              {version.change_summary || 'No summary provided'}
            </Text>
            
            <View style={styles.versionActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => rollbackToVersion(version.id)}
              >
                <Text style={styles.actionButtonText}>Rollback</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  versionList: {
    flex: 1,
  },
  versionItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  currentVersion: {
    backgroundColor: '#e8f5e8',
  },
  selectedVersion: {
    backgroundColor: '#e3f2fd',
  },
  versionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  versionNumber: {
    fontSize: 16,
    fontWeight: '600',
  },
  currentBadge: {
    fontSize: 12,
    color: '#2e7d32',
    fontWeight: 'bold',
  },
  versionDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  changeSummary: {
    fontSize: 14,
    color: '#333',
    marginBottom: 12,
  },
  versionActions: {
    flexDirection: 'row',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#1976d2',
    borderRadius: 4,
    marginRight: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
});