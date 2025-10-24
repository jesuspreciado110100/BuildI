import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LogEntry } from '../types';

interface LogEntryCardProps {
  entry: LogEntry;
  userName?: string;
}

export default function LogEntryCard({ entry, userName }: LogEntryCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.userName}>{userName || 'Unknown User'}</Text>
          <Text style={styles.role}>{entry.role}</Text>
        </View>
        <View style={styles.dateContainer}>
          <Text style={styles.date}>{formatDate(entry.date)}</Text>
          <Text style={styles.time}>{formatTime(entry.created_at)}</Text>
        </View>
      </View>
      
      <Text style={styles.note}>{entry.note}</Text>
      
      {entry.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {entry.tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}
      
      {entry.photo_urls.length > 0 && (
        <View style={styles.photoIndicator}>
          <Text style={styles.photoText}>{entry.photo_urls.length} photo(s) attached</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },
  role: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize'
  },
  dateContainer: {
    alignItems: 'flex-end'
  },
  date: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333'
  },
  time: {
    fontSize: 12,
    color: '#666'
  },
  note: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 12
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  tagText: {
    fontSize: 12,
    color: '#666'
  },
  photoIndicator: {
    backgroundColor: '#e3f2fd',
    padding: 8,
    borderRadius: 8
  },
  photoText: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: '500'
  }
});