import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CurrencyService } from '../services/CurrencyService';

interface CurrencyNotificationCardProps {
  type: 'quote' | 'booking' | 'payment' | 'invoice';
  title: string;
  amount: number;
  currency: string;
  itemDescription?: string;
  timestamp: string;
  onPress?: () => void;
}

export const CurrencyNotificationCard: React.FC<CurrencyNotificationCardProps> = ({
  type,
  title,
  amount,
  currency,
  itemDescription,
  timestamp,
  onPress
}) => {
  const alternateCurrency = currency === 'USD' ? 'MXN' : 'USD';
  const convertedAmount = CurrencyService.convert(amount, currency, alternateCurrency);
  
  const formatNotificationMessage = () => {
    const primaryAmount = CurrencyService.formatCurrency(amount, currency);
    const secondaryAmount = CurrencyService.formatCurrency(convertedAmount, alternateCurrency);
    
    switch (type) {
      case 'quote':
        return `New quote: ${primaryAmount} (~${secondaryAmount})${itemDescription ? ` for ${itemDescription}` : ''}`;
      case 'booking':
        return `Booking confirmed: ${primaryAmount} (~${secondaryAmount})${itemDescription ? ` - ${itemDescription}` : ''}`;
      case 'payment':
        return `Payment received: ${primaryAmount} (~${secondaryAmount})`;
      case 'invoice':
        return `Invoice generated: ${primaryAmount} (~${secondaryAmount})`;
      default:
        return `${title}: ${primaryAmount} (~${secondaryAmount})`;
    }
  };

  const getNotificationIcon = () => {
    switch (type) {
      case 'quote': return '💰';
      case 'booking': return '✅';
      case 'payment': return '💳';
      case 'invoice': return '📄';
      default: return '💼';
    }
  };

  const getNotificationColor = () => {
    switch (type) {
      case 'quote': return '#007AFF';
      case 'booking': return '#28a745';
      case 'payment': return '#17a2b8';
      case 'invoice': return '#ffc107';
      default: return '#6c757d';
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.container, { borderLeftColor: getNotificationColor() }]} 
      onPress={onPress}
    >
      <View style={styles.header}>
        <Text style={styles.icon}>{getNotificationIcon()}</Text>
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{formatNotificationMessage()}</Text>
        </View>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.timestamp}>{new Date(timestamp).toLocaleString()}</Text>
        <View style={styles.amountContainer}>
          <Text style={[styles.primaryAmount, { color: getNotificationColor() }]}>
            {CurrencyService.formatCurrency(amount, currency)}
          </Text>
          <Text style={styles.secondaryAmount}>
            ~{CurrencyService.formatCurrency(convertedAmount, alternateCurrency)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  icon: {
    fontSize: 24,
    marginRight: 12
  },
  content: {
    flex: 1
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4
  },
  message: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  timestamp: {
    fontSize: 12,
    color: '#888'
  },
  amountContainer: {
    alignItems: 'flex-end'
  },
  primaryAmount: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  secondaryAmount: {
    fontSize: 12,
    color: '#666',
    marginTop: 2
  }
});