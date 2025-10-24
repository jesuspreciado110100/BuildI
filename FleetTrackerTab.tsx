import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { DeliveryVehicle, MaterialQuoteRequest } from '../types';
import { DeliveryVehicleCard } from './DeliveryVehicleCard';
import { AssignVehicleModal } from './AssignVehicleModal';
import { DeliveryService } from '../services/DeliveryService';

interface FleetTrackerTabProps {
  supplierId: string;
}

export const FleetTrackerTab: React.FC<FleetTrackerTabProps> = ({ supplierId }) => {
  const [vehicles, setVehicles] = useState<DeliveryVehicle[]>([]);
  const [acceptedOrders, setAcceptedOrders] = useState<MaterialQuoteRequest[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<DeliveryVehicle | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<MaterialQuoteRequest | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [supplierId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [vehiclesData, ordersData] = await Promise.all([
        DeliveryService.getVehiclesBySupplier(supplierId),
        DeliveryService.getAcceptedOrdersForDelivery(supplierId)
      ]);
      setVehicles(vehiclesData);
      setAcceptedOrders(ordersData);
    } catch (error) {
      console.error('Error loading fleet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignVehicle = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return;

    // Find unassigned orders for assignment
    const unassignedOrders = acceptedOrders.filter(order => !order.vehicle_id);
    
    if (unassignedOrders.length === 0) {
      alert('No unassigned orders available');
      return;
    }

    // For simplicity, assign to first unassigned order
    // In a real app, you'd show a selection modal
    setSelectedVehicle(vehicle);
    setSelectedOrder(unassignedOrders[0]);
    setShowAssignModal(true);
  };

  const handleAssignConfirm = async (vehicleId: string, eta: string, notes: string) => {
    if (!selectedOrder) return;

    try {
      await DeliveryService.assignVehicleToOrder(selectedOrder.id, vehicleId, eta, notes);
      await loadData(); // Refresh data
    } catch (error) {
      console.error('Error assigning vehicle:', error);
      alert('Failed to assign vehicle');
    }
  };

  const getAssignedOrder = (vehicleId: string) => {
    return acceptedOrders.find(order => order.vehicle_id === vehicleId);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading fleet data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Fleet Tracker</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={loadData}>
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {vehicles.length === 0 ? (
          <Text style={styles.emptyText}>No vehicles registered</Text>
        ) : (
          vehicles.map(vehicle => (
            <DeliveryVehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              assignedOrder={getAssignedOrder(vehicle.id)}
              onAssignVehicle={handleAssignVehicle}
            />
          ))
        )}
      </ScrollView>

      <AssignVehicleModal
        visible={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        vehicle={selectedVehicle}
        order={selectedOrder}
        onAssign={handleAssignConfirm}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  refreshButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#2196F3',
    borderRadius: 6,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
});