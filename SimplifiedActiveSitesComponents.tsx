import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// FileUploader Component
export function FileUploader({ onUpload }: { onUpload: () => void }) {
  return (
    <TouchableOpacity style={styles.uploadButton} onPress={onUpload}>
      <Ionicons name="cloud-upload" size={20} color="white" />
      <Text style={styles.uploadText}>Upload File</Text>
    </TouchableOpacity>
  );
}

// SitePaymentsPanel Component
export function SitePaymentsPanel({ contractorId }: { contractorId?: string }) {
  const mockPayments = [
    { id: '1', description: 'Foundation Payment', amount: '$25,000', status: 'paid', date: '2024-01-15' },
    { id: '2', description: 'Material Payment', amount: '$15,000', status: 'pending', date: '2024-01-20' }
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payments</Text>
      {mockPayments.map((payment) => (
        <View key={payment.id} style={styles.paymentItem}>
          <View style={styles.paymentContent}>
            <Text style={styles.paymentDesc}>{payment.description}</Text>
            <Text style={styles.paymentDate}>{payment.date}</Text>
          </View>
          <View style={styles.paymentRight}>
            <Text style={styles.paymentAmount}>{payment.amount}</Text>
            <Text style={[styles.paymentStatus, { color: payment.status === 'paid' ? '#10B981' : '#F59E0B' }]}>
              {payment.status}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

// InvoiceCard Component
export function InvoiceCard({ invoice }: { invoice: any }) {
  return (
    <View style={styles.invoiceCard}>
      <Text style={styles.invoiceAmount}>${invoice.amount}</Text>
      <Text style={styles.invoiceStatus}>{invoice.status}</Text>
    </View>
  );
}

// AnalyticsDashboardPanel Component
export function AnalyticsDashboardPanel({ contractorId }: { contractorId?: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Analytics</Text>
      <View style={styles.analyticsGrid}>
        <View style={styles.analyticsCard}>
          <Text style={styles.analyticsValue}>85%</Text>
          <Text style={styles.analyticsLabel}>Completion</Text>
        </View>
        <View style={styles.analyticsCard}>
          <Text style={styles.analyticsValue}>$125K</Text>
          <Text style={styles.analyticsLabel}>Budget Used</Text>
        </View>
      </View>
    </View>
  );
}

// ProgressGraph Component
export function ProgressGraph({ data }: { data: any[] }) {
  return (
    <View style={styles.graphContainer}>
      <Text style={styles.graphTitle}>Progress Chart</Text>
      <View style={styles.graphPlaceholder}>
        <Text style={styles.graphText}>Chart visualization would go here</Text>
      </View>
    </View>
  );
}

// CostBreakdownPanel Component
export function CostBreakdownPanel({ contractorId }: { contractorId?: string }) {
  const mockCosts = [
    { category: 'Materials', amount: 45000, percentage: 45 },
    { category: 'Labor', amount: 35000, percentage: 35 },
    { category: 'Equipment', amount: 20000, percentage: 20 }
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cost Breakdown</Text>
      {mockCosts.map((cost, index) => (
        <View key={index} style={styles.costItem}>
          <Text style={styles.costCategory}>{cost.category}</Text>
          <View style={styles.costRight}>
            <Text style={styles.costAmount}>${cost.amount.toLocaleString()}</Text>
            <Text style={styles.costPercentage}>{cost.percentage}%</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  uploadButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  uploadText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  paymentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  paymentContent: {
    flex: 1,
  },
  paymentDesc: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  paymentDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  paymentRight: {
    alignItems: 'flex-end',
  },
  paymentAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  paymentStatus: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  invoiceCard: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  invoiceAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  invoiceStatus: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  analyticsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  analyticsCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  analyticsValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  analyticsLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  graphContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
  },
  graphTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  graphPlaceholder: {
    height: 120,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  graphText: {
    color: '#6B7280',
    fontSize: 14,
  },
  costItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  costCategory: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  costRight: {
    alignItems: 'flex-end',
  },
  costAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  costPercentage: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
});