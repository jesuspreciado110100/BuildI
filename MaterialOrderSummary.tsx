import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialBooking } from '../types';

interface MaterialOrderSummaryProps {
  booking: MaterialBooking;
  onClose: () => void;
}

const MaterialOrderSummary: React.FC<MaterialOrderSummaryProps> = ({ booking, onClose }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return '#28a745';
      case 'pending': return '#ffc107';
      case 'declined': return '#dc3545';
      case 'delivered': return '#17a2b8';
      default: return '#6c757d';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'accepted': return 'Order Accepted';
      case 'pending': return 'Awaiting Response';
      case 'declined': return 'Order Declined';
      case 'delivered': return 'Delivered';
      default: return 'Unknown Status';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Order Summary</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeText}>×</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
          <Text style={styles.statusText}>{getStatusText(booking.status)}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Order ID:</Text>
          <Text style={styles.value}>{booking.id}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Quantity:</Text>
          <Text style={styles.value}>{booking.quantity} units</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Delivery Location:</Text>
          <Text style={styles.value}>{booking.siteLocation}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Total Price:</Text>
          <Text style={[styles.value, styles.price]}>${booking.totalPrice}</Text>
        </View>

        {booking.customBidPrice && (
          <View style={styles.detailRow}>
            <Text style={styles.label}>Custom Bid:</Text>
            <Text style={[styles.value, styles.customBid]}>${booking.customBidPrice}</Text>
          </View>
        )}

        {booking.deliveryETA && (
          <View style={styles.detailRow}>
            <Text style={styles.label}>Delivery ETA:</Text>
            <Text style={[styles.value, styles.eta]}>{booking.deliveryETA}</Text>
          </View>
        )}

        <View style={styles.detailRow}>
          <Text style={styles.label}>Order Date:</Text>
          <Text style={styles.value}>{new Date(booking.createdAt).toLocaleDateString()}</Text>
        </View>
      </View>

      {booking.status === 'accepted' && (
        <View style={styles.successMessage}>
          <Text style={styles.successText}>✓ Your order has been confirmed!</Text>
          <Text style={styles.successSubtext}>The supplier will contact you soon with delivery details.</Text>
        </View>
      )}

      {booking.status === 'delivered' && (
        <View style={styles.deliveredMessage}>
          <Text style={styles.deliveredText}>📦 Order Delivered Successfully!</Text>
          <Text style={styles.deliveredSubtext}>Thank you for your business.</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333'
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center'
  },
  closeText: {
    fontSize: 20,
    color: '#666'
  },
  content: {
    marginBottom: 20
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 16
  },
  statusText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  label: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500'
  },
  value: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600'
  },
  price: {
    color: '#28a745',
    fontSize: 18
  },
  customBid: {
    color: '#ffc107'
  },
  eta: {
    color: '#17a2b8'
  },
  successMessage: {
    backgroundColor: '#d4edda',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#28a745'
  },
  successText: {
    color: '#155724',
    fontWeight: 'bold',
    fontSize: 16
  },
  successSubtext: {
    color: '#155724',
    fontSize: 14,
    marginTop: 4
  },
  deliveredMessage: {
    backgroundColor: '#d1ecf1',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#17a2b8'
  },
  deliveredText: {
    color: '#0c5460',
    fontWeight: 'bold',
    fontSize: 16
  },
  deliveredSubtext: {
    color: '#0c5460',
    fontSize: 14,
    marginTop: 4
  }
});

export default MaterialOrderSummary;