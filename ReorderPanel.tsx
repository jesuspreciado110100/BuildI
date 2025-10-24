import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TextInput, Alert } from 'react-native';
import { MaterialItem } from '../types';
import { InventoryAnalysis } from '../services/InventoryAnalyticsService';

interface ReorderPanelProps {
  material: MaterialItem;
  analysis: InventoryAnalysis;
  onReorderCreated: () => void;
}

export const ReorderPanel: React.FC<ReorderPanelProps> = ({ material, analysis, onReorderCreated }) => {
  const [showModal, setShowModal] = useState(false);
  const [orderQuantity, setOrderQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const getSuggestedQuantity = () => {
    // Suggest enough to last 30 days plus buffer
    const dailyDemand = analysis.avg_weekly_demand / 7;
    const suggestedQty = Math.ceil(dailyDemand * 30 + material.reorder_threshold);
    return suggestedQty;
  };

  const getUrgencyMessage = () => {
    if (analysis.reorder_status === 'urgent') {
      return `🚨 URGENT: You'll run out in ${analysis.predicted_days_left} days!`;
    } else if (analysis.reorder_status === 'low') {
      return `⚠️ LOW STOCK: You'll run out in ${analysis.predicted_days_left} days`;
    }
    return `✅ Stock levels are safe for ${analysis.predicted_days_left} days`;
  };

  const getUrgencyColor = () => {
    switch (analysis.reorder_status) {
      case 'urgent': return '#F44336';
      case 'low': return '#FF9800';
      case 'safe': return '#4CAF50';
    }
  };

  const handleCreateOrder = async () => {
    if (!orderQuantity || parseInt(orderQuantity) <= 0) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }

    setLoading(true);
    try {
      // Mock order creation - in real app would call API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert(
        'Order Created',
        `Successfully created supplier order for ${orderQuantity} ${material.unit_type} of ${material.name}`,
        [{ text: 'OK', onPress: () => {
          setShowModal(false);
          onReorderCreated();
        }}]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.urgencyBanner, { backgroundColor: getUrgencyColor() }]}>
        <Text style={styles.urgencyText}>{getUrgencyMessage()}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Reorder Recommendation</Text>
        <Text style={styles.prediction}>{analysis.reorder_prediction}</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Current Stock</Text>
            <Text style={styles.statValue}>{analysis.current_stock} {material.unit_type}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Threshold</Text>
            <Text style={styles.statValue}>{material.reorder_threshold} {material.unit_type}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Weekly Demand</Text>
            <Text style={styles.statValue}>{analysis.avg_weekly_demand} {material.unit_type}</Text>
          </View>
        </View>

        <View style={styles.suggestionContainer}>
          <Text style={styles.suggestionTitle}>Suggested Order Quantity:</Text>
          <Text style={styles.suggestionValue}>{getSuggestedQuantity()} {material.unit_type}</Text>
          <Text style={styles.suggestionNote}>(30-day supply + safety buffer)</Text>
        </View>

        <TouchableOpacity
          style={[styles.reorderButton, { backgroundColor: getUrgencyColor() }]}
          onPress={() => setShowModal(true)}
        >
          <Text style={styles.reorderButtonText}>Create New Supplier Order</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Create Reorder</Text>
            <TouchableOpacity onPress={handleCreateOrder} disabled={loading}>
              <Text style={[styles.createButton, loading && styles.disabledButton]}>
                {loading ? 'Creating...' : 'Create'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <Text style={styles.materialName}>{material.name}</Text>
            <Text style={styles.materialDetails}>{material.category} • ${material.unit_price}/{material.unit_type}</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Order Quantity *</Text>
              <TextInput
                style={styles.input}
                value={orderQuantity}
                onChangeText={setOrderQuantity}
                placeholder={`Suggested: ${getSuggestedQuantity()}`}
                keyboardType="numeric"
              />
              <Text style={styles.unitLabel}>{material.unit_type}</Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Notes (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Add any special instructions..."
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.orderSummary}>
              <Text style={styles.summaryTitle}>Order Summary</Text>
              <View style={styles.summaryRow}>
                <Text>Quantity:</Text>
                <Text>{orderQuantity || '0'} {material.unit_type}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text>Unit Price:</Text>
                <Text>${material.unit_price}</Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Estimated Total:</Text>
                <Text style={styles.totalValue}>
                  ${((parseInt(orderQuantity) || 0) * material.unit_price).toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  urgencyBanner: {
    padding: 12,
    alignItems: 'center',
  },
  urgencyText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  prediction: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  suggestionContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
  },
  suggestionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  suggestionValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  suggestionNote: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  reorderButton: {
    padding: 14,
    borderRadius: 6,
    alignItems: 'center',
  },
  reorderButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  cancelButton: {
    color: '#666',
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  createButton: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    color: '#ccc',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  materialName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  materialDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  unitLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  orderSummary: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 6,
    marginTop: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontWeight: '600',
  },
  totalValue: {
    fontWeight: '600',
    fontSize: 16,
  },
});