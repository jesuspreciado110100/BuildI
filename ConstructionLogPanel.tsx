import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/app/lib/supabase';
import ModernAddConstructionLogModal from './ModernAddConstructionLogModal';

interface LogEntry {
  log_id: string;
  title: string;
  description: string;
  text: string;
  photo_url?: string;
  created_at: string;
  logged_by: string;
  weather_conditions?: string;
  temperature?: number;
  crew_size?: number;
  hours_worked?: number;
  safety_incidents?: number;
  quality_score?: number;
  log_type?: string;
}

interface ConstructionLogPanelProps {
  siteId: string;
}

export default function ConstructionLogPanel({ siteId }: ConstructionLogPanelProps) {
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchSiteLogs();
  }, [siteId]);

  const fetchSiteLogs = async () => {
    setRefreshing(true);
    try {
      const { data, error } = await supabase
        .from('site_logs')
        .select('*')
        .eq('site_id', siteId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (data && data.length > 0) {
        setLogEntries(data);
      } else {
        // Fallback to mock data if no logs exist
        setLogEntries([
          {
            log_id: '1',
            title: 'Foundation Pour Complete',
            description: 'Concrete foundation successfully poured',
            text: 'Foundation concrete pour completed. All reinforcement properly positioned.',
            photo_url: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400',
            logged_by: 'John Martinez - Site Foreman',
            log_type: 'progress',
            created_at: new Date().toISOString(),
            weather_conditions: 'Clear, sunny',
            temperature: 75,
            crew_size: 8,
            hours_worked: 8,
            safety_incidents: 0,
            quality_score: 9
          }
        ]);
      }
    } catch (err) {
      console.error('Error fetching logs:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const getActivityIcon = (type?: string) => {
    switch (type) {
      case 'progress': return 'checkmark-circle';
      case 'material': return 'cube';
      case 'safety': return 'shield-checkmark';
      case 'weather': return 'rainy';
      case 'quality': return 'star';
      default: return 'information-circle';
    }
  };

  const getActivityColor = (type?: string) => {
    switch (type) {
      case 'progress': return '#10B981';
      case 'material': return '#3B82F6';
      case 'safety': return '#F59E0B';
      case 'weather': return '#6B7280';
      case 'quality': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Construction Log</Text>
          <Text style={styles.subtitle}>Site Progress & Activities</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.documentsButton}
            onPress={() => {/* Navigate to documents */}}
          >
            <Ionicons name="document-text" size={18} color="#3B82F6" />
            <Text style={styles.documentsButtonText}>Documents</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Ionicons name="add" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.logContainer} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchSiteLogs} />
        }
      >
        {logEntries.map((entry) => (
          <View key={entry.log_id} style={styles.logEntry}>
            <View style={styles.logHeader}>
              <View style={[styles.iconContainer, { backgroundColor: getActivityColor(entry.log_type) + '20' }]}>
                <Ionicons 
                  name={getActivityIcon(entry.log_type) as any} 
                  size={20} 
                  color={getActivityColor(entry.log_type)} 
                />
              </View>
              <View style={styles.logInfo}>
                <Text style={styles.timestamp}>
                  {new Date(entry.created_at).toLocaleDateString()} - {new Date(entry.created_at).toLocaleTimeString()}
                </Text>
                <Text style={styles.worker}>{entry.logged_by}</Text>
              </View>
            </View>
            
            <Text style={styles.activity}>{entry.title}</Text>
            <Text style={styles.description}>{entry.text}</Text>
            
            {entry.photo_url && (
              <Image source={{ uri: entry.photo_url }} style={styles.evidencePhoto} />
            )}
            
            <View style={styles.metaInfo}>
              {entry.weather_conditions && <Text style={styles.metaText}>Weather: {entry.weather_conditions}</Text>}
              {entry.temperature && <Text style={styles.metaText}>Temp: {entry.temperature}°F</Text>}
              {entry.crew_size && <Text style={styles.metaText}>Crew: {entry.crew_size}</Text>}
              {entry.hours_worked && <Text style={styles.metaText}>Hours: {entry.hours_worked}</Text>}
              {entry.quality_score && <Text style={styles.metaText}>Quality: {entry.quality_score}/10</Text>}
            </View>
          </View>
        ))}
      </ScrollView>

      <ModernAddConstructionLogModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        siteId={siteId}
        onLogAdded={fetchSiteLogs}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#FFFFFF', margin: 16, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  headerLeft: { flex: 1 },
  headerButtons: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 18, fontWeight: '600', color: '#1F2937', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#6B7280' },
  documentsButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EBF4FF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, gap: 4 },
  documentsButtonText: { fontSize: 12, color: '#3B82F6', fontWeight: '500' },
  addButton: { backgroundColor: '#3B82F6', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  logContainer: { maxHeight: 400, padding: 16 },
  logEntry: { marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  logHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  iconContainer: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  logInfo: { flex: 1 },
  timestamp: { fontSize: 12, color: '#6B7280', marginBottom: 2 },
  worker: { fontSize: 14, fontWeight: '500', color: '#374151' },
  activity: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 4 },
  description: { fontSize: 14, color: '#6B7280', lineHeight: 20, marginBottom: 8 },
  evidencePhoto: { width: '100%', height: 120, borderRadius: 8, marginBottom: 8 },
  metaInfo: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  metaText: { fontSize: 12, color: '#6B7280', backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }
});