import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { ConstructionConcept } from '../types';
import { DelayTrackerService } from '../services/DelayTrackerService';

interface DelaysTabProps {
  concepts: ConstructionConcept[];
  onUpdateConcept?: (conceptId: string, updates: Partial<ConstructionConcept>) => void;
}

export const DelaysTab: React.FC<DelaysTabProps> = ({ concepts, onUpdateConcept }) => {
  const [delayedConcepts, setDelayedConcepts] = useState<ConstructionConcept[]>([]);
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'delay_days' | 'name' | 'trade'>('delay_days');

  useEffect(() => {
    const delayed = DelayTrackerService.getDelayedConcepts(concepts);
    setDelayedConcepts(delayed);
  }, [concepts]);

  const handleAddDelayReason = (conceptId: string) => {
    const reasons = DelayTrackerService.getDelayReasons();
    Alert.alert(
      'Select Delay Reason',
      'Choose the primary cause of delay:',
      reasons.map(reason => ({
        text: reason,
        onPress: () => updateDelayReason(conceptId, reason)
      })).concat([{ text: 'Cancel', style: 'cancel' }])
    );
  };

  const updateDelayReason = async (conceptId: string, reason: string) => {
    const concept = delayedConcepts.find(c => c.id === conceptId);
    if (concept && onUpdateConcept) {
      const currentReasons = concept.delay_info?.delay_reason || [];
      const updatedReasons = currentReasons.includes(reason) ? 
        currentReasons : [...currentReasons, reason];
      
      const updatedDelayInfo = {
        ...concept.delay_info,
        delay_reason: updatedReasons
      };
      
      onUpdateConcept(conceptId, { delay_info: updatedDelayInfo });
      await DelayTrackerService.updateDelayReason(conceptId, updatedReasons);
    }
  };

  const getSeverityColor = (delayDays: number): string => {
    if (delayDays >= 14) return '#d32f2f'; // Critical
    if (delayDays >= 7) return '#f57c00'; // High
    if (delayDays >= 3) return '#fbc02d'; // Medium
    return '#689f38'; // Low
  };

  const getSeverityLabel = (delayDays: number): string => {
    if (delayDays >= 14) return 'Critical';
    if (delayDays >= 7) return 'High';
    if (delayDays >= 3) return 'Medium';
    return 'Low';
  };

  const renderConceptCard = (concept: ConstructionConcept) => {
    const delayInfo = concept.delay_info || DelayTrackerService.calculateDelayStatus(concept);
    const delayDays = delayInfo.delay_days || 0;
    const isExpanded = selectedConcept === concept.id;

    return (
      <View key={concept.id} style={styles.conceptCard}>
        <TouchableOpacity
          onPress={() => setSelectedConcept(isExpanded ? null : concept.id)}
          style={styles.conceptHeader}
        >
          <View style={styles.conceptInfo}>
            <Text style={styles.conceptName}>{concept.name}</Text>
            <Text style={styles.conceptTrade}>{concept.trade}</Text>
          </View>
          <View style={styles.severityContainer}>
            <View style={[
              styles.severityBadge,
              { backgroundColor: getSeverityColor(delayDays) }
            ]}>
              <Text style={styles.severityText}>{getSeverityLabel(delayDays)}</Text>
            </View>
            <Text style={styles.delayDays}>+{delayDays}d</Text>
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.expandedContent}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Planned Duration:</Text>
              <Text style={styles.detailValue}>{delayInfo.planned_duration_days} days</Text>
            </View>
            
            {delayInfo.actual_duration_days && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Actual Duration:</Text>
                <Text style={styles.detailValue}>{delayInfo.actual_duration_days} days</Text>
              </View>
            )}
            
            {delayInfo.forecasted_completion && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Forecasted Completion:</Text>
                <Text style={styles.detailValue}>{delayInfo.forecasted_completion}</Text>
              </View>
            )}

            <View style={styles.reasonsSection}>
              <Text style={styles.sectionTitle}>Delay Reasons:</Text>
              {delayInfo.delay_reason.length > 0 ? (
                delayInfo.delay_reason.map((reason, index) => (
                  <View key={index} style={styles.reasonChip}>
                    <Text style={styles.reasonText}>{reason}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.noReasons}>No reasons specified</Text>
              )}
              <TouchableOpacity
                style={styles.addReasonButton}
                onPress={() => handleAddDelayReason(concept.id)}
              >
                <Text style={styles.addReasonText}>+ Add Reason</Text>
              </TouchableOpacity>
            </View>

            {delayInfo.recovery_actions && delayInfo.recovery_actions.length > 0 && (
              <View style={styles.actionsSection}>
                <Text style={styles.sectionTitle}>Suggested Actions:</Text>
                {delayInfo.recovery_actions.map((action, index) => (
                  <View key={index} style={styles.actionItem}>
                    <Text style={styles.actionText}>• {action}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  const sortedConcepts = [...delayedConcepts].sort((a, b) => {
    switch (sortBy) {
      case 'delay_days':
        return (b.delay_info?.delay_days || 0) - (a.delay_info?.delay_days || 0);
      case 'name':
        return a.name.localeCompare(b.name);
      case 'trade':
        return a.trade.localeCompare(b.trade);
      default:
        return 0;
    }
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Delayed Concepts ({delayedConcepts.length})</Text>
        <View style={styles.sortContainer}>
          <Text style={styles.sortLabel}>Sort by:</Text>
          <TouchableOpacity
            style={[styles.sortButton, sortBy === 'delay_days' && styles.sortButtonActive]}
            onPress={() => setSortBy('delay_days')}
          >
            <Text style={[styles.sortButtonText, sortBy === 'delay_days' && styles.sortButtonTextActive]}>
              Severity
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortButton, sortBy === 'name' && styles.sortButtonActive]}
            onPress={() => setSortBy('name')}
          >
            <Text style={[styles.sortButtonText, sortBy === 'name' && styles.sortButtonTextActive]}>
              Name
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortButton, sortBy === 'trade' && styles.sortButtonActive]}
            onPress={() => setSortBy('trade')}
          >
            <Text style={[styles.sortButtonText, sortBy === 'trade' && styles.sortButtonTextActive]}>
              Trade
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.conceptsList}>
        {sortedConcepts.length > 0 ? (
          sortedConcepts.map(renderConceptCard)
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No delayed concepts found</Text>
            <Text style={styles.emptySubtext}>All concepts are on track! 🎉</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortLabel: {
    fontSize: 14,
    marginRight: 8,
    color: '#666',
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  sortButtonActive: {
    backgroundColor: '#2196F3',
  },
  sortButtonText: {
    fontSize: 12,
    color: '#666',
  },
  sortButtonTextActive: {
    color: 'white',
  },
  conceptsList: {
    flex: 1,
    padding: 16,
  },
  conceptCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  conceptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  conceptInfo: {
    flex: 1,
  },
  conceptName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  conceptTrade: {
    fontSize: 14,
    color: '#666',
  },
  severityContainer: {
    alignItems: 'center',
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  severityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  delayDays: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#d32f2f',
  },
  expandedContent: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  reasonsSection: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  reasonChip: {
    backgroundColor: '#ffebee',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  reasonText: {
    fontSize: 12,
    color: '#c62828',
  },
  noReasons: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  addReasonButton: {
    backgroundColor: '#e3f2fd',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  addReasonText: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: '600',
  },
  actionsSection: {
    marginTop: 16,
  },
  actionItem: {
    marginBottom: 4,
  },
  actionText: {
    fontSize: 14,
    color: '#333',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
});