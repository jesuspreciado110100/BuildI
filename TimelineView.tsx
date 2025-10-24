import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';

interface TimelineViewProps {
  contractorId?: string;
}

interface TimelineItem {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  progress: number;
  type: 'concept' | 'milestone';
}

export default function TimelineView({ contractorId }: TimelineViewProps) {
  const [zoomLevel, setZoomLevel] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  const mockItems: TimelineItem[] = [
    {
      id: '1',
      name: 'Foundation Work',
      startDate: '2024-01-15',
      endDate: '2024-02-15',
      progress: 75,
      type: 'concept'
    },
    {
      id: '2',
      name: 'Structural Framework',
      startDate: '2024-02-01',
      endDate: '2024-03-15',
      progress: 45,
      type: 'concept'
    },
    {
      id: '3',
      name: 'Inspection Milestone',
      startDate: '2024-02-20',
      endDate: '2024-02-20',
      progress: 100,
      type: 'milestone'
    }
  ];

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return '#10B981';
    if (progress >= 50) return '#F59E0B';
    return '#EF4444';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const renderTimelineItem = (item: TimelineItem) => {
    if (item.type === 'milestone') {
      return (
        <View key={item.id} style={styles.milestoneRow}>
          <View style={styles.milestoneMarker}>
            <Text style={styles.milestoneIcon}>📍</Text>
            <Text style={styles.milestoneTitle}>{item.name}</Text>
            <Text style={styles.milestoneDate}>{formatDate(item.startDate)}</Text>
          </View>
        </View>
      );
    }

    return (
      <View key={item.id} style={styles.conceptRow}>
        <View style={styles.conceptInfo}>
          <Text style={styles.conceptName}>{item.name}</Text>
          <Text style={styles.conceptDates}>
            {formatDate(item.startDate)} - {formatDate(item.endDate)}
          </Text>
        </View>
        <View style={styles.conceptBar}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${item.progress}%`,
                backgroundColor: getProgressColor(item.progress),
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>{item.progress}%</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Timeline View</Text>
        <View style={styles.zoomControls}>
          {(['daily', 'weekly', 'monthly'] as const).map((level) => (
            <TouchableOpacity
              key={level}
              style={[styles.zoomButton, zoomLevel === level && styles.activeZoomButton]}
              onPress={() => setZoomLevel(level)}
            >
              <Text style={[styles.zoomButtonText, zoomLevel === level && styles.activeZoomButtonText]}>
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView style={styles.timelineContainer}>
        <View style={styles.timeline}>
          {mockItems.map(renderTimelineItem)}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  zoomControls: {
    flexDirection: 'row',
  },
  zoomButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginHorizontal: 2,
    borderRadius: 4,
    backgroundColor: '#F3F4F6',
  },
  activeZoomButton: {
    backgroundColor: '#3B82F6',
  },
  zoomButtonText: {
    fontSize: 12,
    color: '#6B7280',
  },
  activeZoomButtonText: {
    color: '#fff',
  },
  timelineContainer: {
    maxHeight: 300,
  },
  timeline: {
    gap: 12,
  },
  conceptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
  },
  conceptInfo: {
    width: 120,
    marginRight: 12,
  },
  conceptName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  conceptDates: {
    fontSize: 12,
    color: '#6B7280',
  },
  conceptBar: {
    height: 16,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 12,
    flex: 1,
  },
  progressBar: {
    height: '100%',
    borderRadius: 8,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    width: 40,
    textAlign: 'center',
    color: '#374151',
  },
  milestoneRow: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  milestoneMarker: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  milestoneIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  milestoneTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    color: '#1F2937',
  },
  milestoneDate: {
    fontSize: 12,
    color: '#6B7280',
  },
});