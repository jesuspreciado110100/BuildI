import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './ProgressHeatmapPanelStyles';

interface HeatmapEntry {
  date: string;
  snapshotCount: number;
  uploadedBy?: string;
  lastSnapshot?: string;
}

interface Props {
  siteId?: string;
}

export const ProgressHeatmapPanel: React.FC<Props> = ({ siteId = 'demo' }) => {
  const [heatmapData, setHeatmapData] = useState<HeatmapEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTile, setSelectedTile] = useState<any>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const mockData = generateMockData();
        setHeatmapData(mockData);
        
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      } catch (error) {
        console.error('Failed to fetch heatmap data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [siteId]);

  const generateMockData = (): HeatmapEntry[] => {
    const data: HeatmapEntry[] = [];
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const daysSinceSnapshot = Math.random() * 10;
      let snapshotCount = 0;
      
      if (daysSinceSnapshot < 2) snapshotCount = Math.floor(Math.random() * 3) + 1;
      else if (daysSinceSnapshot < 7) snapshotCount = Math.random() > 0.7 ? 1 : 0;
      
      data.push({
        date: dateStr,
        snapshotCount,
        uploadedBy: snapshotCount > 0 ? 'John Doe' : undefined,
        lastSnapshot: snapshotCount > 0 ? '2:30 PM' : undefined
      });
    }
    
    return data;
  };

  const getStatusColor = (entry: HeatmapEntry): string => {
    if (entry.snapshotCount === 0) return '#f3f4f6';
    
    const date = new Date(entry.date);
    const today = new Date();
    const daysDiff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff <= 2) return '#10b981';
    if (daysDiff <= 6) return '#f59e0b';
    return '#ef4444';
  };

  const generateCalendarGrid = () => {
    const today = new Date();
    const sites = ['Site A', 'Site B', 'Site C', 'Site D', 'Site E'];
    const days = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      days.push(date);
    }
    
    return { sites, days };
  };

  const { sites, days } = generateCalendarGrid();

  const getStatsData = () => {
    const totalTiles = sites.length * days.length;
    const upToDate = Math.floor(totalTiles * 0.7);
    const stale = Math.floor(totalTiles * 0.2);
    
    return {
      upToDatePercent: Math.round((upToDate / totalTiles) * 100),
      staleCount: stale,
      totalSnapshots: heatmapData.reduce((sum, entry) => sum + entry.snapshotCount, 0)
    };
  };

  const stats = getStatsData();

  const handleTilePress = (site: string, day: Date) => {
    const entry = heatmapData.find(e => e.date === day.toISOString().split('T')[0]);
    setSelectedTile({ site, day, entry });
    setShowTooltip(true);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Ionicons name="camera" size={20} color="#6b7280" />
          <Text style={styles.title}>Progress Coverage</Text>
        </View>
        <View style={styles.shimmerContainer}>
          {[...Array(5)].map((_, i) => (
            <View key={i} style={styles.shimmerRow}>
              {[...Array(7)].map((_, j) => (
                <View key={j} style={[styles.tile, styles.shimmer]} />
              ))}
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.header}>
        <Ionicons name="camera" size={20} color="#6b7280" />
        <Text style={styles.title}>Progress Coverage</Text>
        <TouchableOpacity>
          <Ionicons name="information-circle-outline" size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.upToDatePercent}%</Text>
          <Text style={styles.statLabel}>Up to date</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#f59e0b' }]}>{stats.staleCount}</Text>
          <Text style={styles.statLabel}>Stale</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.totalSnapshots}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      <View style={styles.dateHeader}>
        <View style={styles.siteLabel} />
        {days.map((day, index) => (
          <Text key={index} style={styles.dateText}>
            {day.toLocaleDateString('en', { weekday: 'short' })}
          </Text>
        ))}
      </View>

      <View style={styles.heatmapGrid}>
        {sites.map((site, siteIndex) => (
          <View key={siteIndex} style={styles.siteRow}>
            <Text style={styles.siteText}>{site}</Text>
            {days.map((day, dayIndex) => {
              const entry = heatmapData.find(e => e.date === day.toISOString().split('T')[0]);
              const color = entry ? getStatusColor(entry) : '#f3f4f6';
              
              return (
                <TouchableOpacity
                  key={dayIndex}
                  style={[styles.tile, { backgroundColor: color }]}
                  onPress={() => handleTilePress(site, day)}
                >
                  {entry && entry.snapshotCount > 0 && (
                    <Text style={styles.tileText}>{entry.snapshotCount}</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#10b981' }]} />
          <Text style={styles.legendText}>Fresh (≤2d)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#f59e0b' }]} />
          <Text style={styles.legendText}>Stale (3-6d)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} />
          <Text style={styles.legendText}>Overdue (>7d)</Text>
        </View>
      </View>

      {stats.upToDatePercent < 80 && (
        <TouchableOpacity style={styles.ctaButton}>
          <Ionicons name="cloud-upload" size={20} color="#fff" />
          <Text style={styles.ctaText}>Upload Snapshot</Text>
        </TouchableOpacity>
      )}

      <Modal
        visible={showTooltip}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTooltip(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setShowTooltip(false)}
        >
          <View style={styles.tooltip}>
            <Text style={styles.tooltipTitle}>{selectedTile?.site}</Text>
            <Text style={styles.tooltipDate}>
              {selectedTile?.day?.toLocaleDateString()}
            </Text>
            {selectedTile?.entry?.snapshotCount > 0 ? (
              <>
                <Text style={styles.tooltipText}>
                  {selectedTile.entry.snapshotCount} snapshots
                </Text>
                <Text style={styles.tooltipText}>
                  Last: {selectedTile.entry.lastSnapshot}
                </Text>
                <Text style={styles.tooltipText}>
                  By: {selectedTile.entry.uploadedBy}
                </Text>
              </>
            ) : (
              <Text style={styles.tooltipText}>No snapshots</Text>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </Animated.View>
  );
};