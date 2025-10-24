import React, { useState } from 'react';
import { View, Text, Modal, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';

interface LogEntry {
  id: string;
  date: string;
  time: string;
  activity: string;
  description: string;
  author: string;
  type: 'progress' | 'issue' | 'safety' | 'material';
}

interface ConstructionLogModalProps {
  visible: boolean;
  onClose: () => void;
  siteId: string;
  siteName: string;
}

const mockLogEntries: LogEntry[] = [
  {
    id: '1',
    date: '2024-01-15',
    time: '09:30 AM',
    activity: 'Foundation Pour',
    description: 'Completed concrete pour for foundation section A. Weather conditions optimal.',
    author: 'John Smith',
    type: 'progress'
  },
  {
    id: '2',
    date: '2024-01-15',
    time: '02:15 PM',
    activity: 'Safety Inspection',
    description: 'Weekly safety inspection completed. All equipment checked and certified.',
    author: 'David Chen',
    type: 'safety'
  },
  {
    id: '3',
    date: '2024-01-14',
    time: '11:00 AM',
    activity: 'Material Delivery',
    description: 'Steel beams delivered and stored in designated area. Quality check passed.',
    author: 'Maria Garcia',
    type: 'material'
  }
];

const getTypeColor = (type: string) => {
  switch (type) {
    case 'progress': return '#10B981';
    case 'issue': return '#EF4444';
    case 'safety': return '#F59E0B';
    case 'material': return '#3B82F6';
    default: return '#6B7280';
  }
};

export default function ConstructionLogModal({ 
  visible, 
  onClose, 
  siteId, 
  siteName 
}: ConstructionLogModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Construction Log</Text>
          <Text style={styles.subtitle}>{siteName}</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.content}>
          {mockLogEntries.map((entry) => (
            <View key={entry.id} style={styles.logEntry}>
              <View style={styles.entryHeader}>
                <View style={[styles.typeIndicator, { backgroundColor: getTypeColor(entry.type) }]} />
                <View style={styles.entryInfo}>
                  <Text style={styles.entryDate}>{entry.date} at {entry.time}</Text>
                  <Text style={styles.entryActivity}>{entry.activity}</Text>
                </View>
              </View>
              <Text style={styles.entryDescription}>{entry.description}</Text>
              <Text style={styles.entryAuthor}>By {entry.author}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
  },
  closeButton: {
    alignSelf: 'flex-end',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  closeText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  logEntry: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 12,
  },
  entryInfo: {
    flex: 1,
  },
  entryDate: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  entryActivity: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  entryDescription: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 8,
  },
  entryAuthor: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
});