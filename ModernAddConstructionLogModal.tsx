import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, TextInput, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/app/lib/supabase';
import CatalogItemSelector from './CatalogItemSelector';

interface ModernAddConstructionLogModalProps {
  visible: boolean;
  onClose: () => void;
  siteId: string;
  onLogAdded: () => void;
}

const logTypes = [
  { id: 'progress', label: 'Progress', icon: 'checkmark-circle' },
  { id: 'material', label: 'Material', icon: 'cube' },
  { id: 'safety', label: 'Safety', icon: 'shield-checkmark' },
  { id: 'quality', label: 'Quality', icon: 'star' }
];

export default function ModernAddConstructionLogModal({ 
  visible, 
  onClose, 
  siteId, 
  onLogAdded 
}: ModernAddConstructionLogModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [logType, setLogType] = useState('progress');
  const [selectedCatalogItems, setSelectedCatalogItems] = useState<string[]>([]);
  const [projectId, setProjectId] = useState<string>('');
  const [showCatalogSelector, setShowCatalogSelector] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchProjectId();
    }
  }, [visible, siteId]);

  const fetchProjectId = async () => {
    try {
      const { data } = await supabase
        .from('projects')
        .select('project_id')
        .limit(1)
        .single();
      
      if (data) {
        setProjectId(data.project_id);
      }
    } catch (err) {
      console.error('Error fetching project:', err);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    setLoading(true);
    try {
      const { data: logData, error: logError } = await supabase
        .from('site_logs')
        .insert({
          site_id: siteId,
          title,
          description,
          text: description,
          log_type: logType,
          logged_by: 'Current User',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (logError) throw logError;

      if (selectedCatalogItems.length > 0 && logData) {
        const catalogLinks = selectedCatalogItems.map(itemId => ({
          log_id: logData.log_id,
          catalog_item_id: itemId,
          project_id: projectId
        }));

        await supabase.from('site_log_catalog_items').insert(catalogLinks);
      }

      onLogAdded();
      resetForm();
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to save log');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setLogType('progress');
    setSelectedCatalogItems([]);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.title}>Add Construction Log</Text>
          <TouchableOpacity onPress={handleSubmit} disabled={loading}>
            <Text style={[styles.saveButton, loading && styles.disabled]}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Title</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter log title..."
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Log Type</Text>
            <View style={styles.optionsGrid}>
              {logTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[styles.optionCard, logType === type.id && styles.selectedOption]}
                  onPress={() => setLogType(type.id)}
                >
                  <Ionicons name={type.icon as any} size={24} color={logType === type.id ? '#007AFF' : '#666'} />
                  <Text style={[styles.optionText, logType === type.id && styles.selectedText]}>{type.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <TextInput
              style={styles.textArea}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe the work progress or issue..."
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.section}>
            <TouchableOpacity 
              style={styles.catalogButton}
              onPress={() => setShowCatalogSelector(true)}
            >
              <Ionicons name="list" size={20} color="#3B82F6" />
              <Text style={styles.catalogButtonText}>
                Select Catalog Items ({selectedCatalogItems.length})
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      <Modal visible={showCatalogSelector} animationType="slide">
        <View style={styles.catalogModal}>
          <View style={styles.catalogHeader}>
            <TouchableOpacity onPress={() => setShowCatalogSelector(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.catalogTitle}>Select Items</Text>
            <TouchableOpacity onPress={() => setShowCatalogSelector(false)}>
              <Text style={styles.doneButton}>Done</Text>
            </TouchableOpacity>
          </View>
          {projectId && (
            <CatalogItemSelector
              projectId={projectId}
              selectedItems={selectedCatalogItems}
              onItemsChange={setSelectedCatalogItems}
            />
          )}
        </View>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 60, borderBottomWidth: 1, borderBottomColor: '#eee' },
  title: { fontSize: 18, fontWeight: '600' },
  saveButton: { color: '#007AFF', fontSize: 16, fontWeight: '600' },
  disabled: { opacity: 0.5 },
  content: { flex: 1, padding: 20 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12, color: '#333' },
  input: { borderWidth: 1, borderColor: '#eee', borderRadius: 12, padding: 16, fontSize: 16, backgroundColor: '#f9f9f9' },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  optionCard: { flex: 1, minWidth: '45%', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#eee', alignItems: 'center', backgroundColor: '#f9f9f9' },
  selectedOption: { borderColor: '#007AFF', backgroundColor: '#f0f8ff' },
  optionText: { marginTop: 8, fontSize: 12, color: '#666', textAlign: 'center' },
  selectedText: { color: '#007AFF' },
  textArea: { borderWidth: 1, borderColor: '#eee', borderRadius: 12, padding: 16, fontSize: 16, textAlignVertical: 'top', backgroundColor: '#f9f9f9', minHeight: 100 },
  catalogButton: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#EBF4FF', borderRadius: 12, borderWidth: 1, borderColor: '#3B82F6' },
  catalogButtonText: { marginLeft: 8, fontSize: 16, color: '#3B82F6', fontWeight: '500' },
  catalogModal: { flex: 1, backgroundColor: '#fff' },
  catalogHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 60, borderBottomWidth: 1, borderBottomColor: '#eee' },
  catalogTitle: { fontSize: 18, fontWeight: '600' },
  doneButton: { color: '#007AFF', fontSize: 16, fontWeight: '600' }
});