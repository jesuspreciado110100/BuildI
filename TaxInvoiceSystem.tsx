import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { User, Invoice } from '../types';
import ComplianceSettingsPanel from './ComplianceSettingsPanel';
import SupplierInvoicesTab from './SupplierInvoicesTab';
import TaxNotificationCard, { TaxNotification } from './TaxNotificationCard';
import TaxService from '../services/TaxService';

interface TaxInvoiceSystemProps {
  currentUser: User;
}

const TaxInvoiceSystem: React.FC<TaxInvoiceSystemProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'invoices' | 'notifications'>('invoices');

  // Mock data
  const mockInvoices: Invoice[] = [
    {
      id: 'INV-001',
      site_id: 'site-1',
      supplier_id: 'supplier-1',
      contractor_id: 'contractor-1',
      invoice_number: 'INV-998',
      items: [
        {
          id: 'item-1',
          description: 'Premium Concrete Mix',
          quantity: 50,
          unit_price: 120.00,
          total_amount: 6000.00
        }
      ],
      subtotal: 6000.00,
      tax_amount: 960.00,
      tax_label: 'IVA',
      total_with_tax: 6960.00,
      currency: 'MXN',
      status: 'sent',
      created_at: '2024-01-15T10:30:00Z',
      due_date: '2024-02-15T10:30:00Z',
      invoice_format_version: '1.0',
      legal_disclaimer: 'Factura generada conforme a la legislación fiscal mexicana',
      cfdi_xml_url: 'https://example.com/cfdi/INV-998.xml'
    },
    {
      id: 'INV-002',
      site_id: 'site-1',
      supplier_id: 'supplier-1',
      contractor_id: 'contractor-1',
      invoice_number: 'INV-999',
      items: [
        {
          id: 'item-2',
          description: 'Steel Rebar Bundle',
          quantity: 100,
          unit_price: 85.00,
          total_amount: 8500.00
        }
      ],
      subtotal: 8500.00,
      tax_amount: 680.00,
      tax_label: 'Sales Tax',
      total_with_tax: 9180.00,
      currency: 'USD',
      status: 'paid',
      created_at: '2024-01-20T14:15:00Z',
      due_date: '2024-02-20T14:15:00Z',
      invoice_format_version: '1.0',
      legal_disclaimer: 'This invoice complies with US tax regulations',
      tax_document_url: 'https://example.com/tax-docs/INV-999.pdf'
    }
  ];

  const mockNotifications: TaxNotification[] = [
    {
      id: 'notif-1',
      type: 'invoice_generated',
      invoice_id: 'INV-998',
      amount: 6960.00,
      currency: 'MXN',
      tax_amount: 960.00,
      tax_region: 'MX',
      timestamp: '2024-01-15T10:30:00Z',
      read: false
    },
    {
      id: 'notif-2',
      type: 'tax_document_uploaded',
      supplier_name: 'Cementos Roca',
      order_id: '334',
      timestamp: '2024-01-14T16:45:00Z',
      read: true
    },
    {
      id: 'notif-3',
      type: 'cfdi_generated',
      invoice_id: 'INV-997',
      timestamp: '2024-01-13T09:20:00Z',
      read: true
    },
    {
      id: 'notif-4',
      type: 'payment_received',
      amount: 9180.00,
      currency: 'USD',
      tax_region: 'US',
      timestamp: '2024-01-12T11:30:00Z',
      read: false
    }
  ];

  const [notifications, setNotifications] = useState(mockNotifications);

  const handleUploadTaxDocument = (invoiceId: string) => {
    console.log('Upload tax document for invoice:', invoiceId);
    // Mock notification
    const newNotification: TaxNotification = {
      id: `notif-${Date.now()}`,
      type: 'tax_document_uploaded',
      invoice_id: invoiceId,
      supplier_name: currentUser.name,
      timestamp: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const handleGenerateCFDI = (invoiceId: string) => {
    console.log('Generate CFDI for invoice:', invoiceId);
    // Mock CFDI generation
    const invoice = mockInvoices.find(inv => inv.id === invoiceId);
    if (invoice) {
      const cfdiXml = TaxService.generateCFDI({
        supplier_tax_id: currentUser.tax_id,
        supplier_name: currentUser.name,
        client_tax_id: 'CLIENT123',
        client_name: 'ABC Construction',
        quantity: invoice.items[0]?.quantity || 1,
        description: invoice.items[0]?.description || 'Service',
        unit_price: invoice.items[0]?.unit_price || 0,
        total: invoice.subtotal,
        tax_amount: invoice.tax_amount
      });
      console.log('Generated CFDI XML:', cfdiXml);
      
      // Mock notification
      const newNotification: TaxNotification = {
        id: `notif-${Date.now()}`,
        type: 'cfdi_generated',
        invoice_id: invoiceId,
        timestamp: new Date().toISOString(),
        read: false
      };
      setNotifications(prev => [newNotification, ...prev]);
    }
  };

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true }
          : notif
      )
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'settings':
        return <ComplianceSettingsPanel />;
      
      case 'invoices':
        return (
          <SupplierInvoicesTab
            supplier={currentUser}
            invoices={mockInvoices}
            onUploadTaxDocument={handleUploadTaxDocument}
            onGenerateCFDI={handleGenerateCFDI}
          />
        );
      
      case 'notifications':
        return (
          <ScrollView style={styles.notificationsContainer}>
            <Text style={styles.notificationsTitle}>Tax Notifications</Text>
            {notifications.map(notification => (
              <TaxNotificationCard
                key={notification.id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
              />
            ))}
          </ScrollView>
        );
      
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tax & Invoice System</Text>
        <Text style={styles.subtitle}>
          Manage tax settings, invoices, and compliance
        </Text>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'invoices' && styles.activeTab
          ]}
          onPress={() => setActiveTab('invoices')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'invoices' && styles.activeTabText
          ]}>
            Invoices
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'notifications' && styles.activeTab
          ]}
          onPress={() => setActiveTab('notifications')}
        >
          <View style={styles.tabWithBadge}>
            <Text style={[
              styles.tabText,
              activeTab === 'notifications' && styles.activeTabText
            ]}>
              Notifications
            </Text>
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
        
        {currentUser.role === 'admin' && (
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'settings' && styles.activeTab
            ]}
            onPress={() => setActiveTab('settings')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'settings' && styles.activeTabText
            ]}>
              Settings
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        {renderTabContent()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  badge: {
    backgroundColor: '#ff3b30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  notificationsContainer: {
    flex: 1,
    padding: 16,
  },
  notificationsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
});

export default TaxInvoiceSystem;