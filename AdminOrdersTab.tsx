import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { AdminOrder } from '../types';
import { AdminService } from '../services/AdminService';

interface AdminOrdersTabProps {
  onOrderSelect: (order: AdminOrder) => void;
}

export const AdminOrdersTab: React.FC<AdminOrdersTabProps> = ({ onOrderSelect }) => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<AdminOrder[]>([]);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, typeFilter, statusFilter]);

  const loadOrders = async () => {
    try {
      const data = await AdminService.getAllOrders();
      setOrders(data);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    if (typeFilter !== 'all') {
      filtered = filtered.filter(order => order.type === typeFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FFA500';
      case 'confirmed': return '#007AFF';
      case 'completed': return '#28A745';
      case 'cancelled': return '#DC3545';
      default: return '#666';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'labor': return '#FF6B6B';
      case 'machinery': return '#4ECDC4';
      case 'material': return '#45B7D1';
      default: return '#666';
    }
  };

  const renderOrder = ({ item }: { item: AdminOrder }) => (
    <TouchableOpacity style={styles.orderCard} onPress={() => onOrderSelect(item)}>
      <View style={styles.orderHeader}>
        <View style={[styles.typeBadge, { backgroundColor: getTypeColor(item.type) }]}>
          <Text style={styles.typeBadgeText}>{item.type}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusBadgeText}>{item.status}</Text>
        </View>
      </View>
      
      <Text style={styles.orderAmount}>${item.amount.toFixed(2)}</Text>
      
      <View style={styles.orderDetails}>
        <Text style={styles.orderParty}>Contractor: {item.contractor_name}</Text>
        <Text style={styles.orderParty}>Provider: {item.provider_name}</Text>
        <Text style={styles.orderDate}>
          Created: {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.filters}>
        <Text style={styles.filterLabel}>Type:</Text>
        <View style={styles.filterRow}>
          {['all', 'labor', 'machinery', 'material'].map(type => (
            <TouchableOpacity
              key={type}
              style={[styles.filterButton, typeFilter === type && styles.activeFilter]}
              onPress={() => setTypeFilter(type)}
            >
              <Text style={[styles.filterText, typeFilter === type && styles.activeFilterText]}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <Text style={styles.filterLabel}>Status:</Text>
        <View style={styles.filterRow}>
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(status => (
            <TouchableOpacity
              key={status}
              style={[styles.filterButton, statusFilter === status && styles.activeFilter]}
              onPress={() => setStatusFilter(status)}
            >
              <Text style={[styles.filterText, statusFilter === status && styles.activeFilterText]}>
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <FlatList
        data={filteredOrders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id}
        style={styles.orderList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  filters: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 8,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  activeFilter: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  activeFilterText: {
    color: 'white',
  },
  orderList: {
    flex: 1,
  },
  orderCard: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  orderAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#28A745',
    marginBottom: 8,
  },
  orderDetails: {
    gap: 4,
  },
  orderParty: {
    fontSize: 14,
    color: '#333',
  },
  orderDate: {
    fontSize: 12,
    color: '#666',
  },
});