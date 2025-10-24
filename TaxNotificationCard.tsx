import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Invoice, User } from '../types';
import TaxService from '../services/TaxService';

interface TaxNotification {
  id: string;
  type: 'invoice_generated' | 'tax_document_uploaded' | 'cfdi_generated' | 'payment_received';
  invoice_id?: string;
  supplier_name?: string;
  order_id?: string;
  amount?: number;
  currency?: string;
  tax_amount?: number;
  tax_region?: string;
  timestamp: string;
  read: boolean;
}

interface TaxNotificationCardProps {
  notification: TaxNotification;
  onPress?: () => void;
  onMarkAsRead?: (id: string) => void;
}

const TaxNotificationCard: React.FC<TaxNotificationCardProps> = ({
  notification,
  onPress,
  onMarkAsRead
}) => {
  const formatCurrency = (amount: number, currency: string, region?: string) => {
    const regionConfig = TaxService.getTaxRegionConfig(region || 'US');
    const symbol = regionConfig?.currency_symbol || '$';
    return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} ${currency}`;
  };

  const getTaxLabel = (region?: string) => {
    const regionConfig = TaxService.getTaxRegionConfig(region || 'US');
    return regionConfig?.tax_label || 'Tax';
  };

  const getTaxPercentage = (taxAmount: number, subtotal: number) => {
    if (!taxAmount || !subtotal) return '0';
    return (taxAmount / subtotal * 100).toFixed(1);
  };

  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'invoice_generated': return '📄';
      case 'tax_document_uploaded': return '📋';
      case 'cfdi_generated': return '🇲🇽';
      case 'payment_received': return '💰';
      default: return '📄';
    }
  };

  const getNotificationTitle = () => {
    switch (notification.type) {
      case 'invoice_generated':
        return 'Invoice Generated';
      case 'tax_document_uploaded':
        return 'Tax Document Uploaded';
      case 'cfdi_generated':
        return 'CFDI Generated';
      case 'payment_received':
        return 'Payment Received';
      default:
        return 'Tax Notification';
    }
  };

  const getNotificationMessage = () => {
    const taxLabel = getTaxLabel(notification.tax_region);
    const regionFlag = notification.tax_region === 'MX' ? '🇲🇽' : 
                      notification.tax_region === 'US' ? '🇺🇸' : 
                      notification.tax_region === 'CA' ? '🇨🇦' : '';

    switch (notification.type) {
      case 'invoice_generated':
        if (notification.amount && notification.tax_amount && notification.currency) {
          const subtotal = notification.amount - notification.tax_amount;
          const taxPercentage = getTaxPercentage(notification.tax_amount, subtotal);
          return `Invoice #${notification.invoice_id} generated with ${taxPercentage}% ${taxLabel} ${regionFlag}`;
        }
        return `Invoice #${notification.invoice_id} generated`;
        
      case 'tax_document_uploaded':
        return `Supplier ${notification.supplier_name} uploaded tax file for Order #${notification.order_id}`;
        
      case 'cfdi_generated':
        return `CFDI XML generated for Invoice #${notification.invoice_id} (Mexico)`;
        
      case 'payment_received':
        if (notification.amount && notification.currency) {
          return `Payment received: ${formatCurrency(notification.amount, notification.currency, notification.tax_region)}`;
        }
        return 'Payment received';
        
      default:
        return 'Tax-related update';
    }
  };

  const getTimeAgo = () => {
    const now = new Date();
    const notificationTime = new Date(notification.timestamp);
    const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const handlePress = () => {
    if (!notification.read && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
    if (onPress) {
      onPress();
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        !notification.read && styles.unreadContainer
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{getNotificationIcon()}</Text>
        {!notification.read && <View style={styles.unreadDot} />}
      </View>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[
            styles.title,
            !notification.read && styles.unreadTitle
          ]}>
            {getNotificationTitle()}
          </Text>
          <Text style={styles.timestamp}>{getTimeAgo()}</Text>
        </View>
        
        <Text style={styles.message}>{getNotificationMessage()}</Text>
        
        {/* Amount Display */}
        {notification.amount && notification.currency && (
          <View style={styles.amountContainer}>
            <Text style={styles.amountText}>
              {formatCurrency(notification.amount, notification.currency, notification.tax_region)}
            </Text>
            {notification.tax_amount && (
              <Text style={styles.taxText}>
                (includes {formatCurrency(notification.tax_amount, notification.currency, notification.tax_region)} {getTaxLabel(notification.tax_region)})
              </Text>
            )}
          </View>
        )}
        
        {/* CFDI Badge */}
        {notification.type === 'cfdi_generated' && (
          <View style={styles.cfdiBadge}>
            <Text style={styles.cfdiBadgeText}>CFDI Compliant</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  unreadContainer: {
    backgroundColor: '#f8f9ff',
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  iconContainer: {
    position: 'relative',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 24,
  },
  unreadDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  unreadTitle: {
    fontWeight: 'bold',
    color: '#007AFF',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  message: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  amountContainer: {
    marginTop: 4,
  },
  amountText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  taxText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  cfdiBadge: {
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  cfdiBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2d5a2d',
  },
});

export default TaxNotificationCard;
export type { TaxNotification };