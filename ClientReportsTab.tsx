import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';

interface ClientReportsTabProps {
  userId: string;
}

export const ClientReportsTab: React.FC<ClientReportsTabProps> = ({ userId }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('month');

  const mockReports = [
    {
      id: '1',
      title: 'Monthly Progress Report',
      date: '2024-01-15',
      type: 'progress',
      status: 'ready',
      description: 'Comprehensive progress across all assigned sites'
    },
    {
      id: '2',
      title: 'Safety Compliance Report',
      date: '2024-01-10',
      type: 'safety',
      status: 'ready',
      description: 'Safety metrics and incident reports'
    },
    {
      id: '3',
      title: 'Cost Analysis Report',
      date: '2024-01-05',
      type: 'financial',
      status: 'generating',
      description: 'Budget vs actual spending analysis'
    }
  ];

  const getReportIcon = (type: string) => {
    switch (type) {
      case 'progress': return '📊';
      case 'safety': return '🛡️';
      case 'financial': return '💰';
      default: return '📄';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return '#4CAF50';
      case 'generating': return '#FF9800';
      case 'error': return '#F44336';
      default: return '#666';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Reports</Text>
      
      <View style={styles.periodSelector}>
        <Text style={styles.periodLabel}>Report Period:</Text>
        <View style={styles.periodButtons}>
          {(['week', 'month', 'quarter'] as const).map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.periodButtonActive
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text style={[
                styles.periodButtonText,
                selectedPeriod === period && styles.periodButtonTextActive
              ]}>
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.reportsContainer}>
        {mockReports.map((report) => (
          <View key={report.id} style={styles.reportCard}>
            <View style={styles.reportHeader}>
              <View style={styles.reportTitleContainer}>
                <Text style={styles.reportIcon}>{getReportIcon(report.type)}</Text>
                <View style={styles.reportInfo}>
                  <Text style={styles.reportTitle}>{report.title}</Text>
                  <Text style={styles.reportDescription}>{report.description}</Text>
                </View>
              </View>
              <View style={styles.reportStatus}>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(report.status) }
                ]}>
                  <Text style={styles.statusText}>
                    {report.status.toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.reportFooter}>
              <Text style={styles.reportDate}>
                Generated: {new Date(report.date).toLocaleDateString()}
              </Text>
              <TouchableOpacity 
                style={[
                  styles.downloadButton,
                  report.status !== 'ready' && styles.downloadButtonDisabled
                ]}
                disabled={report.status !== 'ready'}
              >
                <Text style={[
                  styles.downloadButtonText,
                  report.status !== 'ready' && styles.downloadButtonTextDisabled
                ]}>
                  {report.status === 'ready' ? 'Download' : 'Processing...'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.requestContainer}>
        <Text style={styles.requestTitle}>Need a Custom Report?</Text>
        <Text style={styles.requestDescription}>
          Contact your project manager to request specific reports or data exports.
        </Text>
        <TouchableOpacity style={styles.requestButton}>
          <Text style={styles.requestButtonText}>Request Custom Report</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  periodSelector: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  periodLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  periodButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#2196F3',
  },
  periodButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  periodButtonTextActive: {
    color: 'white',
  },
  reportsContainer: {
    marginBottom: 20,
  },
  reportCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reportTitleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  reportIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  reportInfo: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  reportDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  reportStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reportDate: {
    fontSize: 12,
    color: '#999',
  },
  downloadButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  downloadButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  downloadButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  downloadButtonTextDisabled: {
    color: '#999',
  },
  requestContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  requestTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  requestDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  requestButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  requestButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});