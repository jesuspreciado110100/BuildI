import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Image } from 'react-native';

interface Site {
  id: string;
  name: string;
  location: string;
  status: string;
  progress: number;
  budget: number;
  teamSize: number;
  price: number;
  type: string;
  photos: string[];
}

interface Props {
  visible: boolean;
  site: Site | null;
  onClose: () => void;
  onRequestMaterials: () => void;
  onHireLabor: () => void;
  onViewReports: () => void;
}

export const SiteQuickViewModal: React.FC<Props> = ({
  visible,
  site,
  onClose,
  onRequestMaterials,
  onHireLabor,
  onViewReports
}) => {
  if (!site) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{site.name}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.content}>
          {site.photos.length > 0 && (
            <Image source={{ uri: site.photos[0] }} style={styles.photo} />
          )}
          
          <View style={styles.infoSection}>
            <Text style={styles.location}>📍 {site.location}</Text>
            <Text style={styles.status}>Status: {site.status}</Text>
            <Text style={styles.type}>Type: {site.type}</Text>
          </View>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{site.progress}%</Text>
              <Text style={styles.statLabel}>Progress</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>${(site.budget / 1000000).toFixed(1)}M</Text>
              <Text style={styles.statLabel}>Budget</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{site.teamSize}</Text>
              <Text style={styles.statLabel}>Team Size</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>${site.price}</Text>
              <Text style={styles.statLabel}>Current Price</Text>
            </View>
          </View>
          
          <View style={styles.progressSection}>
            <Text style={styles.progressTitle}>Project Progress</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${site.progress}%` }]} />
            </View>
          </View>
          
          <View style={styles.actionsSection}>
            <Text style={styles.actionsTitle}>Quick Actions</Text>
            
            <TouchableOpacity style={styles.actionButton} onPress={onRequestMaterials}>
              <Text style={styles.actionIcon}>📦</Text>
              <Text style={styles.actionText}>Request Materials</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={onHireLabor}>
              <Text style={styles.actionIcon}>👷</Text>
              <Text style={styles.actionText}>Hire Labor</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={onViewReports}>
              <Text style={styles.actionIcon}>📊</Text>
              <Text style={styles.actionText}>View Reports</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  title: { fontSize: 20, fontWeight: 'bold' },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center'
  },
  closeText: { fontSize: 18, color: '#666' },
  content: { flex: 1, padding: 16 },
  photo: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16
  },
  infoSection: { marginBottom: 20 },
  location: { fontSize: 16, color: '#666', marginBottom: 4 },
  status: { fontSize: 16, color: '#4CAF50', marginBottom: 4 },
  type: { fontSize: 16, color: '#666' },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  statCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8
  },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  statLabel: { fontSize: 12, color: '#666', marginTop: 4 },
  progressSection: { marginBottom: 20 },
  progressTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4
  },
  actionsSection: { marginBottom: 20 },
  actionsTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8
  },
  actionIcon: { fontSize: 20, marginRight: 12 },
  actionText: { fontSize: 16, color: 'white', fontWeight: '600' }
});