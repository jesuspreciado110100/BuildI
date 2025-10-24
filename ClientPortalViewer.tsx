import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { PortalAccessService } from '../services/PortalAccessService';
import { PortalSiteData } from '../types/ClientPortal';
import { PhotoGallery } from './PhotoGallery';
import { ReportDownloadsPanel } from './ReportDownloadsPanel';
import { CostBreakdownPanel } from './CostBreakdownPanel';
import { ContactContractorButton } from './ContactContractorButton';
import { AnimatedProgressBar } from './AnimatedProgressBar';

interface ClientPortalViewerProps {
  siteId: string;
  role: 'client' | 'investor';
  portalId: string;
}

export const ClientPortalViewer: React.FC<ClientPortalViewerProps> = ({ 
  siteId, 
  role, 
  portalId 
}) => {
  const [siteData, setSiteData] = useState<PortalSiteData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSiteData();
    logPortalAccess();
  }, [siteId, role]);

  const loadSiteData = async () => {
    try {
      const data = await PortalAccessService.getViewableSiteData(siteId, role);
      setSiteData(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load site data');
    } finally {
      setLoading(false);
    }
  };

  const logPortalAccess = async () => {
    try {
      await PortalAccessService.logPortalAccess(portalId);
    } catch (error) {
      console.error('Failed to log portal access:', error);
    }
  };

  const handlePhotoPress = (photo: any) => {
    Alert.alert('Photo', photo.caption || 'Construction progress photo');
  };

  const handleReportDownload = (report: any) => {
    Alert.alert('Download', `Downloading ${report.title}...`);
  };

  const handleContactContractor = (message: string) => {
    console.log('Message sent to contractor:', message);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading portal...</Text>
      </View>
    );
  }

  if (!siteData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load site data</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Site Header */}
      <View style={styles.siteHeader}>
        <Text style={styles.siteName}>{siteData.site.name}</Text>
        <Text style={styles.siteLocation}>{siteData.site.location}</Text>
        <Text style={styles.contractorName}>
          Contractor: {siteData.site.contractor_name}
        </Text>
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>
            Started: {new Date(siteData.site.start_date).toLocaleDateString()}
          </Text>
          <Text style={styles.dateText}>
            Est. Completion: {new Date(siteData.site.estimated_completion).toLocaleDateString()}
          </Text>
        </View>
      </View>

      {/* Project Progress */}
      <View style={styles.progressSection}>
        <Text style={styles.sectionTitle}>Project Progress</Text>
        {siteData.concepts.map((concept) => (
          <View key={concept.id} style={styles.conceptItem}>
            <View style={styles.conceptHeader}>
              <Text style={styles.conceptName}>{concept.name}</Text>
              <Text style={styles.conceptStatus}>{concept.status}</Text>
            </View>
            <AnimatedProgressBar 
              progress={concept.progress_percent} 
              color={concept.progress_percent === 100 ? '#4caf50' : '#2196f3'}
            />
            <Text style={styles.progressText}>
              {concept.progress_percent}% Complete
            </Text>
          </View>
        ))}
      </View>

      {/* Photo Gallery */}
      <PhotoGallery 
        photos={siteData.photos} 
        onPhotoPress={handlePhotoPress}
      />

      {/* Reports */}
      <ReportDownloadsPanel 
        reports={siteData.reports}
        onDownload={handleReportDownload}
      />

      {/* Cost Breakdown */}
      <CostBreakdownPanel costs={siteData.costs} />

      {/* Contact Contractor */}
      <ContactContractorButton 
        contractorName={siteData.site.contractor_name}
        onSendMessage={handleContactContractor}
      />

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          This is a read-only portal. For questions or concerns, use the contact button above.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#f44336',
  },
  siteHeader: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  siteName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  siteLocation: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  contractorName: {
    fontSize: 14,
    color: '#2196f3',
    fontWeight: '600',
    marginBottom: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateText: {
    fontSize: 12,
    color: '#666',
  },
  progressSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  conceptItem: {
    marginBottom: 16,
  },
  conceptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  conceptName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  conceptStatus: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'right',
  },
  footer: {
    padding: 20,
    marginTop: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});