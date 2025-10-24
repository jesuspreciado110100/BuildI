import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { QRAnalytics } from '../types';
import { ConceptScannerComponent } from './ConceptScannerComponent';
import { ConstructionConcept, ConceptProgressLog } from '../types';
import { notificationService } from '../services/NotificationService';
import { QRGeneratorService } from '../services/QRGeneratorService';

interface QRAnalyticsDashboardProps {
  contractorId: string;
}

export const QRAnalyticsDashboard: React.FC<QRAnalyticsDashboardProps> = ({ contractorId }) => {
  const [analytics, setAnalytics] = useState<QRAnalytics>({
    total_deliveries: 0,
    scanned_deliveries: 0,
    scan_verification_rate: 0,
    avg_scan_delay_hours: 0,
    concepts_completed_via_scan: 0,
    total_concepts_completed: 0,
    concept_scan_rate: 0
  });
  
  const [mockConcepts] = useState<ConstructionConcept[]>([
    {
      id: 'concept1',
      name: 'Foundation Work',
      description: 'Concrete foundation',
      trade: 'Concrete',
      tags: ['foundation'],
      phases: [],
      total_volume: 100,
      unit: 'm³',
      estimated_duration: 5,
      created_at: new Date().toISOString(),
      contractor_id: contractorId,
      status: 'in_progress',
      qr_code: QRGeneratorService.generateConceptQR('concept1')
    },
    {
      id: 'concept2',
      name: 'Wall Construction',
      description: 'Brick wall construction',
      trade: 'Masonry',
      tags: ['walls'],
      phases: [],
      total_volume: 200,
      unit: 'm²',
      estimated_duration: 8,
      created_at: new Date().toISOString(),
      contractor_id: contractorId,
      status: 'planning',
      qr_code: QRGeneratorService.generateConceptQR('concept2')
    }
  ]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = () => {
    // Mock analytics data
    setAnalytics({
      total_deliveries: 25,
      scanned_deliveries: 22,
      scan_verification_rate: 88,
      avg_scan_delay_hours: 2.5,
      concepts_completed_via_scan: 8,
      total_concepts_completed: 12,
      concept_scan_rate: 67
    });
  };

  const handleProgressLogged = async (log: ConceptProgressLog) => {
    const concept = mockConcepts.find(c => c.id === log.concept_id);
    if (concept) {
      await notificationService.sendConceptProgressScannedNotification(
        contractorId,
        concept.name,
        log.progress_percent,
        concept.id
      );
    }
    
    // Update analytics
    setAnalytics(prev => ({
      ...prev,
      concepts_completed_via_scan: prev.concepts_completed_via_scan + (log.progress_percent === 100 ? 1 : 0)
    }));
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>QR Analytics Dashboard</Text>
      
      <View style={styles.analyticsGrid}>
        <View style={styles.analyticsCard}>
          <Text style={styles.analyticsValue}>{analytics.scan_verification_rate}%</Text>
          <Text style={styles.analyticsLabel}>Deliveries Verified by Scan</Text>
        </View>
        
        <View style={styles.analyticsCard}>
          <Text style={styles.analyticsValue}>{analytics.avg_scan_delay_hours}h</Text>
          <Text style={styles.analyticsLabel}>Avg Scan Delay</Text>
        </View>
        
        <View style={styles.analyticsCard}>
          <Text style={styles.analyticsValue}>{analytics.concept_scan_rate}%</Text>
          <Text style={styles.analyticsLabel}>Concepts Scanned</Text>
        </View>
        
        <View style={styles.analyticsCard}>
          <Text style={styles.analyticsValue}>{analytics.scanned_deliveries}/{analytics.total_deliveries}</Text>
          <Text style={styles.analyticsLabel}>Scanned Deliveries</Text>
        </View>
      </View>
      
      <Text style={styles.sectionTitle}>Concept Progress Scanner</Text>
      
      {mockConcepts.map(concept => (
        <ConceptScannerComponent
          key={concept.id}
          concept={concept}
          onProgressLogged={handleProgressLogged}
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center'
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30
  },
  analyticsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '48%',
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  analyticsValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8
  },
  analyticsLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500'
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16
  }
});