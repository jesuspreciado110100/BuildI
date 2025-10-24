import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, TextInput, ScrollView } from 'react-native';

interface ProgressLogModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ProgressLogModal: React.FC<ProgressLogModalProps> = ({ visible, onClose }) => {
  const [progress, setProgress] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedSite, setSelectedSite] = useState('Site A');

  const handleSubmit = () => {
    console.log('Progress logged:', { progress, notes, selectedSite });
    setProgress('');
    setNotes('');
    onClose();
  };

  const sites = ['Site A', 'Site B', 'Site C'];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Log Progress</Text>
          <TouchableOpacity onPress={handleSubmit}>
            <Text style={styles.saveButton}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.label}>Site</Text>
            <View style={styles.siteSelector}>
              {sites.map((site) => (
                <TouchableOpacity
                  key={site}
                  style={[
                    styles.siteOption,
                    selectedSite === site && styles.selectedSite
                  ]}
                  onPress={() => setSelectedSite(site)}
                >
                  <Text style={[
                    styles.siteText,
                    selectedSite === site && styles.selectedSiteText
                  ]}>{site}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Progress %</Text>
            <TextInput
              style={styles.input}
              value={progress}
              onChangeText={setProgress}
              placeholder="Enter progress percentage"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add progress notes..."
              multiline
              numberOfLines={4}
            />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    color: '#6b7280',
    fontSize: 16,
  },
  saveButton: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#374151',
  },
  siteSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  siteOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  selectedSite: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  siteText: {
    color: '#374151',
    fontSize: 14,
  },
  selectedSiteText: {
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
});