import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LocalizationService } from '../services/LocalizationService';

interface LocalizedNotificationCardProps {
  type: string;
  title?: string;
  message?: string;
  measurement?: number;
  unitType?: 'area' | 'volume' | 'weight' | 'length';
  conceptName?: string;
  timestamp: string;
  isRead?: boolean;
  onPress?: () => void;
  style?: any;
}

export const LocalizedNotificationCard: React.FC<LocalizedNotificationCardProps> = ({
  type,
  title,
  message,
  measurement,
  unitType,
  conceptName,
  timestamp,
  isRead = false,
  onPress,
  style
}) => {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking_confirmed': return '✅';
      case 'progress_updated': return '📊';
      case 'payment_received': return '💰';
      case 'material_delivered': return '🚚';
      case 'worker_assigned': return '👷';
      case 'milestone_reached': return '🎯';
      default: return '📢';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'booking_confirmed': return '#28a745';
      case 'progress_updated': return '#007AFF';
      case 'payment_received': return '#28a745';
      case 'material_delivered': return '#fd7e14';
      case 'worker_assigned': return '#6f42c1';
      case 'milestone_reached': return '#ffc107';
      default: return '#6c757d';
    }
  };

  const formatNotificationMessage = () => {
    if (message) {
      return message;
    }

    let baseMessage = LocalizationService.t(`notifications.${type}`);
    
    if (measurement && unitType) {
      const formattedMeasurement = LocalizationService.formatMeasurement(measurement, unitType);
      baseMessage += ` - ${formattedMeasurement}`;
    }

    if (conceptName) {
      const translatedConcept = LocalizationService.t(`concepts.${conceptName}`);
      baseMessage += ` (${translatedConcept})`;
    }

    return baseMessage;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return LocalizationService.getCurrentLanguage() === 'es' ? 'Ahora' : 'Now';
    } else if (diffInMinutes < 60) {
      return LocalizationService.getCurrentLanguage() === 'es' ? 
        `Hace ${diffInMinutes} min` : `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return LocalizationService.getCurrentLanguage() === 'es' ? 
        `Hace ${hours}h` : `${hours}h ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return LocalizationService.getCurrentLanguage() === 'es' ? 
        `Hace ${days}d` : `${days}d ago`;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        !isRead && styles.unreadCard,
        style
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{getNotificationIcon(type)}</Text>
        <View 
          style={[
            styles.iconBadge, 
            { backgroundColor: getNotificationColor(type) }
          ]} 
        />
      </View>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {title || LocalizationService.t(`notifications.${type}`)}
          </Text>
          <Text style={styles.timestamp}>{formatTimestamp(timestamp)}</Text>
        </View>
        
        <Text style={styles.message}>
          {formatNotificationMessage()}
        </Text>
        
        {!isRead && <View style={styles.unreadDot} />}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 4,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  unreadCard: {
    backgroundColor: '#f8f9ff',
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  iconContainer: {
    position: 'relative',
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  iconBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  content: {
    flex: 1,
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  message: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
  },
});