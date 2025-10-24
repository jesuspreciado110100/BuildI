import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { LogEntry } from '../types';
import LogEntryForm from './LogEntryForm';
import LogEntryCard from './LogEntryCard';

interface DailyLogTabProps {
  siteId: string;
  userId: string;
  userRole: string;
}

export default function DailyLogTab({ siteId, userId, userRole }: DailyLogTabProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [filterTag, setFilterTag] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Mock data for demonstration
  useEffect(() => {
    const mockLogs: LogEntry[] = [
      {
        id: '1',
        site_id: siteId,
        user_id: 'user1',
        role: 'contractor',
        date: '2024-01-15',
        note: 'Foundation work completed. Weather conditions were favorable.',
        tags: ['progress', 'weather'],
        photo_urls: ['photo1.jpg'],
        created_at: '2024-01-15T14:30:00Z'
      },
      {
        id: '2',
        site_id: siteId,
        user_id: 'user2',
        role: 'labor_chief',
        date: '2024-01-14',
        note: 'Material delivery delayed due to traffic. Rescheduled for tomorrow.',
        tags: ['delay', 'delivery'],
        photo_urls: [],
        created_at: '2024-01-14T16:45:00Z'
      }
    ];
    setLogs(mockLogs);
  }, [siteId]);

  const handleAddLog = (newLog: Omit<LogEntry, 'id' | 'created_at'>) => {
    const logEntry: LogEntry = {
      ...newLog,
      id: Date.now().toString(),
      created_at: new Date().toISOString()
    };
    setLogs(prev => [logEntry, ...prev]);
    setShowForm(false);
  };

  const filteredLogs = logs.filter(log => {
    if (filterTag && !log.tags.includes(filterTag)) return false;
    if (filterRole && log.role !== filterRole) return false;
    if (dateFilter && !log.date.includes(dateFilter)) return false;
    return true;
  });

  const allTags = [...new Set(logs.flatMap(log => log.tags))];
  const allRoles = [...new Set(logs.map(log => log.role))];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Daily Site Log</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowForm(!showForm)}
        >
          <Text style={styles.addButtonText}>{showForm ? 'Cancel' : 'Add Entry'}</Text>
        </TouchableOpacity>
      </View>

      {showForm && (
        <LogEntryForm
          onSubmit={handleAddLog}
          siteId={siteId}
          userId={userId}
          userRole={userRole}
        />
      )}

      <View style={styles.filters}>
        <TextInput
          style={styles.filterInput}
          placeholder="Filter by date (YYYY-MM-DD)"
          value={dateFilter}
          onChangeText={setDateFilter}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.filterChip, !filterTag && styles.activeFilter]}
            onPress={() => setFilterTag('')}
          >
            <Text style={styles.filterText}>All Tags</Text>
          </TouchableOpacity>
          {allTags.map(tag => (
            <TouchableOpacity
              key={tag}
              style={[styles.filterChip, filterTag === tag && styles.activeFilter]}
              onPress={() => setFilterTag(tag)}
            >
              <Text style={styles.filterText}>{tag}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.logsList}>
        {filteredLogs.map(log => (
          <LogEntryCard key={log.id} entry={log} userName="Site User" />
        ))}
        {filteredLogs.length === 0 && (
          <Text style={styles.emptyText}>No log entries found</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: 'white' },
  title: { fontSize: 20, fontWeight: 'bold' },
  addButton: { backgroundColor: '#007AFF', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  addButtonText: { color: 'white', fontWeight: 'bold' },
  filters: { backgroundColor: 'white', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  filterInput: { borderWidth: 1, borderColor: '#ddd', padding: 8, borderRadius: 8, marginBottom: 12 },
  filterChip: { backgroundColor: '#f0f0f0', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginRight: 8 },
  activeFilter: { backgroundColor: '#007AFF' },
  filterText: { fontSize: 12, color: '#333' },
  logsList: { flex: 1 },
  emptyText: { textAlign: 'center', color: '#666', marginTop: 40, fontSize: 16 }
});