import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DeliveryVehicle, MaterialQuoteRequest } from '../types';

interface DeliveryVehicleCardProps {
  vehicle: DeliveryVehicle;
  assignedOrder?: MaterialQuoteRequest;
  onAssignVehicle: (vehicleId: string) => void;
}

export const DeliveryVehicleCard: React.FC<DeliveryVehicleCardProps> = ({
  vehicle,
  assignedOrder,
  onAssignVehicle,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return '#4CAF50';
      case 'delivering': return '#FF9800';
      case 'maintenance': return '#F44336';
      default: return '#757575';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Available';
      case 'delivering': return 'Delivering';
      case 'maintenance': return 'Maintenance';
      default: return 'Unknown';
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.driverName}>{vehicle.driver_name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(vehicle.status) }]}>
          <Text style={styles.statusText}>{getStatusText(vehicle.status)}</Text>
        </View>
      </View>
      
      <Text style={styles.location}>📍 {vehicle.current_location}</Text>
      
      {assignedOrder && (
        <View style={styles.orderInfo}>
          <Text style={styles.orderLabel}>Assigned Order:</Text>
          <Text style={styles.orderText}>{assignedOrder.material_name}</Text>
          <Text style={styles.orderQuantity}>Qty: {assignedOrder.quantity}</Text>
        </View>
      )}
      
      {vehicle.status === 'available' && (
        <TouchableOpacity 
          style={styles.assignButton}
          onPress={() => onAssignVehicle(vehicle.id)}
        >
          <Text style={styles.assignButtonText}>Assign Vehicle</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  driverName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  orderInfo: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
  },
  orderLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  orderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  orderQuantity: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  assignButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  assignButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});