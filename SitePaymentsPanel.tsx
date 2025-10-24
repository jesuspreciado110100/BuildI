import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SitePaymentsPanelProps {
  siteId: string;
}

export function SitePaymentsPanel({ siteId }: SitePaymentsPanelProps) {
  const mockInvoices = [
    { id: '1', amount: '$5,200', status: 'paid', date: '2024-01-15', description: 'Foundation Work' },
    { id: '2', amount: '$3,800', status: 'pending', date: '2024-01-10', description: 'Material Supply' },
    { id: '3', amount: '$2,400', status: 'overdue', date: '2024-01-05', description: 'Labor Costs' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return '#34c759';
      case 'pending': return '#ff9500';
      case 'overdue': return '#ff3b30';
      default: return '#666';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Invoices & Payments</Text>
        <Text style={styles.subtitle}>Site: {siteId}</Text>
      </View>

      <View style={styles.summarySection}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryAmount}>$11,400</Text>
          <Text style={styles.summaryLabel}>Total Invoiced</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryAmount, { color: '#34c759' }]}>$5,200</Text>
          <Text style={styles.summaryLabel}>Paid</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryAmount, { color: '#ff9500' }]}>$6,200</Text>
          <Text style={styles.summaryLabel}>Outstanding</Text>
        </View>
      </View>

      <View style={styles.invoicesSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Invoices</Text>
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add" size={20} color="#007aff" />
            <Text style={styles.addButtonText}>New Invoice</Text>
          </TouchableOpacity>
        </View>
        
        {mockInvoices.map((invoice) => (
          <TouchableOpacity key={invoice.id} style={styles.invoiceItem}>
            <View style={styles.invoiceContent}>
              <Text style={styles.invoiceDescription}>{invoice.description}</Text>
              <Text style={styles.invoiceDate}>{invoice.date}</Text>
            </View>
            <View style={styles.invoiceRight}>
              <Text style={styles.invoiceAmount}>{invoice.amount}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(invoice.status) }]}>
                <Text style={styles.statusText}>{invoice.status}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { padding: 20, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  subtitle: { fontSize: 16, color: '#666', marginTop: 4 },
  summarySection: { flexDirection: 'row', padding: 20, gap: 10 },
  summaryCard: { flex: 1, backgroundColor: 'white', padding: 15, borderRadius: 8, alignItems: 'center' },
  summaryAmount: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  summaryLabel: { fontSize: 12, color: '#666', marginTop: 4 },
  invoicesSection: { backgroundColor: 'white', marginTop: 10, padding: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  addButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addButtonText: { color: '#007aff', fontSize: 14 },
  invoiceItem: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  invoiceContent: { flex: 1 },
  invoiceDescription: { fontSize: 16, fontWeight: '500', color: '#333' },
  invoiceDate: { fontSize: 12, color: '#666', marginTop: 2 },
  invoiceRight: { alignItems: 'flex-end' },
  invoiceAmount: { fontSize: 16, fontWeight: '600', color: '#333' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginTop: 4 },
  statusText: { fontSize: 10, color: 'white', fontWeight: '600', textTransform: 'uppercase' }
});