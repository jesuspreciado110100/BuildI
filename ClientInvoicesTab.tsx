import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';

interface ClientInvoicesTabProps {
  userId: string;
}

interface Invoice {
  id: string;
  number: string;
  siteName: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  dueDate: string;
  issueDate: string;
  description: string;
}

export const ClientInvoicesTab: React.FC<ClientInvoicesTabProps> = ({ userId }) => {
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');

  const mockInvoices: Invoice[] = [
    {
      id: '1',
      number: 'INV-2024-001',
      siteName: 'Downtown Office Complex',
      amount: 45000,
      status: 'paid',
      dueDate: '2024-01-15',
      issueDate: '2024-01-01',
      description: 'Foundation work - Phase 1'
    },
    {
      id: '2',
      number: 'INV-2024-002',
      siteName: 'Residential Tower A',
      amount: 28500,
      status: 'pending',
      dueDate: '2024-01-25',
      issueDate: '2024-01-10',
      description: 'Framing materials and labor'
    },
    {
      id: '3',
      number: 'INV-2024-003',
      siteName: 'Downtown Office Complex',
      amount: 15750,
      status: 'overdue',
      dueDate: '2024-01-05',
      issueDate: '2023-12-20',
      description: 'Equipment rental - December'
    }
  ];

  const filteredInvoices = mockInvoices.filter(invoice => 
    filter === 'all' || invoice.status === filter
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return '#4CAF50';
      case 'pending': return '#FF9800';
      case 'overdue': return '#F44336';
      default: return '#666';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'paid': return '#E8F5E8';
      case 'pending': return '#FFF3E0';
      case 'overdue': return '#FFEBEE';
      default: return '#f0f0f0';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getTotalAmount = () => {
    return filteredInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Invoices</Text>
      
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {(['all', 'paid', 'pending', 'overdue'] as const).map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterButton,
                filter === status && styles.filterButtonActive
              ]}
              onPress={() => setFilter(status)}
            >
              <Text style={[
                styles.filterButtonText,
                filter === status && styles.filterButtonTextActive
              ]}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Total Amount</Text>
        <Text style={styles.summaryAmount}>{formatCurrency(getTotalAmount())}</Text>
        <Text style={styles.summaryCount}>{filteredInvoices.length} invoice(s)</Text>
      </View>

      <View style={styles.invoicesContainer}>
        {filteredInvoices.map((invoice) => (
          <View key={invoice.id} style={styles.invoiceCard}>
            <View style={styles.invoiceHeader}>
              <View style={styles.invoiceInfo}>
                <Text style={styles.invoiceNumber}>{invoice.number}</Text>
                <Text style={styles.siteName}>{invoice.siteName}</Text>
              </View>
              <View style={styles.invoiceStatus}>
                <View style={[
                  styles.statusBadge,
                  { 
                    backgroundColor: getStatusBgColor(invoice.status),
                    borderColor: getStatusColor(invoice.status)
                  }
                ]}>
                  <Text style={[
                    styles.statusText,
                    { color: getStatusColor(invoice.status) }
                  ]}>
                    {invoice.status.toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>
            
            <Text style={styles.invoiceDescription}>{invoice.description}</Text>
            
            <View style={styles.invoiceDetails}>
              <View style={styles.dateContainer}>
                <Text style={styles.dateLabel}>Issued:</Text>
                <Text style={styles.dateValue}>{formatDate(invoice.issueDate)}</Text>
              </View>
              <View style={styles.dateContainer}>
                <Text style={styles.dateLabel}>Due:</Text>
                <Text style={[
                  styles.dateValue,
                  invoice.status === 'overdue' && styles.overdueDate
                ]}>
                  {formatDate(invoice.dueDate)}
                </Text>
              </View>
            </View>
            
            <View style={styles.invoiceFooter}>
              <Text style={styles.invoiceAmount}>{formatCurrency(invoice.amount)}</Text>
              <TouchableOpacity style={styles.viewButton}>
                <Text style={styles.viewButtonText}>View Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      {filteredInvoices.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No invoices found</Text>
          <Text style={styles.emptyStateSubtext}>
            {filter === 'all' 
              ? 'You have no invoices at this time.'
              : `No ${filter} invoices found.`
            }
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#2196F3',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  summaryContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  summaryCount: {
    fontSize: 14,
    color: '#999',
  },
  invoicesContainer: {
    marginBottom: 20,
  },
  invoiceCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  invoiceInfo: {
    flex: 1,
  },
  invoiceNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  siteName: {
    fontSize: 14,
    color: '#666',
  },
  invoiceStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  invoiceDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  invoiceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateContainer: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  overdueDate: {
    color: '#F44336',
  },
  invoiceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  invoiceAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  viewButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  viewButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});