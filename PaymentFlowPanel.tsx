import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Invoice } from '../types';
import InvoiceService from '../services/InvoiceService';
import InvoiceCard from './InvoiceCard';

interface PaymentFlowPanelProps {
  userId: string;
  userRole: 'contractor' | 'subcontractor' | 'all';
}

const PaymentFlowPanel: React.FC<PaymentFlowPanelProps> = ({ userId, userRole }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [statusFilter, setStatusFilter] = useState<Invoice['status'] | 'all'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'last30' | 'last90'>('all');

  useEffect(() => {
    loadInvoices();
  }, [userId, userRole]);

  useEffect(() => {
    applyFilters();
  }, [invoices, statusFilter, dateFilter]);

  const loadInvoices = () => {
    let data: Invoice[] = [];
    
    if (userRole === 'contractor') {
      data = InvoiceService.getInvoicesByContractor(userId);
    } else if (userRole === 'subcontractor') {
      data = InvoiceService.getInvoicesBySubcontractor(userId);
    } else {
      data = InvoiceService.getAllInvoices();
    }
    
    setInvoices(data);
  };

  const applyFilters = () => {
    let filtered = [...invoices];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(inv => inv.status === statusFilter);
    }

    if (dateFilter !== 'all') {
      const daysAgo = dateFilter === 'last30' ? 30 : 90;
      const cutoffDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(inv => new Date(inv.issue_date) >= cutoffDate);
    }

    setFilteredInvoices(filtered);
  };

  const handlePayment = async (invoiceId: string) => {
    const success = await InvoiceService.processPayment(invoiceId);
    if (success) {
      loadInvoices(); // Refresh data
    }
  };

  const getTotalAmount = () => {
    return filteredInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  };

  const getPaidAmount = () => {
    return filteredInvoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.amount, 0);
  };

  const getPendingAmount = () => {
    return filteredInvoices
      .filter(inv => inv.status === 'pending')
      .reduce((sum, inv) => sum + inv.amount, 0);
  };

  return (
    <View style={styles.container}>
      <View style={styles.summarySection}>
        <Text style={styles.sectionTitle}>Payment Summary</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total</Text>
            <Text style={styles.summaryValue}>${getTotalAmount().toLocaleString()}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Paid</Text>
            <Text style={[styles.summaryValue, { color: '#4CAF50' }]}>
              ${getPaidAmount().toLocaleString()}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Pending</Text>
            <Text style={[styles.summaryValue, { color: '#FF9800' }]}>
              ${getPendingAmount().toLocaleString()}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.filtersSection}>
        <Text style={styles.sectionTitle}>Filters</Text>
        <View style={styles.filterRow}>
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Status:</Text>
            <View style={styles.filterButtons}>
              {['all', 'pending', 'paid', 'overdue'].map(status => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.filterButton,
                    statusFilter === status && styles.activeFilter
                  ]}
                  onPress={() => setStatusFilter(status as any)}
                >
                  <Text style={[
                    styles.filterButtonText,
                    statusFilter === status && styles.activeFilterText
                  ]}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </View>

      <ScrollView style={styles.invoicesList}>
        {filteredInvoices.map(invoice => (
          <InvoiceCard
            key={invoice.id}
            invoice={invoice}
            onPaymentPress={handlePayment}
          />
        ))}
        {filteredInvoices.length === 0 && (
          <Text style={styles.emptyText}>No invoices found</Text>
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
  summarySection: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  filtersSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  filterRow: {
    marginBottom: 12,
  },
  filterGroup: {
    marginBottom: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    marginBottom: 8,
  },
  activeFilter: {
    backgroundColor: '#2196F3',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#666',
  },
  activeFilterText: {
    color: '#fff',
  },
  invoicesList: {
    flex: 1,
    padding: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 32,
  },
});

export default PaymentFlowPanel;