import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { CommissionManagerService } from '../services/CommissionManagerService';

interface AdminNotification {
  id: string;
  type: 'flagged_job' | 'dispute' | 'daily_summary' | 'commission_changed' | 'earnings_digest';
  title: string;
  message: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
}

export const NotificationSystem: React.FC = () => {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);

  useEffect(() => {
    // Simulate receiving notifications including commission changes
    const mockNotifications: AdminNotification[] = [
      {
        id: '1',
        type: 'flagged_job',
        title: 'Job Flagged',
        message: 'Payment dispute flagged for job #123',
        timestamp: new Date().toISOString(),
        severity: 'high'
      },
      {
        id: '2',
        type: 'commission_changed',
        title: 'Commission Rate Updated',
        message: 'Labor commission rate changed from 8% to 10% for US region',
        timestamp: new Date().toISOString(),
        severity: 'medium'
      },
      {
        id: '3',
        type: 'earnings_digest',
        title: 'Weekly Earnings Report',
        message: 'Platform earned $12,500 this week. Labor: $8,500, Machinery: $3,200, Materials: $800',
        timestamp: new Date().toISOString(),
        severity: 'low'
      },
      {
        id: '4',
        type: 'daily_summary',
        title: 'Daily Operations Summary',
        message: '89 bookings completed, 3 disputes resolved, 1247 active users',
        timestamp: new Date().toISOString(),
        severity: 'low'
      }
    ];
    
    setNotifications(mockNotifications);
    
    // Show alert for high severity notifications
    mockNotifications.forEach(notification => {
      if (notification.severity === 'high') {
        Alert.alert(notification.title, notification.message);
      }
    });
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return '#DC3545';
      case 'medium': return '#FFC107';
      case 'low': return '#28A745';
      default: return '#6C757D';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'commission_changed': return '💰';
      case 'earnings_digest': return '📊';
      case 'flagged_job': return '🚩';
      case 'dispute': return '⚠️';
      default: return '📢';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Notifications</Text>
      {notifications.map(notification => (
        <View key={notification.id} style={styles.notificationCard}>
          <View style={[styles.severityIndicator, { backgroundColor: getSeverityColor(notification.severity) }]} />
          <Text style={styles.notificationIcon}>{getNotificationIcon(notification.type)}</Text>
          <View style={styles.notificationContent}>
            <Text style={styles.notificationTitle}>{notification.title}</Text>
            <Text style={styles.notificationMessage}>{notification.message}</Text>
            <Text style={styles.notificationTime}>{new Date(notification.timestamp).toLocaleString()}</Text>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 12, color: '#333' },
  notificationCard: { flexDirection: 'row', backgroundColor: 'white', padding: 12, borderRadius: 8, marginBottom: 8, alignItems: 'center' },
  severityIndicator: { width: 4, borderRadius: 2, marginRight: 12, height: 40 },
  notificationIcon: { fontSize: 20, marginRight: 8 },
  notificationContent: { flex: 1 },
  notificationTitle: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  notificationMessage: { fontSize: 12, color: '#666', marginBottom: 4 },
  notificationTime: { fontSize: 10, color: '#999' }
});