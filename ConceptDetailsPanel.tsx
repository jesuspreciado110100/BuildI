import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { ConceptProgressOverview } from './ConceptProgressOverview';
import { LaborBookingsPanel } from './LaborBookingsPanel';
import { MachineryBookingsPanel } from './MachineryBookingsPanel';
import { MaterialOrdersPanel } from './MaterialOrdersPanel';
import { ConceptVisualSection } from './ConceptVisualSection';
import { ConceptSmartSuggestions } from './ConceptSmartSuggestions';
import { ConceptRelatedTabs } from './ConceptRelatedTabs';
import { EnhancedSnapshotUploader } from './EnhancedSnapshotUploader';
import { ConceptProgressTimeline } from './ConceptProgressTimeline';
import { VisualProgressLogCard } from './VisualProgressLogCard';
import { ProgressSnapshotService, SnapshotEntry } from '../services/ProgressSnapshotService';
import { EmptyStateCard } from './EmptyStateCard';
import ProgressSnapshotTriggerService from '../services/ProgressSnapshotTriggerService';
import { ProgressCheckIntegration } from './ProgressCheckIntegration';
import { ProgressHeatmapPanel } from './ProgressHeatmapPanel';

interface ConceptDetailsPanelProps {
  siteId: string;
  conceptId: string;
}

