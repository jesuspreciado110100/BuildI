import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

interface Report {
  id: string;
  title: string;
  type: 'pdf' | 'excel';
  url: string;
  generated_at: string;
}

interface ReportDownloadsPanelProps {
  reports: Report[];
  onDownload?: (report: Report) => void;
}

export const ReportDownloadsPanel: React.FC<ReportDownloadsPanelProps> = ({ 
  reports, 
  onDownload 
}) => {
  const getFileIcon = (type: 'pdf' | 'excel') => {
    return type === 'pdf' ? '📄' : '📊';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (reports.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Reports & Downloads</Text>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No reports available</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reports & Downloads</Text>
      <ScrollView style={styles.scrollView}>
        {reports.map((report) => (
          <TouchableOpacity
            key={report.id}
            style={styles.reportItem}
            onPress={() => onDownload?.(report)}
          >
            <View style={styles.reportHeader}>
              <Text style={styles.fileIcon}>{getFileIcon(report.type)}</Text>
              <View style={styles.reportInfo}>
                <Text style={styles.reportTitle} numberOfLines={2}>
                  {report.title}
                </Text>
                <Text style={styles.reportDate}>
                  Generated: {formatDate(report.generated_at)}
                </Text>
              </View>
              <View style={styles.typebadge}>
                <Text style={styles.typeBadgeText}>
                  {report.type.toUpperCase()}
                </Text>
              </View>
            </View>
            <View style={styles.downloadButton}>
              <Text style={styles.downloadButtonText}>Download</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  scrollView: {
    maxHeight: 300,
  },
  reportItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  fileIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  reportInfo: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  reportDate: {
    fontSize: 12,
    color: '#666',
  },
  typeBadge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  downloadButton: {
    backgroundColor: '#2196f3',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});