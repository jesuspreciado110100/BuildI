import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { AdminPayment } from '../types';
import { AdminService } from '../services/AdminService';

interface AdminPaymentsTabProps {
  onPaymentSelect: (payment: AdminPayment) => void;
}

export const AdminPaymentsTab: React.FC<AdminPaymentsTabProps> = ({ onPaymentSelect }) => {
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<AdminPayment[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'amount' | 'date'>('date');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayments();
  }, []);

  useEffect(() => {
    filterAndSortPayments();
  }, [payments, statusFilter, regionFilter, sortBy]);

  const loadPayments = async () => {
    try {
      const data = await AdminService.getAllPayments();
      setPayments(data);
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortPayments = () => {
    let filtered = payments;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(payment => payment.escrow_status === statusFilter);
    }

    if (regionFilter !== 'all') {
      filtered = filtered.filter(payment => payment.region === regionFilter);
    }

    // Sort payments
    filtered.sort((a, b) => {
      if (sortBy === 'amount') {
        return b.amount - a.amount;
      } else {
        return new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime();
      }
    });

    setFilteredPayments(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FFA500';
      case 'funded': return '#007AFF';
      case 'released': return '#28A745';
      case 'disputed': return '#DC3545';
      default: return '#666';
    }
  };

  const getUniqueRegions = () => {
    const regions = [...new Set(payments.map(p => p.region))];
    return regions.filter(Boolean);
  };

  const renderPayment = ({ item }: { item: AdminPayment }) => (
    <TouchableOpacity style={styles.paymentCard} onPress={() => onPaymentSelect(item)}>
      <View style={styles.paymentHeader}>
        <Text style={styles.paymentAmount}>${item.amount.toFixed(2)}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.escrow_status) }]}>
          <Text style={styles.statusBadgeText}>{item.escrow_status}</Text>
        </View>
      </View>
      
      <View style={styles.paymentDetails}>
        <Text style={styles.paymentInfo}>Order ID: {item.order_id}</Text>
        <Text style={styles.paymentInfo}>Region: {item.region}</Text>
        <Text style={styles.paymentDate}>
          Payment: {new Date(item.payment_date).toLocaleDateString()}
        </Text>
        {item.release_date && (
          <Text style={styles.paymentDate}>
            Released: {new Date(item.release_date).toLocaleDateString()}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.filters}>
        <Text style={styles.filterLabel}>Status:</Text>
        <View style={styles.filterRow}>
          {['all', 'pending', 'funded', 'released', 'disputed'].map(status => (
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
        
        <Text style={styles.filterLabel}>Region:</Text>
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterButton, regionFilter === 'all' && styles.activeFilter]}
            onPress={() => setRegionFilter('all')}
          >
            <Text style={[styles.filterText, regionFilter === 'all' && styles.activeFilterText]}>
              all
            </Text>
          </TouchableOpacity>
          {getUniqueRegions().map(region => (
            <TouchableOpacity
              key={region}
              style={[styles.filterButton, regionFilter === region && styles.activeFilter]}
              onPress={() => setRegionFilter(region)}
            >
              <Text style={[styles.filterText, regionFilter === region && styles.activeFilterText]}>
                {region}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <Text style={styles.filterLabel}>Sort by:</Text>
        <View style={styles.filterRow}>
          {[{ key: 'date', label: 'Date' }, { key: 'amount', label: 'Amount' }].map(sort => (
            <TouchableOpacity
              key={sort.key}
              style={[styles.filterButton, sortBy === sort.key && styles.activeFilter]}
              onPress={() => setSortBy(sort.key as 'amount' | 'date')}
            >
              <Text style={[styles.filterText, sortBy === sort.key && styles.activeFilterText]}>
                {sort.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <FlatList
        data={filteredPayments}
        renderItem={renderPayment}
        keyExtractor={(item) => item.id}
        style={styles.paymentList}
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
  paymentList: {
    flex: 1,
  },
  paymentCard: {
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
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#28A745',
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
  paymentDetails: {
    gap: 4,
  },
  paymentInfo: {
    fontSize: 14,
    color: '#333',
  },
  paymentDate: {
    fontSize: 12,
    color: '#666',
  },
});