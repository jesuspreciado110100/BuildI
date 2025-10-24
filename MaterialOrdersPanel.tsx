import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { MaterialQuoteRequestForm } from './MaterialQuoteRequestForm';
import { MaterialComparisonPanel } from './MaterialComparisonPanel';

interface MaterialOrder {
  id: string;
  materialName: string;
  category: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalPrice: number;
  supplierName: string;
  status: 'quote_pending' | 'quote_accepted' | 'in_transit' | 'delivered' | 'cancelled';
  deliveryDate?: string;
  trackingNumber?: string;
}

interface MaterialOrdersPanelProps {
  conceptId: string;
  siteId: string;
  materialOrders: MaterialOrder[];
  onRefresh?: () => void;
}

export const MaterialOrdersPanel: React.FC<MaterialOrdersPanelProps> = ({
  conceptId,
  siteId,
  materialOrders,
  onRefresh
}) => {
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialOrder | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return '#4CAF50';
      case 'in_transit': return '#FF9800';
      case 'quote_accepted': return '#2196F3';
      case 'quote_pending': return '#FFC107';
      case 'cancelled': return '#F44336';
      default: return '#666';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return '✅';
      case 'in_transit': return '🚚';
      case 'quote_accepted': return '📋';
      case 'quote_pending': return '⏳';
      case 'cancelled': return '❌';
      default: return '❓';
    }
  };

  const handleCompareQuotes = () => {
    setShowComparison(true);
  };

  const renderMaterialItem = ({ item }: { item: MaterialOrder }) => (
    <View style={styles.materialItem}>
      <View style={styles.materialHeader}>
        <View style={styles.materialInfo}>
          <View style={styles.titleRow}>
            <Text style={styles.statusIcon}>{getStatusIcon(item.status)}</Text>
            <Text style={styles.materialName}>{item.materialName}</Text>
          </View>
          <Text style={styles.category}>{item.category}</Text>
          <Text style={styles.supplier}>Supplier: {item.supplierName}</Text>
          <Text style={styles.quantity}>
            {item.quantity} {item.unit} × ${item.pricePerUnit.toFixed(2)}
          </Text>
          <Text style={styles.totalPrice}>
            Total: ${item.totalPrice.toLocaleString()}
          </Text>
          {item.deliveryDate && (
            <Text style={styles.deliveryDate}>
              Delivery: {item.deliveryDate}
            </Text>
          )}
          {item.trackingNumber && (
            <Text style={styles.tracking}>
              Tracking: {item.trackingNumber}
            </Text>
          )}
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status.replace('_', ' ')}</Text>
        </View>
      </View>
      
      {item.status === 'in_transit' && (
        <View style={styles.progressIndicator}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '60%' }]} />
          </View>
          <Text style={styles.progressText}>In Transit</Text>
        </View>
      )}
    </View>
  );

  const pendingQuotes = materialOrders.filter(order => order.status === 'quote_pending');
  const acceptedOrders = materialOrders.filter(order => order.status !== 'quote_pending');
  const inTransitOrders = materialOrders.filter(order => order.status === 'in_transit');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Material Orders</Text>
        <Text style={styles.count}>{materialOrders.length} orders</Text>
      </View>
      
      {pendingQuotes.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pending Quotes ({pendingQuotes.length})</Text>
          <FlatList
            data={pendingQuotes}
            renderItem={renderMaterialItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}
      
      {acceptedOrders.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Accepted Orders ({acceptedOrders.length})</Text>
          <FlatList
            data={acceptedOrders}
            renderItem={renderMaterialItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}
      
      {inTransitOrders.length > 0 && (
        <View style={styles.deliverySection}>
          <Text style={styles.sectionTitle}>🚚 Deliveries in Progress ({inTransitOrders.length})</Text>
        </View>
      )}
      
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => setShowQuoteForm(true)}
        >
          <Text style={styles.actionButtonText}>Order Materials</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={handleCompareQuotes}
        >
          <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>Compare Quotes</Text>
        </TouchableOpacity>
      </View>
      
      {materialOrders.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No material orders yet</Text>
        </View>
      )}
      
      <MaterialQuoteRequestForm
        visible={showQuoteForm}
        onClose={() => setShowQuoteForm(false)}
        conceptId={conceptId}
        siteId={siteId}
        onSuccess={onRefresh}
      />
      
      <MaterialComparisonPanel
        visible={showComparison}
        onClose={() => setShowComparison(false)}
        conceptId={conceptId}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333'
  },
  count: {
    fontSize: 14,
    color: '#666'
  },
  section: {
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8
  },
  deliverySection: {
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16
  },
  materialItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingVertical: 12
  },
  materialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  materialInfo: {
    flex: 1
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  statusIcon: {
    fontSize: 16,
    marginRight: 8
  },
  materialName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },
  category: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2
  },
  supplier: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2
  },
  quantity: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2
  },
  totalPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2
  },
  deliveryDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2
  },
  tracking: {
    fontSize: 12,
    color: '#007AFF'
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
    textTransform: 'uppercase'
  },
  progressIndicator: {
    marginTop: 8
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginBottom: 4
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF9800',
    borderRadius: 2
  },
  progressText: {
    fontSize: 12,
    color: '#666'
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 8
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF'
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600'
  },
  secondaryButtonText: {
    color: '#007AFF'
  },
  emptyState: {
    padding: 20,
    alignItems: 'center'
  },
  emptyText: {
    fontSize: 14,
    color: '#666'
  }
});