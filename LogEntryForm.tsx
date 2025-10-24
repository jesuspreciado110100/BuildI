import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { LogEntry } from '../types';

interface LogEntryFormProps {
  onSubmit: (entry: Omit<LogEntry, 'id' | 'created_at'>) => void;
  siteId: string;
  userId: string;
  userRole: string;
}

const commonTags = ['weather', 'inspection', 'delay', 'delivery', 'safety', 'equipment', 'materials', 'progress'];

export default function LogEntryForm({ onSubmit, siteId, userId, userRole }: LogEntryFormProps) {
  const [note, setNote] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSubmit = () => {
    if (!note.trim()) return;
    
    onSubmit({
      site_id: siteId,
      user_id: userId,
      role: userRole,
      date,
      note: note.trim(),
      tags: selectedTags,
      photo_urls: []
    });
    
    setNote('');
    setSelectedTags([]);
    setDate(new Date().toISOString().split('T')[0]);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Date</Text>
      <TextInput
        style={styles.dateInput}
        value={date}
        onChangeText={setDate}
        placeholder="YYYY-MM-DD"
      />
      
      <Text style={styles.label}>Notes</Text>
      <TextInput
        style={styles.noteInput}
        value={note}
        onChangeText={setNote}
        placeholder="Enter daily log notes..."
        multiline
        numberOfLines={4}
      />
      
      <Text style={styles.label}>Tags</Text>
      <View style={styles.tagsContainer}>
        {commonTags.map(tag => (
          <TouchableOpacity
            key={tag}
            style={[styles.tag, selectedTags.includes(tag) && styles.selectedTag]}
            onPress={() => toggleTag(tag)}
          >
            <Text style={[styles.tagText, selectedTags.includes(tag) && styles.selectedTagText]}>
              {tag}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitText}>Add Log Entry</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 8, marginTop: 16 },
  dateInput: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8 },
  noteInput: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, height: 100, textAlignVertical: 'top' },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { backgroundColor: '#f0f0f0', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  selectedTag: { backgroundColor: '#007AFF' },
  tagText: { color: '#333' },
  selectedTagText: { color: 'white' },
  submitButton: { backgroundColor: '#007AFF', padding: 16, borderRadius: 8, marginTop: 24 },
  submitText: { color: 'white', textAlign: 'center', fontWeight: 'bold' }
});