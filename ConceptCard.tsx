import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface Concept {
  id: string;
  title?: string;
  description: string;
  unit: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  group: string;
  status: string;
  progress: number;
}

interface ConceptCardProps {
  concept: Concept;
  onPress?: () => void;
}

export const ConceptCard: React.FC<ConceptCardProps> = ({ concept, onPress }) => {
  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return '#10B981';
    if (progress >= 50) return '#3B82F6';
    if (progress >= 20) return '#F59E0B';
    return '#EF4444';
  };

  const getGroupIcon = (group: string) => {
    switch (group.toLowerCase()) {
      case 'electrical': return '⚡';
      case 'plumbing': return '🔧';
      case 'hvac': return '🌡️';
      case 'concrete': return '🏗️';
      case 'roofing': return '🏠';
      case 'framing': return '🔨';
      default: return '🔧';
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.groupInfo}>
            <Text style={styles.groupIcon}>{getGroupIcon(concept.group)}</Text>
            <View style={styles.textInfo}>
              <Text style={styles.groupName}>{concept.group}</Text>
              {concept.title && (
                <Text style={styles.conceptTitle}>{concept.title}</Text>
              )}
            </View>
          </View>
          <Text style={styles.totalCost}>{formatCurrency(concept.total_price)}</Text>
        </View>
        
        <Text style={styles.description} numberOfLines={2}>
          {concept.description}
        </Text>
        
        <View style={styles.unitInfo}>
          <Text style={styles.unitText}>
            {concept.quantity} {concept.unit} × {formatCurrency(concept.unit_price)}
          </Text>
        </View>
        
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progress</Text>
            <Text style={styles.progressPercent}>{concept.progress}%</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBar, 
                { 
                  width: `${concept.progress}%`,
                  backgroundColor: getProgressColor(concept.progress)
                }
              ]} 
            />
          </View>
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Upload Progress</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Book Labor</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Order Materials</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  groupInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  groupIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  textInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    textTransform: 'capitalize',
  },
  conceptTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  totalCost: {
    fontSize: 18,
    fontWeight: '700',
    color: '#059669',
  },
  description: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 8,
  },
  unitInfo: {
    marginBottom: 12,
  },
  unitText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  progressPercent: {
    fontSize: 12,
    color: '#111827',
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 11,
    color: '#374151',
    fontWeight: '500',
  },
});