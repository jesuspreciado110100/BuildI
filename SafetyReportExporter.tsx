import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafetyAnalyticsService } from '../services/SafetyAnalyticsService';

interface SafetyReportExporterProps {
  siteId: string;
  siteName: string;
  onExportComplete?: (success: boolean) => void;
}

export const SafetyReportExporter: React.FC<SafetyReportExporterProps> = ({
  siteId,
  siteName,
  onExportComplete
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const safetyService = SafetyAnalyticsService.getInstance();

  const handleExportReport = async () => {
    try {
      setIsExporting(true);
      
      // Get safety data
      const safetyData = await safetyService.calculateSafetyScore(siteId);
      const incidents = await safetyService.getSiteIncidents(siteId);
      const ppeViolations = await safetyService.getPPEViolations(siteId);
      const entryLogs = await safetyService.getEntryLogs(siteId);
      
      // Simulate PDF generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock report data
      const reportData = {
        siteName,
        siteId,
        generatedAt: new Date().toISOString(),
        safetyScore: safetyData.score,
        colorLevel: safetyData.colorLevel,
        riskReason: safetyData.riskReason,
        totalIncidents: incidents.length,
        resolvedIncidents: incidents.filter(i => i.resolved).length,
        ppeCompliance: safetyData.ppeCompliance,
        entryViolations: safetyData.entryViolations,
        summary: {
          criticalIssues: incidents.filter(i => i.severity === 'critical' && !i.resolved).length,
          majorIssues: incidents.filter(i => i.severity === 'major' && !i.resolved).length,
          minorIssues: incidents.filter(i => i.severity === 'minor' && !i.resolved).length,
          ppeViolationsCount: ppeViolations.length,
          unauthorizedEntries: entryLogs.filter(log => !log.approved).length
        }
      };
      
      console.log('Safety Report Generated:', reportData);
      
      Alert.alert(
        'Report Generated',
        `Safety report for ${siteName} has been generated successfully. In a real app, this would be saved as a PDF file.`,
        [{ text: 'OK', onPress: () => onExportComplete?.(true) }]
      );
      
    } catch (error) {
      console.error('Error generating safety report:', error);
      Alert.alert(
        'Export Failed',
        'Failed to generate safety report. Please try again.',
        [{ text: 'OK', onPress: () => onExportComplete?.(false) }]
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.exportButton, isExporting && styles.exportButtonDisabled]}
      onPress={handleExportReport}
      disabled={isExporting}
    >
      <Text style={styles.exportButtonText}>
        {isExporting ? '📄 Generating...' : '📊 Generate Safety Report (PDF)'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  exportButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  exportButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  exportButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});