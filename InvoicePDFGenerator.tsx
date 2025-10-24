import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Invoice, User, Site } from '../types';
import TaxService from '../services/TaxService';

interface InvoicePDFGeneratorProps {
  invoice: Invoice;
  supplier: User;
  contractor: User;
  site: Site;
}

const InvoicePDFGenerator: React.FC<InvoicePDFGeneratorProps> = ({
  invoice,
  supplier,
  contractor,
  site
}) => {
  const regionConfig = TaxService.getTaxRegionConfig(supplier.tax_region || 'US');
  const invoiceFormatting = TaxService.formatInvoice(invoice, supplier.tax_region || 'US');

  const formatCurrency = (amount: number) => {
    const symbol = regionConfig?.currency_symbol || '$';
    return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const format = regionConfig?.date_format || 'MM/DD/YYYY';
    
    if (format === 'DD/MM/YYYY') {
      return date.toLocaleDateString('en-GB');
    }
    return date.toLocaleDateString('en-US');
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoSection}>
          {supplier.invoice_logo_url && (
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoText}>LOGO</Text>
            </View>
          )}
          <View>
            <Text style={styles.companyName}>{supplier.name}</Text>
            <Text style={styles.taxInfo}>
              Tax ID: {supplier.tax_id || 'N/A'}
            </Text>
            <Text style={styles.regionInfo}>
              Region: {supplier.tax_region || 'N/A'}
            </Text>
          </View>
        </View>
        
        <View style={styles.invoiceInfo}>
          <Text style={styles.invoiceTitle}>INVOICE</Text>
          <Text style={styles.invoiceNumber}>#{invoice.invoice_number}</Text>
          <Text style={styles.date}>Date: {formatDate(invoice.created_at)}</Text>
          <Text style={styles.dueDate}>Due: {formatDate(invoice.due_date)}</Text>
        </View>
      </View>

      {/* Bill To Section */}
      <View style={styles.billToSection}>
        <Text style={styles.sectionTitle}>Bill To:</Text>
        <Text style={styles.clientName}>{contractor.name}</Text>
        <Text style={styles.clientInfo}>Project: {site.name}</Text>
        <Text style={styles.clientInfo}>Location: {site.location}</Text>
        {contractor.tax_id && (
          <Text style={styles.clientInfo}>Tax ID: {contractor.tax_id}</Text>
        )}
      </View>

      {/* Line Items */}
      <View style={styles.itemsSection}>
        <View style={styles.itemsHeader}>
          <Text style={[styles.itemHeaderText, { flex: 3 }]}>Description</Text>
          <Text style={[styles.itemHeaderText, { flex: 1 }]}>Qty</Text>
          <Text style={[styles.itemHeaderText, { flex: 1 }]}>Rate</Text>
          <Text style={[styles.itemHeaderText, { flex: 1 }]}>Amount</Text>
        </View>
        
        {invoice.items.map((item, index) => (
          <View key={item.id} style={styles.itemRow}>
            <Text style={[styles.itemText, { flex: 3 }]}>{item.description}</Text>
            <Text style={[styles.itemText, { flex: 1 }]}>{item.quantity}</Text>
            <Text style={[styles.itemText, { flex: 1 }]}>{formatCurrency(item.unit_price)}</Text>
            <Text style={[styles.itemText, { flex: 1 }]}>{formatCurrency(item.total_amount)}</Text>
          </View>
        ))}
      </View>

      {/* Totals */}
      <View style={styles.totalsSection}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal:</Text>
          <Text style={styles.totalValue}>{formatCurrency(invoice.subtotal)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>{invoice.tax_label} ({(invoice.tax_amount / invoice.subtotal * 100).toFixed(1)}%):</Text>
          <Text style={styles.totalValue}>{formatCurrency(invoice.tax_amount)}</Text>
        </View>
        <View style={[styles.totalRow, styles.grandTotalRow]}>
          <Text style={styles.grandTotalLabel}>Total:</Text>
          <Text style={styles.grandTotalValue}>{formatCurrency(invoice.total_with_tax)}</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        {supplier.invoice_footer_note && (
          <Text style={styles.footerNote}>{supplier.invoice_footer_note}</Text>
        )}
        <Text style={styles.legalDisclaimer}>{invoice.legal_disclaimer}</Text>
        
        {supplier.tax_region === 'MX' && (
          <View style={styles.cfdiSection}>
            <Text style={styles.cfdiText}>CFDI - Comprobante Fiscal Digital</Text>
            <Text style={styles.cfdiNote}>Este documento es una representación impresa de un CFDI</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  logoPlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    borderRadius: 4,
  },
  logoText: {
    fontSize: 12,
    color: '#666',
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  taxInfo: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  regionInfo: {
    fontSize: 12,
    color: '#666',
  },
  invoiceInfo: {
    alignItems: 'flex-end',
  },
  invoiceTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  invoiceNumber: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  date: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  dueDate: {
    fontSize: 12,
    color: '#666',
  },
  billToSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  clientInfo: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  itemsSection: {
    marginBottom: 30,
  },
  itemsHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 4,
    marginBottom: 10,
  },
  itemHeaderText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  itemRow: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemText: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
  totalsSection: {
    alignItems: 'flex-end',
    marginBottom: 30,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 200,
    marginBottom: 5,
  },
  totalLabel: {
    fontSize: 12,
    color: '#666',
  },
  totalValue: {
    fontSize: 12,
    fontWeight: '500',
  },
  grandTotalRow: {
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 5,
    marginTop: 5,
  },
  grandTotalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  grandTotalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 20,
  },
  footerNote: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
  },
  legalDisclaimer: {
    fontSize: 10,
    color: '#888',
    textAlign: 'center',
    marginBottom: 15,
  },
  cfdiSection: {
    alignItems: 'center',
  },
  cfdiText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  cfdiNote: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
});

export default InvoicePDFGenerator;