export const ConceptDetailsPanel: React.FC<ConceptDetailsPanelProps> = ({
  siteId,
  conceptId
}) => {
  // Trigger snapshot reminders when concept is opened
  useEffect(() => {
    const triggerSnapshotCheck = async () => {
      try {
        console.log(`[ConceptDetailsPanel] Triggering snapshot check for site: ${siteId}`);
        await ProgressSnapshotTriggerService.watchAndNotify(siteId);
      } catch (error) {
        console.error('Error triggering snapshot check:', error);
      }
    };
    
    triggerSnapshotCheck();
  }, [siteId]);

  const [conceptData, setConceptData] = useState({
    name: 'Foundation Work',
    volumeCompleted: 45.5,
    totalVolume: 120.0,
    quantityPlanned: 120,
    quantityExecuted: 45,
    unit: 'm³',
    unitPrice: 85.50,
    totalCost: 10260,
    progress: 38,
    category: 'foundation'
  });

  const [snapshots, setSnapshots] = useState<SnapshotEntry[]>([]);
  const [isLoadingSnapshots, setIsLoadingSnapshots] = useState(true);

  const [laborBookings] = useState([
    {
      id: '1',
      type: 'labor_request' as const,
      workerName: 'John Smith',
      trade: 'Concrete Specialist',
      status: 'in_progress' as const,
      rating: 4.8,
      hourlyRate: 45,
      hoursWorked: 32,
      canChat: true
    },
    {
      id: '2',
      type: 'micro_job' as const,
      workerName: 'Mike Johnson',
      trade: 'General Labor',
      status: 'completed' as const,
      rating: 4.5,
      hourlyRate: 25,
      hoursWorked: 16,
      canChat: false
    }
  ]);

  const [machineryBookings] = useState([
    {
      id: '1',
      machineryName: 'CAT 320 Excavator',
      type: 'Excavator',
      operatorName: 'Bob Wilson',
      operatorPhone: '+1234567890',
      status: 'in_use' as const,
      dailyRate: 350,
      daysBooked: 5,
      startDate: '2024-01-15',
      endDate: '2024-01-20',
      canChat: true
    }
  ]);

  const [materialOrders] = useState([
    {
      id: '1',
      materialName: 'Ready-Mix Concrete',
      category: 'Concrete',
      quantity: 50,
      unit: 'm³',
      pricePerUnit: 120,
      totalPrice: 6000,
      supplierName: 'ABC Concrete Co.',
      status: 'in_transit' as const,
      deliveryDate: '2024-01-18',
      trackingNumber: 'TRK123456'
    },
    {
      id: '2',
      materialName: 'Steel Rebar',
      category: 'Steel',
      quantity: 2000,
      unit: 'kg',
      pricePerUnit: 1.25,
      totalPrice: 2500,
      supplierName: 'Steel Supply Inc.',
      status: 'quote_pending' as const
    }
  ]);

  const [progressPhotos] = useState([
    {
      id: '1',
      url: 'photo1.jpg',
      description: 'Excavation completed',
      uploadedBy: 'John Smith',
      uploadedAt: '2024-01-15',
      thumbnail: 'thumb1.jpg'
    },
    {
      id: '2',
      url: 'photo2.jpg',
      description: 'Concrete pouring in progress',
      uploadedBy: 'Mike Johnson',
      uploadedAt: '2024-01-16',
      thumbnail: 'thumb2.jpg'
    }
  ]);

  const [documents] = useState([
    {
      id: '1',
      name: 'Foundation Specifications.pdf',
      type: 'pdf' as const,
      size: '2.5 MB',
      uploadedBy: 'Project Manager',
      uploadedAt: '2024-01-10',
      url: 'spec.pdf'
    }
  ]);

  const [invoices] = useState([
    {
      id: '1',
      invoiceNumber: 'INV-2024-001',
      supplier: 'ABC Concrete Co.',
      amount: 6000,
      status: 'pending' as const,
      dueDate: '2024-02-01',
      items: ['Ready-Mix Concrete - 50m³']
    }
  ]);

  const [safetyLogs] = useState([
    {
      id: '1',
      type: 'inspection' as const,
      title: 'Daily Safety Inspection',
      description: 'All safety protocols followed',
      severity: 'low' as const,
      reportedBy: 'Safety Officer',
      reportedAt: '2024-01-16',
      status: 'resolved' as const
    }
  ]);

  // Load progress snapshots on mount
  useEffect(() => {
    loadSnapshots();
  }, [conceptId]);

  const loadSnapshots = async () => {
    try {
      setIsLoadingSnapshots(true);
      const snapshotData = await ProgressSnapshotService.getForConcept(conceptId);
      setSnapshots(snapshotData);
    } catch (error) {
      console.error('Error loading snapshots:', error);
    } finally {
      setIsLoadingSnapshots(false);
    }
  };

  const handlePhotoUploaded = (progressIncrease: number) => {
    setConceptData(prev => ({
      ...prev,
      progress: Math.min(100, prev.progress + progressIncrease)
    }));
  };

  const handleRefresh = () => {
    // Refresh data from API
    console.log('Refreshing concept data...');
    loadSnapshots();
  };

  const handleSnapshotUploaded = () => {
    // Refresh snapshots after new upload
    loadSnapshots();
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ConceptProgressOverview
        conceptName={conceptData.name}
        volumeCompleted={conceptData.volumeCompleted}
        totalVolume={conceptData.totalVolume}
        quantityPlanned={conceptData.quantityPlanned}
        quantityExecuted={conceptData.quantityExecuted}
        unit={conceptData.unit}
        unitPrice={conceptData.unitPrice}
        totalCost={conceptData.totalCost}
        progress={conceptData.progress}
      />
      
      {/* Progress Check Integration */}
      <ProgressCheckIntegration
        siteId={siteId}
        onCheckComplete={(results) => {
          console.log('Progress check results:', results);
        }}
      />
      
      {/* Progress Heatmap Panel */}
      <ProgressHeatmapPanel
        siteId={siteId}
        conceptId={conceptId}
      />
      
      <LaborBookingsPanel
        conceptId={conceptId}
        siteId={siteId}
        laborBookings={laborBookings}
        onRefresh={handleRefresh}
      />
      
      <MachineryBookingsPanel
        conceptId={conceptId}
        siteId={siteId}
        machineryBookings={machineryBookings}
        onRefresh={handleRefresh}
      />
      
      <MaterialOrdersPanel
        conceptId={conceptId}
        siteId={siteId}
        materialOrders={materialOrders}
        onRefresh={handleRefresh}
      />
      
      <ConceptVisualSection
        conceptId={conceptId}
        siteId={siteId}
        photos={progressPhotos}
        hasBIMModel={true}
        onPhotoUploaded={handlePhotoUploaded}
        onRefresh={handleRefresh}
      />
      
      {/* Visual Progress Logging Section */}
      <View style={styles.progressFeedSection}>
        <Text style={styles.sectionTitle}>Progress Feed</Text>
        
        {/* Snapshot Uploader */}
        <EnhancedSnapshotUploader
          siteId={siteId}
          conceptId={conceptId}
          onUploadComplete={handleSnapshotUploaded}
        />
        
        {/* Progress Timeline */}
        {snapshots.length > 0 && (
          <ConceptProgressTimeline
            siteId={siteId}
            conceptId={conceptId}
          />
        )}
        
        {/* Visual Progress Log Cards */}
        <View style={styles.logCardsContainer}>
          {isLoadingSnapshots ? (
            <Text style={styles.loadingText}>Loading progress logs...</Text>
          ) : snapshots.length > 0 ? (
            snapshots.map((snapshot) => (
              <VisualProgressLogCard
                key={snapshot.id}
                snapshot={snapshot}
              />
            ))
          ) : (
            <EmptyStateCard
              title="No Progress Logs Yet"
              description="Upload your first progress snapshot to start tracking visual progress for this concept."
              iconName="camera"
            />
          )}
        </View>
      </View>
      
      <ConceptSmartSuggestions
        conceptId={conceptId}
        conceptCategory={conceptData.category}
        siteId={siteId}
        onQuickAdd={(suggestion) => {
          console.log('Quick add:', suggestion);
        }}
      />
      
      <ConceptRelatedTabs
        conceptId={conceptId}
        documents={documents}
        invoices={invoices}
        safetyLogs={safetyLogs}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  progressFeedSection: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center'
  },
  logCardsContainer: {
    marginTop: 16
  },
  loadingText: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 16,
    padding: 20
  }
});

export default ConceptDetailsPanel;