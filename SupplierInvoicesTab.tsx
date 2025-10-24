import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Invoice, User, Site } from '../types';
import TaxService from '../services/TaxService';
import InvoicePDFGenerator from './InvoicePDFGenerator';

interface SupplierInvoicesTabProps {
  supplier: User;
  invoices: Invoice[];
  onUploadTaxDocument: (invoiceId: string) => void;
  onGenerateCFDI: (invoiceId: string) => void;
}

const SupplierInvoicesTab: React.FC<SupplierInvoicesTabProps> = ({
  supplier,
  invoices,
  onUploadTaxDocument,
  onGenerateCFDI
}) => {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showPDFPreview, setShowPDFPreview] = useState(false);

  const formatCurrency = (amount: number, currency: string) => {
    const regionConfig = TaxService.getTaxRegionConfig(supplier.tax_region || 'US');
    const symbol = regionConfig?.currency_symbol || '$';
    return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} ${currency}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return '#28a745';
      case 'sent': return '#007bff';
      case 'overdue': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowPDFPreview(true);
  };

  const handleUploadTaxDoc = (invoiceId: string) => {
    Alert.alert(
      'Upload Tax Document',
      'Select tax document type:',
      [
        { text: 'PDF Receipt', onPress: () => onUploadTaxDocument(invoiceId) },
        { text: 'CFDI XML', onPress: () => onGenerateCFDI(invoiceId) },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const mockContractor: User = {
    id: '1',
    name: 'ABC Construction',
    email: 'contractor@example.com',
    role: 'contractor',
    created_at: new Date().toISOString(),
    tax_id: 'CON123456789'
  };

  const mockSite: Site = {
    id: '1',
    name: 'Downtown Plaza',
    location: 'Mexico City, MX',
    contractor_id: '1',
    status: 'active',
    timezone: 'America/Mexico_City',
    country: 'MX',
    region: 'CDMX',
    currency: 'MXN',
    base_currency: 'MXN'
  };

  if (showPDFPreview && selectedInvoice) {
    return (
      <View style={styles.container}>
        <View style={styles.previewHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setShowPDFPreview(false)}
          >
            <Text style={styles.backButtonText}>← Back to Invoices</Text>
          </TouchableOpacity>
          <Text style={styles.previewTitle}>Invoice Preview</Text>
        </View>
        <InvoicePDFGenerator
          invoice={selectedInvoice}
          supplier={supplier}
          contractor={mockContractor}
          site={mockSite}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Invoices</Text>
      
      {/* Summary Cards */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{invoices.length}</Text>
          <Text style={styles.summaryLabel}>Total Invoices</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>
            {invoices.filter(inv => inv.status === 'paid').length}
          </Text>
          <Text style={styles.summaryLabel}>Paid</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>
            {invoices.filter(inv => inv.status === 'overdue').length}
          </Text>
          <Text style={styles.summaryLabel}>Overdue</Text>
        </View>
      </View>

      {/* Invoice List */}
      <View style={styles.invoiceList}>
        {invoices.map((invoice) => {
          const taxPercentage = (invoice.tax_amount / invoice.subtotal * 100).toFixed(1);
          
          return (
            <View key={invoice.id} style={styles.invoiceCard}>
              <View style={styles.invoiceHeader}>
                <View>
                  <Text style={styles.invoiceNumber}>#{invoice.invoice_number}</Text>
                  <Text style={styles.invoiceDate}>
                    {new Date(invoice.created_at).toLocaleDateString()}
                  </Text>
                </View>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(invoice.status) }
                ]}>
                  <Text style={styles.statusText}>{invoice.status.toUpperCase()}</Text>
                </View>
              </View>

              {/* Tax Breakdown */}
              <View style={styles.breakdownSection}>
                <Text style={styles.breakdownTitle}>Amount Breakdown:</Text>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Subtotal:</Text>
                  <Text style={styles.breakdownValue}>
                    {formatCurrency(invoice.subtotal, invoice.currency)}
                  </Text>
                </View>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>
                    {invoice.tax_label} ({taxPercentage}%):
                  </Text>
                  <Text style={styles.breakdownValue}>
                    {formatCurrency(invoice.tax_amount, invoice.currency)}
                  </Text>
                </View>
                <View style={[styles.breakdownRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>Total:</Text>
                  <Text style={styles.totalValue}>
                    {formatCurrency(invoice.total_with_tax, invoice.currency)}
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.viewButton}
                  onPress={() => handleViewInvoice(invoice)}
                >
                  <Text style={styles.viewButtonText}>View PDF</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={() => handleUploadTaxDoc(invoice.id)}
                >
                  <Text style={styles.uploadButtonText}>Upload Tax Doc</Text>
                </TouchableOpacity>
              </View>

              {/* Tax Document Status */}
              {invoice.tax_document_url && (
                <View style={styles.taxDocStatus}>
                  <Text style={styles.taxDocText}>✓ Tax document uploaded</Text>
                </View>
              )}
              
              {invoice.cfdi_xml_url && supplier.tax_region === 'MX' && (
                <View style={styles.cfdiStatus}>
                  <Text style={styles.cfdiText}>✓ CFDI XML generated</Text>
                </View>
              )}
            </View>
          );
        })}
      </View>

      {invoices.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No invoices found</Text>
          <Text style={styles.emptyStateSubtext}>
            Invoices will appear here once orders are completed
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  invoiceList: {
    gap: 16,
  },
  invoiceCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  invoiceNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  invoiceDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  breakdownSection: {
    marginBottom: 16,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  breakdownLabel: {
    fontSize: 14,
    color: '#666',
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 8,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  viewButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  viewButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  uploadButton: {
    flex: 1,
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  taxDocStatus: {
    backgroundColor: '#d4edda',
    padding: 8,
    borderRadius: 4,
    marginTop: 8,
  },
  taxDocText: {
    fontSize: 12,
    color: '#155724',
    fontWeight: '500',
  },
  cfdiStatus: {
    backgroundColor: '#cce5ff',
    padding: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  cfdiText: {
    fontSize: 12,
    color: '#004085',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
});

export default SupplierInvoicesTab;