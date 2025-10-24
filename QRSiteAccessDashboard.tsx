import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { QRScannerModal } from './QRScannerModal';
import { PPEComplianceScanner } from './PPEComplianceScanner';
import { SiteAccessTab } from './SiteAccessTab';
import { PPEViolation } from '../types';

export const QRSiteAccessDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'scanner' | 'ppe' | 'logs'>('scanner');
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [currentSiteId] = useState('site_001');
  const [currentUserId] = useState('user_001');

  const handleViolationDetected = (violation: PPEViolation) => {
    console.log('PPE Violation detected:', violation);
    // Could trigger additional actions like alerts
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'scanner':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.tabTitle}>🔍 QR Code Scanner</Text>
            <Text style={styles.tabDescription}>
              Scan QR codes for site entry verification
            </Text>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowQRScanner(true)}
            >
              <Text style={styles.actionButtonText}>📱 Open QR Scanner</Text>
            </TouchableOpacity>
            
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>How it works:</Text>
              <Text style={styles.infoText}>• Point camera at worker's QR code</Text>
              <Text style={styles.infoText}>• System validates user permissions</Text>
              <Text style={styles.infoText}>• Entry is logged automatically</Text>
              <Text style={styles.infoText}>• Notifications sent to supervisors</Text>
            </View>
          </View>
        );
        
      case 'ppe':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.tabTitle}>🦺 PPE Compliance</Text>
            <Text style={styles.tabDescription}>
              AI-powered PPE detection and compliance monitoring
            </Text>
            
            <PPEComplianceScanner
              userId={currentUserId}
              onViolationDetected={handleViolationDetected}
            />
          </View>
        );
        
      case 'logs':
        return (
          <View style={styles.tabContent}>
            <SiteAccessTab siteId={currentSiteId} />
          </View>
        );
        
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>QR Site Access System</Text>
      
      {/* Tab Navigation */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'scanner' && styles.activeTab]}
          onPress={() => setActiveTab('scanner')}
        >
          <Text style={[styles.tabText, activeTab === 'scanner' && styles.activeTabText]}>
            Scanner
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'ppe' && styles.activeTab]}
          onPress={() => setActiveTab('ppe')}
        >
          <Text style={[styles.tabText, activeTab === 'ppe' && styles.activeTabText]}>
            PPE Check
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'logs' && styles.activeTab]}
          onPress={() => setActiveTab('logs')}
        >
          <Text style={[styles.tabText, activeTab === 'logs' && styles.activeTabText]}>
            Access Logs
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <ScrollView style={styles.content}>
        {renderTabContent()}
      </ScrollView>

      {/* QR Scanner Modal */}
      <QRScannerModal
        visible={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        siteId={currentSiteId}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    color: '#6c757d',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 20,
  },
  tabTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  tabDescription: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoBox: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 5,
  },
});