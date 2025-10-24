import { EquipmentAnalyticsService } from './EquipmentAnalyticsService';
import { NotificationService } from './NotificationService';
import { EquipmentAnalytics } from '../types';

export class EquipmentNotificationService {
  private static instance: EquipmentNotificationService;
  private notificationService: NotificationService;
  private analyticsService: EquipmentAnalyticsService;

  private constructor() {
    this.notificationService = NotificationService.getInstance();
    this.analyticsService = EquipmentAnalyticsService.getInstance();
  }

  static getInstance(): EquipmentNotificationService {
    if (!EquipmentNotificationService.instance) {
      EquipmentNotificationService.instance = new EquipmentNotificationService();
    }
    return EquipmentNotificationService.instance;
  }

  async scheduleEquipmentNotifications(userId: string, userRole: string): Promise<void> {
    try {
      const analytics = await this.analyticsService.getAllEquipmentAnalytics();
      
      for (const equipment of analytics) {
        await this.checkAndSendNotifications(userId, userRole, equipment);
      }
    } catch (error) {
      console.error('Error scheduling equipment notifications:', error);
    }
  }

  private async checkAndSendNotifications(
    userId: string, 
    userRole: string, 
    equipment: EquipmentAnalytics
  ): Promise<void> {
    // Low utilization notification
    if (equipment.utilization_score < 25) {
      await this.notificationService.sendNotification({
        userId,
        title: 'Equipment Underutilized',
        message: `${equipment.machinery_name} underused this week (utilization: ${equipment.utilization_score}%)`,
        type: 'equipment_utilization',
        priority: 'medium',
        relatedId: equipment.machinery_id,
        relatedType: 'equipment'
      });
    }

    // High idle time notification
    if (equipment.avg_idle_time > 4) {
      const idlePercentage = Math.round((equipment.avg_idle_time / (equipment.daily_usage_hours + equipment.avg_idle_time)) * 100);
      
      if (idlePercentage > 50) {
        await this.notificationService.sendNotification({
          userId,
          title: 'High Idle Time Alert',
          message: `${equipment.machinery_name} has high idle time (>${Math.round(equipment.avg_idle_time)}h avg)`,
          type: 'equipment_idle',
          priority: 'medium',
          relatedId: equipment.machinery_id,
          relatedType: 'equipment'
        });
      }
    }

    // Predicted downtime notification
    if (equipment.predicted_downtime_date) {
      const daysUntil = Math.ceil(
        (new Date(equipment.predicted_downtime_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysUntil <= 3) {
        await this.notificationService.sendNotification({
          userId,
          title: 'Predicted Downtime Alert',
          message: `Predicted downtime in ${daysUntil} days — suggest oil service for ${equipment.machinery_name}`,
          type: 'equipment_maintenance',
          priority: 'high',
          relatedId: equipment.machinery_id,
          relatedType: 'equipment'
        });
      }
    }

    // Maintenance suggestion notification
    if (equipment.maintenance_suggestion) {
      await this.notificationService.sendNotification({
        userId,
        title: 'Maintenance Recommended',
        message: `${equipment.machinery_name} requires maintenance (utilization > 80%)`,
        type: 'equipment_maintenance',
        priority: 'high',
        relatedId: equipment.machinery_id,
        relatedType: 'equipment'
      });
    }

    // Critical alert notification
    if (equipment.alert_level === 'critical') {
      await this.notificationService.sendNotification({
        userId,
        title: 'Critical Equipment Alert',
        message: `${equipment.machinery_name} requires immediate attention - critical performance issues detected`,
        type: 'equipment_critical',
        priority: 'urgent',
        relatedId: equipment.machinery_id,
        relatedType: 'equipment'
      });
    }
  }

  async sendEquipmentSummaryNotification(userId: string, userRole: string): Promise<void> {
    try {
      const analytics = await this.analyticsService.getAllEquipmentAnalytics();
      const criticalCount = analytics.filter(e => e.alert_level === 'critical').length;
      const maintenanceCount = analytics.filter(e => e.maintenance_suggestion).length;
      const lowUtilizationCount = analytics.filter(e => e.utilization_score < 25).length;
      
      if (criticalCount > 0 || maintenanceCount > 0 || lowUtilizationCount > 0) {
        let message = 'Equipment Summary: ';
        const alerts = [];
        
        if (criticalCount > 0) alerts.push(`${criticalCount} critical alerts`);
        if (maintenanceCount > 0) alerts.push(`${maintenanceCount} maintenance needed`);
        if (lowUtilizationCount > 0) alerts.push(`${lowUtilizationCount} underutilized`);
        
        message += alerts.join(', ');
        
        await this.notificationService.sendNotification({
          userId,
          title: 'Daily Equipment Report',
          message,
          type: 'equipment_summary',
          priority: 'medium',
          relatedId: 'equipment_summary',
          relatedType: 'report'
        });
      }
    } catch (error) {
      console.error('Error sending equipment summary notification:', error);
    }
  }

  async getEquipmentNotificationHistory(userId: string, equipmentId?: string): Promise<any[]> {
    try {
      // This would typically fetch from a database
      // For now, return mock data
      return [
        {
          id: '1',
          title: 'Equipment Underutilized',
          message: 'Excavator #39 underused this week (utilization: 22%)',
          timestamp: new Date().toISOString(),
          type: 'equipment_utilization',
          status: 'unread'
        },
        {
          id: '2',
          title: 'Predicted Downtime Alert',
          message: 'Predicted downtime in 3 days — suggest oil service',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          type: 'equipment_maintenance',
          status: 'read'
        }
      ];
    } catch (error) {
      console.error('Error fetching notification history:', error);
      return [];
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      // This would typically update the database
      console.log(`Marking notification ${notificationId} as read`);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  async schedulePeriodicChecks(userId: string, userRole: string): Promise<void> {
    // Schedule daily equipment checks
    setInterval(async () => {
      await this.scheduleEquipmentNotifications(userId, userRole);
    }, 24 * 60 * 60 * 1000); // 24 hours

    // Schedule weekly summary
    setInterval(async () => {
      await this.sendEquipmentSummaryNotification(userId, userRole);
    }, 7 * 24 * 60 * 60 * 1000); // 7 days
  }
}