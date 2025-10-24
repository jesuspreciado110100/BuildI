import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { MaterialQuoteRequest, MaterialItem, MaterialOrder, MaterialScanLog } from '../types';
import { MaterialScannerModal } from './MaterialScannerModal';
import { ReviewModal } from './ReviewModal';
import { PaymentModal } from './PaymentModal';
import { escrowService } from '../services/EscrowService';
import { QRGeneratorService } from '../services/QRGeneratorService';

interface MaterialOrdersTabProps {
  contractorId: string;
}

function OrderCard({ quote, material, onScanDelivery, onPrintQR, showScanButton, scanProgress }: any) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#ffc107';
      case 'accepted': return '#28a745';
      case 'declined': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const finalPrice = quote.counter_offer_price || material.unit_price;
  const totalAmount = quote.quantity * finalPrice;

  return (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.materialName}>{material.name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(quote.status) }]}>
          <Text style={styles.statusText}>{quote.status.toUpperCase()}</Text>
        </View>
      </View>
      
      <Text style={styles.orderDetail}>Quantity: {quote.quantity} {material.unit_type}</Text>
      <Text style={styles.totalAmount}>Total: ${totalAmount.toFixed(2)}</Text>
      
      {scanProgress && (
        <View style={styles.scanProgress}>
          <Text style={styles.scanProgressText}>
            📦 Scanned: {scanProgress.scanned}/{scanProgress.expected} items
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[styles.progressFill, { width: `${(scanProgress.scanned / scanProgress.expected) * 100}%` }]}
            />
          </View>
        </View>
      )}
      
      <View style={styles.buttonContainer}>
        {showScanButton && (
          <TouchableOpacity style={styles.scanButton} onPress={onScanDelivery}>
            <Text style={styles.scanButtonText}>📱 Scan Delivery</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity style={styles.qrButton} onPress={onPrintQR}>
          <Text style={styles.qrButtonText}>🏷️ Print QR</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function MaterialOrdersTab({ contractorId }: MaterialOrdersTabProps) {
  const [orders, setOrders] = useState<MaterialQuoteRequest[]>([]);
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [scannerModalVisible, setScannerModalVisible] = useState(false);
  const [selectedOrderForScan, setSelectedOrderForScan] = useState<MaterialOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [contractorId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const ordersData = escrowService.getOrdersByContractor(contractorId);
      const ordersWithQR = ordersData.map(order => ({
        ...order,
        qr_code: order.qr_code || QRGeneratorService.generateMaterialOrderQR(order.id),
        expected_count: order.quantity,
        scanned_count: 0
      }));
      setOrders(ordersWithQR);
      setMaterials([
        { id: 'material1', name: 'Concrete Mix', unit_price: 50, unit_type: 'cubic yard' } as MaterialItem,
        { id: 'material2', name: 'Steel Rebar', unit_price: 25, unit_type: 'ton' } as MaterialItem,
      ]);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMaterialById = (materialId: string) => {
    return materials.find(m => m.id === materialId);
  };

  const handleScanDelivery = (order: MaterialQuoteRequest) => {
    const materialOrder: MaterialOrder = {
      id: order.id,
      site_id: 'site1',
      concept_id: order.concept_id,
      contractor_id: contractorId,
      supplier_id: order.supplier_id,
      items: [{
        id: 'item1',
        material_id: order.material_id,
        quantity: order.quantity,
        unit_price: order.counter_offer_price || 0,
        total_price: order.quantity * (order.counter_offer_price || 0)
      }],
      status: 'confirmed',
      total_cost: order.quantity * (order.counter_offer_price || 0),
      delivery_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
      qr_code: order.qr_code,
      expected_count: order.quantity,
      scanned_count: order.scanned_count || 0
    };
    setSelectedOrderForScan(materialOrder);
    setScannerModalVisible(true);
  };

  const handleScanComplete = (scanLog: MaterialScanLog) => {
    if (!selectedOrderForScan) return;
    
    setOrders(prev => prev.map(order => {
      if (order.id === selectedOrderForScan.id) {
        const newScannedCount = (order.scanned_count || 0) + scanLog.quantity_scanned;
        return {
          ...order,
          scanned_count: newScannedCount,
          delivery_status: newScannedCount >= order.quantity ? 'delivered' : 'partial'
        };
      }
      return order;
    }));
    
    Alert.alert('Scan Complete', `Scanned ${scanLog.quantity_scanned} items`);
  };

  const handlePrintQR = (order: MaterialQuoteRequest) => {
    const material = getMaterialById(order.material_id);
    if (!material) return;
    
    const printableQR = QRGeneratorService.generatePrintableQR(
      'material', 
      order.id, 
      `${material.name} - Order #${order.id.slice(-6)}`
    );
    
    Alert.alert(
      'QR Code Generated',
      `QR Code: ${printableQR.qr_code}\n\nIn a real app, this would open a print dialog.`,
      [{ text: 'OK' }]
    );
  };

  const canScanDelivery = (order: MaterialQuoteRequest) => {
    return order.status === 'accepted' && order.is_paid && order.delivery_status !== 'delivered';
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading orders...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.sectionTitle}>Material Orders</Text>
        {orders.length === 0 ? (
          <Text style={styles.emptyText}>No orders found</Text>
        ) : (
          orders.map((quote) => {
            const material = getMaterialById(quote.material_id);
            if (!material) return null;
            
            return (
              <OrderCard
                key={quote.id}
                quote={quote}
                material={material}
                onScanDelivery={() => handleScanDelivery(quote)}
                onPrintQR={() => handlePrintQR(quote)}
                showScanButton={canScanDelivery(quote)}
                scanProgress={{
                  scanned: quote.scanned_count || 0,
                  expected: quote.expected_count || quote.quantity
                }}
              />
            );
          })
        )}
      </ScrollView>
      
      {selectedOrderForScan && (
        <MaterialScannerModal
          visible={scannerModalVisible}
          onClose={() => {
            setScannerModalVisible(false);
            setSelectedOrderForScan(null);
          }}
          order={selectedOrderForScan}
          onScanComplete={handleScanComplete}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  scrollView: { flex: 1, padding: 16 },
  loadingText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#666' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#495057' },
  emptyText: { fontSize: 16, color: '#6c757d', textAlign: 'center', paddingVertical: 20, fontStyle: 'italic' },
  orderCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  materialName: { fontSize: 18, fontWeight: 'bold', flex: 1, marginRight: 12 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  statusText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  orderDetail: { fontSize: 14, color: '#666', marginBottom: 4 },
  totalAmount: { fontSize: 18, fontWeight: 'bold', color: '#007bff', marginTop: 8, marginBottom: 8 },
  scanProgress: { backgroundColor: '#f8f9fa', padding: 10, borderRadius: 8, marginBottom: 12 },
  scanProgressText: { fontSize: 14, color: '#495057', marginBottom: 8 },
  progressBar: { height: 8, backgroundColor: '#e9ecef', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#28a745' },
  buttonContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  scanButton: { backgroundColor: '#17a2b8', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  scanButtonText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  qrButton: { backgroundColor: '#6f42c1', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  qrButtonText: { color: '#fff', fontSize: 14, fontWeight: 'bold' }
});